import { ref, watch } from 'vue'

// Store peer connections and remote streams
const peerConnections = ref(new Map()) // playerId -> RTCPeerConnection
const remoteStreams = ref(new Map()) // playerId -> MediaStream

// ICE servers for NAT traversal
// STUN servers help discover public IP, TURN servers relay when direct connection fails
const iceServers = {
  iceServers: [
    // Free STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Additional STUN servers for redundancy
    { urls: 'stun:stun.stunprotocol.org:3478' },
    { urls: 'stun:stun.voip.blackberry.com:3478' },
    // Free TURN servers from Metered (reliable public TURN)
    {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'e8dd65f92ae757249e72a7e1',
      credential: '9jf5SXvMs1yWxPnS'
    },
    {
      urls: 'turn:a.relay.metered.ca:80?transport=tcp',
      username: 'e8dd65f92ae757249e72a7e1',
      credential: '9jf5SXvMs1yWxPnS'
    },
    {
      urls: 'turn:a.relay.metered.ca:443',
      username: 'e8dd65f92ae757249e72a7e1',
      credential: '9jf5SXvMs1yWxPnS'
    },
    {
      urls: 'turn:a.relay.metered.ca:443?transport=tcp',
      username: 'e8dd65f92ae757249e72a7e1',
      credential: '9jf5SXvMs1yWxPnS'
    }
  ],
  iceCandidatePoolSize: 10
}

// Track pending reconnections to avoid duplicates
const pendingReconnections = new Set()
// Track if we've set up signaling (to avoid duplicate listeners)
let signalingSetup = false
// Track ongoing negotiations to handle glare
const makingOffer = new Map() // peerId -> boolean

