<script setup>
import PixelFish from './PixelFish.vue'
import PixelSuit from './PixelSuit.vue'

defineProps({
  suit: {
    type: String,
    required: true
  },
  rank: {
    type: String,
    required: true
  },
  faceDown: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  },
  small: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

// Map suits to fish suit names for color determination
const suitToFish = {
  '♠': 'wave',
  '♥': 'coral',
  '♦': 'pearl',
  '♣': 'algae'
}

const getSuitColor = (suit) => {
  const colors = {
    '♥': '#ff6b35',
    '♦': '#f8bbd9',
    '♠': '#4fc3f7',
    '♣': '#81c784'
  }
  return colors[suit] || '#ff6b35'
}

const getFishColor = (suit) => {
  const colorMap = {
    '♠': 'blue',
    '♥': 'orange',
    '♦': 'pink',
    '♣': 'green'
  }
  return colorMap[suit] || 'orange'
}

const getSuitName = (suit) => suitToFish[suit] || 'coral'
</script>

<template>
  <div
    class="card pixel-card"
    :class="{
      'face-down': faceDown,
      'selected': selected,
      'small': small,
      'new-card': isNew,
      'animated': animated
    }"
    @click="$emit('click')"
  >
    <template v-if="!faceDown">
      <div class="card-inner">
        <!-- Top left corner -->
        <div class="card-corner top-left">
          <span class="rank" :style="{ color: getSuitColor(suit) }">{{ rank }}</span>
          <PixelSuit :suit="suit" :size="small ? 10 : 14" />
        </div>

        <!-- Center fish with decorative suits -->
        <div class="card-center">
          <div class="center-decoration top">
            <PixelSuit :suit="suit" :size="small ? 8 : 12" />
          </div>
          <PixelFish :size="small ? 28 : 44" :color="getFishColor(suit)" />
          <div class="center-decoration bottom">
            <PixelSuit :suit="suit" :size="small ? 8 : 12" />
          </div>
        </div>

        <!-- Bottom right corner -->
        <div class="card-corner bottom-right">
          <span class="rank" :style="{ color: getSuitColor(suit) }">{{ rank }}</span>
          <PixelSuit :suit="suit" :size="small ? 10 : 14" />
        </div>

        <!-- Decorative pixel border pattern -->
        <div class="pixel-border-pattern">
          <div class="border-corner tl"></div>
          <div class="border-corner tr"></div>
          <div class="border-corner bl"></div>
          <div class="border-corner br"></div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card-back">
        <div class="card-back-inner">
          <PixelFish :size="small ? 24 : 36" color="gold" />
        </div>
        <!-- Animated wave pattern -->
        <div class="back-pattern">
          <div class="wave-line" v-for="i in 5" :key="i" :style="{ '--wave-delay': i * 0.2 + 's' }"></div>
        </div>
        <!-- Corner decorations -->
        <div class="back-corners">
          <div class="back-corner tl"></div>
          <div class="back-corner tr"></div>
          <div class="back-corner bl"></div>
          <div class="back-corner br"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.card {
  width: var(--card-width, 90px);
  height: var(--card-height, 130px);
  position: relative;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.2s ease-out,
              filter 0.2s ease-out;
  image-rendering: pixelated;
  border-radius: 0 !important;
  --shimmer-color: rgba(255, 255, 255, 0.4);
}

.card.small {
  --card-width: 56px;
  --card-height: 80px;
}

.card-inner,
.card-back {
  width: 100%;
  height: 100%;
  border-radius: 0 !important;
  position: relative;
  overflow: hidden;
}

.card-inner {
  background: linear-gradient(135deg, #f8f4e8 0%, #e8e4d8 100%);
  border: 3px solid #2c2c2c;
  box-shadow:
    inset -3px -3px 0 #d4d0c4,
    inset 3px 3px 0 #ffffff,
    4px 4px 0 rgba(0, 0, 0, 0.3);
}

/* Shimmer overlay effect */
.card-inner::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    135deg,
    transparent 30%,
    var(--shimmer-color) 50%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 10;
}

.card:hover .card-inner::before {
  opacity: 1;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translate(-30%, -30%) rotate(0deg); }
  100% { transform: translate(30%, 30%) rotate(0deg); }
}

.card:hover {
  transform: translateY(-12px) scale(1.02);
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  z-index: 100;
}

.card:hover .card-inner {
  box-shadow:
    inset -3px -3px 0 #d4d0c4,
    inset 3px 3px 0 #ffffff,
    0 0 20px rgba(255, 215, 0, 0.3),
    6px 8px 0 rgba(0, 0, 0, 0.4);
}

.card.selected {
  transform: translateY(-20px) scale(1.05);
  filter: drop-shadow(0 12px 24px rgba(255, 215, 0, 0.4));
  z-index: 200;
}

.card.selected .card-inner {
  border-color: #ffd700;
  box-shadow:
    inset -3px -3px 0 #d4d0c4,
    inset 3px 3px 0 #ffffff,
    0 0 0 4px #ffd700,
    0 0 30px rgba(255, 215, 0, 0.6),
    0 0 60px rgba(255, 215, 0, 0.3),
    8px 10px 0 rgba(0, 0, 0, 0.4);
  animation: selectedPulse 1.5s ease-in-out infinite;
}

