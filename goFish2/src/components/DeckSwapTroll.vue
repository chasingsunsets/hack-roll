<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['complete'])

// NOTE: This component appears for ALL players when deck swap occurs
// Everyone sees the animation and gets their hands swapped

const phase = ref('entering') // entering, chaos, swapping, fading
const cardSpins = ref([])
const particles = ref([])
const lightningBolts = ref([])
const trollEyes = ref(false)
const screenShake = ref(false)

onMounted(async () => {
  // Start screen shake
  screenShake.value = true

  // Phase 1: Troll appears with glitch
  await delay(400)
  trollEyes.value = true
  createParticles()
  createLightning()

  await delay(400)
  phase.value = 'chaos'

  // Phase 2: Cards spiral in chaos
  createCardSpins()
  await delay(2000)

  // Phase 3: Cards explode outward (swap happens)
  phase.value = 'swapping'
  createParticles() // More particles on swap
  await delay(1400)

  // Phase 4: Fade out
  phase.value = 'fading'
  screenShake.value = false
  await delay(800)

  emit('complete')
})

function createCardSpins() {
  // Create 24 spinning card representations in a double helix pattern
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2
    const layer = i % 3 // Three layers of cards
    cardSpins.value.push({
      id: i,
      startAngle: angle,
      delay: i * 25,
      layer,
      hue: (i * 15) % 360 // Rainbow hues
    })
  }
}

function createParticles() {
  // Create explosion particles
  for (let i = 0; i < 30; i++) {
    particles.value.push({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      angle: Math.random() * 360,
      speed: 2 + Math.random() * 4,
      size: 4 + Math.random() * 8,
      hue: Math.random() * 360,
      delay: Math.random() * 200
    })
  }

  // Clear old particles after animation
  setTimeout(() => {
    particles.value = particles.value.slice(-30)
  }, 1500)
}

