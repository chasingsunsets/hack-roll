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
    default: 1500
  }
})

const emit = defineEmits(['complete'])

const isVisible = ref(false)
const isExiting = ref(false)

// Generate sparkle particles
const sparkles = ref([])
const generateSparkles = () => {
  return Array.from({ length: 16 }, (_, i) => ({
    id: i,
    angle: (i / 16) * 360,
    distance: 40 + Math.random() * 60,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 0.3,
    color: ['#ffd700', '#ffee88', '#ff6b35', '#4fc3f7'][Math.floor(Math.random() * 4)]
  }))
}

// Generate star particles
const stars = ref([])
const generateStars = () => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (i / 8) * 360 + 22.5,
    distance: 60 + Math.random() * 40,
    delay: 0.1 + Math.random() * 0.2
  }))
}

let timeout = null

watch(() => props.show, (newVal) => {
  if (newVal) {
    sparkles.value = generateSparkles()
    stars.value = generateStars()
    isVisible.value = true
    isExiting.value = false

    timeout = setTimeout(() => {
      isExiting.value = true
      setTimeout(() => {
        isVisible.value = false
        emit('complete')
      }, 300)
    }, props.duration - 300)
  }
})

onUnmounted(() => {
  if (timeout) clearTimeout(timeout)
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
      <!-- Central glow -->
      <div class="central-glow"></div>

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
          <svg width="12" height="12" viewBox="0 0 12 12">
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
    </div>
  </Teleport>
</template>

<style scoped>
.book-complete-effect {
  position: fixed;
  transform: translate(-50%, -50%);
  z-index: 2000;
  pointer-events: none;
  animation: effect-in 0.3s steps(4) forwards;
}

.book-complete-effect.exiting {
  animation: effect-out 0.3s steps(4) forwards;
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

/* Central glow */
.central-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle,
    rgba(255, 215, 0, 0.6) 0%,
    rgba(255, 215, 0, 0.3) 40%,
    transparent 70%
  );
  animation: glow-pulse 0.5s steps(4) infinite alternate;
}

@keyframes glow-pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.3);
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
