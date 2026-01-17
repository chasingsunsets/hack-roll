<script setup>
import { ref, onMounted } from 'vue'

// Generate random bubbles
const bubbles = ref([])
const seaweed = ref([])
const coral = ref([])
const bgFish = ref([])
const lightRays = ref([])
const plankton = ref([])
const jellyfish = ref([])
const caustics = ref([])
const dustMotes = ref([])

const generateBubbles = () => {
  const newBubbles = []
  for (let i = 0; i < 25; i++) {
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
  for (let i = 0; i < 7; i++) {
    newRays.push({
      id: i,
      x: 5 + i * 14 + Math.random() * 8,
      width: 40 + Math.random() * 60,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3
    })
  }
  lightRays.value = newRays
}

// Bioluminescent plankton particles
const generatePlankton = () => {
  const newPlankton = []
  const colors = ['#5dfc9a', '#4fc3f7', '#f8bbd9', '#ffd700', '#81d4fa']
  for (let i = 0; i < 40; i++) {
    newPlankton.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
      driftX: -20 + Math.random() * 40,
      driftY: -30 + Math.random() * 20
    })
  }
  plankton.value = newPlankton
}

// Ethereal jellyfish silhouettes
const generateJellyfish = () => {
  const newJellyfish = []
  for (let i = 0; i < 4; i++) {
    newJellyfish.push({
      id: i,
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 40,
      size: 30 + Math.random() * 40,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 8,
      opacity: 0.08 + Math.random() * 0.1
    })
  }
  jellyfish.value = newJellyfish
}

// Caustic light patterns on the sand
const generateCaustics = () => {
  const newCaustics = []
  for (let i = 0; i < 12; i++) {
    newCaustics.push({
      id: i,
      x: i * 8 + Math.random() * 5,
      size: 40 + Math.random() * 60,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 2
    })
  }
  caustics.value = newCaustics
}

// Floating dust motes / marine snow
const generateDustMotes = () => {
  const newDust = []
  for (let i = 0; i < 30; i++) {
    newDust.push({
      id: i,
      x: Math.random() * 100,
      startY: 10 + Math.random() * 60,
      size: 1 + Math.random() * 3,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
      drift: -10 + Math.random() * 20
    })
  }
  dustMotes.value = newDust
}

onMounted(() => {
  generateBubbles()
  generateSeaweed()
  generateCoral()
  generateBgFish()
  generateLightRays()
  generatePlankton()
  generateJellyfish()
  generateCaustics()
  generateDustMotes()
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

    <!-- Bioluminescent plankton -->
    <div class="plankton-container">
      <div
        v-for="p in plankton"
        :key="p.id"
        class="plankton"
        :style="{
          left: p.x + '%',
          top: p.y + '%',
          width: p.size + 'px',
          height: p.size + 'px',
          '--color': p.color,
          '--duration': p.duration + 's',
          '--delay': p.delay + 's',
          '--drift-x': p.driftX + 'px',
          '--drift-y': p.driftY + 'px'
        }"
      ></div>
    </div>

    <!-- Ethereal jellyfish silhouettes -->
    <div class="jellyfish-container">
      <div
        v-for="jelly in jellyfish"
        :key="jelly.id"
        class="jellyfish"
        :style="{
          left: jelly.x + '%',
          top: jelly.y + '%',
          '--size': jelly.size + 'px',
          '--duration': jelly.duration + 's',
          '--delay': jelly.delay + 's',
          '--opacity': jelly.opacity
        }"
      >
        <div class="jelly-bell"></div>
        <div class="jelly-tentacles">
          <div class="tentacle" v-for="t in 5" :key="t"></div>
        </div>
      </div>
    </div>

    <!-- Caustic light patterns on sand -->
    <div class="caustics-container">
      <div
        v-for="c in caustics"
        :key="c.id"
        class="caustic"
        :style="{
          left: c.x + '%',
          width: c.size + 'px',
          height: c.size + 'px',
          '--delay': c.delay + 's',
          '--duration': c.duration + 's'
        }"
      ></div>
    </div>

    <!-- Marine snow / dust motes -->
    <div class="dust-container">
      <div
        v-for="d in dustMotes"
        :key="d.id"
        class="dust-mote"
        :style="{
          left: d.x + '%',
          top: d.startY + '%',
          width: d.size + 'px',
          height: d.size + 'px',
          '--duration': d.duration + 's',
          '--delay': d.delay + 's',
          '--drift': d.drift + 'px'
        }"
      ></div>
    </div>

    <!-- Ambient underwater glow -->
    <div class="ambient-glow"></div>
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

