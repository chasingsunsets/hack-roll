<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

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

watch(() => props.stream, async (newStream) => {
  if (videoEl.value && newStream) {
    videoEl.value.srcObject = newStream
    try {
      await videoEl.value.play()
    } catch (err) {
      console.error('Error playing video:', err)
    }
  }
}, { immediate: true })

onMounted(() => {
  if (videoEl.value && props.stream) {
    videoEl.value.srcObject = props.stream
  }
})

onUnmounted(() => {
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

      <!-- Scanline overlay -->
      <div class="camera-scanlines"></div>

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
