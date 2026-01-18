<script setup>
defineProps({
  size: {
    type: Number,
    default: 32
  },
  color: {
    type: String,
    default: 'blue' // 'blue', 'gray', 'dark'
  }
})

const colorPalettes = {
  blue: {
    body: '#4a90e2',
    bodyLight: '#6ba3e8',
    bodyDark: '#2c5aa0',
    fin: '#3d7dc7',
    finDark: '#2a5c94',
    eye: '#1a1a2e',
    eyeWhite: '#ffffff',
    teeth: '#ffffff',
    outline: '#1a3a5c'
  },
  gray: {
    body: '#7a8a99',
    bodyLight: '#a0adb8',
    bodyDark: '#5a6a79',
    fin: '#6a7a89',
    finDark: '#4a5a69',
    eye: '#1a1a2e',
    eyeWhite: '#ffffff',
    teeth: '#ffffff',
    outline: '#2a3a4a'
  },
  dark: {
    body: '#3a4a5a',
    bodyLight: '#5a6a7a',
    bodyDark: '#2a3a4a',
    fin: '#4a5a6a',
    finDark: '#1a2a3a',
    eye: '#ff4444',
    eyeWhite: '#ffffff',
    teeth: '#ffffff',
    outline: '#0a1a2a'
  }
}

const getColors = (colorName) => colorPalettes[colorName] || colorPalettes.blue
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    style="image-rendering: pixelated;"
  >
    <!-- Simple recognizable shark -->

    <!-- Iconic dorsal fin -->
    <rect x="6" y="2" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="5" y="3" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="6" y="3" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="7" y="3" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="5" y="4" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="6" y="4" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="7" y="4" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Head/nose -->
    <rect x="2" y="5" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="3" y="5" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="4" y="5" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="5" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="6" y="5" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="7" y="5" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="8" y="5" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Eye row -->
    <rect x="1" y="6" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="2" y="6" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="3" y="6" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="4" y="6" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="6" width="1" height="1" :fill="getColors(color).eyeWhite"/>
    <rect x="6" y="6" width="1" height="1" :fill="getColors(color).eye"/>
    <rect x="7" y="6" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="8" y="6" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Mouth with teeth -->
    <rect x="1" y="7" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="2" y="7" width="1" height="1" :fill="getColors(color).teeth"/>
    <rect x="3" y="7" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="4" y="7" width="1" height="1" :fill="getColors(color).teeth"/>
    <rect x="5" y="7" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="6" y="7" width="1" height="1" :fill="getColors(color).teeth"/>
    <rect x="7" y="7" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Body with pectoral fin -->
    <rect x="0" y="8" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="1" y="8" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="2" y="8" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="3" y="8" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="4" y="8" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="8" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="6" y="8" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="7" y="8" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Belly -->
    <rect x="2" y="9" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="3" y="9" width="1" height="1" :fill="getColors(color).bodyLight"/>
    <rect x="4" y="9" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="9" width="1" height="1" :fill="getColors(color).bodyDark"/>
    <rect x="6" y="9" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Tail -->
    <rect x="3" y="10" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="4" y="10" width="1" height="1" :fill="getColors(color).body"/>
    <rect x="5" y="10" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Tail fin -->
    <rect x="5" y="9" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="6" y="9" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="7" y="9" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="6" y="10" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="7" y="10" width="1" height="1" :fill="getColors(color).finDark"/>
    <rect x="8" y="10" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="7" y="11" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="8" y="11" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="9" y="11" width="1" height="1" :fill="getColors(color).outline"/>

    <!-- Lower tail -->
    <rect x="4" y="11" width="1" height="1" :fill="getColors(color).outline"/>
    <rect x="5" y="11" width="1" height="1" :fill="getColors(color).fin"/>
    <rect x="6" y="11" width="1" height="1" :fill="getColors(color).outline"/>
  </svg>
</template>

<style scoped>
svg {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
