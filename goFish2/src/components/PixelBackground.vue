<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTurbulence } from '../composables/useTurbulence'

const props = defineProps({
  roomCode: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['turbulence-triggered'])

const { turbulenceActive, triggerTurbulence } = useTurbulence()

// Generate random bubbles
const bubbles = ref([])
const seaweed = ref([])
const coral = ref([])
const bgFish = ref([])
const lightRays = ref([])
const particles = ref([])

let turbulenceInterval = null

const generateBubbles = () => {
  const newBubbles = []
  const bubbleSizes = ['small', 'medium', 'large']
  const totalBubbles = 35
  
  // Create some bubble clusters
  const clusterCount = 5
  const bubblesPerCluster = Math.floor(totalBubbles / clusterCount)
  const remainingBubbles = totalBubbles - (bubblesPerCluster * clusterCount)
  
  let bubbleId = 0
  
  // Generate clustered bubbles
  for (let cluster = 0; cluster < clusterCount; cluster++) {
    const clusterX = 10 + Math.random() * 80
    const clusterDelay = Math.random() * 8
    
    for (let i = 0; i < bubblesPerCluster; i++) {
      const sizeCategory = bubbleSizes[Math.floor(Math.random() * bubbleSizes.length)]
      let baseSize
      if (sizeCategory === 'small') baseSize = 4 + Math.random() * 4
      else if (sizeCategory === 'medium') baseSize = 8 + Math.random() * 6
      else baseSize = 14 + Math.random() * 8
      
      newBubbles.push({
        id: bubbleId++,
        x: clusterX + (Math.random() - 0.5) * 8,
        delay: clusterDelay + Math.random() * 2,
        duration: 6 + Math.random() * 8,
        size: baseSize,
        sizeCategory: sizeCategory,
        horizontalDrift: (Math.random() - 0.5) * 30,
        expansionRate: 0.8 + Math.random() * 0.4,
        opacityPeak: 0.4 + Math.random() * 0.3
      })
    }
  }
  
  // Generate remaining individual bubbles
  for (let i = 0; i < remainingBubbles; i++) {
    const sizeCategory = bubbleSizes[Math.floor(Math.random() * bubbleSizes.length)]
    let baseSize
    if (sizeCategory === 'small') baseSize = 4 + Math.random() * 4
    else if (sizeCategory === 'medium') baseSize = 8 + Math.random() * 6
    else baseSize = 14 + Math.random() * 8
    
    newBubbles.push({
      id: bubbleId++,
      x: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 6 + Math.random() * 8,
      size: baseSize,
      sizeCategory: sizeCategory,
      horizontalDrift: (Math.random() - 0.5) * 25,
      expansionRate: 0.8 + Math.random() * 0.4,
      opacityPeak: 0.4 + Math.random() * 0.3
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
  const fishPatterns = ['solid', 'striped', 'spotted']
  const fishSizes = ['small', 'medium', 'large']
  
  for (let i = 0; i < 10; i++) {
    const baseSize = 20 + Math.random() * 24
    newFish.push({
      id: i,
      y: 15 + Math.random() * 60,
      color: fishColors[Math.floor(Math.random() * fishColors.length)],
      pattern: fishPatterns[Math.floor(Math.random() * fishPatterns.length)],
      sizeCategory: fishSizes[Math.floor(Math.random() * fishSizes.length)],
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 20,
      size: baseSize,
      direction: Math.random() > 0.5 ? 1 : -1,
      verticalSpeed: 0.3 + Math.random() * 0.5,
      verticalAmplitude: 15 + Math.random() * 20
    })
  }
  bgFish.value = newFish
}

const generateLightRays = () => {
  const newRays = []
  for (let i = 0; i < 7; i++) {
    newRays.push({
      id: i,
      x: 5 + i * 15 + Math.random() * 8,
      width: 40 + Math.random() * 60,
      delay: Math.random() * 4,
      duration: 5 + Math.random() * 4
    })
  }
  lightRays.value = newRays
}

const generateParticles = () => {
  const newParticles = []
  for (let i = 0; i < 30; i++) {
    newParticles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 12,
      drift: (Math.random() - 0.5) * 50
    })
  }
  particles.value = newParticles
}

const startTurbulenceTimer = () => {
  // Trigger turbulence every 20-40 seconds
  const scheduleNext = () => {
    const delay = 20000 + Math.random() * 20000
    turbulenceInterval = setTimeout(() => {
      triggerTurbulence()
      // Emit event to parent so it can notify the server
      emit('turbulence-triggered', props.roomCode)
      scheduleNext()
    }, delay)
  }
  scheduleNext()
}

onMounted(() => {
  generateBubbles()
  generateSeaweed()
  generateCoral()
  generateBgFish()
  generateLightRays()
  generateParticles()
  startTurbulenceTimer()
})

onUnmounted(() => {
  if (turbulenceInterval) {
    clearTimeout(turbulenceInterval)
  }
})
</script>

<template>
  <div class="pixel-background" :class="{ 'turbulence-active': turbulenceActive }">
    <!-- Water gradient layers -->
    <div class="water-layer water-top"></div>
    <div class="water-layer water-mid"></div>
    <div class="water-layer water-bottom"></div>

    <!-- Floating particles -->
    <div class="particles-container">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          left: particle.x + '%',
          top: particle.y + '%',
          width: particle.size + 'px',
          height: particle.size + 'px',
          animationDelay: particle.delay + 's',
          animationDuration: particle.duration + 's',
          '--particle-drift': particle.drift + 'px'
        }"
      ></div>
    </div>

    <!-- Turbulence effect overlay -->
    <div v-if="turbulenceActive" class="turbulence-overlay">
      <div class="turbulence-wave wave-1"></div>
      <div class="turbulence-wave wave-2"></div>
      <div class="turbulence-wave wave-3"></div>
    </div>

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
        :class="bubble.sizeCategory"
        :style="{
          left: bubble.x + '%',
          animationDelay: bubble.delay + 's',
          animationDuration: bubble.duration + 's',
          width: bubble.size + 'px',
          height: bubble.size + 'px',
          '--bubble-drift': bubble.horizontalDrift + 'px',
          '--bubble-expansion': bubble.expansionRate,
          '--bubble-opacity-peak': bubble.opacityPeak
        }"
      >
        <div class="bubble-inner"></div>
        <div class="bubble-highlight"></div>
      </div>
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
          '--fish-direction': fish.direction,
          '--vertical-speed': fish.verticalSpeed,
          '--vertical-amplitude': fish.verticalAmplitude + 'px'
        }"
      >
        <svg :width="fish.size" :height="fish.size * 0.7" viewBox="0 0 20 14" class="fish-svg">
          <defs>
            <linearGradient :id="`fishGrad${fish.id}`" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" :stop-color="fish.color" stop-opacity="1"/>
              <stop offset="100%" :stop-color="fish.color" stop-opacity="0.7"/>
            </linearGradient>
          </defs>
          
          <!-- Tail fin (caudal) -->
          <path d="M 0 5 L 2 3 L 2 5 L 0 7 L 2 9 L 2 11 L 0 7 Z" :fill="fish.color" opacity="0.8"/>
          <path d="M 1 6 L 2 4 L 2 8 L 1 8 Z" :fill="fish.color" opacity="0.6"/>
          
          <!-- Body (teardrop/oval shape) -->
          <ellipse cx="10" cy="7" rx="7" ry="5" :fill="'url(#fishGrad' + fish.id + ')'"/>
          <ellipse cx="8" cy="6.5" rx="5" ry="4" :fill="fish.color" opacity="0.9"/>
          
          <!-- Scales pattern - spotted -->
          <g v-if="fish.pattern === 'spotted'">
            <circle cx="8" cy="6" r="1" :fill="fish.color" opacity="0.3"/>
            <circle cx="11" cy="7" r="0.8" :fill="fish.color" opacity="0.3"/>
            <circle cx="9" cy="8" r="0.6" :fill="fish.color" opacity="0.3"/>
          </g>
          <!-- Scales pattern - striped -->
          <g v-else-if="fish.pattern === 'striped'">
            <line x1="5" y1="6" x2="13" y2="6" :stroke="fish.color" stroke-width="0.5" opacity="0.4"/>
            <line x1="6" y1="7.5" x2="12" y2="7.5" :stroke="fish.color" stroke-width="0.5" opacity="0.4"/>
            <line x1="5.5" y1="8.5" x2="11.5" y2="8.5" :stroke="fish.color" stroke-width="0.5" opacity="0.4"/>
          </g>
          
          <!-- Dorsal fin (top) -->
          <path d="M 6 2 L 7 1 L 9 1.5 L 11 1 L 12 2 L 11 3 L 9 2.5 L 7 3 Z" :fill="fish.color" opacity="0.7"/>
          <path d="M 8 1.5 L 9 1.5 L 9 2.5 L 8 2.5 Z" :fill="fish.color" opacity="0.5"/>
          
          <!-- Pectoral fin (side) -->
          <ellipse cx="5" cy="7" rx="2" ry="1.5" :fill="fish.color" opacity="0.6" transform="rotate(-20 5 7)"/>
          
          <!-- Pelvic fin (bottom) -->
          <path d="M 7 10 L 8 11 L 9 11 L 10 10 L 9 9.5 L 8 9.5 Z" :fill="fish.color" opacity="0.7"/>
          
          <!-- Eye -->
          <circle cx="12" cy="6.5" r="1.5" fill="#ffffff" opacity="0.9"/>
          <circle cx="12.5" cy="6.5" r="1" :fill="fish.color" opacity="0.3"/>
          <circle cx="12.8" cy="6.5" r="0.6" fill="#1a1a2e"/>
          <circle cx="13" cy="6.3" r="0.2" fill="#ffffff" opacity="0.8"/>
          
          <!-- Mouth -->
          <ellipse cx="15" cy="7" rx="1" ry="0.5" :fill="fish.color" opacity="0.6"/>
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
  z-index: 0;
  overflow: hidden;
  background: #0a1628;
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
  bottom: -30px;
  border-radius: 50%;
  animation: rise ease-in-out infinite;
  image-rendering: pixelated;
  pointer-events: none;
}

