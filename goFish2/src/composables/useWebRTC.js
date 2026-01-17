import { ref, watch } from 'vue'

// Store peer connections and remote streams
const peerConnections = ref(new Map()) // playerId -> RTCPeerConnection
const remoteStreams = ref(new Map()) // playerId -> MediaStream

// ICE servers for NAT traversal (using free public STUN servers)
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
}

export function useWebRTC(socket, myId) {
  let localStream = null

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
      const [remoteStream] = event.streams
      remoteStreams.value.set(peerId, remoteStream)
      console.log(`[WebRTC] Remote stream added for ${peerId}`)
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC] Sending ICE candidate to ${peerId}`)
        socket.value.emit('webrtc-ice-candidate', {
          to: peerId,
          candidate: event.candidate
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${peerId}: ${pc.connectionState}`)
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        cleanupPeerConnection(peerId)
      }
    }

    peerConnections.value.set(peerId, pc)
    return pc
  }

  /**
   * Create and send an offer to a peer
   */
  async function createOffer(peerId) {
    try {
      const pc = createPeerConnection(peerId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      console.log(`[WebRTC] Sending offer to ${peerId}`)
      socket.value.emit('webrtc-offer', {
        to: peerId,
        offer: offer
      })
    } catch (error) {
      console.error(`[WebRTC] Error creating offer for ${peerId}:`, error)
    }
  }

  /**
   * Handle incoming offer from a peer
   */
  async function handleOffer(peerId, offer) {
    try {
      console.log(`[WebRTC] Received offer from ${peerId}`)
      const pc = createPeerConnection(peerId)
      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      console.log(`[WebRTC] Sending answer to ${peerId}`)
      socket.value.emit('webrtc-answer', {
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
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
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
   */
  async function connectToPeers(playerIds) {
    if (!localStream) {
      console.warn('[WebRTC] No local stream available')
      return
    }

    console.log(`[WebRTC] Connecting to peers:`, playerIds)
    for (const peerId of playerIds) {
      if (peerId !== myId.value) {
        await createOffer(peerId)
      }
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
      peerConnections.value.delete(peerId)
      console.log(`[WebRTC] Closed peer connection for ${peerId}`)
    }
    remoteStreams.value.delete(peerId)
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
    if (!socket.value) return

    socket.value.on('webrtc-offer', ({ from, offer }) => {
      handleOffer(from, offer)
    })

    socket.value.on('webrtc-answer', ({ from, answer }) => {
      handleAnswer(from, answer)
    })

    socket.value.on('webrtc-ice-candidate', ({ from, candidate }) => {
      handleIceCandidate(from, candidate)
    })

    socket.value.on('player-disconnected', ({ playerId }) => {
      cleanupPeerConnection(playerId)
    })

    console.log('[WebRTC] Signaling setup complete')
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

    // Internal (exposed for debugging)
    peerConnections
  }
}
