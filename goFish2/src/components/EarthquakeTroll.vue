<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['complete'])

// NOTE: This component appears for ALL players when earthquake occurs
// Everyone's screen shakes and sees falling rocks/debris

const phase = ref('warning') // warning, shaking, intense, settling, fading
const cracks = ref([])
const fallingRocks = ref([])

onMounted(async () => {
  // Phase 1: Warning tremors
  await delay(600)
  phase.value = 'shaking'

  // Phase 2: Main earthquake - create cracks and falling rocks
  createCracks()
  await delay(800)

  // Phase 3: Intense shaking
  phase.value = 'intense'
  createFallingRocks()
  await delay(1200)

  // Phase 4: Settling down
  phase.value = 'settling'
  await delay(800)

  // Phase 5: Fade out
  phase.value = 'fading'
  await delay(600)

  emit('complete')
})

function createCracks() {
  // Create 8 ground cracks spreading from random points
  for (let i = 0; i < 8; i++) {
    const startX = Math.random() * 100
    const startY = 60 + Math.random() * 40
    const angle = -45 + Math.random() * 90
    const length = 100 + Math.random() * 150

    cracks.value.push({
      id: i,
      startX,
      startY,
      angle,
      length,
      delay: i * 80
    })
  }
}

function createFallingRocks() {
  // Create 25 falling pixelated rocks from top
  for (let i = 0; i < 25; i++) {
    fallingRocks.value.push({
      id: i,
      x: Math.random() * 100,
      size: 20 + Math.random() * 30,
      rotation: Math.random() * 360,
      delay: i * 40,
      duration: 1200 + Math.random() * 800
    })
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
</script>

<template>
  <div class="earthquake-overlay" :class="phase">
    <!-- Warning Indicator -->
    <div class="warning-indicator" v-if="phase === 'warning'">
      <div class="warning-icon">⚠️</div>
      <div class="warning-text">EARTHQUAKE!</div>
    </div>

    <!-- Ground Cracks -->
    <div class="cracks-container" v-if="phase !== 'warning'">
      <div
        v-for="crack in cracks"
        :key="crack.id"
        class="ground-crack"
        :style="{
          '--start-x': crack.startX + '%',
          '--start-y': crack.startY + '%',
          '--angle': crack.angle + 'deg',
          '--length': crack.length + 'px',
          '--delay': crack.delay + 'ms'
        }"
      ></div>
    </div>

    <!-- Falling Rocks -->
    <div class="rocks-container" v-if="phase === 'intense' || phase === 'settling'">
      <div
        v-for="rock in fallingRocks"
        :key="rock.id"
        class="falling-rock"
        :style="{
          '--x': rock.x + '%',
          '--size': rock.size + 'px',
          '--rotation': rock.rotation + 'deg',
          '--delay': rock.delay + 'ms',
          '--duration': rock.duration + 'ms'
        }"
      ></div>
    </div>

    <!-- Dust clouds -->
    <div class="dust-overlay" :class="{ 'active': phase === 'intense' || phase === 'settling' }">
      <div class="dust-particle" v-for="i in 15" :key="i" :style="{ '--i': i }"></div>
    </div>

    <!-- Screen shake effect message -->
    <div class="earthquake-message" :class="{ 'active': phase === 'shaking' || phase === 'intense' }">
      <span class="earthquake-text">EARTHQUAKE!</span>
      <span class="earthquake-subtext">Everything's shaking!</span>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.earthquake-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
  overflow: hidden;
  font-family: 'Press Start 2P', monospace;
}

/* ========== SCREEN SHAKE ANIMATIONS ========== */
.earthquake-overlay.warning {
  animation: tremor 0.15s ease-in-out infinite;
}

.earthquake-overlay.shaking {
  animation: shake-light 0.1s ease-in-out infinite;
}

.earthquake-overlay.intense {
  animation: shake-heavy 0.08s ease-in-out infinite;
}

.earthquake-overlay.settling {
  animation: shake-light 0.15s ease-in-out infinite;
}

.earthquake-overlay.fading {
  animation: shake-fade 0.2s ease-out infinite;
}

@keyframes tremor {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(1px, 1px); }
  50% { transform: translate(-1px, 0); }
  75% { transform: translate(0, -1px); }
}

@keyframes shake-light {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  10% { transform: translate(-3px, 2px) rotate(-0.5deg); }
  20% { transform: translate(3px, -3px) rotate(0.5deg); }
  30% { transform: translate(-2px, 3px) rotate(-0.3deg); }
  40% { transform: translate(2px, -2px) rotate(0.3deg); }
  50% { transform: translate(-3px, 2px) rotate(-0.5deg); }
  60% { transform: translate(3px, 2px) rotate(0.5deg); }
  70% { transform: translate(-2px, -3px) rotate(-0.3deg); }
  80% { transform: translate(2px, 3px) rotate(0.3deg); }
  90% { transform: translate(-3px, -2px) rotate(-0.5deg); }
}