.bubble-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    inset 0 0 6px rgba(255, 255, 255, 0.3),
    0 0 4px rgba(255, 255, 255, 0.2);
}

.bubble-highlight {
  position: absolute;
  top: 20%;
  left: 25%;
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
}

.bubble.small {
  border-width: 1.5px;
}

.bubble.small .bubble-inner {
  border-width: 1.5px;
}

.bubble.large {
  border-width: 2.5px;
}

.bubble.large .bubble-inner {
  border-width: 2.5px;
}

@keyframes rise {
  0% {
    bottom: -30px;
    opacity: 0;
    transform: translateX(0) scale(0.8);
  }
  5% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.3);
  }
  15% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.7);
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.3)) scale(0.85);
  }
  30% {
    opacity: var(--bubble-opacity-peak, 0.5);
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.6)) scale(0.9);
  }
  50% {
    opacity: var(--bubble-opacity-peak, 0.5);
    transform: translateX(var(--bubble-drift, 0px)) scale(1);
  }
  70% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.8);
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.8)) scale(calc(1 * var(--bubble-expansion, 1)));
  }
  85% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.5);
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.5)) scale(calc(1.1 * var(--bubble-expansion, 1)));
  }
  95% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.2);
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.3)) scale(calc(1.15 * var(--bubble-expansion, 1)));
  }
  100% {
    bottom: 110%;
    opacity: 0;
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.2)) scale(calc(1.2 * var(--bubble-expansion, 1)));
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
  opacity: 0.4;
  animation: swim linear infinite;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.1));
}