function createLightning() {
  // Create lightning bolts
  for (let i = 0; i < 6; i++) {
    lightningBolts.value.push({
      id: i,
      rotation: i * 60,
      delay: i * 100
    })
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
</script>

<template>
  <div class="deck-swap-overlay" :class="{ 'shake': screenShake }">
    <!-- CRT Scanlines overlay -->
    <div class="crt-overlay"></div>

    <!-- Chromatic aberration layer -->
    <div class="chromatic-layer"></div>

    <!-- Background chaos pattern -->
    <div class="chaos-bg" :class="phase"></div>

    <!-- Lightning bolts -->
    <div class="lightning-container">
      <div
        v-for="bolt in lightningBolts"
        :key="bolt.id"
        class="lightning-bolt"
        :style="{
          '--rotation': bolt.rotation + 'deg',
          '--delay': bolt.delay + 'ms'
        }"
      ></div>
    </div>

    <!-- Center vortex/portal effect -->
    <div class="vortex-container">
      <div class="vortex" :class="phase">
        <div class="vortex-ring ring-1"></div>
        <div class="vortex-ring ring-2"></div>
        <div class="vortex-ring ring-3"></div>
        <div class="vortex-ring ring-4"></div>
        <div class="vortex-ring ring-5"></div>
        <div class="portal-center"></div>
      </div>
    </div>

    <!-- Pixel Troll Character -->
    <div class="troll-container" :class="{ 'active': phase !== 'entering' && phase !== 'fading' }">
      <div class="troll">
        <div class="troll-body">
          <!-- Ears -->
          <div class="troll-ear left"></div>
          <div class="troll-ear right"></div>
          <!-- Head -->
          <div class="troll-head">
            <!-- Eyes -->
            <div class="troll-eye left" :class="{ 'glowing': trollEyes }"></div>
            <div class="troll-eye right" :class="{ 'glowing': trollEyes }"></div>
            <!-- Mischievous grin -->
            <div class="troll-mouth"></div>
          </div>
          <!-- Hands rubbing together -->
          <div class="troll-hands">
            <div class="troll-hand left"></div>
            <div class="troll-hand right"></div>
          </div>
        </div>
        <!-- Evil laugh particles -->
        <div class="laugh-particles">
          <span v-for="n in 5" :key="n" class="laugh-text" :style="{ '--i': n }">HA</span>
        </div>
      </div>
    </div>

    <!-- Spinning cards -->
    <div class="cards-container" v-if="phase === 'chaos' || phase === 'swapping'">
      <div
        v-for="card in cardSpins"
        :key="card.id"
        class="spinning-card"
        :class="phase"
        :style="{
          '--start-angle': card.startAngle + 'rad',
          '--delay': card.delay + 'ms',
          '--card-index': card.id,
          '--layer': card.layer,
          '--hue': card.hue
        }"
      >
        <div class="card-face">
          <div class="card-pattern"></div>
          <div class="card-glint"></div>
        </div>
        <div class="card-trail"></div>
      </div>
    </div>

    <!-- Explosion particles -->
    <div class="particles-container">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          '--x': particle.x + '%',
          '--y': particle.y + '%',
          '--angle': particle.angle + 'deg',
          '--speed': particle.speed,
          '--size': particle.size + 'px',
          '--hue': particle.hue,
          '--delay': particle.delay + 'ms'
        }"
      ></div>
    </div>

    <!-- Message overlay -->
    <div class="message-overlay" :class="{ 'active': phase === 'chaos' || phase === 'swapping' }">
      <div class="glitch-container">
        <div class="swap-text glitch" data-text="DECK SWAP!">
          <span class="swap-message">DECK SWAP!</span>
        </div>
        <div class="swap-submessage-container">
          <span class="swap-submessage">
            <span class="shuffle-icon">&#x2660;</span>
            HANDS SHUFFLED
            <span class="shuffle-icon">&#x2665;</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Corner decorations -->
    <div class="corner-deco top-left"></div>
    <div class="corner-deco top-right"></div>
    <div class="corner-deco bottom-left"></div>
    <div class="corner-deco bottom-right"></div>
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
  background: radial-gradient(ellipse at center,
    rgba(139, 71, 137, 0.4) 0%,
    rgba(20, 10, 30, 0.95) 50%,
    rgba(0, 0, 0, 0.98) 100%
  );
}

/* ========== SCREEN SHAKE ========== */
.deck-swap-overlay.shake {
  animation: screen-shake 0.15s infinite;
}

@keyframes screen-shake {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(-3px, 2px) rotate(-0.5deg); }
  50% { transform: translate(3px, -2px) rotate(0.5deg); }
  75% { transform: translate(-2px, -3px) rotate(-0.3deg); }
}

/* ========== CRT OVERLAY ========== */
.crt-overlay {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 100;
  animation: crt-flicker 0.1s infinite;
}

@keyframes crt-flicker {
  0%, 100% { opacity: 0.97; }
  50% { opacity: 1; }
}

/* ========== CHROMATIC ABERRATION ========== */
.chromatic-layer {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255,0,0,0.03) 0%, transparent 50%, rgba(0,255,255,0.03) 100%);
  animation: chromatic-shift 0.5s ease-in-out infinite alternate;
  z-index: 99;
  mix-blend-mode: screen;
}

@keyframes chromatic-shift {
  0% { transform: translateX(-2px); }
  100% { transform: translateX(2px); }
}

/* ========== CHAOS BACKGROUND ========== */
.chaos-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 107, 53, 0.2) 0%, transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(79, 195, 247, 0.2) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(139, 71, 137, 0.3) 0%, transparent 60%);
  animation: chaos-pulse 0.8s ease-in-out infinite;
}

.chaos-bg.chaos, .chaos-bg.swapping {
  animation: chaos-pulse 0.4s ease-in-out infinite, chaos-rotate 4s linear infinite;
}

@keyframes chaos-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes chaos-rotate {
  from { filter: hue-rotate(0deg); }
  to { filter: hue-rotate(360deg); }
}

