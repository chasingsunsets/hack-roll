<script setup>
import { ref, computed } from 'vue'
import Card from './Card.vue'
import PixelFish from './PixelFish.vue'

const props = defineProps({
  cardsRemaining: {
    type: Number,
    required: true
  },
  canDraw: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['draw'])

// Fishing animation state
const isFishing = ref(false)
const fishingPhase = ref('idle') // idle, casting, hooked, reeling, complete

// Generate messy pile card positions
const messyCards = computed(() => {
  const cards = []
  const count = Math.min(8, props.cardsRemaining)
  for (let i = 0; i < count; i++) {
    const seed = i * 7 + 13
    const rotation = ((seed * 17) % 50) - 25
    const offsetX = ((seed * 23) % 40) - 20
    const offsetY = ((seed * 31) % 24) - 12
    cards.push({
      id: i,
      rotation,
      offsetX,
      offsetY,
      zIndex: i
    })
  }
  return cards
})

// Handle fishing action
const startFishing = async () => {
  if (!props.canDraw || isFishing.value || props.cardsRemaining === 0) return

  isFishing.value = true
  fishingPhase.value = 'casting'

  // Phase 1: Cast the line
  await delay(500)
  fishingPhase.value = 'hooked'

  // Phase 2: Hook catches card
  await delay(400)
  fishingPhase.value = 'reeling'

  // Phase 3: Reel up smoothly
  await delay(800)
  fishingPhase.value = 'complete'

  // Emit draw event
  emit('draw')

  // Phase 4: Reset
  await delay(300)
  isFishing.value = false
  fishingPhase.value = 'idle'
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
</script>

<template>
  <div class="draw-pile-wrapper">
    <div class="draw-pile" :class="{ 'can-draw': canDraw && !isFishing, 'is-fishing': isFishing }">

      <!-- Fishing Rod (only visible during fishing) -->
      <div class="fishing-rod" :class="fishingPhase" v-show="isFishing">
        <div class="rod-body">
          <div class="rod-handle"></div>
          <div class="rod-shaft"></div>
          <div class="rod-tip"></div>
        </div>

        <!-- Fishing Line - continuous element -->
        <div class="fishing-line"></div>

        <!-- Hook Assembly -->
        <div class="hook-assembly">
          <div class="bobber"></div>
          <div class="hook"></div>
          <!-- Caught card -->
          <div class="caught-card" v-if="fishingPhase === 'reeling' || fishingPhase === 'complete'">
            <Card suit="♠" rank="?" :face-down="true" :small="true" />
          </div>
        </div>

        <!-- Water splash -->
        <div class="splash" v-if="fishingPhase === 'hooked'">
          <span v-for="i in 5" :key="i" class="drop" :style="{ '--i': i }"></span>
        </div>
      </div>

      <!-- Card Pile -->
      <div class="pile-area" @click="startFishing">
        <!-- Glow effect when drawable -->
        <div class="pile-glow" v-if="canDraw && !isFishing"></div>

        <!-- Messy scattered cards -->
        <div class="card-pile" v-if="cardsRemaining > 0">
          <div
            v-for="card in messyCards"
            :key="card.id"
            class="pile-card"
            :class="{ 'taking': fishingPhase === 'reeling' && card.id === messyCards.length - 1 }"
            :style="{
              '--rot': card.rotation + 'deg',
              '--x': card.offsetX + 'px',
              '--y': card.offsetY + 'px',
              '--z': card.zIndex
            }"
          >
            <Card suit="♠" rank="A" :face-down="true" :small="true" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <div class="empty-border">
            <PixelFish :size="28" color="blue" class="swimming-fish" />
            <span>EMPTY</span>
          </div>
        </div>
      </div>

      <!-- Card count badge -->
      <div class="count-badge">
        <span class="count-number">{{ cardsRemaining }}</span>
        <span class="count-label">CARDS</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draw-pile-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.draw-pile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: 'Press Start 2P', monospace;
}

/* ========== FISHING ROD ========== */
.fishing-rod {
  position: absolute;
  top: -90px;
  left: 50%;
  width: 120px;
  height: 180px;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 50;
}

