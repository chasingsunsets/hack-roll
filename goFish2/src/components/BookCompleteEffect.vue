<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  rank: {
    type: String,
    default: ''
  },
  position: {
    type: Object,
    default: () => ({ x: 50, y: 50 })
  },
  duration: {
    type: Number,
    default: 2000
  }
})

const emit = defineEmits(['complete'])

const isVisible = ref(false)
const isExiting = ref(false)

// Generate sparkle particles - more for drama
const sparkles = ref([])
const generateSparkles = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    id: i,
    angle: (i / 24) * 360,
    distance: 60 + Math.random() * 100,
    size: 4 + Math.random() * 10,
    delay: Math.random() * 0.4,
    color: ['#ffd700', '#ffee88', '#ff6b35', '#4fc3f7', '#5dfc9a'][Math.floor(Math.random() * 5)]
  }))
}

// Generate star particles
const stars = ref([])
const generateStars = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    distance: 80 + Math.random() * 60,
    delay: 0.1 + Math.random() * 0.3
  }))
}

// Generate firework trails
const fireworks = ref([])
const generateFireworks = () => {
  return Array.from({ length: 3 }, (_, i) => ({
    id: i,
    x: -50 + Math.random() * 100,
    delay: i * 0.2
  }))
}

// Generate confetti
const confetti = ref([])
const generateConfetti = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: -100 + Math.random() * 200,
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
    color: ['#ffd700', '#ff6b35', '#4fc3f7', '#5dfc9a', '#f8bbd9'][Math.floor(Math.random() * 5)]
  }))
}

let timeout = null

// Trigger celebration shake
const triggerCelebration = () => {
  document.body.classList.add('book-complete-shake')
  setTimeout(() => {
    document.body.classList.remove('book-complete-shake')
  }, 400)
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    sparkles.value = generateSparkles()
    stars.value = generateStars()
    fireworks.value = generateFireworks()
    confetti.value = generateConfetti()
    isVisible.value = true
    isExiting.value = false

    // Trigger screen celebration
    triggerCelebration()

    timeout = setTimeout(() => {
      isExiting.value = true
      setTimeout(() => {
        isVisible.value = false
        emit('complete')
      }, 400)
    }, props.duration - 400)
  }
})

onUnmounted(() => {
  if (timeout) clearTimeout(timeout)
  document.body.classList.remove('book-complete-shake')
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="book-complete-effect"
      :class="{ exiting: isExiting }"
      :style="{
        left: position.x + '%',
        top: position.y + '%'
      }"
    >
      <!-- Background flash -->
      <div class="flash-bg"></div>

      <!-- Central glow -->
      <div class="central-glow"></div>

      <!-- Confetti -->
      <div class="confetti-container">
        <div
          v-for="piece in confetti"
          :key="piece.id"
          class="confetti"
          :style="{
            '--x': piece.x + 'px',
            '--delay': piece.delay + 's',
            '--rotation': piece.rotation + 'deg',
            '--color': piece.color
          }"
        ></div>
      </div>

      <!-- Rank display -->
      <div class="rank-display">
        <span class="rank-text">{{ rank }}</span>
        <span class="book-text">BOOK!</span>
      </div>

      <!-- Sparkle particles -->
      <div class="sparkles">
        <div
          v-for="sparkle in sparkles"
          :key="sparkle.id"
          class="sparkle"
          :style="{
            '--angle': sparkle.angle + 'deg',
            '--distance': sparkle.distance + 'px',
            '--size': sparkle.size + 'px',
            '--delay': sparkle.delay + 's',
            '--color': sparkle.color
          }"
        ></div>
      </div>

      <!-- Star particles -->
      <div class="stars">
        <div
          v-for="star in stars"
          :key="star.id"
          class="star"
          :style="{
            '--angle': star.angle + 'deg',
            '--distance': star.distance + 'px',
            '--delay': star.delay + 's'
          }"
        >
          <svg width="16" height="16" viewBox="0 0 12 12">
            <polygon
              points="6,0 7.5,4.5 12,4.5 8.5,7.5 10,12 6,9 2,12 3.5,7.5 0,4.5 4.5,4.5"
              fill="#ffd700"
            />
          </svg>
        </div>
      </div>

      <!-- Card stack animation -->
      <div class="card-stack">
        <div class="stack-card" v-for="i in 4" :key="i" :style="{ '--card-index': i }"></div>
      </div>

      <!-- Ring burst -->
      <div class="ring-burst"></div>
    </div>
  </Teleport>
</template>