/* ========== LIGHTNING BOLTS ========== */
.lightning-container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
}

.lightning-bolt {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 250px;
  background: linear-gradient(to bottom,
    #fff 0%,
    #FFD700 30%,
    #FF6B35 60%,
    transparent 100%
  );
  transform-origin: center top;
  transform: translate(-50%, 0) rotate(var(--rotation));
  opacity: 0;
  animation: lightning-flash 0.3s ease-out var(--delay) forwards,
             lightning-flicker 0.1s ease-in-out 0.3s infinite;
  clip-path: polygon(
    0% 0%, 100% 0%,
    100% 20%, 60% 25%,
    100% 30%, 100% 50%,
    40% 55%, 100% 60%,
    100% 100%, 0% 100%,
    0% 60%, 60% 55%,
    0% 50%, 0% 30%,
    40% 25%, 0% 20%
  );
}

@keyframes lightning-flash {
  0% { opacity: 0; transform: translate(-50%, 0) rotate(var(--rotation)) scaleY(0); }
  50% { opacity: 1; }
  100% { opacity: 0.8; transform: translate(-50%, 0) rotate(var(--rotation)) scaleY(1); }
}

@keyframes lightning-flicker {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ========== VORTEX EFFECT ========== */
.vortex-container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.vortex {
  position: relative;
  width: 500px;
  height: 500px;
}

.vortex-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 4px solid;
  border-radius: 50%;
  opacity: 0;
  box-shadow: 0 0 20px currentColor, inset 0 0 20px currentColor;
}

.vortex.entering .vortex-ring {
  animation: ring-spawn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.vortex.chaos .vortex-ring,
.vortex.swapping .vortex-ring {
  animation: ring-spin-chaos 1.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  opacity: 0.85;
}

.ring-1 {
  width: 80px;
  height: 80px;
  border-color: #FF1493;
  animation-delay: 0s !important;
}

.ring-2 {
  width: 150px;
  height: 150px;
  border-color: #FF6B35;
  animation-delay: 0.08s !important;
}

.ring-3 {
  width: 220px;
  height: 220px;
  border-color: #FFD700;
  animation-delay: 0.16s !important;
}

.ring-4 {
  width: 290px;
  height: 290px;
  border-color: #4FC3F7;
  animation-delay: 0.24s !important;
}

.ring-5 {
  width: 360px;
  height: 360px;
  border-color: #8B4789;
  animation-delay: 0.32s !important;
}

.portal-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #fff 0%, #8B4789 40%, #000 100%);
  border-radius: 50%;
  box-shadow:
    0 0 30px #8B4789,
    0 0 60px #FF6B35,
    0 0 90px #FFD700;
  animation: portal-pulse 0.5s ease-in-out infinite;
}

@keyframes ring-spawn {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 0.85;
  }
}

@keyframes ring-spin-chaos {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
    border-width: 4px;
  }
  25% {
    transform: translate(-50%, -50%) rotate(90deg) scale(1.1);
    border-width: 6px;
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg) scale(0.95);
    border-width: 3px;
  }
  75% {
    transform: translate(-50%, -50%) rotate(270deg) scale(1.05);
    border-width: 5px;
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
    border-width: 4px;
  }
}

@keyframes portal-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 0 30px #8B4789, 0 0 60px #FF6B35, 0 0 90px #FFD700;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    box-shadow: 0 0 50px #8B4789, 0 0 80px #FF6B35, 0 0 120px #FFD700;
  }
}

.vortex.fading .vortex-ring,
.vortex.fading .portal-center {
  animation: ring-implode 0.8s cubic-bezier(0.55, 0, 1, 0.45) forwards;
}

@keyframes ring-implode {
  0% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
}

/* ========== TROLL CHARACTER ========== */
.troll-container {
  position: absolute;
  left: 50%;
  top: 15%;
  transform: translate(-50%, -50%) scale(0);
  z-index: 50;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.troll-container.active {
  transform: translate(-50%, -50%) scale(1);
  animation: troll-bounce 0.6s ease-in-out infinite;
}

@keyframes troll-bounce {
  0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(-3deg); }
  50% { transform: translate(-50%, -50%) scale(1.05) rotate(3deg); }
}