.rod-body {
  position: absolute;
  top: 0;
  left: 30px;
  transform-origin: bottom center;
  transform: rotate(-25deg);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fishing-rod.casting .rod-body,
.fishing-rod.hooked .rod-body,
.fishing-rod.reeling .rod-body,
.fishing-rod.complete .rod-body {
  transform: rotate(10deg);
}

.rod-handle {
  width: 10px;
  height: 24px;
  background: #8B4513;
  border: 2px solid #5D3A1A;
  position: absolute;
  bottom: 0;
  left: 0;
}

.rod-shaft {
  width: 6px;
  height: 55px;
  background: linear-gradient(90deg, #654321, #8B7355, #654321);
  border: 1px solid #3D2817;
  position: absolute;
  bottom: 22px;
  left: 2px;
}

.rod-tip {
  width: 3px;
  height: 20px;
  background: #A0522D;
  position: absolute;
  bottom: 75px;
  left: 3px;
}

/* Fishing Line */
.fishing-line {
  position: absolute;
  top: 18px;
  left: 58px;
  width: 2px;
  height: 0;
  background: linear-gradient(180deg,
    rgba(135, 206, 235, 0.9) 0%,
    rgba(135, 206, 235, 0.6) 100%
  );
  box-shadow: 0 0 4px rgba(135, 206, 235, 0.8);
  transform-origin: top center;
}

.fishing-rod.casting .fishing-line {
  animation: line-extend 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.fishing-rod.hooked .fishing-line {
  height: 130px;
}

.fishing-rod.reeling .fishing-line {
  animation: line-retract 0.8s cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards;
}

.fishing-rod.complete .fishing-line {
  height: 20px;
}

@keyframes line-extend {
  0% { height: 0; }
  100% { height: 130px; }
}

@keyframes line-retract {
  0% { height: 130px; }
  100% { height: 20px; }
}

/* Hook Assembly */
.hook-assembly {
  position: absolute;
  top: 18px;
  left: 50px;
  opacity: 0;
  transform: translateY(0);
}

.fishing-rod.casting .hook-assembly {
  animation: hook-descend 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.fishing-rod.hooked .hook-assembly {
  opacity: 1;
  transform: translateY(115px);
  animation: hook-shake 0.15s ease-in-out infinite;
}

.fishing-rod.reeling .hook-assembly {
  opacity: 1;
  animation: hook-ascend 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.fishing-rod.complete .hook-assembly {
  opacity: 1;
  transform: translateY(0);
}

@keyframes hook-descend {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 1;
    transform: translateY(115px);
  }
}

@keyframes hook-shake {
  0%, 100% { transform: translateY(115px) rotate(-3deg); }
  50% { transform: translateY(115px) rotate(3deg); }
}

@keyframes hook-ascend {
  0% { transform: translateY(115px); }
  30% { transform: translateY(100px); }
  100% { transform: translateY(0); }
}

.bobber {
  width: 12px;
  height: 16px;
  background: linear-gradient(180deg, #FF3333 50%, #FFFFFF 50%);
  border: 2px solid #CC0000;
  margin-left: 2px;
}

.hook {
  width: 14px;
  height: 14px;
  border: 3px solid #C0C0C0;
  border-top: none;
  border-right: none;
  border-bottom-left-radius: 10px;
  margin-top: 2px;
  margin-left: 4px;
}

/* Caught card */
.caught-card {
  position: absolute;
  top: 35px;
  left: -15px;
  animation: card-dangle 0.4s ease-in-out infinite alternate;
}

@keyframes card-dangle {
  0% { transform: rotate(-8deg) translateY(0); }
  100% { transform: rotate(8deg) translateY(2px); }
}

/* Water splash */
.splash {
  position: absolute;
  top: 140px;
  left: 40px;
  width: 40px;
  height: 20px;
}

.drop {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #4FC3F7;
  border-radius: 50%;
  animation: splash-out 0.4s ease-out forwards;
}

.drop:nth-child(1) { --angle: -60deg; }
.drop:nth-child(2) { --angle: -30deg; }
.drop:nth-child(3) { --angle: 0deg; }
.drop:nth-child(4) { --angle: 30deg; }
.drop:nth-child(5) { --angle: 60deg; }

@keyframes splash-out {
  0% {
    transform: translate(20px, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(20px + cos(var(--angle)) * 25px),
      calc(sin(var(--angle)) * -20px)
    ) scale(0.3);
    opacity: 0;
  }
}

/* ========== CARD PILE ========== */
.pile-area {
  position: relative;
  width: 110px;
  height: 90px;
  cursor: pointer;
  transition: transform 0.2s ease-out;
}

.can-draw .pile-area:hover {
  transform: scale(1.05);
}

.can-draw .pile-area:active {
  transform: scale(0.98);
}

.pile-glow {
  position: absolute;
  inset: -12px;
  border: 3px solid rgba(255, 107, 53, 0.6);
  box-shadow:
    0 0 15px rgba(255, 107, 53, 0.4),
    inset 0 0 15px rgba(255, 107, 53, 0.1);
  animation: glow-breathe 1.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glow-breathe {
  0%, 100% {
    opacity: 0.7;
    box-shadow:
      0 0 15px rgba(255, 107, 53, 0.4),
      inset 0 0 15px rgba(255, 107, 53, 0.1);
  }
  50% {
    opacity: 1;
    box-shadow:
      0 0 25px rgba(255, 107, 53, 0.7),
      inset 0 0 20px rgba(255, 107, 53, 0.2);
  }
}

.card-pile {
  position: relative;
  width: 100%;
  height: 100%;
}

.pile-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) rotate(var(--rot));
  z-index: var(--z);
  filter: drop-shadow(2px 3px 3px rgba(0, 0, 0, 0.35));
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;
}

.pile-card:nth-child(even) {
  filter: drop-shadow(2px 3px 3px rgba(0, 0, 0, 0.35)) brightness(0.97);
}

.pile-card.taking {
  animation: card-lift 0.3s ease-out forwards;
}

@keyframes card-lift {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y) - 40px)) rotate(calc(var(--rot) + 15deg)) scale(0.9);
  }
}

