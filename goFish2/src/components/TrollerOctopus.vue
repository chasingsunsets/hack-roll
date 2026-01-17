<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['complete'])

// NOTE: This component only appears for the player who got trolled by the octopus
// The server sends 'octopus-troll' event only to the affected player's socket

const phase = ref('entering') // entering, splashing, inking, fading
const inkSplashes = ref([])

onMounted(async () => {
  // Phase 1: Octopus enters from side
  await delay(800)
  phase.value = 'splashing'

  // Phase 2: Octopus shakes and prepares to splash
  await delay(600)
  phase.value = 'inking'

  // Phase 3: Create multiple ink splashes that spread across screen
  createInkSplashes()
  await delay(1000)

  // Phase 4: Ink fully covers screen (ONLY on this player's screen)
  phase.value = 'covered'
  await delay(1500)

  // Phase 5: Fade out
  phase.value = 'fading'
  await delay(800)

  emit('complete')
})

function createInkSplashes() {
  // Create 40 ink splashes that spread from octopus to cover entire screen
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2
    const distance = 200 + Math.random() * 150
    inkSplashes.value.push({
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 100 + Math.random() * 150,
      delay: i * 20
    })
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
</script>

<template>
  <div class="troller-overlay">
    <!-- Giant Pixelated Squid (only visible to trolled player) -->
    <div class="octopus" :class="phase">
      <!-- Squid Body (pixelated blocks) -->
      <div class="octopus-head">
        <!-- Row 1 - Top -->
        <div class="pixel-row">
          <div class="pixel empty"></div>
          <div class="pixel empty"></div>
          <div class="pixel empty"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel empty"></div>
          <div class="pixel empty"></div>
          <div class="pixel empty"></div>
        </div>
        <!-- Row 2 -->
        <div class="pixel-row">
          <div class="pixel empty"></div>
          <div class="pixel empty"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel empty"></div>
          <div class="pixel empty"></div>
        </div>
        <!-- Row 3 -->
        <div class="pixel-row">
          <div class="pixel empty"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel empty"></div>
        </div>
        <!-- Row 4 - Eyes -->
        <div class="pixel-row">
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel white"></div>
          <div class="pixel white"></div>
          <div class="pixel black"></div>
          <div class="pixel white"></div>
          <div class="pixel white"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
        </div>
        <!-- Row 5 - Pupils -->
        <div class="pixel-row">
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel red"></div>
          <div class="pixel white"></div>
          <div class="pixel black"></div>
          <div class="pixel white"></div>
          <div class="pixel red"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
        </div>
        <!-- Row 6 -->
        <div class="pixel-row">
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
        </div>
        <!-- Row 7 - Mouth -->
        <div class="pixel-row">
          <div class="pixel empty"></div>
          <div class="pixel black"></div>
          <div class="pixel dark"></div>
          <div class="pixel dark"></div>
          <div class="pixel dark"></div>
          <div class="pixel dark"></div>
          <div class="pixel dark"></div>
          <div class="pixel black"></div>
          <div class="pixel empty"></div>
        </div>
        <!-- Row 8 -->
        <div class="pixel-row">
          <div class="pixel empty"></div>
          <div class="pixel empty"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel black"></div>
          <div class="pixel empty"></div>
          <div class="pixel empty"></div>
        </div>
      </div>

      <!-- Pixelated Tentacles (8 for squid/octopus) -->
      <div class="tentacles">
        <div class="tentacle tentacle-1">
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
        </div>
        <div class="tentacle tentacle-2">
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
        </div>
        <div class="tentacle tentacle-3">
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
        </div>
        <div class="tentacle tentacle-4">
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
        </div>
        <div class="tentacle tentacle-5">
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
        </div>
        <div class="tentacle tentacle-6">
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
        </div>
        <div class="tentacle tentacle-7">
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
        </div>
        <div class="tentacle tentacle-8">
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
          <div class="tentacle-segment"></div>
        </div>
      </div>
    </div>

    <!-- Ink Splashes -->
    <div class="ink-container" v-if="phase === 'inking' || phase === 'covered'">
      <div
        v-for="splash in inkSplashes"
        :key="splash.id"
        class="ink-splash"
        :style="{
          '--x': splash.x + 'px',
          '--y': splash.y + 'px',
          '--size': splash.size + 'px',
          '--delay': splash.delay + 'ms'
        }"
      ></div>
    </div>

    <!-- Full Black Ink Overlay -->
    <div class="ink-overlay" :class="{ 'active': phase === 'covered' || phase === 'fading' }">
      <div class="ink-text" v-if="phase === 'covered'">
        <span class="ink-message">SKIPPED!</span>
        <span class="ink-submessage">Octopus got you!</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.troller-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
  font-family: 'Press Start 2P', monospace;
}