.troll {
  position: relative;
  width: 100px;
  height: 100px;
}

.troll-body {
  position: relative;
  width: 100%;
  height: 100%;
}

.troll-head {
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 60px;
  background: #7B68EE;
  border: 4px solid #483D8B;
  border-radius: 35% 35% 40% 40%;
  box-shadow: inset -4px -4px 0 rgba(0,0,0,0.3), inset 4px 4px 0 rgba(255,255,255,0.2);
}

.troll-ear {
  position: absolute;
  top: 15%;
  width: 20px;
  height: 35px;
  background: #7B68EE;
  border: 3px solid #483D8B;
  border-radius: 50% 50% 30% 30%;
}

.troll-ear.left {
  left: 5%;
  transform: rotate(-25deg);
}

.troll-ear.right {
  right: 5%;
  transform: rotate(25deg);
}

.troll-eye {
  position: absolute;
  top: 35%;
  width: 16px;
  height: 16px;
  background: #FFD700;
  border: 3px solid #000;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.troll-eye.left { left: 20%; }
.troll-eye.right { right: 20%; }

.troll-eye.glowing {
  background: #FF4444;
  box-shadow: 0 0 10px #FF4444, 0 0 20px #FF0000;
  animation: eye-glow 0.3s ease-in-out infinite;
}

@keyframes eye-glow {
  0%, 100% { box-shadow: 0 0 10px #FF4444, 0 0 20px #FF0000; }
  50% { box-shadow: 0 0 20px #FF4444, 0 0 40px #FF0000, 0 0 60px #FF6600; }
}

.troll-mouth {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 35px;
  height: 15px;
  background: #2a0a0a;
  border: 3px solid #000;
  border-radius: 0 0 50% 50%;
  overflow: hidden;
}

.troll-mouth::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  width: 25%;
  height: 8px;
  background: #fff;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.troll-mouth::after {
  content: '';
  position: absolute;
  top: 0;
  right: 10%;
  width: 25%;
  height: 8px;
  background: #fff;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.troll-hands {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
}

.troll-hand {
  width: 20px;
  height: 25px;
  background: #7B68EE;
  border: 3px solid #483D8B;
  border-radius: 40%;
  animation: hand-rub 0.4s ease-in-out infinite;
}

.troll-hand.left { animation-delay: 0s; }
.troll-hand.right { animation-delay: 0.2s; }

@keyframes hand-rub {
  0%, 100% { transform: translateY(0) rotate(-10deg); }
  50% { transform: translateY(-5px) rotate(10deg); }
}

.laugh-particles {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.laugh-text {
  position: absolute;
  font-size: 0.6rem;
  color: #FFD700;
  text-shadow: 2px 2px 0 #000;
  animation: laugh-float 1s ease-out infinite;
  animation-delay: calc(var(--i) * 0.15s);
  opacity: 0;
}

@keyframes laugh-float {
  0% {
    opacity: 0;
    transform: translate(calc((var(--i) - 3) * 15px), 0) scale(0.5);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc((var(--i) - 3) * 25px), -40px) scale(1.2) rotate(calc((var(--i) - 3) * 15deg));
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
  width: 45px;
  height: 62px;
  left: 50%;
  top: 50%;
  filter: drop-shadow(0 0 10px hsla(var(--hue), 100%, 60%, 0.8));
}

.spinning-card.chaos {
  animation: card-spiral-chaos 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay);
}

.spinning-card.swapping {
  animation: card-explode 1.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
  animation-delay: calc(var(--delay) * 0.4);
}

@keyframes card-spiral-chaos {
  0% {
    transform: translate(-50%, -50%)
      rotate(var(--start-angle))
      translateX(800px)
      rotate(calc(var(--card-index) * 45deg))
      scale(0.3);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%)
      rotate(calc(var(--start-angle) + 720deg))
      translateX(calc(100px + var(--layer) * 30px))
      rotate(calc(var(--card-index) * 1080deg))
      scale(1);
    opacity: 1;
  }
}

@keyframes card-explode {
  0% {
    transform: translate(-50%, -50%)
      rotate(calc(var(--start-angle) + 720deg))
      translateX(calc(100px + var(--layer) * 30px))
      rotate(calc(var(--card-index) * 1080deg))
      scale(1);
    opacity: 1;
  }
  30% {
    transform: translate(-50%, -50%)
      rotate(calc(var(--start-angle) + 720deg))
      translateX(50px)
      scale(1.3);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%)
      rotate(calc(var(--start-angle) + 1440deg))
      translateX(900px)
      rotate(calc(var(--card-index) * 2160deg))
      scale(0.2);
    opacity: 0;
  }
}