/* Bioluminescent plankton */
.plankton-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.plankton {
  position: absolute;
  background: var(--color);
  box-shadow: 0 0 6px var(--color), 0 0 12px var(--color);
  animation: plankton-float var(--duration) ease-in-out var(--delay) infinite;
  opacity: 0;
}

@keyframes plankton-float {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.5);
  }
  20% {
    opacity: 0.8;
    transform: translate(calc(var(--drift-x) * 0.3), calc(var(--drift-y) * 0.3)) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(calc(var(--drift-x) * 0.6), calc(var(--drift-y) * 0.6)) scale(1.2);
  }
  80% {
    opacity: 0.6;
    transform: translate(calc(var(--drift-x) * 0.9), calc(var(--drift-y) * 0.9)) scale(0.8);
  }
  100% {
    opacity: 0;
    transform: translate(var(--drift-x), var(--drift-y)) scale(0.3);
  }
}

/* Ethereal jellyfish */
.jellyfish-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.jellyfish {
  position: absolute;
  opacity: var(--opacity);
  animation: jellyfish-drift var(--duration) ease-in-out var(--delay) infinite;
}

.jelly-bell {
  width: var(--size);
  height: calc(var(--size) * 0.6);
  background: radial-gradient(ellipse at 50% 30%, rgba(79, 195, 247, 0.4) 0%, rgba(79, 195, 247, 0.1) 60%, transparent 80%);
  border-radius: 50% 50% 40% 40%;
  position: relative;
}

.jelly-bell::after {
  content: '';
  position: absolute;
  top: 10%;
  left: 20%;
  width: 60%;
  height: 40%;
  background: radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
}

.jelly-tentacles {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin-top: -4px;
}

.tentacle {
  width: 2px;
  height: calc(var(--size) * 0.8);
  background: linear-gradient(180deg, rgba(79, 195, 247, 0.3) 0%, rgba(79, 195, 247, 0.05) 100%);
  animation: tentacle-wave 2s ease-in-out infinite;
}

.tentacle:nth-child(1) { animation-delay: 0s; height: calc(var(--size) * 0.7); }
.tentacle:nth-child(2) { animation-delay: 0.2s; height: calc(var(--size) * 0.9); }
.tentacle:nth-child(3) { animation-delay: 0.4s; height: calc(var(--size) * 1); }
.tentacle:nth-child(4) { animation-delay: 0.2s; height: calc(var(--size) * 0.85); }
.tentacle:nth-child(5) { animation-delay: 0s; height: calc(var(--size) * 0.65); }

@keyframes jellyfish-drift {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-30px) translateX(-5px);
  }
  75% {
    transform: translateY(-15px) translateX(15px);
  }
}

@keyframes tentacle-wave {
  0%, 100% {
    transform: skewX(-5deg) scaleY(1);
  }
  50% {
    transform: skewX(5deg) scaleY(1.1);
  }
}

/* Caustic light patterns */
.caustics-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  pointer-events: none;
  overflow: hidden;
}

.caustic {
  position: absolute;
  bottom: 10px;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 70%);
  animation: caustic-shimmer var(--duration) ease-in-out var(--delay) infinite;
  transform-origin: center;
}

@keyframes caustic-shimmer {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8) rotate(0deg);
  }
  25% {
    opacity: 0.6;
    transform: scale(1.1) rotate(5deg);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.9) rotate(-3deg);
  }
  75% {
    opacity: 0.7;
    transform: scale(1.2) rotate(2deg);
  }
}

/* Marine snow / dust motes */
.dust-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.dust-mote {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  animation: dust-fall var(--duration) linear var(--delay) infinite;
  opacity: 0;
}

@keyframes dust-fall {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0);
  }
  10% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.3;
    transform: translateY(100px) translateX(var(--drift));
  }
  90% {
    opacity: 0.2;
  }
  100% {
    opacity: 0;
    transform: translateY(200px) translateX(calc(var(--drift) * 2));
  }
}

/* Ambient underwater glow */
.ambient-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(ellipse at 30% 20%, rgba(79, 195, 247, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(93, 252, 154, 0.05) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 80%, rgba(255, 215, 0, 0.04) 0%, transparent 35%);
  animation: ambient-pulse 8s ease-in-out infinite;
}

@keyframes ambient-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Enhanced light rays with color shift */
.light-ray {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(79, 195, 247, 0.1) 20%,
    rgba(255, 255, 255, 0.08) 40%,
    rgba(93, 252, 154, 0.04) 60%,
    transparent 100%
  );
  transform: skewX(-15deg);
  animation: ray-shimmer linear infinite, ray-color-shift 6s ease-in-out infinite;
}

@keyframes ray-color-shift {
  0%, 100% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(15deg);
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

  .jellyfish {
    display: none;
  }

  .plankton-container .plankton:nth-child(n+20) {
    display: none;
  }
}
</style>