/* ========== PIXELATED OCTOPUS ========== */
.octopus {
  position: absolute;
  right: -500px;
  top: 50%;
  transform: translateY(-50%) scale(2);
  transition: right 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.octopus.entering {
  animation: octopus-enter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes octopus-enter {
  0% { right: -500px; }
  100% { right: 100px; }
}

.octopus.splashing {
  right: 100px;
  animation: octopus-shake 0.1s ease-in-out infinite;
}

@keyframes octopus-shake {
  0%, 100% { transform: translateY(-50%) scale(2) rotate(-2deg); }
  50% { transform: translateY(-50%) scale(2) rotate(2deg); }
}

.octopus.inking {
  right: 100px;
  transform: translateY(-50%) scale(2.2);
  animation: octopus-recoil 0.3s ease-out;
}

@keyframes octopus-recoil {
  0% { transform: translateY(-50%) scale(2); }
  50% { transform: translateY(-50%) scale(1.8); }
  100% { transform: translateY(-50%) scale(2.2); }
}

.octopus.covered,
.octopus.fading {
  opacity: 0;
  transition: opacity 0.5s ease-out;
}

/* Octopus Head */
.octopus-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  filter: drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.5));
}

.pixel-row {
  display: flex;
  gap: 2px;
}

.pixel {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  image-rendering: pixelated;
}

.pixel.empty {
  background: transparent;
  border: none;
}

.pixel.purple {
  background: #8B4789;
  box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.3);
}

.pixel.white {
  background: #fff;
}

.pixel.black {
  background: #1a1a1a;
  box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.5);
}

.pixel.red {
  background: #ff0000;
}

.pixel.dark {
  background: #0a0a0a;
}

/* Tentacles */
.tentacles {
  position: absolute;
  top: 160px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  display: flex;
  justify-content: space-around;
}

.tentacle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: tentacle-wiggle 0.8s ease-in-out infinite;
}

.tentacle-1 { animation-delay: 0s; transform: rotate(-30deg); }
.tentacle-2 { animation-delay: 0.1s; transform: rotate(-20deg); }
.tentacle-3 { animation-delay: 0.2s; transform: rotate(-10deg); }
.tentacle-4 { animation-delay: 0.3s; transform: rotate(0deg); }
.tentacle-5 { animation-delay: 0.4s; transform: rotate(10deg); }
.tentacle-6 { animation-delay: 0.5s; transform: rotate(20deg); }
.tentacle-7 { animation-delay: 0.6s; transform: rotate(30deg); }
.tentacle-8 { animation-delay: 0.7s; transform: rotate(5deg); }

@keyframes tentacle-wiggle {
  0%, 100% { transform: rotate(var(--base-angle, 0deg)) translateX(0); }
  50% { transform: rotate(var(--base-angle, 0deg)) translateX(8px); }
}

.tentacle-segment {
  width: 18px;
  height: 22px;
  background: #1a1a1a;
  border: 2px solid #000;
  box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.5);
}

/* ========== INK SPLASHES ========== */
.ink-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ink-splash {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: #000;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: ink-explode 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

@keyframes ink-explode {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(-50% + var(--x)),
      calc(-50% + var(--y))
    ) scale(3);
    opacity: 0.95;
  }
}

/* Black Ink Overlay */
.ink-overlay {
  position: fixed;
  inset: 0;
  background: #000;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease-in;
}

.ink-overlay.active {
  opacity: 1;
}

.ink-overlay.active.fading {
  opacity: 0;
  transition: opacity 0.8s ease-out;
}

.ink-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: text-appear 0.5s ease-out 0.3s backwards;
}

@keyframes text-appear {
  0% {
    transform: scale(0.5) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.ink-message {
  font-size: 4rem;
  color: #FF6B35;
  text-shadow:
    4px 4px 0 #000,
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    0 0 40px rgba(255, 107, 53, 0.8);
  animation: text-shake 0.15s ease-in-out infinite;
}

@keyframes text-shake {
  0%, 100% { transform: translate(0, 0) rotate(-1deg); }
  25% { transform: translate(-2px, 2px) rotate(1deg); }
  50% { transform: translate(2px, -2px) rotate(-1deg); }
  75% { transform: translate(-2px, -2px) rotate(1deg); }
}

.ink-submessage {
  font-size: 1rem;
  color: #8B4789;
  text-shadow:
    2px 2px 0 #000,
    -1px -1px 0 #000;
  animation: submessage-pulse 1s ease-in-out infinite;
}

@keyframes submessage-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
</style>
