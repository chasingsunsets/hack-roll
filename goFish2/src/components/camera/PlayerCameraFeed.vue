<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  stream: {
    type: MediaStream,
    default: null
  },
  playerName: {
    type: String,
    required: true
  },
  isLocal: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'small' // 'small', 'medium', or 'large'
  }
})

const videoEl = ref(null)
let currentStream = null
const videoTrackCount = ref(0)

const hasVideoTracks = computed(() => videoTrackCount.value > 0)

async function attachStream(stream, retryCount = 0) {
  if (!videoEl.value || !stream) {
    console.log(`[PlayerCameraFeed] Cannot attach - videoEl: ${!!videoEl.value}, stream: ${!!stream}`)
    return
  }

  const videoTracks = stream.getVideoTracks()
  videoTrackCount.value = videoTracks.length
  console.log(`[PlayerCameraFeed] Attaching stream for ${props.playerName}, video tracks: ${videoTracks.length}, retry: ${retryCount}`)

  // If no video tracks yet and we haven't retried too many times, wait and retry
  if (videoTracks.length === 0 && retryCount < 5) {
    console.log(`[PlayerCameraFeed] No video tracks yet for ${props.playerName}, retrying in 500ms...`)
    setTimeout(() => attachStream(stream, retryCount + 1), 500)
    return
  }

  videoEl.value.srcObject = stream

  // Listen for tracks being added to the stream
  stream.onaddtrack = (event) => {
    console.log(`[PlayerCameraFeed] Track added to stream for ${props.playerName}:`, event.track.kind)
    videoTrackCount.value = stream.getVideoTracks().length
    // Re-attach to trigger video update
    if (videoEl.value) {
      videoEl.value.srcObject = null
      videoEl.value.srcObject = stream
      videoEl.value.play().catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Play error:', err)
        }
      })
    }
  }

  try {
    await videoEl.value.play()
    console.log(`[PlayerCameraFeed] Video playing for ${props.playerName}`)
  } catch (err) {
    // AbortError is expected when stream changes or element is removed - don't log as error
    if (err.name === 'AbortError') {
      console.log(`[PlayerCameraFeed] Play aborted for ${props.playerName} (stream changed or element removed)`)
    } else {
      console.error(`[PlayerCameraFeed] Error playing video for ${props.playerName}:`, err)
    }
  }
}

watch(() => props.stream, async (newStream, oldStream) => {
  console.log(`[PlayerCameraFeed] Stream changed for ${props.playerName}:`, newStream ? `${newStream.getTracks().length} tracks` : 'null')
  if (newStream) {
    const videoTracks = newStream.getVideoTracks()
    console.log(`[PlayerCameraFeed] Video tracks for ${props.playerName}:`, videoTracks.length)
    videoTracks.forEach((track, i) => {
      console.log(`[PlayerCameraFeed] Track ${i}: enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`)
    })
  }

  // Clean up old stream listener
  if (oldStream && oldStream !== newStream) {
    oldStream.onaddtrack = null
  }

  currentStream = newStream

  // Wait for next tick to ensure video element is mounted
  await nextTick()
  await attachStream(newStream)
}, { immediate: true })

onMounted(() => {
  if (props.stream) {
    attachStream(props.stream)
  }
})

onUnmounted(() => {
  if (currentStream) {
    currentStream.onaddtrack = null
  }
  if (videoEl.value) {
    videoEl.value.srcObject = null
  }
})
</script>

<template>
  <div class="player-camera" :class="[`size-${size}`, { 'is-local': isLocal }]">
    <div class="camera-wrapper">
      <video
        ref="videoEl"
        autoplay
        playsinline
        :muted="isLocal"
        class="camera-video"
      ></video>

      <!-- Loading indicator when no video tracks -->
      <div v-if="!hasVideoTracks" class="loading-indicator">
        <span>CONNECTING...</span>
      </div>

      <!-- Scanline overlay -->
      <div class="camera-scanlines"></div>

      <!-- Live indicator -->
      <div v-if="hasVideoTracks" class="live-indicator">
        <span class="live-dot"></span>
        LIVE
      </div>

      <!-- Player label -->
      <div class="player-label">
        {{ playerName }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-camera {
  font-family: 'Press Start 2P', monospace;
}

.camera-wrapper {
  position: relative;
  background: var(--ocean-abyss, #0a1628);
  border: 2px solid var(--suit-wave, #4fc3f7);
  overflow: hidden;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}

/* Small size */
.size-small .camera-wrapper {
  width: 80px;
  height: 60px;
}

/* Medium size */
.size-medium .camera-wrapper {
  width: 120px;
  height: 90px;
}

/* Large size (for opponents) */
.size-large .camera-wrapper {
  width: 160px;
  height: 120px;
}

.size-large .player-label {
  font-size: 0.4rem;
  padding: 3px 6px;
}

/* XLarge size (prominent opponent camera) */
.size-xlarge .camera-wrapper {
  width: 240px;
  height: 180px;
  border-width: 3px;
  box-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.6),
    0 0 20px rgba(79, 195, 247, 0.3);
}

.size-xlarge .player-label {
  font-size: 0.5rem;
  padding: 5px 10px;
}

/* Add corner decorations for xlarge */
.size-xlarge .camera-wrapper::before,
.size-xlarge .camera-wrapper::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 3px solid #ffd700;
  z-index: 2;
}

.size-xlarge .camera-wrapper::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.size-xlarge .camera-wrapper::after {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
}

.size-xlarge::before,
.size-xlarge::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 3px solid #ffd700;
  z-index: 2;
}

.size-xlarge::before {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
}

.size-xlarge::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

.size-xlarge {
  position: relative;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  image-rendering: pixelated;
}

.is-local .camera-video {
  transform: scaleX(-1); /* Mirror for local player */
}

.camera-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
}

.loading-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 22, 40, 0.9);
  z-index: 5;
}

.loading-indicator span {
  font-size: 0.4rem;
  color: #4fc3f7;
  animation: blink 1s steps(2) infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.size-xlarge .loading-indicator span {
  font-size: 0.5rem;
}

.live-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #ff4444;
  font-size: 0.3rem;
  padding: 2px 5px;
  border: 1px solid #ff4444;
  z-index: 3;
}

.live-dot {
  width: 6px;
  height: 6px;
  background: #ff4444;
  border-radius: 50%;
  animation: live-pulse 1s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.size-xlarge .live-indicator {
  font-size: 0.4rem;
  padding: 3px 8px;
  top: 6px;
  right: 6px;
}

.size-xlarge .live-dot {
  width: 8px;
  height: 8px;
}

.player-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10, 22, 40, 0.9);
  color: #4fc3f7;
  font-size: 0.35rem;
  padding: 2px 4px;
  text-align: center;
  border-top: 1px solid #4fc3f7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
