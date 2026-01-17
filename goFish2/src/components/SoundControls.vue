<script setup>
import { ref } from 'vue'
import { useSoundEffects } from '../composables/useSoundEffects'

const { isEnabled, volume, toggleSound, setVolume, playClick } = useSoundEffects()

const showControls = ref(false)

function handleToggle() {
  toggleSound()
}

function handleVolumeChange(event) {
  setVolume(parseFloat(event.target.value))
  playClick()
}

function togglePanel() {
  showControls.value = !showControls.value
  if (isEnabled.value) {
    playClick()
  }
}
</script>

<template>
  <div class="sound-controls">
    <!-- Sound Toggle Button -->
    <button
      class="sound-toggle-btn"
      @click="handleToggle"
      :class="{ 'sound-off': !isEnabled }"
      :title="isEnabled ? 'Sound On' : 'Sound Off'"
    >
      <span class="sound-icon" v-if="isEnabled">🔊</span>
      <span class="sound-icon" v-else>🔇</span>
    </button>

    <!-- Settings Button -->
    <button
      class="sound-settings-btn"
      @click="togglePanel"
      :title="showControls ? 'Hide volume' : 'Show volume'"
      v-if="isEnabled"
    >
      ⚙️
    </button>

    <!-- Volume Panel -->
    <transition name="slide">
      <div class="volume-panel" v-if="showControls && isEnabled">
        <label class="volume-label">Volume</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          :value="volume"
          @input="handleVolumeChange"
          class="volume-slider"
        />
        <span class="volume-value">{{ Math.round(volume * 100) }}%</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.sound-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  font-family: 'Press Start 2P', monospace;
}

.sound-toggle-btn,
.sound-settings-btn {
  width: 50px;
  height: 50px;
  border: 3px solid #333;
  background: linear-gradient(135deg, #4fc3f7 0%, #2196f3 100%);
  box-shadow:
    inset -2px -2px 0 rgba(0, 0, 0, 0.3),
    inset 2px 2px 0 rgba(255, 255, 255, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sound-toggle-btn:hover,
.sound-settings-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    inset -2px -2px 0 rgba(0, 0, 0, 0.3),
    inset 2px 2px 0 rgba(255, 255, 255, 0.3),
    0 6px 12px rgba(0, 0, 0, 0.4);
}

.sound-toggle-btn:active,
.sound-settings-btn:active {
  transform: translateY(0);
  box-shadow:
    inset 2px 2px 0 rgba(0, 0, 0, 0.3),
    inset -2px -2px 0 rgba(255, 255, 255, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.3);
}

.sound-toggle-btn.sound-off {
  background: linear-gradient(135deg, #999 0%, #666 100%);
}

.sound-settings-btn {
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.sound-icon {
  filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.3));
}

/* Volume Panel */
.volume-panel {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 3px solid #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
}

.volume-label {
  color: #4fc3f7;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.volume-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: #444;
  outline: none;
  border: 2px solid #666;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #4fc3f7 0%, #2196f3 100%);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #4fc3f7 0%, #2196f3 100%);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border-radius: 0;
}

.volume-value {
  color: #FFD700;
  font-size: 0.7rem;
  text-align: center;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .sound-controls {
    bottom: 10px;
    right: 10px;
  }

  .sound-toggle-btn,
  .sound-settings-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .sound-settings-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .volume-panel {
    min-width: 150px;
    padding: 10px;
  }

  .volume-label {
    font-size: 0.5rem;
  }

  .volume-value {
    font-size: 0.6rem;
  }
}
</style>
