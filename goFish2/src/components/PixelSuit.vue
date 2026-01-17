<script setup>
defineProps({
  suit: {
    type: String,
    required: true,
    validator: (value) => ['coral', 'algae', 'wave', 'pearl', '♥', '♣', '♠', '♦'].includes(value)
  },
  size: {
    type: Number,
    default: 16
  }
})

// Map traditional suits to fish suits
const suitMap = {
  '♥': 'coral',
  '♣': 'algae',
  '♠': 'wave',
  '♦': 'pearl'
}

const getMappedSuit = (suit) => suitMap[suit] || suit

// Color palettes for each fish suit
const colorPalettes = {
  coral: {
    primary: '#ff6b35',
    light: '#ff9a6c',
    dark: '#cc4a1a',
    accent: '#ffb088',
    outline: '#8a2a0a'
  },
  algae: {
    primary: '#81c784',
    light: '#a5d6a7',
    dark: '#4caf50',
    accent: '#c8e6c9',
    outline: '#1b5e20'
  },
  wave: {
    primary: '#4fc3f7',
    light: '#81d4fa',
    dark: '#0288d1',
    accent: '#b3e5fc',
    outline: '#01579b'
  },
  pearl: {
    primary: '#f8bbd9',
    light: '#fce4ec',
    dark: '#f48fb1',
    accent: '#ffffff',
    outline: '#880e4f'
  }
}

const getColors = (suit) => colorPalettes[getMappedSuit(suit)] || colorPalettes.coral
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 8 8"
    class="pixel-suit"
  >
    <!-- Coral Fish (Heart replacement) - Warm, rounded shape -->
    <template v-if="getMappedSuit(suit) === 'coral'">
      <!-- Body -->
      <rect x="1" y="2" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="2" y="1" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="2" y="2" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="3" y="2" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="4" y="1" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="4" y="2" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="5" y="2" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="1" y="3" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="2" y="3" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="3" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="4" y="3" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="5" y="3" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="6" y="3" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="2" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="3" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="4" y="4" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="5" y="4" width="1" height="1" :fill="getColors(suit).dark"/>
      <!-- Tail -->
      <rect x="0" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="0" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <!-- Eye -->
      <rect x="5" y="2" width="1" height="1" fill="#ffffff"/>
      <!-- Fins -->
      <rect x="3" y="5" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="3" y="1" width="1" height="1" :fill="getColors(suit).light"/>
    </template>

    <!-- Algae Fish (Club replacement) - Spiky, plant-like -->
    <template v-else-if="getMappedSuit(suit) === 'algae'">
      <!-- Body -->
      <rect x="2" y="2" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="3" y="2" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="4" y="2" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="5" y="2" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="1" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="2" y="3" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="3" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="4" y="3" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="5" y="3" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="6" y="3" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="2" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="3" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="4" y="4" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="5" y="4" width="1" height="1" :fill="getColors(suit).dark"/>
      <!-- Tail fin -->
      <rect x="0" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="0" y="2" width="1" height="1" :fill="getColors(suit).accent"/>
      <rect x="0" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <!-- Dorsal spikes -->
      <rect x="2" y="1" width="1" height="1" :fill="getColors(suit).accent"/>
      <rect x="4" y="1" width="1" height="1" :fill="getColors(suit).light"/>
      <!-- Bottom fin -->
      <rect x="3" y="5" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="4" y="5" width="1" height="1" :fill="getColors(suit).dark"/>
      <!-- Eye -->
      <rect x="5" y="2" width="1" height="1" fill="#ffffff"/>
    </template>

    <!-- Wave Fish (Spade replacement) - Sleek, flowing -->
    <template v-else-if="getMappedSuit(suit) === 'wave'">
      <!-- Body -->
      <rect x="2" y="2" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="3" y="2" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="4" y="2" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="5" y="2" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="6" y="2" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="1" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="2" y="3" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="3" y="3" width="1" height="1" :fill="getColors(suit).accent"/>
      <rect x="4" y="3" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="5" y="3" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="6" y="3" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="2" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="3" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="4" y="4" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="5" y="4" width="1" height="1" :fill="getColors(suit).dark"/>
      <!-- Tail -->
      <rect x="0" y="2" width="1" height="1" :fill="getColors(suit).accent"/>
      <rect x="0" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="0" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <!-- Fins -->
      <rect x="3" y="1" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="4" y="1" width="1" height="1" :fill="getColors(suit).accent"/>
      <rect x="3" y="5" width="1" height="1" :fill="getColors(suit).dark"/>
      <!-- Eye -->
      <rect x="5" y="2" width="1" height="1" fill="#ffffff"/>
      <rect x="6" y="2" width="1" height="1" :fill="getColors(suit).outline"/>
    </template>

    <!-- Pearl Fish (Diamond replacement) - Elegant, shimmering -->
    <template v-else-if="getMappedSuit(suit) === 'pearl'">
      <!-- Body -->
      <rect x="2" y="2" width="1" height="1" :fill="getColors(suit).accent"/>
      <rect x="3" y="2" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="4" y="2" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="5" y="2" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="1" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="2" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="3" y="3" width="1" height="1" :fill="getColors(suit).accent"/>
      <rect x="4" y="3" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="5" y="3" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="6" y="3" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="2" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="3" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <rect x="4" y="4" width="1" height="1" :fill="getColors(suit).dark"/>
      <rect x="5" y="4" width="1" height="1" :fill="getColors(suit).dark"/>
      <!-- Tail -->
      <rect x="0" y="2" width="1" height="1" :fill="getColors(suit).accent"/>
      <rect x="0" y="3" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="0" y="4" width="1" height="1" :fill="getColors(suit).primary"/>
      <!-- Fins with sparkle -->
      <rect x="3" y="1" width="1" height="1" :fill="getColors(suit).accent"/>
      <rect x="4" y="1" width="1" height="1" :fill="getColors(suit).light"/>
      <rect x="3" y="5" width="1" height="1" :fill="getColors(suit).dark"/>
      <!-- Eye -->
      <rect x="5" y="2" width="1" height="1" fill="#ffffff"/>
      <!-- Pearl shimmer -->
      <rect x="2" y="3" width="1" height="1" fill="#ffffff" opacity="0.5"/>
    </template>
  </svg>
</template>

<style scoped>
.pixel-suit {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: inline-block;
  vertical-align: middle;
}
</style>
