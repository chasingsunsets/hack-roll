<script setup>
import PixelFish from './PixelFish.vue'

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
  }
})

defineEmits(['click'])

const getSuitColor = (suit) => {
  return suit === '♥' || suit === '♦' ? 'red' : 'black'
}

const getFishColor = (suit) => {
  const colorMap = {
    '♠': 'blue',
    '♥': 'pink',
    '♦': 'gold',
    '♣': 'green'
  }
  return colorMap[suit] || 'orange'
}
</script>

<template>
  <div
    class="card pixel-card"
    :class="{
      'face-down': faceDown,
      'selected': selected,
      'small': small,
      'new-card': isNew
    }"
    @click="$emit('click')"
  >
    <template v-if="!faceDown">
      <div class="card-inner">
        <div class="card-corner top-left">
          <span class="rank" :class="getSuitColor(suit)">{{ rank }}</span>
          <span class="suit" :class="getSuitColor(suit)">{{ suit }}</span>
        </div>
        <div class="card-center">
          <PixelFish :size="small ? 32 : 48" :color="getFishColor(suit)" />
        </div>
        <div class="card-corner bottom-right">
          <span class="rank" :class="getSuitColor(suit)">{{ rank }}</span>
          <span class="suit" :class="getSuitColor(suit)">{{ suit }}</span>
        </div>
      </div>
      <!-- Pixel border effect -->
      <div class="pixel-border"></div>
    </template>
    <template v-else>
      <div class="card-back">
        <div class="card-back-inner">
          <PixelFish :size="small ? 28 : 40" color="gold" />
        </div>
        <div class="back-pattern"></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.card {
  width: 90px;
  height: 130px;
  position: relative;
  cursor: pointer;
  transition: all 0.15s ease;
  image-rendering: pixelated;
}

.card.small {
  width: 56px;
  height: 80px;
}

.card-inner,
.card-back {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.card-inner {
  background: linear-gradient(135deg, #f8f4e8 0%, #e8e4d8 100%);
  box-shadow:
    inset -2px -2px 0 #d4d0c4,
    inset 2px 2px 0 #ffffff,
    4px 4px 0 rgba(0, 0, 0, 0.3);
}

.card:hover {
  transform: translateY(-8px);
}

.card:hover .card-inner {
  box-shadow:
    inset -2px -2px 0 #d4d0c4,
    inset 2px 2px 0 #ffffff,
    6px 8px 0 rgba(0, 0, 0, 0.4);
}

.card.selected {
  transform: translateY(-16px);
}

.card.selected .card-inner {
  box-shadow:
    inset -2px -2px 0 #d4d0c4,
    inset 2px 2px 0 #ffffff,
    0 0 0 4px #ffd700,
    8px 10px 0 rgba(0, 0, 0, 0.4);
}

/* Pixel border effect */
.pixel-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border: 3px solid #2c2c2c;
  border-radius: 4px;
}

.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  line-height: 1;
}

.top-left {
  top: 6px;
  left: 8px;
}

.bottom-right {
  bottom: 6px;
  right: 8px;
  transform: rotate(180deg);
}

.rank {
  font-size: 1.1rem;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
}

.suit {
  font-size: 0.9rem;
}

.card.small .rank {
  font-size: 0.75rem;
}

.card.small .suit {
  font-size: 0.65rem;
}

.card.small .top-left {
  top: 4px;
  left: 5px;
}

.card.small .bottom-right {
  bottom: 4px;
  right: 5px;
}

.suit.red,
.rank.red {
  color: #c62828;
}

.suit.black,
.rank.black {
  color: #1a1a1a;
}

.card-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Face down card */
.card-back {
  background: #1a3a5c;
  box-shadow:
    inset -2px -2px 0 #0d2847,
    inset 2px 2px 0 #2a5a8c,
    4px 4px 0 rgba(0, 0, 0, 0.3);
  border: 3px solid #0a1628;
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

.back-pattern {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 2px solid #ffd700;
  border-radius: 2px;
  background:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 4px,
      rgba(255, 215, 0, 0.1) 4px,
      rgba(255, 215, 0, 0.1) 8px
    );
}

.card.small .back-pattern {
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
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
</style>