.fish-svg {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  transform: scaleX(var(--fish-direction, 1));
}

@keyframes swim {
  0% {
    left: -50px;
    transform: translateY(0) translateX(0);
  }
  12.5% {
    transform: translateY(calc(var(--vertical-amplitude, 15px) * -0.5)) translateX(2px);
  }
  25% {
    transform: translateY(calc(var(--vertical-amplitude, 15px) * -1)) translateX(0);
  }
  37.5% {
    transform: translateY(calc(var(--vertical-amplitude, 15px) * -0.5)) translateX(-2px);
  }
  50% {
    transform: translateY(0) translateX(0);
  }
  62.5% {
    transform: translateY(calc(var(--vertical-amplitude, 15px) * 0.5)) translateX(2px);
  }
  75% {
    transform: translateY(calc(var(--vertical-amplitude, 15px) * 1)) translateX(0);
  }
  87.5% {
    transform: translateY(calc(var(--vertical-amplitude, 15px) * 0.5)) translateX(-2px);
  }
  100% {
    left: calc(100% + 50px);
    transform: translateY(0) translateX(0);
  }
}

/* Particles */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: particle-float linear infinite;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
}

@keyframes particle-float {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  50% {
    transform: translate(var(--particle-drift, 0px), -30vh) rotate(180deg);
    opacity: 0.8;
  }
  90% {
    opacity: 0.4;
  }
  100% {
    transform: translate(calc(var(--particle-drift, 0px) * 0.5), -60vh) rotate(360deg);
    opacity: 0;
  }
}

