<script setup>
import { ref, onMounted, defineExpose, watch } from 'vue';
import { BANNED_MOVES } from '../../services/gestureDefinitions';

const props = defineProps({
  isDetecting: {
    type: Boolean,
    default: false
  },
  currentGestures: {
    type: Array,
    default: () => []
  },
  stream: {
    type: Object,
    default: null
  }
});

const videoEl = ref(null);

defineExpose({
  getVideoElement() {
    return videoEl.value;
  }
});

watch(() => props.stream, async (newStream) => {
  if (videoEl.value && newStream) {
    videoEl.value.srcObject = newStream;
    await videoEl.value.play();
  }
}, { immediate: true });

onMounted(async () => {
  if (videoEl.value && props.stream) {
    videoEl.value.srcObject = props.stream;
    await videoEl.value.play();
  }
});

function getGestureName(type) {
  return BANNED_MOVES[type]?.name || type;
}
</script>

<template>
  <div class="camera-container">
    <div class="camera-frame">
      <!-- Frame decoration -->
      <div class="frame-corner frame-corner--tl"></div>
      <div class="frame-corner frame-corner--tr"></div>
      <div class="frame-corner frame-corner--bl"></div>
      <div class="frame-corner frame-corner--br"></div>

      <!-- Video -->
      <video
        ref="videoEl"
        autoplay
        playsinline
        muted
        class="camera-video"
      ></video>

      <!-- Scanline overlay -->
      <div class="camera-scanlines"></div>

      <!-- Status -->
      <div class="camera-status" :class="{ 'camera-status--active': isDetecting }">
        <span class="status-dot"></span>
        <span class="status-text">{{ isDetecting ? 'SCANNING' : 'LOADING' }}</span>
      </div>

      <!-- Detected gestures -->
      <div v-if="currentGestures.length > 0" class="gesture-alerts">
        <div
          v-for="gesture in currentGestures"
          :key="gesture.type"
          class="gesture-alert"
        >
          <span class="alert-icon">!</span>
          <span class="alert-name">{{ getGestureName(gesture.type).toUpperCase() }}</span>
          <span class="alert-conf">{{ Math.round(gesture.confidence * 100) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.camera-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 40;
  font-family: 'Press Start 2P', monospace;
}

.camera-frame {
  position: relative;
  width: 320px;
  background: var(--ocean-abyss, #0a1628);
  border: 4px solid var(--suit-wave, #4fc3f7);
  box-shadow:
    6px 6px 0 rgba(0, 0, 0, 0.5),
    0 0 30px rgba(79, 195, 247, 0.4);
}

/* Frame corner decorations */
.frame-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 4px solid var(--gold-bright, #ffd700);
  z-index: 5;
}

.frame-corner--tl {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.frame-corner--tr {
  top: -3px;
  right: -3px;
  border-left: none;
  border-bottom: none;
}

.frame-corner--bl {
  bottom: -3px;
  left: -3px;
  border-right: none;
  border-top: none;
}

.frame-corner--br {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.camera-video {
  width: 100%;
  height: auto;
  display: block;
  transform: scaleX(-1);
  image-rendering: pixelated;
}

.camera-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.2) 2px,
    rgba(0, 0, 0, 0.2) 4px
  );
  pointer-events: none;
}

.camera-status {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--ocean-abyss, #0a1628);
  border: 2px solid var(--suit-coral, #ff6b35);
}

.camera-status--active {
  border-color: var(--feedback-success, #5dfc9a);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--suit-coral, #ff6b35);
  animation: pixel-blink 1s steps(2) infinite;
}

.camera-status--active .status-dot {
  background: var(--feedback-success, #5dfc9a);
}

@keyframes pixel-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.status-text {
  font-size: 0.5rem;
  color: #fff;
}

.gesture-alerts {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gesture-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--suit-coral, #ff6b35);
  border: 3px solid var(--gold-bright, #ffd700);
  animation: alert-shake 0.3s steps(4);
}

@keyframes alert-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

.alert-icon {
  font-size: 0.7rem;
  color: var(--gold-bright, #ffd700);
}

.alert-name {
  flex: 1;
  font-size: 0.45rem;
  color: #fff;
}

.alert-conf {
  font-size: 0.45rem;
  color: var(--gold-bright, #ffd700);
}
</style>