@keyframes selectedPulse {
  0%, 100% {
    box-shadow:
      inset -3px -3px 0 #d4d0c4,
      inset 3px 3px 0 #ffffff,
      0 0 0 4px #ffd700,
      0 0 30px rgba(255, 215, 0, 0.6),
      0 0 60px rgba(255, 215, 0, 0.3),
      8px 10px 0 rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow:
      inset -3px -3px 0 #d4d0c4,
      inset 3px 3px 0 #ffffff,
      0 0 0 6px #ffee88,
      0 0 50px rgba(255, 215, 0, 0.8),
      0 0 80px rgba(255, 215, 0, 0.5),
      8px 10px 0 rgba(0, 0, 0, 0.4);
  }
}

/* Pixel border decorations */
.pixel-border-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.border-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #2c2c2c;
}

.border-corner.tl {
  top: 0;
  left: 0;
  clip-path: polygon(0 0, 100% 0, 0 100%);
  background: linear-gradient(135deg, #2c2c2c 50%, transparent 50%);
}

.border-corner.tr {
  top: 0;
  right: 0;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
  background: linear-gradient(225deg, #2c2c2c 50%, transparent 50%);
}

.border-corner.bl {
  bottom: 0;
  left: 0;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
  background: linear-gradient(45deg, #2c2c2c 50%, transparent 50%);
}

.border-corner.br {
  bottom: 0;
  right: 0;
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
  background: linear-gradient(315deg, #2c2c2c 50%, transparent 50%);
}

.card.small .border-corner {
  width: 4px;
  height: 4px;
}

/* Card corners */
.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: 'Press Start 2P', monospace;
  font-weight: bold;
  line-height: 1;
}

.top-left {
  top: 6px;
  left: 6px;
}

.bottom-right {
  bottom: 6px;
  right: 6px;
  transform: rotate(180deg);
}

.rank {
  font-size: 0.9rem;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.card.small .rank {
  font-size: 0.6rem;
}

.card.small .top-left {
  top: 4px;
  left: 4px;
}

.card.small .bottom-right {
  bottom: 4px;
  right: 4px;
}

/* Card center */
.card-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.center-decoration {
  opacity: 0.6;
}

.center-decoration.top {
  transform: translateY(4px);
}

.center-decoration.bottom {
  transform: translateY(-4px) rotate(180deg);
}

.card.small .center-decoration {
  display: none;
}

/* Face down card */
.card-back {
  background: linear-gradient(135deg, #1a3a5c 0%, #0d2847 100%);
  border: 3px solid #0a1628;
  box-shadow:
    inset -3px -3px 0 #0d2847,
    inset 3px 3px 0 #2a5a8c,
    4px 4px 0 rgba(0, 0, 0, 0.3);
}

.card.face-down:hover {
  transform: none;
}

.card-back-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

/* Animated wave pattern */
.back-pattern {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 2px solid #ffd700;
  overflow: hidden;
}

.wave-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 215, 0, 0.3) 25%,
    rgba(255, 215, 0, 0.5) 50%,
    rgba(255, 215, 0, 0.3) 75%,
    transparent 100%
  );
  animation: wave-move 3s ease-in-out infinite;
  animation-delay: var(--wave-delay, 0s);
}

.wave-line:nth-child(1) { top: 20%; }
.wave-line:nth-child(2) { top: 35%; }
.wave-line:nth-child(3) { top: 50%; }
.wave-line:nth-child(4) { top: 65%; }
.wave-line:nth-child(5) { top: 80%; }

@keyframes wave-move {
  0%, 100% {
    transform: translateX(-20%);
    opacity: 0.3;
  }
  50% {
    transform: translateX(20%);
    opacity: 0.6;
  }
}

.card.small .back-pattern {
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.card.small .wave-line {
  height: 1px;
}

/* Back corner decorations */
.back-corners {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  pointer-events: none;
}

.back-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid #ffd700;
}

.back-corner.tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.back-corner.tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.back-corner.bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.back-corner.br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.card.small .back-corners {
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.card.small .back-corner {
  width: 5px;
  height: 5px;
}

/* New card celebration effects */
.card.new-card {
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 25px rgba(255, 107, 53, 0.6));
}

.card.new-card .card-inner {
  animation: cardGlow 1s ease-in-out;
  box-shadow:
    inset -2px -2px 0 #d4d0c4,
    inset 2px 2px 0 #ffffff,
    0 0 0 4px rgba(255, 215, 0, 0.6),
    0 0 20px rgba(255, 215, 0, 0.8),
    8px 10px 0 rgba(0, 0, 0, 0.4);
}

@keyframes cardGlow {
  0%, 100% {
    box-shadow:
      inset -2px -2px 0 #d4d0c4,
      inset 2px 2px 0 #ffffff,
      0 0 0 4px rgba(255, 215, 0, 0.6),
      0 0 20px rgba(255, 215, 0, 0.8),
      8px 10px 0 rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow:
      inset -2px -2px 0 #d4d0c4,
      inset 2px 2px 0 #ffffff,
      0 0 0 6px rgba(255, 215, 0, 1),
      0 0 40px rgba(255, 215, 0, 1),
      0 0 60px rgba(255, 107, 53, 0.8),
      12px 14px 0 rgba(0, 0, 0, 0.4);
  }
}

/* Animation class */
.card.animated {
  animation: card-deal 0.3s steps(4) forwards;
}

@keyframes card-deal {
  0% {
    transform: translate(0, -50px) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translate(0, -20px) scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
}
</style>
