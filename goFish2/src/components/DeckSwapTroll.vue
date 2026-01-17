<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['complete'])

// NOTE: This component appears for ALL players when deck swap occurs
// Everyone sees the animation and gets their hands swapped

const phase = ref('entering') // entering, swirling, swapping, fading
const cardSpins = ref([])

onMounted(async () => {
  // Phase 1: Cards fly in from all corners
  await delay(500)
  phase.value = 'swirling'

  // Phase 2: Create spinning cards that swirl in center
  createCardSpins()
  await delay(1800)

  // Phase 3: Cards explode outward (swap happens)
  phase.value = 'swapping'
  await delay(1200)

  // Phase 4: Fade out
  phase.value = 'fading'
  await delay(600)

  emit('complete')
})

function createCardSpins() {
  // Create 20 spinning card representations
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2
    cardSpins.value.push({
      id: i,
      startAngle: angle,
      delay: i * 30
    })
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
</script>

<template>
  <div class="deck-swap-overlay">
    <!-- Center vortex effect -->
    <div class="vortex" :class="phase">
      <div class="vortex-ring ring-1"></div>
      <div class="vortex-ring ring-2"></div>
      <div class="vortex-ring ring-3"></div>
      <div class="vortex-ring ring-4"></div>
    </div>

    <!-- Spinning cards -->
    <div class="cards-container" v-if="phase === 'swirling' || phase === 'swapping'">
      <div
        v-for="card in cardSpins"
        :key="card.id"
        class="spinning-card"
        :class="phase"
        :style="{
          '--start-angle': card.startAngle + 'rad',
          '--delay': card.delay + 'ms',
          '--card-index': card.id
        }"
      >
        <div class="card-face"></div>
      </div>
    </div>

    <!-- Message overlay -->
    <div class="message-overlay" :class="{ 'active': phase === 'swirling' || phase === 'swapping' }">
      <div class="swap-text" v-if="phase === 'swirling' || phase === 'swapping'">
        <span class="swap-message">DECK SWAP!</span>
        <span class="swap-submessage">Hands shuffled!</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.deck-swap-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
  font-family: 'Press Start 2P', monospace;
  background: radial-gradient(circle at center, rgba(139, 71, 137, 0.3) 0%, transparent 70%);
}

/* ========== VORTEX EFFECT ========== */
.vortex {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
}

.vortex-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 4px solid;
  border-radius: 50%;
  opacity: 0;
}

.vortex.entering .vortex-ring {
  animation: ring-expand 0.5s ease-out forwards;
}

.vortex.swirling .vortex-ring,
.vortex.swapping .vortex-ring {
  animation: ring-spin 2s linear infinite;
  opacity: 0.7;
}

.ring-1 {
  width: 100px;
  height: 100px;
  border-color: #8B4789;
  animation-delay: 0s;
}

.ring-2 {
  width: 180px;
  height: 180px;
  border-color: #FF6B35;
  animation-delay: 0.15s;
}

.ring-3 {
  width: 260px;
  height: 260px;
  border-color: #4FC3F7;
  animation-delay: 0.3s;
}

.ring-4 {
  width: 340px;
  height: 340px;
  border-color: #FFD700;
  animation-delay: 0.45s;
}

@keyframes ring-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
}

@keyframes ring-spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg) scale(1.1);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
  }
}

.vortex.fading .vortex-ring {
  animation: ring-fade 0.6s ease-out forwards;
}

@keyframes ring-fade {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
}

/* ========== SPINNING CARDS ========== */
.cards-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinning-card {
  position: absolute;
  width: 40px;
  height: 55px;
  left: 50%;
  top: 50%;
}

.spinning-card.swirling {
  animation: card-spiral-in 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay);
}

.spinning-card.swapping {
  animation: card-spiral-out 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
  animation-delay: calc(var(--delay) * 0.3);
}

@keyframes card-spiral-in {
  0% {
    transform: translate(-50%, -50%)
      rotate(var(--start-angle))
      translateX(600px)
      rotate(calc(var(--card-index) * 90deg))
      scale(0.5);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%)
      rotate(var(--start-angle))
      translateX(120px)
      rotate(calc(var(--card-index) * 720deg + 360deg))
      scale(1);
    opacity: 1;
  }
}

@keyframes card-spiral-out {
  0% {
    transform: translate(-50%, -50%)
      rotate(var(--start-angle))
      translateX(120px)
      rotate(calc(var(--card-index) * 720deg))
      scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%)
      rotate(calc(var(--start-angle) + 180deg))
      translateX(700px)
      rotate(calc(var(--card-index) * 1080deg))
      scale(0.3);
    opacity: 0;
  }
}

.card-face {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a3a5c 0%, #0d2847 100%);
  border: 3px solid #4fc3f7;
  box-shadow:
    inset -2px -2px 0 #0a1628,
    inset 2px 2px 0 #2a5a8c,
    0 0 15px rgba(79, 195, 247, 0.5);
  position: relative;
  animation: card-glint 0.8s ease-in-out infinite;
}

@keyframes card-glint {
  0%, 100% {
    box-shadow:
      inset -2px -2px 0 #0a1628,
      inset 2px 2px 0 #2a5a8c,
      0 0 15px rgba(79, 195, 247, 0.5);
  }
  50% {
    box-shadow:
      inset -2px -2px 0 #0a1628,
      inset 2px 2px 0 #2a5a8c,
      0 0 25px rgba(79, 195, 247, 0.8);
  }
}

/* Card back pattern */
.card-face::before {
  content: '';
  position: absolute;
  inset: 6px;
  background: repeating-linear-gradient(
    45deg,
    #8B4789 0px,
    #8B4789 4px,
    #6a3568 4px,
    #6a3568 8px
  );
  opacity: 0.4;
}

/* ========== MESSAGE OVERLAY ========== */
.message-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-in;
}

.message-overlay.active {
  opacity: 1;
}

.swap-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: text-appear 0.6s ease-out 0.5s backwards;
  z-index: 10;
}

@keyframes text-appear {
  0% {
    transform: scale(0.3) rotate(-15deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.15) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.swap-message {
  font-size: 4rem;
  color: #8B4789;
  text-shadow:
    4px 4px 0 #000,
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    0 0 40px rgba(139, 71, 137, 0.9);
  animation: message-pulse 1s ease-in-out infinite;
}

@keyframes message-pulse {
  0%, 100% {
    transform: scale(1);
    text-shadow:
      4px 4px 0 #000,
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000,
      0 0 40px rgba(139, 71, 137, 0.9);
  }
  50% {
    transform: scale(1.05);
    text-shadow:
      4px 4px 0 #000,
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000,
      0 0 60px rgba(139, 71, 137, 1);
  }
}

.swap-submessage {
  font-size: 1rem;
  color: #FF6B35;
  text-shadow:
    2px 2px 0 #000,
    -1px -1px 0 #000;
  animation: submessage-slide 1.2s ease-in-out infinite;
}

@keyframes submessage-slide {
  0%, 100% {
    opacity: 0.85;
    transform: translateX(0);
  }
  50% {
    opacity: 1;
    transform: translateX(5px);
  }
}
</style>