.card-face {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #1a3a5c 0%, #0d2847 100%);
  border: 3px solid;
  border-color: hsl(var(--hue), 100%, 60%);
  position: relative;
  overflow: hidden;
  box-shadow:
    inset -2px -2px 0 #0a1628,
    inset 2px 2px 0 #2a5a8c;
}

.card-pattern {
  position: absolute;
  inset: 5px;
  background:
    repeating-linear-gradient(
      45deg,
      hsla(var(--hue), 80%, 50%, 0.3) 0px,
      hsla(var(--hue), 80%, 50%, 0.3) 3px,
      transparent 3px,
      transparent 6px
    ),
    repeating-linear-gradient(
      -45deg,
      hsla(var(--hue), 80%, 50%, 0.3) 0px,
      hsla(var(--hue), 80%, 50%, 0.3) 3px,
      transparent 3px,
      transparent 6px
    );
}

.card-glint {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 40%,
    rgba(255,255,255,0.4) 50%,
    transparent 60%
  );
  animation: card-shine 1s linear infinite;
}

@keyframes card-shine {
  from { transform: translateX(-100%) rotate(0deg); }
  to { transform: translateX(100%) rotate(0deg); }
}

.card-trail {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    hsla(var(--hue), 100%, 70%, 0.6) 0%,
    transparent 100%
  );
  transform: scaleX(3) translateX(-30%);
  opacity: 0.5;
  filter: blur(4px);
}

/* ========== PARTICLES ========== */
.particles-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--size);
  height: var(--size);
  background: hsl(var(--hue), 100%, 60%);
  box-shadow: 0 0 10px hsl(var(--hue), 100%, 70%);
  animation: particle-explode 1.2s ease-out var(--delay) forwards;
  opacity: 0;
}

@keyframes particle-explode {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(calc(var(--speed) * 80px)) scale(0);
  }
}

/* ========== MESSAGE OVERLAY ========== */
.message-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 60;
}

.message-overlay.active {
  opacity: 1;
  transform: scale(1);
}

.glitch-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.swap-text {
  position: relative;
}

.swap-message {
  font-size: 4.5rem;
  color: #fff;
  text-shadow:
    0 0 10px #FF1493,
    0 0 20px #FF1493,
    0 0 40px #FF1493,
    0 0 80px #8B4789,
    5px 5px 0 #000,
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000;
  animation: text-glitch 0.3s ease-in-out infinite, text-pulse 0.8s ease-in-out infinite;
  letter-spacing: 4px;
}

@keyframes text-glitch {
  0%, 100% {
    transform: translate(0, 0) skew(0deg);
    filter: hue-rotate(0deg);
  }
  20% {
    transform: translate(-3px, 2px) skew(2deg);
    filter: hue-rotate(90deg);
  }
  40% {
    transform: translate(3px, -2px) skew(-2deg);
    filter: hue-rotate(180deg);
  }
  60% {
    transform: translate(-2px, -3px) skew(1deg);
    filter: hue-rotate(270deg);
  }
  80% {
    transform: translate(2px, 3px) skew(-1deg);
    filter: hue-rotate(360deg);
  }
}