/* Turbulence effects */
.turbulence-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.turbulence-wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.03) 25%,
    rgba(79, 195, 247, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 75%,
    transparent 100%
  );
  animation: turbulence-sweep 3s ease-in-out;
}

.turbulence-wave.wave-2 {
  animation-delay: 0.3s;
  animation-duration: 2.7s;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(129, 199, 132, 0.05) 50%,
    transparent 100%
  );
}

.turbulence-wave.wave-3 {
  animation-delay: 0.6s;
  animation-duration: 3.3s;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(255, 215, 0, 0.04) 50%,
    transparent 100%
  );
}

@keyframes turbulence-sweep {
  0% {
    transform: translateX(-100%) scale(1);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%) scale(1.2);
    opacity: 0;
  }
}

/* Turbulence active state - screen sway */
.pixel-background.turbulence-active {
  animation: underwater-sway 3s ease-in-out;
}

@keyframes underwater-sway {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  10% {
    transform: translateX(-15px) rotate(-0.5deg);
  }
  20% {
    transform: translateX(10px) rotate(0.3deg);
  }
  30% {
    transform: translateX(-12px) rotate(-0.4deg);
  }
  40% {
    transform: translateX(8px) rotate(0.2deg);
  }
  50% {
    transform: translateX(-10px) rotate(-0.3deg);
  }
  60% {
    transform: translateX(7px) rotate(0.2deg);
  }
  70% {
    transform: translateX(-5px) rotate(-0.2deg);
  }
  80% {
    transform: translateX(3px) rotate(0.1deg);
  }
  90% {
    transform: translateX(-2px) rotate(-0.05deg);
  }
}

/* Enhanced light rays during turbulence */
.turbulence-active .light-ray {
  animation: ray-shimmer-intense 1.5s linear infinite;
}

@keyframes ray-shimmer-intense {
  0%, 100% {
    opacity: 0.2;
    transform: skewX(-15deg) translateX(0);
  }
  25% {
    opacity: 0.8;
    transform: skewX(-12deg) translateX(10px);
  }
  50% {
    opacity: 0.4;
    transform: skewX(-18deg) translateX(-5px);
  }
  75% {
    opacity: 0.9;
    transform: skewX(-10deg) translateX(15px);
  }
}

/* Enhanced bubbles during turbulence */
.turbulence-active .bubble {
  animation: rise-turbulent 8s ease-in-out infinite !important;
}

@keyframes rise-turbulent {
  0% {
    bottom: -30px;
    opacity: 0;
    transform: translateX(0) scale(0.8) rotate(0deg);
  }
  5% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.3);
  }
  15% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.7);
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.5)) scale(0.85) rotate(-15deg);
  }
  30% {
    opacity: var(--bubble-opacity-peak, 0.5);
    transform: translateX(calc(var(--bubble-drift, 0px) * 1.5)) scale(0.9) rotate(20deg);
  }
  50% {
    opacity: var(--bubble-opacity-peak, 0.5);
    transform: translateX(calc(var(--bubble-drift, 0px) * 2)) scale(1) rotate(-25deg);
  }
  70% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.8);
    transform: translateX(calc(var(--bubble-drift, 0px) * 1.5)) scale(calc(1 * var(--bubble-expansion, 1))) rotate(30deg);
  }
  85% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.5);
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.8)) scale(calc(1.1 * var(--bubble-expansion, 1))) rotate(-20deg);
  }
  95% {
    opacity: calc(var(--bubble-opacity-peak, 0.5) * 0.2);
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.3)) scale(calc(1.15 * var(--bubble-expansion, 1))) rotate(10deg);
  }
  100% {
    bottom: 110%;
    opacity: 0;
    transform: translateX(calc(var(--bubble-drift, 0px) * 0.2)) scale(calc(1.2 * var(--bubble-expansion, 1))) rotate(0deg);
  }
}

/* Fish swim faster during turbulence */
.turbulence-active .bg-fish {
  animation-duration: 8s !important;
  opacity: 0.6 !important;
}

/* Seaweed sways more during turbulence */
.turbulence-active .seaweed {
  animation: sway-intense 1.5s ease-in-out infinite !important;
}

@keyframes sway-intense {
  0%, 100% {
    transform: skewX(-15deg) scaleY(1.05);
  }
  25% {
    transform: skewX(-5deg) scaleY(0.98);
  }
  50% {
    transform: skewX(15deg) scaleY(1.05);
  }
  75% {
    transform: skewX(5deg) scaleY(0.98);
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

  .particle {
    opacity: 0.3;
  }
}
</style>