/* Empty state */
.empty-state {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-border {
  width: 70px;
  height: 85px;
  border: 3px dashed rgba(79, 195, 247, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(10, 22, 40, 0.4);
}

.empty-border span {
  font-size: 0.45rem;
  color: rgba(79, 195, 247, 0.7);
}

.swimming-fish {
  animation: fish-swim 2.5s ease-in-out infinite;
}

@keyframes fish-swim {
  0%, 100% { transform: translateX(-8px) scaleX(1); }
  50% { transform: translateX(8px) scaleX(-1); }
}

/* Count badge */
.count-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(180deg, #1a3a5c 0%, #0d2847 100%);
  border: 3px solid #4fc3f7;
  padding: 6px 14px;
  box-shadow:
    inset -2px -2px 0 #0a1628,
    inset 2px 2px 0 #2a5a8c,
    3px 3px 0 rgba(0, 0, 0, 0.4);
}

.count-number {
  font-size: 1rem;
  color: #ffd700;
  text-shadow: 2px 2px 0 #cc8800;
}

.count-label {
  font-size: 0.35rem;
  color: #4fc3f7;
  letter-spacing: 1px;
}

/* Draw prompt */
.draw-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(180deg, #ff6b35 0%, #cc4a1a 100%);
  padding: 8px 16px;
  box-shadow:
    inset -2px -2px 0 #993311,
    inset 2px 2px 0 #ff9a6c,
    3px 3px 0 rgba(0, 0, 0, 0.4);
  animation: prompt-pulse 0.8s ease-in-out infinite;
}

@keyframes prompt-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.draw-prompt span {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  color: #fff;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
}

.prompt-fish {
  animation: fish-hop 0.5s ease-in-out infinite alternate;
}

@keyframes fish-hop {
  0% { transform: translateY(0) rotate(-5deg); }
  100% { transform: translateY(-3px) rotate(5deg); }
}

/* Hide prompt during fishing */
.is-fishing + .draw-prompt {
  display: none;
}
</style>
