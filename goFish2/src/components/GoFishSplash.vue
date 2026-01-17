<script setup>
import { ref, watch, onUnmounted } from 'vue'
import PixelFish from './PixelFish.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 2000
  }
})

const emit = defineEmits(['complete'])

const isVisible = ref(false)
const isExiting = ref(false)

// Generate random bubble positions
const bubbles = ref([])
const generateBubbles = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    y: 60 + Math.random() * 30,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1
  }))
}

// Generate splash ripples
const ripples = ref([])
const generateRipples = () => {
  return Array.from({ length: 3 }, (_, i) => ({
    id: i,
    delay: i * 0.2
  }))
}

let timeout = null

watch(() => props.show, (newVal) => {
  if (newVal) {
    bubbles.value = generateBubbles()
    ripples.value = generateRipples()
    isVisible.value = true
    isExiting.value = false

    // Auto-hide after duration
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
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="go-fish-splash" :class="{ exiting: isExiting }">
      <!-- Ripple effects -->
      <div class="ripples">
        <div
          v-for="ripple in ripples"
          :key="ripple.id"
          class="ripple"
          :style="{ animationDelay: ripple.delay + 's' }"
        ></div>
      </div>

      <!-- Main splash content -->
      <div class="splash-content">
        <!-- Jumping fish -->
        <div class="splash-fish">
          <PixelFish :size="80" color="gold" />
        </div>

        <!-- GO FISH! text -->
        <div class="splash-text">
          <span class="text-go">GO</span>
          <span class="text-fish">FISH!</span>
        </div>

        <!-- Water splash effect -->
        <div class="water-splash">
          <div class="splash-drop" v-for="i in 8" :key="i" :style="{ '--drop-index': i }"></div>
        </div>
      </div>

      <!-- Bubbles -->
      <div class="bubbles">
        <div
          v-for="bubble in bubbles"
          :key="bubble.id"
          class="bubble"
          :style="{
            left: bubble.x + '%',
            bottom: bubble.y + '%',
            width: bubble.size + 'px',
            height: bubble.size + 'px',
            animationDelay: bubble.delay + 's',
            animationDuration: bubble.duration + 's'
          }"
        ></div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.go-fish-splash {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
  background: radial-gradient(circle at center, rgba(79, 195, 247, 0.3) 0%, transparent 60%);
  animation: splash-bg-in 0.3s steps(4) forwards;
}

.go-fish-splash.exiting {
  animation: splash-bg-out 0.4s steps(4) forwards;
}

@keyframes splash-bg-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes splash-bg-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

/* Ripple effects */
.ripples {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ripple {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 4px solid rgba(79, 195, 247, 0.6);
  border-radius: 0;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple-expand 1s steps(8) forwards;
}

@keyframes ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

/* Splash content */
.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: content-bounce 0.5s steps(6) forwards;
}

@keyframes content-bounce {
  0% {
    transform: scale(0) rotate(-10deg);
    opacity: 0;
  }
  40% {
    transform: scale(1.2) rotate(5deg);
    opacity: 1;
  }
  70% {
    transform: scale(0.9) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.go-fish-splash.exiting .splash-content {
  animation: content-exit 0.4s steps(4) forwards;
}

@keyframes content-exit {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(0.5) translateY(-50px);
    opacity: 0;
  }
}

/* Jumping fish */
.splash-fish {
  animation: fish-jump 0.8s steps(8) infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

@keyframes fish-jump {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(-10deg);
  }
  50% {
    transform: translateY(-30px) rotate(0deg);
  }
  75% {
    transform: translateY(-20px) rotate(10deg);
  }
}

/* Text styling */
.splash-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  font-family: 'Press Start 2P', monospace;
}

.text-go {
  font-size: 2rem;
  color: #4fc3f7;
  text-shadow:
    4px 4px 0 #0288d1,
    -2px -2px 0 #81d4fa,
    0 0 20px rgba(79, 195, 247, 0.5);
  animation: text-wobble 0.5s steps(4) infinite alternate;
}

.text-fish {
  font-size: 2.5rem;
  color: #ffd700;
  text-shadow:
    4px 4px 0 #cc8800,
    -2px -2px 0 #ffee88,
    0 0 20px rgba(255, 215, 0, 0.5);
  animation: text-wobble 0.5s steps(4) infinite alternate-reverse;
}

@keyframes text-wobble {
  0% { transform: translateX(-2px) rotate(-1deg); }
  100% { transform: translateX(2px) rotate(1deg); }
}

/* Water splash drops */
.water-splash {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.splash-drop {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #4fc3f7;
  border: 2px solid #81d4fa;
  animation: drop-burst 0.8s steps(4) forwards;
  --angle: calc(var(--drop-index) * 45deg);
  --distance: 80px;
}

@keyframes drop-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(var(--distance)) scale(0);
    opacity: 0;
  }
}

/* Bubbles */
.bubbles {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bubble {
  position: absolute;
  background: rgba(79, 195, 247, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.6);
  animation: bubble-rise 1.5s steps(12) forwards;
}

@keyframes bubble-rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-200px) scale(0.5);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 600px) {
  .text-go {
    font-size: 1.5rem;
  }

  .text-fish {
    font-size: 2rem;
  }

  .splash-fish {
    transform: scale(0.8);
  }
}
</style>
