<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Generate random bubbles
const bubbles = ref([])
const seaweed = ref([])

const generateBubbles = () => {
  const newBubbles = []
  for (let i = 0; i < 15; i++) {
    newBubbles.push({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 4,
      size: 4 + Math.random() * 8
    })
  }
  bubbles.value = newBubbles
}

const generateSeaweed = () => {
  const newSeaweed = []
  for (let i = 0; i < 8; i++) {
    newSeaweed.push({
      id: i,
      x: 5 + i * 12 + Math.random() * 5,
      height: 60 + Math.random() * 80,
      delay: Math.random() * 2,
      color: Math.random() > 0.5 ? '#2d5a27' : '#1e3d1a'
    })
  }
  seaweed.value = newSeaweed
}

onMounted(() => {
  generateBubbles()
  generateSeaweed()
})
</script>

<template>
  <div class="pixel-background">
    <!-- Water gradient layers -->
    <div class="water-layer water-top"></div>
    <div class="water-layer water-mid"></div>
    <div class="water-layer water-bottom"></div>

    <!-- Pixel grid overlay -->
    <div class="pixel-grid"></div>

    <!-- Animated bubbles -->
    <div
      v-for="bubble in bubbles"
      :key="bubble.id"
      class="bubble"
      :style="{
        left: bubble.x + '%',
        animationDelay: bubble.delay + 's',
        animationDuration: bubble.duration + 's',
        width: bubble.size + 'px',
        height: bubble.size + 'px'
      }"
    ></div>

    <!-- Seaweed at bottom -->
    <div
      v-for="weed in seaweed"
      :key="weed.id"
      class="seaweed"
      :style="{
        left: weed.x + '%',
        height: weed.height + 'px',
        animationDelay: weed.delay + 's',
        backgroundColor: weed.color
      }"
    ></div>

    <!-- Sandy bottom -->
    <div class="sand-bottom">
      <div class="sand-pixel" v-for="i in 50" :key="i" :style="{ left: (i * 2) + '%' }"></div>
    </div>

    <!-- Small fish swimming in background -->
    <div class="bg-fish fish-1"></div>
    <div class="bg-fish fish-2"></div>
    <div class="bg-fish fish-3"></div>
  </div>
</template>

<style scoped>
.pixel-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

/* Water layers */
.water-layer {
  position: absolute;
  left: 0;
  width: 100%;
}

.water-top {
  top: 0;
  height: 30%;
  background: linear-gradient(180deg, #0a1628 0%, #0d2847 100%);
}

.water-mid {
  top: 30%;
  height: 40%;
  background: linear-gradient(180deg, #0d2847 0%, #114b6d 100%);
}

.water-bottom {
  top: 70%;
  height: 30%;
  background: linear-gradient(180deg, #114b6d 0%, #0a3a52 100%);
}

/* Pixel grid overlay for retro feel */
.pixel-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 8px 8px;
  pointer-events: none;
}

/* Bubbles */
.bubble {
  position: absolute;
  bottom: -20px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: rise linear infinite;
  image-rendering: pixelated;
}

@keyframes rise {
  0% {
    bottom: -20px;
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    bottom: 110%;
    opacity: 0;
  }
}

/* Seaweed */
.seaweed {
  position: absolute;
  bottom: 40px;
  width: 12px;
  border-radius: 6px 6px 0 0;
  animation: sway 3s ease-in-out infinite;
  transform-origin: bottom center;
  image-rendering: pixelated;
}

@keyframes sway {
  0%, 100% {
    transform: skewX(-5deg);
  }
  50% {
    transform: skewX(5deg);
  }
}

/* Sandy bottom */
.sand-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background: linear-gradient(180deg, #3d2817 0%, #5c3d23 50%, #4a3120 100%);
}

.sand-pixel {
  position: absolute;
  bottom: 35px;
  width: 8px;
  height: 8px;
  background: #4a3120;
}

.sand-pixel:nth-child(odd) {
  bottom: 40px;
  background: #5c3d23;
}

.sand-pixel:nth-child(3n) {
  bottom: 38px;
  background: #6b4c32;
}

/* Background fish */
.bg-fish {
  position: absolute;
  width: 24px;
  height: 16px;
  opacity: 0.3;
  animation: swim linear infinite;
}

.bg-fish::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 12px;
  background: #4fc3f7;
  border-radius: 50% 50% 50% 50%;
  top: 2px;
  left: 0;
}

.bg-fish::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid #4fc3f7;
  right: 0;
  top: 4px;
  transform: rotate(180deg);
}

.fish-1 {
  top: 20%;
  animation-duration: 25s;
}

.fish-2 {
  top: 45%;
  animation-duration: 30s;
  animation-delay: -10s;
}

.fish-2::before,
.fish-2::after {
  background: #f48fb1;
  border-left-color: #f48fb1;
}

.fish-3 {
  top: 70%;
  animation-duration: 20s;
  animation-delay: -5s;
}

.fish-3::before,
.fish-3::after {
  background: #81c784;
  border-left-color: #81c784;
}

@keyframes swim {
  0% {
    left: -50px;
  }
  100% {
    left: calc(100% + 50px);
  }
}
</style>