@keyframes text-pulse {
  0%, 100% {
    transform: scale(1);
    text-shadow:
      0 0 10px #FF1493,
      0 0 20px #FF1493,
      0 0 40px #FF1493,
      0 0 80px #8B4789,
      5px 5px 0 #000;
  }
  50% {
    transform: scale(1.05);
    text-shadow:
      0 0 20px #FF1493,
      0 0 40px #FF1493,
      0 0 60px #FF1493,
      0 0 100px #8B4789,
      5px 5px 0 #000;
  }
}

/* Glitch pseudo-elements */
.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 4.5rem;
}

.glitch::before {
  color: #0ff;
  animation: glitch-1 0.3s infinite linear alternate-reverse;
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
  z-index: -1;
}

.glitch::after {
  color: #f0f;
  animation: glitch-2 0.3s infinite linear alternate-reverse;
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
  z-index: -1;
}

@keyframes glitch-1 {
  0% { transform: translate(0); }
  20% { transform: translate(-4px, 4px); }
  40% { transform: translate(4px, -4px); }
  60% { transform: translate(-4px, -4px); }
  80% { transform: translate(4px, 4px); }
  100% { transform: translate(0); }
}

@keyframes glitch-2 {
  0% { transform: translate(0); }
  20% { transform: translate(4px, -4px); }
  40% { transform: translate(-4px, 4px); }
  60% { transform: translate(4px, 4px); }
  80% { transform: translate(-4px, -4px); }
  100% { transform: translate(0); }
}

.swap-submessage-container {
  animation: submessage-appear 0.6s ease-out 0.3s backwards;
}

@keyframes submessage-appear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.swap-submessage {
  font-size: 1.2rem;
  color: #4FC3F7;
  text-shadow:
    3px 3px 0 #000,
    -1px -1px 0 #000,
    0 0 20px #4FC3F7;
  display: flex;
  align-items: center;
  gap: 15px;
  animation: submessage-glow 1s ease-in-out infinite;
}

.shuffle-icon {
  font-size: 1.5rem;
  color: #FFD700;
  animation: icon-spin 1s linear infinite;
}

.shuffle-icon:last-child {
  animation-direction: reverse;
}

@keyframes icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes submessage-glow {
  0%, 100% {
    text-shadow: 3px 3px 0 #000, 0 0 20px #4FC3F7;
  }
  50% {
    text-shadow: 3px 3px 0 #000, 0 0 40px #4FC3F7, 0 0 60px #4FC3F7;
  }
}

/* ========== CORNER DECORATIONS ========== */
.corner-deco {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 4px solid #FFD700;
  opacity: 0;
  animation: corner-appear 0.4s ease-out 0.2s forwards;
}

.corner-deco.top-left {
  top: 20px;
  left: 20px;
  border-right: none;
  border-bottom: none;
}

.corner-deco.top-right {
  top: 20px;
  right: 20px;
  border-left: none;
  border-bottom: none;
}

.corner-deco.bottom-left {
  bottom: 20px;
  left: 20px;
  border-right: none;
  border-top: none;
}

.corner-deco.bottom-right {
  bottom: 20px;
  right: 20px;
  border-left: none;
  border-top: none;
}

@keyframes corner-appear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .swap-message {
    font-size: 2.5rem;
  }

  .glitch::before,
  .glitch::after {
    font-size: 2.5rem;
  }

  .swap-submessage {
    font-size: 0.8rem;
  }

  .troll-container {
    transform-origin: center center;
    top: 12%;
  }

  .troll {
    transform: scale(0.7);
  }

  .vortex {
    width: 300px;
    height: 300px;
  }

  .ring-1 { width: 50px; height: 50px; }
  .ring-2 { width: 100px; height: 100px; }
  .ring-3 { width: 150px; height: 150px; }
  .ring-4 { width: 200px; height: 200px; }
  .ring-5 { width: 250px; height: 250px; }
}
</style>
