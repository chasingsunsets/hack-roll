<script setup>
import { ref, onMounted } from 'vue'

// Generate random bubbles
const bubbles = ref([])
const seaweed = ref([])
const coral = ref([])
const bgFish = ref([])
const lightRays = ref([])

const generateBubbles = () => {
  const newBubbles = []
  for (let i = 0; i < 20; i++) {
    newBubbles.push({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 6,
      size: 4 + Math.random() * 10
    })
  }
  bubbles.value = newBubbles
}

const generateSeaweed = () => {
  const newSeaweed = []
  for (let i = 0; i < 12; i++) {
    newSeaweed.push({
      id: i,
      x: 3 + i * 8 + Math.random() * 4,
      height: 50 + Math.random() * 100,
      delay: Math.random() * 2,
      color: ['#2d5a27', '#1e3d1a', '#3a7a33', '#1a4a1a'][Math.floor(Math.random() * 4)],
      width: 8 + Math.random() * 8
    })
  }
  seaweed.value = newSeaweed
}

const generateCoral = () => {
  const newCoral = []
  const coralTypes = ['branch', 'fan', 'brain']
  for (let i = 0; i < 6; i++) {
    newCoral.push({
      id: i,
      x: 10 + i * 15 + Math.random() * 10,
      type: coralTypes[Math.floor(Math.random() * coralTypes.length)],
      color: ['#ff6b35', '#f48fb1', '#ffd54f', '#ff9a6c'][Math.floor(Math.random() * 4)],
      size: 0.8 + Math.random() * 0.6
    })
  }
  coral.value = newCoral
}

const generateBgFish = () => {
  const newFish = []
  const fishColors = ['#4fc3f7', '#f48fb1', '#81c784', '#ffd54f', '#ff6b35']
  for (let i = 0; i < 8; i++) {
    newFish.push({
      id: i,
      y: 15 + Math.random() * 60,
      color: fishColors[Math.floor(Math.random() * fishColors.length)],
      duration: 20 + Math.random() * 20,
      delay: Math.random() * 15,
      size: 16 + Math.random() * 16,
      direction: Math.random() > 0.5 ? 1 : -1
    })
  }
  bgFish.value = newFish
}

const generateLightRays = () => {
  const newRays = []
  for (let i = 0; i < 5; i++) {
    newRays.push({
      id: i,
      x: 10 + i * 20 + Math.random() * 10,
      width: 30 + Math.random() * 50,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3
    })
  }
  lightRays.value = newRays
}

onMounted(() => {
  generateBubbles()
  generateSeaweed()
  generateCoral()
  generateBgFish()
  generateLightRays()
})
</script>

<template>
  <div class="pixel-background">
    <!-- Water gradient layers -->
    <div class="water-layer water-top"></div>
    <div class="water-layer water-mid"></div>
    <div class="water-layer water-bottom"></div>

    <!-- Light rays from surface -->
    <div class="light-rays">
      <div
        v-for="ray in lightRays"
        :key="ray.id"
        class="light-ray"
        :style="{
          left: ray.x + '%',
          width: ray.width + 'px',
          animationDelay: ray.delay + 's',
          animationDuration: ray.duration + 's'
        }"
      ></div>
    </div>

    <!-- Pixel grid overlay -->
    <div class="pixel-grid"></div>

    <!-- Animated bubbles -->
    <div class="bubbles-container">
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
    </div>

    <!-- Coral formations -->
    <div class="coral-container">
      <div
        v-for="c in coral"
        :key="c.id"
        class="coral"
        :class="c.type"
        :style="{
          left: c.x + '%',
          '--coral-color': c.color,
          transform: `scale(${c.size})`
        }"
      >
        <!-- Branch coral -->
        <template v-if="c.type === 'branch'">
          <div class="coral-branch b1"></div>
          <div class="coral-branch b2"></div>
          <div class="coral-branch b3"></div>
        </template>
        <!-- Fan coral -->
        <template v-else-if="c.type === 'fan'">
          <div class="coral-fan"></div>
        </template>
        <!-- Brain coral -->
        <template v-else>
          <div class="coral-brain"></div>
        </template>
      </div>
    </div>

    <!-- Seaweed at bottom -->
    <div class="seaweed-container">
      <div
        v-for="weed in seaweed"
        :key="weed.id"
        class="seaweed"
        :style="{
          left: weed.x + '%',
          height: weed.height + 'px',
          width: weed.width + 'px',
          animationDelay: weed.delay + 's',
          backgroundColor: weed.color
        }"
      ></div>
    </div>

    <!-- Sandy bottom with texture -->
    <div class="sand-bottom">
      <div class="sand-layer s1"></div>
      <div class="sand-layer s2"></div>
      <div class="sand-layer s3"></div>
      <div class="sand-pixel" v-for="i in 60" :key="i" :style="{ left: ((i * 1.7) % 100) + '%' }"></div>
    </div>

    <!-- Background fish -->
    <div class="fish-container">
      <div
        v-for="fish in bgFish"
        :key="fish.id"
        class="bg-fish"
        :style="{
          top: fish.y + '%',
          animationDuration: fish.duration + 's',
          animationDelay: fish.delay + 's',
          '--fish-color': fish.color,
          '--fish-size': fish.size + 'px',
          '--fish-direction': fish.direction
        }"
      >
        <svg :width="fish.size" :height="fish.size * 0.6" viewBox="0 0 16 10" class="fish-svg">
          <!-- Fish body -->
          <rect x="3" y="2" width="8" height="6" :fill="fish.color"/>
          <rect x="2" y="3" width="1" height="4" :fill="fish.color"/>
          <rect x="11" y="3" width="1" height="4" :fill="fish.color"/>
          <!-- Tail -->
          <rect x="0" y="2" width="2" height="2" :fill="fish.color"/>
          <rect x="0" y="6" width="2" height="2" :fill="fish.color"/>
          <!-- Eye -->
          <rect x="9" y="4" width="2" height="2" fill="#ffffff"/>
          <rect x="10" y="4" width="1" height="1" fill="#1a1a2e"/>
          <!-- Fin -->
          <rect x="5" y="0" width="3" height="2" :fill="fish.color" opacity="0.7"/>
          <rect x="5" y="8" width="3" height="2" :fill="fish.color" opacity="0.7"/>
        </svg>
      </div>
    </div>
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
  height: 25%;
  background: linear-gradient(180deg, #0a1628 0%, #0d2847 100%);
}

