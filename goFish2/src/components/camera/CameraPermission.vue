<script setup>
import PixelFish from '../PixelFish.vue';

const emit = defineEmits(['granted', 'denied']);

async function requestPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    emit('granted');
  } catch (err) {
    console.error('Camera permission denied:', err);
    emit('denied', err);
  }
}
</script>

<template>
  <div class="camera-permission">
    <div class="permission-box">
      <!-- Decorative corners -->
      <div class="box-corner box-corner--tl"></div>
      <div class="box-corner box-corner--tr"></div>
      <div class="box-corner box-corner--bl"></div>
      <div class="box-corner box-corner--br"></div>

      <!-- Scanlines -->
      <div class="box-scanlines"></div>

      <!-- Content -->
      <div class="permission-content">
        <div class="icon-container">
          <PixelFish :size="48" color="cyan" />
          <div class="camera-icon">
            <svg width="32" height="32" viewBox="0 0 16 16">
              <rect x="2" y="4" width="12" height="10" fill="#4fc3f7"/>
              <rect x="3" y="5" width="10" height="8" fill="#0a1628"/>
              <rect x="6" y="7" width="4" height="4" fill="#4fc3f7"/>
              <rect x="7" y="8" width="2" height="2" fill="#fff"/>
              <rect x="5" y="2" width="6" height="2" fill="#4fc3f7"/>
            </svg>
          </div>
        </div>

        <h3 class="permission-title">CAMERA ACCESS</h3>

        <p class="permission-desc">
          Enable your camera to detect banned moves and catch other players!
        </p>

        <div class="privacy-box">
          <span class="privacy-icon">*</span>
          <span class="privacy-text">VIDEO PROCESSED LOCALLY - NOT SENT TO SERVER</span>
        </div>

        <button class="enable-btn" @click="requestPermission">
          <span class="btn-icon">&gt;</span>
          <span class="btn-text">ENABLE CAMERA</span>
        </button>

        <button class="skip-btn" @click="emit('denied')">
          SKIP FOR NOW
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.camera-permission {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 22, 40, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  font-family: 'Press Start 2P', monospace;
}

.permission-box {
  position: relative;
  background: var(--ocean-deep, #0d2847);
  border: 4px solid var(--suit-wave, #4fc3f7);
  padding: 32px;
  max-width: 400px;
  box-shadow:
    8px 8px 0 rgba(0, 0, 0, 0.5),
    0 0 30px rgba(79, 195, 247, 0.3);
}

.box-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 4px solid var(--gold-bright, #ffd700);
  z-index: 5;
}

.box-corner--tl {
  top: -4px;
  left: -4px;
  border-right: none;
  border-bottom: none;
}

.box-corner--tr {
  top: -4px;
  right: -4px;
  border-left: none;
  border-bottom: none;
}

.box-corner--bl {
  bottom: -4px;
  left: -4px;
  border-right: none;
  border-top: none;
}

.box-corner--br {
  bottom: -4px;
  right: -4px;
  border-left: none;
  border-top: none;
}

.box-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(79, 195, 247, 0.03) 2px,
    rgba(79, 195, 247, 0.03) 4px
  );
  pointer-events: none;
}

.permission-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.icon-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.camera-icon {
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.permission-title {
  margin: 0;
  font-size: 1rem;
  color: var(--suit-wave, #4fc3f7);
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}

.permission-desc {
  margin: 0;
  font-size: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 1.8;
}

.privacy-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(93, 252, 154, 0.15);
  border: 2px solid var(--feedback-success, #5dfc9a);
}

.privacy-icon {
  font-size: 0.6rem;
  color: var(--feedback-success, #5dfc9a);
}

.privacy-text {
  font-size: 0.35rem;
  color: var(--feedback-success, #5dfc9a);
}

.enable-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: var(--suit-wave, #4fc3f7);
  border: none;
  box-shadow:
    inset -3px -3px 0 rgba(0, 0, 0, 0.2),
    inset 3px 3px 0 rgba(255, 255, 255, 0.2),
    4px 4px 0 rgba(0, 0, 0, 0.4);
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  transition: transform 0.1s steps(2);
}

.enable-btn:hover {
  transform: scale(1.05);
}

.enable-btn:active {
  transform: scale(0.95);
  box-shadow:
    inset 3px 3px 0 rgba(0, 0, 0, 0.2),
    inset -3px -3px 0 rgba(255, 255, 255, 0.2),
    2px 2px 0 rgba(0, 0, 0, 0.4);
}

.btn-icon {
  font-size: 0.7rem;
  color: var(--ocean-abyss, #0a1628);
}

.btn-text {
  font-size: 0.6rem;
  color: var(--ocean-abyss, #0a1628);
}

.skip-btn {
  padding: 8px 16px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
}

.skip-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
}
</style>