<style scoped>
.book-complete-effect {
  position: fixed;
  transform: translate(-50%, -50%);
  z-index: 2000;
  pointer-events: none;
  animation: effect-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.book-complete-effect.exiting {
  animation: effect-out 0.4s ease-out forwards;
}

@keyframes effect-in {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes effect-out {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

/* Flash background */
.flash-bg {
  position: fixed;
  top: -100vh;
  left: -100vw;
  width: 300vw;
  height: 300vh;
  background: radial-gradient(circle at center, rgba(255, 215, 0, 0.4) 0%, transparent 50%);
  animation: flash-in 0.3s ease-out forwards;
}

@keyframes flash-in {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

/* Ring burst */
.ring-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  border: 4px solid #ffd700;
  transform: translate(-50%, -50%) scale(0);
  animation: ring-expand 0.8s ease-out forwards;
}

@keyframes ring-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
    border-width: 4px;
  }
  100% {
    transform: translate(-50%, -50%) scale(6);
    opacity: 0;
    border-width: 1px;
  }
}

/* Confetti */
.confetti-container {
  position: absolute;
  top: 50%;
  left: 50%;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 12px;
  background: var(--color);
  transform: translateX(var(--x)) rotate(var(--rotation));
  animation: confetti-fall 1.5s ease-out var(--delay) forwards;
  opacity: 0;
}

@keyframes confetti-fall {
  0% {
    transform: translateX(var(--x)) translateY(0) rotate(var(--rotation)) scale(0);
    opacity: 1;
  }
  20% {
    opacity: 1;
    transform: translateX(var(--x)) translateY(-80px) rotate(calc(var(--rotation) + 180deg)) scale(1);
  }
  100% {
    transform: translateX(calc(var(--x) * 1.5)) translateY(200px) rotate(calc(var(--rotation) + 720deg)) scale(0.5);
    opacity: 0;
  }
}

/* Central glow - enhanced */
.central-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle,
    rgba(255, 215, 0, 0.8) 0%,
    rgba(255, 215, 0, 0.4) 30%,
    rgba(93, 252, 154, 0.2) 60%,
    transparent 80%
  );
  animation: glow-pulse 0.6s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 1;
  }
}

/* Rank display */
.rank-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-family: 'Press Start 2P', monospace;
  animation: rank-pop 0.4s steps(4) forwards;
}

@keyframes rank-pop {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(-20deg);
  }
  60% {
    transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

.rank-text {
  font-size: 2rem;
  color: #ffd700;
  text-shadow:
    3px 3px 0 #cc8800,
    -1px -1px 0 #ffee88;
}

.book-text {
  font-size: 0.8rem;
  color: #5dfc9a;
  text-shadow:
    2px 2px 0 #2a6a4a,
    -1px -1px 0 #8affba;
}

/* Sparkle particles */
.sparkles {
  position: absolute;
  top: 50%;
  left: 50%;
}

.sparkle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: var(--color);
  transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
  animation: sparkle-burst 0.8s steps(8) forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes sparkle-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scale(0);
    opacity: 0;
  }
}

/* Star particles */
.stars {
  position: absolute;
  top: 50%;
  left: 50%;
}

.star {
  position: absolute;
  transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
  animation: star-burst 1s steps(8) forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

.star svg {
  animation: star-spin 0.5s steps(8) infinite;
}

@keyframes star-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(0);
    opacity: 1;
  }
  30% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(var(--distance) * 0.3)) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scale(0.5);
    opacity: 0;
  }
}

@keyframes star-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Card stack animation */
.card-stack {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.stack-card {
  position: absolute;
  width: 30px;
  height: 42px;
  background: linear-gradient(135deg, #f8f4e8 0%, #e8e4d8 100%);
  border: 2px solid #2c2c2c;
  box-shadow:
    inset -2px -2px 0 #d4d0c4,
    inset 2px 2px 0 #ffffff;
  animation: card-collect 0.6s steps(6) forwards;
  animation-delay: calc(var(--card-index) * 0.1s);
  opacity: 0;
}

.stack-card:nth-child(1) { --start-x: -60px; --start-y: -40px; }
.stack-card:nth-child(2) { --start-x: 60px; --start-y: -40px; }
.stack-card:nth-child(3) { --start-x: -60px; --start-y: 40px; }
.stack-card:nth-child(4) { --start-x: 60px; --start-y: 40px; }

@keyframes card-collect {
  0% {
    transform: translate(var(--start-x), var(--start-y)) rotate(calc(var(--card-index) * 15deg)) scale(1);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(calc((var(--card-index) - 2) * 5deg)) scale(0.8);
    opacity: 0.5;
  }
}
</style>
