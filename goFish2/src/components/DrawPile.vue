<script setup>
import Card from './Card.vue'
import PixelFish from './PixelFish.vue'

defineProps({
  cardsRemaining: {
    type: Number,
    required: true
  },
  canDraw: {
    type: Boolean,
    default: false
  }
})

defineEmits(['draw'])
</script>

<template>
  <div class="draw-pile" :class="{ 'can-draw': canDraw }">
    <div class="pile-stack" @click="canDraw && $emit('draw')">
      <Card
        v-for="i in Math.min(5, cardsRemaining)"
        :key="i"
        suit="♠"
        rank="A"
        :face-down="true"
        class="pile-card"
        :style="{ '--stack-index': i }"
      />
      <div v-if="cardsRemaining === 0" class="empty-pile">
        <div class="empty-border">
          <span>EMPTY</span>
        </div>
      </div>
      <!-- Glow effect when can draw -->
      <div v-if="canDraw && cardsRemaining > 0" class="draw-glow"></div>
    </div>
    <div class="pile-info">
      <span class="pile-label">DRAW PILE</span>
      <div class="pile-count-container">
        <span class="pile-count">{{ cardsRemaining }}</span>
      </div>
    </div>
    <div v-if="canDraw" class="draw-hint">
      <PixelFish :size="20" color="gold" class="hint-fish" />
      <span>GO FISH!</span>
      <div class="hint-arrow">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="5" y="0" width="2" height="8" fill="currentColor"/>
          <rect x="3" y="6" width="2" height="2" fill="currentColor"/>
          <rect x="7" y="6" width="2" height="2" fill="currentColor"/>
          <rect x="1" y="8" width="2" height="2" fill="currentColor"/>
          <rect x="9" y="8" width="2" height="2" fill="currentColor"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draw-pile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-family: 'Press Start 2P', monospace;
}

.pile-stack {
  position: relative;
  width: 90px;
  height: 130px;
  cursor: pointer;
  transition: transform 0.15s steps(4);
}

.can-draw .pile-stack:hover {
  transform: scale(1.05);
}

.pile-card {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateY(calc(var(--stack-index) * -3px)) translateX(calc(var(--stack-index) * 2px));
  pointer-events: none;
}

.empty-pile {
  width: 90px;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-border {
  width: 100%;
  height: 100%;
  border: 4px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.6rem;
  background: rgba(0, 0, 0, 0.2);
}

/* Draw glow effect */
.draw-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 3px solid #ff6b35;
  animation: glow-pulse 1s steps(4) infinite;
  pointer-events: none;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.5;
    box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 25px rgba(255, 107, 53, 0.8);
  }
}

.pile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pile-label {
  font-size: 0.55rem;
  color: #4fc3f7;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}

.pile-count-container {
  background: #1a3a5c;
  border: 3px solid #4fc3f7;
  box-shadow:
    inset -2px -2px 0 #0d2847,
    inset 2px 2px 0 #2a5a8c,
    4px 4px 0 rgba(0, 0, 0, 0.3);
}

.pile-count {
  display: block;
  font-size: 0.8rem;
  color: #fff;
  padding: 6px 14px;
}

.draw-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: #ff6b35;
  color: white;
  padding: 10px 18px;
  font-size: 0.55rem;
  border: none;
  box-shadow:
    inset -3px -3px 0 #cc4a1a,
    inset 3px 3px 0 #ff9a6c,
    4px 4px 0 rgba(0, 0, 0, 0.4);
  animation: hint-pulse 1s steps(4) infinite;
}

.hint-fish {
  animation: fish-bounce 0.5s steps(4) infinite alternate;
}

@keyframes fish-bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-4px); }
}

.hint-arrow {
  color: #ffd700;
  animation: arrow-bounce 0.5s steps(4) infinite;
}

@keyframes arrow-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

@keyframes hint-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow:
      inset -3px -3px 0 #cc4a1a,
      inset 3px 3px 0 #ff9a6c,
      4px 4px 0 rgba(0, 0, 0, 0.4);
  }
  50% {
    transform: scale(1.03);
    box-shadow:
      inset -3px -3px 0 #cc4a1a,
      inset 3px 3px 0 #ff9a6c,
      4px 4px 0 rgba(0, 0, 0, 0.4),
      0 0 15px rgba(255, 107, 53, 0.5);
  }
}

.can-draw .pile-stack {
  animation: stack-glow 1.5s steps(6) infinite;
}

@keyframes stack-glow {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(255, 107, 53, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(255, 107, 53, 0.8));
  }
}
</style>
