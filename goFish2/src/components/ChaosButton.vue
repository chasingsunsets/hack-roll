<script setup>
import PixelFish from './PixelFish.vue'

defineProps({
  available: {
    type: Boolean,
    default: false
  },
  cooldown: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['activate'])
</script>

<template>
  <div class="chaos-button-container">
    <button
      class="chaos-button pixel-btn"
      :class="{ 
        'available': available && !disabled,
        'cooldown': !available || disabled,
        'disabled': disabled
      }"
      :disabled="!available || disabled"
      @click="$emit('activate')"
    >
      <div class="button-content">
        <div class="button-icon">
          <PixelFish :size="24" color="gold" />
        </div>
        <div class="button-text">
          <span class="button-label">CHAOS</span>
          <span v-if="!available && cooldown > 0" class="cooldown-text">
            {{ cooldown }} turn{{ cooldown !== 1 ? 's' : '' }}
          </span>
          <span v-else-if="available && !disabled" class="ready-text">READY!</span>
        </div>
      </div>
    </button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.chaos-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.chaos-button {
  padding: 14px 24px;
  background: #ff6b35;
  border: none;
  color: white;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.65rem;
  cursor: pointer;
  position: relative;
  box-shadow:
    inset -4px -4px 0 #cc4a1a,
    inset 4px 4px 0 #ff9a6c,
    6px 6px 0 rgba(0, 0, 0, 0.4);
  transition: all 0.1s ease;
  min-width: 140px;
}

.chaos-button.available {
  background: #ff6b35;
  animation: chaosGlow 1s ease-in-out infinite, chaosWiggle 2s ease-in-out infinite, chaosScale 1.5s ease-in-out infinite;
}

.chaos-button.available:hover {
  animation: chaosGlow 0.5s ease-in-out infinite, chaosWiggle 0.8s ease-in-out infinite, chaosScale 0.8s ease-in-out infinite, chaosHover 0.3s ease-in-out infinite;
  transform: translate(2px, 2px) scale(1.05);
  box-shadow:
    inset -4px -4px 0 #cc4a1a,
    inset 4px 4px 0 #ff9a6c,
    4px 4px 0 rgba(0, 0, 0, 0.4);
}

.chaos-button.available:active {
  animation: chaosPress 0.2s ease-out;
  transform: translate(6px, 6px) scale(0.95) rotate(5deg);
  box-shadow:
    inset -4px -4px 0 #cc4a1a,
    inset 4px 4px 0 #ff9a6c,
    2px 2px 0 rgba(0, 0, 0, 0.4);
}

.chaos-button.cooldown {
  background: #4a4a4a;
  color: #888;
  cursor: not-allowed;
  box-shadow:
    inset -4px -4px 0 #2a2a2a,
    inset 4px 4px 0 #6a6a6a,
    4px 4px 0 rgba(0, 0, 0, 0.3);
}

.chaos-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fishSpin 3s linear infinite;
}

.chaos-button.available .button-icon {
  animation: fishSpin 1.5s linear infinite, fishBounce 0.8s ease-in-out infinite;
}

.button-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.button-label {
  font-size: 0.7rem;
  line-height: 1.2;
}

.cooldown-text {
  font-size: 0.5rem;
  color: #ff9a6c;
  opacity: 0.9;
}

.ready-text {
  font-size: 0.5rem;
  color: #ffd700;
  animation: pulse 0.8s ease-in-out infinite, textShake 0.5s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

@keyframes chaosGlow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.6)) drop-shadow(0 0 15px rgba(255, 215, 0, 0.4));
    box-shadow:
      inset -4px -4px 0 #cc4a1a,
      inset 4px 4px 0 #ff9a6c,
      6px 6px 0 rgba(0, 0, 0, 0.4),
      0 0 15px rgba(255, 215, 0, 0.5),
      0 0 30px rgba(255, 107, 53, 0.4);
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(255, 107, 53, 1)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
    box-shadow:
      inset -4px -4px 0 #cc4a1a,
      inset 4px 4px 0 #ff9a6c,
      6px 6px 0 rgba(0, 0, 0, 0.4),
      0 0 30px rgba(255, 215, 0, 0.9),
      0 0 50px rgba(255, 107, 53, 0.7);
  }
}

@keyframes chaosWiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(3deg);
  }
}

@keyframes chaosScale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

@keyframes chaosHover {
  0%, 100% {
    transform: translate(2px, 2px) scale(1.05) rotate(0deg);
  }
  50% {
    transform: translate(2px, 2px) scale(1.08) rotate(2deg);
  }
}

@keyframes chaosPress {
  0% {
    transform: translate(6px, 6px) scale(0.95) rotate(5deg);
  }
  50% {
    transform: translate(8px, 8px) scale(0.92) rotate(-5deg);
  }
  100% {
    transform: translate(6px, 6px) scale(0.95) rotate(5deg);
  }
}

@keyframes fishSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fishBounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-5px) rotate(-10deg);
  }
  75% {
    transform: translateY(5px) rotate(10deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes textShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}
</style>