@keyframes shake-heavy {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  10% { transform: translate(-8px, 6px) rotate(-1deg); }
  20% { transform: translate(7px, -8px) rotate(1deg); }
  30% { transform: translate(-6px, 7px) rotate(-1.5deg); }
  40% { transform: translate(8px, -6px) rotate(1deg); }
  50% { transform: translate(-7px, 8px) rotate(-1deg); }
  60% { transform: translate(6px, 7px) rotate(1.5deg); }
  70% { transform: translate(-8px, -7px) rotate(-1deg); }
  80% { transform: translate(7px, 8px) rotate(1deg); }
  90% { transform: translate(-6px, -8px) rotate(-1.5deg); }
}

@keyframes shake-fade {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-1px, 1px); }
}

/* ========== WARNING INDICATOR ========== */
.warning-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: warning-pulse 0.4s ease-in-out infinite;
}

@keyframes warning-pulse {
  0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
}

.warning-icon {
  font-size: 6rem;
  filter: drop-shadow(0 0 20px rgba(255, 200, 0, 0.8));
}

.warning-text {
  font-size: 2rem;
  color: #FFD700;
  text-shadow:
    3px 3px 0 #000,
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000;
}

/* ========== GROUND CRACKS ========== */
.cracks-container {
  position: fixed;
  inset: 0;
}

.ground-crack {
  position: absolute;
  left: var(--start-x);
  top: var(--start-y);
  width: 4px;
  height: var(--length);
  background: linear-gradient(180deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(50, 30, 20, 0.7) 50%,
    rgba(0, 0, 0, 0.5) 100%
  );
  transform-origin: top center;
  transform: rotate(var(--angle)) scaleY(0);
  animation: crack-spread 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  filter: blur(1px);
}

@keyframes crack-spread {
  0% {
    transform: rotate(var(--angle)) scaleY(0);
    opacity: 0;
  }
  100% {
    transform: rotate(var(--angle)) scaleY(1);
    opacity: 1;
  }
}

/* ========== FALLING ROCKS ========== */
.rocks-container {
  position: fixed;
  inset: 0;
}

.falling-rock {
  position: absolute;
  left: var(--x);
  top: -50px;
  width: var(--size);
  height: var(--size);
  background: linear-gradient(135deg, #5a4a3a 0%, #3a2a1a 50%, #2a1a0a 100%);
  border: 2px solid #1a1a1a;
  box-shadow:
    inset -2px -2px 0 rgba(0, 0, 0, 0.5),
    3px 3px 5px rgba(0, 0, 0, 0.6);
  animation: rock-fall var(--duration) cubic-bezier(0.55, 0, 1, 0.45) forwards;
  animation-delay: var(--delay);
  clip-path: polygon(
    20% 0%, 80% 0%, 100% 20%, 100% 80%,
    80% 100%, 20% 100%, 0% 80%, 0% 20%
  );
}

@keyframes rock-fall {
  0% {
    transform: translateY(0) rotate(var(--rotation));
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(calc(var(--rotation) + 720deg));
    opacity: 0.8;
  }
}

/* Add some pixelated texture to rocks */
.falling-rock::before {
  content: '';
  position: absolute;
  inset: 4px;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 0px,
    rgba(255, 255, 255, 0.1) 2px,
    transparent 2px,
    transparent 4px
  );
}

/* ========== DUST CLOUDS ========== */
.dust-overlay {
  position: fixed;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease-in;
}

.dust-overlay.active {
  opacity: 1;
}

.dust-particle {
  position: absolute;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(139, 120, 100, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  left: calc(var(--i) * 7%);
  bottom: -50px;
  animation: dust-rise 3s ease-out infinite;
  animation-delay: calc(var(--i) * 0.15s);
  filter: blur(8px);
}

@keyframes dust-rise {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-120vh) scale(1.5);
    opacity: 0;
  }
}

/* ========== MESSAGE ========== */
.earthquake-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  opacity: 0;
  transition: opacity 0.3s ease-in;
  z-index: 10;
}

.earthquake-message.active {
  opacity: 1;
  animation: message-shake 0.1s ease-in-out infinite;
}

@keyframes message-shake {
  0%, 100% { transform: translate(-50%, -50%) rotate(-1deg); }
  50% { transform: translate(-50%, -50%) rotate(1deg); }
}

.earthquake-text {
  font-size: 4rem;
  color: #8B4513;
  text-shadow:
    4px 4px 0 #000,
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    0 0 40px rgba(139, 69, 19, 0.9);
  animation: text-rumble 0.15s ease-in-out infinite;
}

@keyframes text-rumble {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    filter: blur(0px);
  }
  25% {
    transform: translate(-3px, 2px) scale(1.02);
    filter: blur(0.5px);
  }
  50% {
    transform: translate(3px, -2px) scale(0.98);
    filter: blur(0.3px);
  }
  75% {
    transform: translate(-2px, -3px) scale(1.01);
    filter: blur(0.4px);
  }
}

.earthquake-subtext {
  font-size: 1rem;
  color: #D2691E;
  text-shadow:
    2px 2px 0 #000,
    -1px -1px 0 #000;
  animation: subtext-wobble 0.2s ease-in-out infinite;
}

@keyframes subtext-wobble {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
</style>
