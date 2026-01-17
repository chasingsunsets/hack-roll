<script setup>
import { ref } from 'vue'
import Lobby from './components/Lobby.vue'
import MultiplayerGameBoard from './components/MultiplayerGameBoard.vue'

const gameStarted = ref(false)
const initialGameData = ref(null)

function onGameStarted(data) {
  initialGameData.value = data
  gameStarted.value = true
}

function onLeaveGame() {
  gameStarted.value = false
  initialGameData.value = null
}
</script>

<template>
  <Lobby v-if="!gameStarted" @game-started="onGameStarted" />
  <MultiplayerGameBoard v-else :initial-data="initialGameData" @leave-game="onLeaveGame" />
</template>

<style scoped>
</style>