.water-mid {
  top: 25%;
  height: 45%;
  background: linear-gradient(180deg, #0d2847 0%, #114b6d 100%);
}

.water-bottom {
  top: 70%;
  height: 30%;
  background: linear-gradient(180deg, #114b6d 0%, #0a3a52 100%);
}

/* Light rays */
.light-rays {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70%;
  pointer-events: none;
  overflow: hidden;
}

.light-ray {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 30%,
    rgba(255, 255, 255, 0.02) 60%,
    transparent 100%
  );
  transform: skewX(-15deg);
  animation: ray-shimmer linear infinite;
}

@keyframes ray-shimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* Pixel grid overlay for retro feel */
.pixel-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 8px 8px;
  pointer-events: none;
}

/* Bubbles */
.bubbles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bubble {
  position: absolute;
  bottom: -20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.25);
  animation: rise linear infinite;
  image-rendering: pixelated;
}

@keyframes rise {
  0% {
    bottom: -20px;
    opacity: 0;
    transform: translateX(0);
  }
  10% {
    opacity: 0.5;
  }
  50% {
    transform: translateX(10px);
  }
  90% {
    opacity: 0.4;
  }
  100% {
    bottom: 110%;
    opacity: 0;
    transform: translateX(-10px);
  }
}

/* Coral */
.coral-container {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.coral {
  position: absolute;
  bottom: 0;
  transform-origin: bottom center;
}

.coral-branch {
  position: absolute;
  bottom: 0;
  width: 8px;
  background: var(--coral-color);
  border-radius: 4px 4px 0 0;
}

.coral-branch.b1 {
  left: 0;
  height: 40px;
  transform: rotate(-15deg);
}

.coral-branch.b2 {
  left: 12px;
  height: 55px;
}

.coral-branch.b3 {
  left: 24px;
  height: 35px;
  transform: rotate(15deg);
}

.coral-fan {
  width: 40px;
  height: 35px;
  background: var(--coral-color);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  opacity: 0.8;
}

.coral-brain {
  width: 30px;
  height: 25px;
  background: var(--coral-color);
  border-radius: 50% 50% 40% 40%;
}

/* Seaweed */
.seaweed-container {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.seaweed {
  position: absolute;
  bottom: 0;
  border-radius: 50% 50% 0 0;
  animation: sway 3s ease-in-out infinite;
  transform-origin: bottom center;
  image-rendering: pixelated;
}

@keyframes sway {
  0%, 100% {
    transform: skewX(-8deg) scaleY(1);
  }
  25% {
    transform: skewX(0deg) scaleY(1.02);
  }
  50% {
    transform: skewX(8deg) scaleY(1);
  }
  75% {
    transform: skewX(0deg) scaleY(0.98);
  }
}

/* Sandy bottom */
.sand-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
}

.sand-layer {
  position: absolute;
  left: 0;
  width: 100%;
}

.sand-layer.s1 {
  bottom: 0;
  height: 30px;
  background: #4a3120;
}

.sand-layer.s2 {
  bottom: 30px;
  height: 12px;
  background: #5c3d23;
}

.sand-layer.s3 {
  bottom: 42px;
  height: 8px;
  background: linear-gradient(180deg, transparent 0%, #3d2817 100%);
}

.sand-pixel {
  position: absolute;
  bottom: 35px;
  width: 8px;
  height: 8px;
  background: #4a3120;
}

.sand-pixel:nth-child(odd) {
  bottom: 38px;
  background: #5c3d23;
}

.sand-pixel:nth-child(3n) {
  bottom: 40px;
  background: #6b4c32;
}

.sand-pixel:nth-child(5n) {
  bottom: 36px;
  width: 12px;
  background: #3d2817;
}

/* Background fish */
.fish-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bg-fish {
  position: absolute;
  opacity: 0.25;
  animation: swim linear infinite;
}

.fish-svg {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  transform: scaleX(var(--fish-direction, 1));
}

@keyframes swim {
  0% {
    left: -50px;
    transform: translateY(0);
  }
  25% {
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(0);
  }
  75% {
    transform: translateY(10px);
  }
  100% {
    left: calc(100% + 50px);
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .light-ray {
    opacity: 0.5;
  }

  .bg-fish {
    opacity: 0.15;
  }
}
</style>
