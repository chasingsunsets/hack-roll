import { ref, onUnmounted } from 'vue'

// Store remote player frames (playerId -> imageDataUrl)
const remoteFrames = ref(new Map())

// Streaming state
let streamingInterval = null
let canvas = null
let ctx = null
const FRAME_INTERVAL = 200 // Send frame every 200ms (5 fps) - adjust for quality vs bandwidth
const FRAME_QUALITY = 0.5 // JPEG quality (0-1)
const FRAME_WIDTH = 320 // Downscale for bandwidth
const FRAME_HEIGHT = 240

export function useFrameStreaming(getRawSocket, myId) {
  let localVideoElement = null
  let isStreaming = false

  function getSocket() {
    return typeof getRawSocket === 'function' ? getRawSocket() : getRawSocket?.value
  }

  /**
   * Initialize canvas for frame capture
   */
  function initCanvas() {
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.width = FRAME_WIDTH
      canvas.height = FRAME_HEIGHT
      ctx = canvas.getContext('2d')
    }
  }

  /**
   * Capture a frame from the video element and return as data URL
   */
  function captureFrame(videoEl) {
    if (!videoEl || videoEl.readyState < 2) return null
    
    initCanvas()
    
    try {
      // Draw video frame to canvas (scaled down)
      ctx.drawImage(videoEl, 0, 0, FRAME_WIDTH, FRAME_HEIGHT)
      // Convert to JPEG data URL
      return canvas.toDataURL('image/jpeg', FRAME_QUALITY)
    } catch (err) {
      console.error('[FrameStreaming] Error capturing frame:', err)
      return null
    }
  }

  /**
   * Start streaming frames from local video to other players
   */
  function startStreaming(videoElement) {
    if (isStreaming) {
      console.log('[FrameStreaming] Already streaming')
      return
    }

    localVideoElement = videoElement
    isStreaming = true

    console.log('[FrameStreaming] Starting frame streaming')

    streamingInterval = setInterval(() => {
      if (!localVideoElement || !getSocket()) return

      const frame = captureFrame(localVideoElement)
      if (frame) {
        getSocket().emit('video-frame', { frame })
      }
    }, FRAME_INTERVAL)
  }

  /**
   * Stop streaming frames
   */
  function stopStreaming() {
    if (streamingInterval) {
      clearInterval(streamingInterval)
      streamingInterval = null
    }
    isStreaming = false
    localVideoElement = null
    console.log('[FrameStreaming] Stopped frame streaming')
  }

  /**
   * Set up socket listeners for receiving frames from other players
   */
  function setupFrameListeners() {
    const socket = getSocket()
    if (!socket) return

    // Remove existing listener to prevent duplicates
    socket.off('video-frame')

    socket.on('video-frame', ({ playerId, frame }) => {
      // Update the frame for this player (creates new Map for reactivity)
      const newMap = new Map(remoteFrames.value)
      newMap.set(playerId, frame)
      remoteFrames.value = newMap
    })

    // Clean up frame when player disconnects
    socket.off('player-disconnected-frame')
    socket.on('player-disconnected', ({ playerId }) => {
      const newMap = new Map(remoteFrames.value)
      newMap.delete(playerId)
      remoteFrames.value = newMap
    })

    console.log('[FrameStreaming] Frame listeners set up')
  }

  /**
   * Get frame for a specific player
   */
  function getPlayerFrame(playerId) {
    return remoteFrames.value.get(playerId) || null
  }

  /**
   * Cleanup on unmount
   */
  function cleanup() {
    stopStreaming()
  }

  return {
    // State
    remoteFrames,

    // Methods
    startStreaming,
    stopStreaming,
    setupFrameListeners,
    getPlayerFrame,
    cleanup
  }
}
