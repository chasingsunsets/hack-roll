<script setup>
defineProps({
  size: {
    type: Number,
    default: 64
  },
  color: {
    type: String,
    default: 'orange' // 'orange', 'blue', 'green', 'pink', 'gold'
  }
})

const colorPalettes = {
  orange: {
    body: '#ff6b35',
    bodyLight: '#ff8c5a',
    bodyDark: '#cc4a1a',
    fin: '#f7931e',
    finDark: '#d4750a',
    eye: '#1a1a2e',
    eyeWhite: '#ffffff',
    outline: '#4a2c1a'
  },
  blue: {
    body: '#4fc3f7',
    bodyLight: '#81d4fa',
    bodyDark: '#0288d1',
    fin: '#29b6f6',
    finDark: '#0277bd',
    eye: '#1a1a2e',
    eyeWhite: '#ffffff',
    outline: '#1a3a4a'
  },
  green: {
    body: '#81c784',
    bodyLight: '#a5d6a7',
    bodyDark: '#4caf50',
    fin: '#66bb6a',
    finDark: '#388e3c',
    eye: '#1a1a2e',
    eyeWhite: '#ffffff',
    outline: '#1a3a1a'
  },
  pink: {
    body: '#f48fb1',
    bodyLight: '#f8bbd9',
    bodyDark: '#ec407a',
    fin: '#f06292',
    finDark: '#c2185b',
    eye: '#1a1a2e',
    eyeWhite: '#ffffff',
    outline: '#4a1a3a'
  },
  gold: {
    body: '#ffd54f',
    bodyLight: '#ffeb3b',
    bodyDark: '#ffc107',
    fin: '#ffca28',
    finDark: '#ff8f00',
    eye: '#1a1a2e',
    eyeWhite: '#ffffff',
    outline: '#5d4e0a'
  }
}

const getColors = (colorName) => colorPalettes[colorName] || colorPalettes.orange
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    style="image-rendering: pixelated;"
  >
    <!-- Pixel grid fish design -->
    <!-- Row 0-1: Top fin -->
    <rect x="6" y="0" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="7" y="0" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="5" y="1" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="6" y="1" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="7" y="1" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="8" y="1" width="1" height="1" :fill="getColors(color).finDark"/>

    <!-- Row 2-3: Head top -->
    <rect x="4" y="2" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="5" y="2" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="6" y="2" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="7" y="2" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="8" y="2" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="9" y="2" width="1" height="1" :fill="getColors(color).outline"/>

    <rect x="3" y="3" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="4" y="3" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="5" y="3" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="6" y="3" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="7" y="3" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="8" y="3" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="9" y="3" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="10" y="3" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Row 4-5: Eyes -->
    <rect x="2" y="4" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="3" y="4" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="4" y="4" width="1" height="1" :fill="getColors(color).eyeWhite"/>
    <rect x="5" y="4" width="1" height="1" :fill="getColors(color).eye"/>
    <rect x="6" y="4" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="7" y="4" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="8" y="4" width="1" height="1" :fill="getColors(color).eyeWhite"/>
    <rect x="9" y="4" width="1" height="1" :fill="getColors(color).eye"/>
    <rect x="10" y="4" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="11" y="4" width="1" height="1" :fill="getColors(color).outline"/>

    <rect x="1" y="5" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="2" y="5" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="3" y="5" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="4" y="5" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="5" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="6" y="5" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="7" y="5" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="8" y="5" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="9" y="5" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="10" y="5" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="11" y="5" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Row 6-7: Body middle with side fin -->
    <rect x="0" y="6" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="1" y="6" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="2" y="6" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="3" y="6" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="4" y="6" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="6" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="6" y="6" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="7" y="6" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="8" y="6" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="9" y="6" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="10" y="6" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="11" y="6" width="1" height="1" :fill="getColors(color).outline"/>

    <rect x="0" y="7" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="1" y="7" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="2" y="7" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="3" y="7" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="4" y="7" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="5" y="7" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="6" y="7" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="7" y="7" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="8" y="7" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="9" y="7" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="10" y="7" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="11" y="7" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Row 8-9: Body with scales pattern -->
    <rect x="1" y="8" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="2" y="8" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="3" y="8" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="4" y="8" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="8" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="6" y="8" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="7" y="8" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="8" y="8" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="9" y="8" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="10" y="8" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="11" y="8" width="1" height="1" :fill="getColors(color).outline"/>

    <rect x="2" y="9" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="3" y="9" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="4" y="9" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="9" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="6" y="9" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="7" y="9" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="8" y="9" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="9" y="9" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="10" y="9" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Row 10-11: Tail start -->
    <rect x="3" y="10" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="4" y="10" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="10" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="6" y="10" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="7" y="10" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="8" y="10" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="9" y="10" width="1" height="1" :fill="getColors(color).outline"/>

    <rect x="4" y="11" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="5" y="11" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="6" y="11" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="7" y="11" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="8" y="11" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Row 12-15: Tail fin -->
    <rect x="3" y="12" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="4" y="12" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="5" y="12" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="6" y="12" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="7" y="12" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="8" y="12" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="9" y="12" width="1" height="1" :fill="getColors(color).outline"/>

    <rect x="2" y="13" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="3" y="13" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="4" y="13" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="5" y="13" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="6" y="13" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="7" y="13" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="8" y="13" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="9" y="13" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="10" y="13" width="1" height="1" :fill="getColors(color).outline"/>

    <rect x="2" y="14" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="3" y="14" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="4" y="14" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="8" y="14" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="9" y="14" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="10" y="14" width="1" height="1" :fill="getColors(color).finDark"/>

    <rect x="3" y="15" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="9" y="15" width="1" height="1" :fill="getColors(color).outline"/>
  </svg>
</template>

<style scoped>
svg {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