export function useWebRTC(getRawSocket, myId) {
  let localStream = null

  // Helper to get the raw socket
  function getSocket() {
    return typeof getRawSocket === 'function' ? getRawSocket() : getRawSocket?.value;
  }

  /**
   * Initialize WebRTC with local camera stream
   */
  async function initializeWebRTC(stream) {
    localStream = stream
    console.log('[WebRTC] Initialized with local stream')
  }

  /**
   * Create a peer connection for a specific player
   */
  function createPeerConnection(peerId) {
    if (peerConnections.value.has(peerId)) {
      console.log(`[WebRTC] Peer connection already exists for ${peerId}`)
      return peerConnections.value.get(peerId)
    }

    console.log(`[WebRTC] Creating peer connection for ${peerId}`)
    const pc = new RTCPeerConnection(iceServers)

    // Add local stream tracks to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream)
        console.log(`[WebRTC] Added ${track.kind} track to peer ${peerId}`)
      })
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received ${event.track.kind} track from ${peerId}`)
      console.log(`[WebRTC] Track state: enabled=${event.track.enabled}, muted=${event.track.muted}, readyState=${event.track.readyState}`)
      console.log(`[WebRTC] Event streams:`, event.streams.length)

      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0]
        console.log(`[WebRTC] Remote stream has ${remoteStream.getTracks().length} tracks, ${remoteStream.getVideoTracks().length} video tracks`)

        // Create a new Map to trigger Vue reactivity
        const newMap = new Map(remoteStreams.value)
        newMap.set(peerId, remoteStream)
        remoteStreams.value = newMap
        console.log(`[WebRTC] Remote stream added/updated for ${peerId}, total streams:`, remoteStreams.value.size)
      } else {
        console.warn(`[WebRTC] No stream in ontrack event from ${peerId}`)
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC] Sending ICE candidate to ${peerId}`, event.candidate.type)
        getSocket().emit('webrtc-ice-candidate', {
          to: peerId,
          candidate: event.candidate
        })
      } else {
        console.log(`[WebRTC] ICE candidate gathering complete for ${peerId}`)
      }
    }

    // Handle ICE connection state changes (more granular than connection state)
    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE connection state with ${peerId}: ${pc.iceConnectionState}`)
      if (pc.iceConnectionState === 'failed') {
        console.log(`[WebRTC] ICE connection failed with ${peerId}, attempting restart...`)
        // Try ICE restart
        pc.restartIce()
      }
    }

    // Handle ICE gathering state changes
    pc.onicegatheringstatechange = () => {
      console.log(`[WebRTC] ICE gathering state with ${peerId}: ${pc.iceGatheringState}`)
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${peerId}: ${pc.connectionState}`)
      if (pc.connectionState === 'failed') {
        // On failure, cleanup and try to reconnect after a delay
        cleanupPeerConnection(peerId)
        scheduleReconnection(peerId)
      } else if (pc.connectionState === 'disconnected') {
        // Disconnected might recover, wait a bit before cleaning up
        console.log(`[WebRTC] Connection disconnected with ${peerId}, waiting for recovery...`)
        setTimeout(() => {
          const currentPc = peerConnections.value.get(peerId)
          if (currentPc && currentPc.connectionState === 'disconnected') {
            console.log(`[WebRTC] Connection still disconnected with ${peerId}, cleaning up`)
            cleanupPeerConnection(peerId)
            scheduleReconnection(peerId)
          }
        }, 5000)
      }
    }

    peerConnections.value.set(peerId, pc)
    return pc
  }

  /**
   * Schedule a reconnection attempt with a peer
   */
  function scheduleReconnection(peerId) {
    if (pendingReconnections.has(peerId)) {
      console.log(`[WebRTC] Reconnection already pending for ${peerId}`)
      return
    }
    if (!localStream) {
      console.log(`[WebRTC] No local stream, skipping reconnection with ${peerId}`)
      return
    }
    
    pendingReconnections.add(peerId)
    console.log(`[WebRTC] Scheduling reconnection with ${peerId} in 2 seconds...`)
    
    setTimeout(async () => {
      pendingReconnections.delete(peerId)
      if (localStream && !peerConnections.value.has(peerId)) {
        console.log(`[WebRTC] Attempting reconnection with ${peerId}`)
        await createOffer(peerId)
      }
    }, 2000)
  }

  /**
   * Create and send an offer to a peer
   * Uses makingOffer flag to handle glare condition
   */
  async function createOffer(peerId) {
    try {
      const pc = createPeerConnection(peerId)
      
      // Check if we're in a valid state to create an offer
      if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
        console.log(`[WebRTC] Cannot create offer for ${peerId}, signaling state: ${pc.signalingState}`)
        return
      }
      
      makingOffer.set(peerId, true)
      const offer = await pc.createOffer()
      
      // Check state again after async operation
      if (pc.signalingState !== 'stable') {
        console.log(`[WebRTC] State changed during offer creation for ${peerId}, aborting`)
        makingOffer.set(peerId, false)
        return
      }
      
      await pc.setLocalDescription(offer)
      makingOffer.set(peerId, false)

      console.log(`[WebRTC] Sending offer to ${peerId}`)
      getSocket().emit('webrtc-offer', {
        to: peerId,
        offer: offer
      })
    } catch (error) {
      makingOffer.set(peerId, false)
      console.error(`[WebRTC] Error creating offer for ${peerId}:`, error)
    }
  }

  /**
   * Determine if we should be the "polite" peer (will rollback on glare)
   * The peer with the lexicographically smaller ID is polite
   */
  function isPolite(peerId) {
    const myIdValue = typeof myId === 'object' ? myId.value : myId
    return myIdValue < peerId
  }

  /**
   * Handle incoming offer from a peer
   * Implements "polite peer" pattern to handle simultaneous offers (glare)
   */
  async function handleOffer(peerId, offer) {
    try {
      console.log(`[WebRTC] Received offer from ${peerId}`)

      let pc = peerConnections.value.get(peerId)
      
      if (!pc) {
        pc = createPeerConnection(peerId)
      }
      
      // Handle glare condition (both peers sent offers simultaneously)
      const offerCollision = makingOffer.get(peerId) || pc.signalingState !== 'stable'
      const polite = isPolite(peerId)
      
      if (offerCollision) {
        if (!polite) {
          // We're impolite - ignore incoming offer, our offer takes precedence
          console.log(`[WebRTC] Ignoring offer from ${peerId} (we're impolite, glare condition)`)
          return
        }
        // We're polite - rollback our offer and accept theirs
        console.log(`[WebRTC] Rolling back local offer for ${peerId} (we're polite)`)
        await pc.setLocalDescription({ type: 'rollback' })
        makingOffer.set(peerId, false)
      }

      // Add local tracks if we have them and they aren't added yet
      if (localStream) {
        const senders = pc.getSenders()
        const hasVideoTrack = senders.some(s => s.track && s.track.kind === 'video')
        if (!hasVideoTrack) {
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream)
            console.log(`[WebRTC] Added ${track.kind} track for ${peerId}`)
          })
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      console.log(`[WebRTC] Sending answer to ${peerId}`)
      getSocket().emit('webrtc-answer', {
        to: peerId,
        answer: answer
      })
    } catch (error) {
      console.error(`[WebRTC] Error handling offer from ${peerId}:`, error)
    }
  }

  /**
   * Handle incoming answer from a peer
   */
  async function handleAnswer(peerId, answer) {
    try {
      console.log(`[WebRTC] Received answer from ${peerId}`)
      const pc = peerConnections.value.get(peerId)
      if (pc) {
        // Only set remote description if we're expecting an answer
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
        } else {
          console.log(`[WebRTC] Ignoring answer from ${peerId}, signaling state: ${pc.signalingState}`)
        }
      }
    } catch (error) {
      console.error(`[WebRTC] Error handling answer from ${peerId}:`, error)
    }
  }

  /**
   * Handle incoming ICE candidate from a peer
   */
  async function handleIceCandidate(peerId, candidate) {
    try {
      const pc = peerConnections.value.get(peerId)
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
        console.log(`[WebRTC] Added ICE candidate from ${peerId}`)
      }
    } catch (error) {
      console.error(`[WebRTC] Error adding ICE candidate from ${peerId}:`, error)
    }
  }

  /**
   * Start WebRTC with all peers in the room
   * Only initiates connections if we have the lower peer ID (to avoid duplicate offers)
   */
  async function connectToPeers(playerIds) {
    if (!localStream) {
      console.warn('[WebRTC] No local stream available')
      return
    }

    const myIdValue = typeof myId === 'object' ? myId.value : myId
    console.log(`[WebRTC] Connecting to peers:`, playerIds, 'myId:', myIdValue)
    
    for (const peerId of playerIds) {
      if (peerId !== myIdValue) {
        // Only initiate if we have lower ID (prevents both peers sending offers)
        // The other peer will receive our camera-ready notification and may also connect
        if (myIdValue < peerId) {
          console.log(`[WebRTC] Initiating connection to ${peerId} (we have lower ID)`)
          await createOffer(peerId)
        } else {
          console.log(`[WebRTC] Waiting for ${peerId} to initiate (they have lower ID)`)
        }
      }
    }
  }

  /**
   * Add local tracks to an existing connection and renegotiate
   */
  async function addTracksAndRenegotiate(peerId, pc) {
    try {
      // Check if tracks are already added
      const senders = pc.getSenders()
      const hasVideoTrack = senders.some(s => s.track && s.track.kind === 'video')

      if (!hasVideoTrack && localStream) {
        // Add local tracks
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream)
          console.log(`[WebRTC] Added ${track.kind} track to existing peer ${peerId}`)
        })

        // Create a new offer to renegotiate
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        console.log(`[WebRTC] Sending renegotiation offer to ${peerId}`)
        getSocket().emit('webrtc-offer', {
          to: peerId,
          offer: offer
        })
      } else {
        console.log(`[WebRTC] Tracks already added to peer ${peerId}, skipping`)
      }
    } catch (error) {
      console.error(`[WebRTC] Error renegotiating with ${peerId}:`, error)
    }
  }

  /**
   * Get remote stream for a specific player
   */
  function getRemoteStream(peerId) {
    return remoteStreams.value.get(peerId) || null
  }

  /**
   * Cleanup a specific peer connection
   */
  function cleanupPeerConnection(peerId) {
    const pc = peerConnections.value.get(peerId)
    if (pc) {
      pc.close()
      const newPcMap = new Map(peerConnections.value)
      newPcMap.delete(peerId)
      peerConnections.value = newPcMap
      console.log(`[WebRTC] Closed peer connection for ${peerId}`)
    }
    // Trigger reactivity by creating new Map
    const newStreamsMap = new Map(remoteStreams.value)
    newStreamsMap.delete(peerId)
    remoteStreams.value = newStreamsMap
  }

  /**
   * Cleanup all peer connections
   */
  function cleanupAllPeerConnections() {
    console.log('[WebRTC] Cleaning up all peer connections')
    peerConnections.value.forEach((pc, peerId) => {
      pc.close()
    })
    peerConnections.value.clear()
    remoteStreams.value.clear()
  }

  /**
   * Setup socket event listeners for WebRTC signaling
   */
  function setupSignaling() {
    if (!getSocket()) return

    // Remove existing listeners to prevent duplicates
    getSocket().off('webrtc-offer')
    getSocket().off('webrtc-answer')
    getSocket().off('webrtc-ice-candidate')
    getSocket().off('player-disconnected')
    getSocket().off('peer-camera-ready')
    getSocket().off('webrtc-connection-requested')

    getSocket().on('webrtc-offer', ({ from, offer }) => {
      console.log(`[WebRTC] Received offer from ${from}`)
      handleOffer(from, offer)
    })

    getSocket().on('webrtc-answer', ({ from, answer }) => {
      console.log(`[WebRTC] Received answer from ${from}`)
      handleAnswer(from, answer)
    })

    getSocket().on('webrtc-ice-candidate', ({ from, candidate }) => {
      handleIceCandidate(from, candidate)
    })

    getSocket().on('player-disconnected', ({ playerId }) => {
      cleanupPeerConnection(playerId)
    })

    // When another peer's camera is ready, initiate connection to them
    getSocket().on('peer-camera-ready', ({ peerId }) => {
      console.log(`[WebRTC] Peer ${peerId} camera ready`)
      if (!localStream) {
        console.log(`[WebRTC] No local stream, skipping connection to ${peerId}`)
        return
      }
      
      // Check if we already have a healthy connection
      const existingPc = peerConnections.value.get(peerId)
      if (existingPc) {
        const state = existingPc.connectionState
        if (state === 'connected' || state === 'connecting') {
          console.log(`[WebRTC] Already ${state} with ${peerId}, skipping`)
          return
        }
        // Clean up failed/closed connection before creating new one
        cleanupPeerConnection(peerId)
      }
      
      // Both peers might try to connect - use ID comparison to decide who initiates
      const myIdValue = typeof myId === 'object' ? myId.value : myId
      if (myIdValue < peerId) {
        console.log(`[WebRTC] Initiating connection to ${peerId} (we have lower ID)`)
        createOffer(peerId)
      } else {
        console.log(`[WebRTC] Waiting for ${peerId} to initiate (they have lower ID)`)
      }
    })

    // When a peer requests a connection with us (they have camera but we initiated)
    getSocket().on('webrtc-connection-requested', ({ from }) => {
      console.log(`[WebRTC] Connection requested by ${from}`)
      if (localStream) {
        createOffer(from)
      }
    })

    console.log('[WebRTC] Signaling setup complete')
  }

  /**
   * Notify other peers that our camera is ready
   */
  function notifyCameraReady() {
    const socket = getSocket()
    if (socket) {
      console.log('[WebRTC] Notifying peers that camera is ready')
      socket.emit('camera-ready')
    }
  }

  /**
   * Request a WebRTC connection with a specific peer
   */
  function requestConnection(peerId) {
    const socket = getSocket()
    if (socket) {
      console.log(`[WebRTC] Requesting connection with ${peerId}`)
      socket.emit('request-webrtc-connection', { to: peerId })
    }
  }

  return {
    // State
    remoteStreams,

    // Methods
    initializeWebRTC,
    connectToPeers,
    getRemoteStream,
    setupSignaling,
    cleanupAllPeerConnections,
    notifyCameraReady,
    requestConnection,

    // Internal (exposed for debugging)
    peerConnections
  }
}
