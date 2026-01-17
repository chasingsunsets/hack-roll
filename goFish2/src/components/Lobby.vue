<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useSocket } from '../composables/useSocket';
import PixelFish from './PixelFish.vue';
import PixelBackground from './PixelBackground.vue';

const emit = defineEmits(['game-started']);

const {
  connected,
  roomCode,
  players,
  isHost,
  myId,
  gameStarted,
  connect,
  disconnect,
  createRoom,
  joinRoom,
  rejoinRoom,
  startGame,
  setEventHandlers,
  hasSession,
  clearSession
} = useSocket();

const playerName = ref('');
const joinCode = ref('');
const error = ref('');
const inRoom = ref(false);
const isLoading = ref(false);
const isRejoining = ref(false);

onMounted(() => {
  connect();
  setEventHandlers({
    onPlayerJoined: (data) => {
      console.log('Player joined:', data.newPlayer);
    },
    onPlayerLeft: (data) => {
      console.log('Player left');
    },
    onGameStarted: (data) => {
      emit('game-started', data);
    },
    onPlayerRejoined: (data) => {
      console.log('Player rejoined:', data.playerName);
    }
  });
});

// Watch for successful rejoin
watch([roomCode, gameStarted], ([newRoomCode, newGameStarted]) => {
  if (newRoomCode && !inRoom.value) {
    inRoom.value = true;
    isRejoining.value = false;
    // If game was already in progress, emit game-started
    if (newGameStarted) {
      emit('game-started', { rejoined: true });
    }
  }
}, { immediate: true });

onUnmounted(() => {
  // Don't disconnect here - we want to stay connected for the game
});

async function handleCreateRoom() {
  if (!playerName.value.trim()) {
    error.value = 'Please enter your name';
    return;
  }

  isLoading.value = true;
  error.value = '';

  const result = await createRoom(playerName.value.trim());

  isLoading.value = false;

  if (result.success) {
    inRoom.value = true;
  } else {
    error.value = result.error || 'Failed to create room';
  }
}

async function handleJoinRoom() {
  if (!playerName.value.trim()) {
    error.value = 'Please enter your name';
    return;
  }

  if (!joinCode.value.trim()) {
    error.value = 'Please enter a room code';
    return;
  }

  isLoading.value = true;
  error.value = '';

  const result = await joinRoom(joinCode.value.trim().toUpperCase(), playerName.value.trim());

  isLoading.value = false;

  if (result.success) {
    inRoom.value = true;
  } else {
    error.value = result.error || 'Failed to join room';
  }
}

async function handleStartGame() {
  if (players.value.length < 2) {
    error.value = 'Need at least 2 players';
    return;
  }

  isLoading.value = true;
  error.value = '';

  const result = await startGame();

  isLoading.value = false;

  if (!result.success) {
    error.value = result.error || 'Failed to start game';
  }
}

function leaveRoom() {
  disconnect();
  inRoom.value = false;
  connect(); // Reconnect for next attempt
}

function handleClearSession() {
  clearSession();
  inRoom.value = false;
  error.value = '';
}
</script>

<template>
  <div class="lobby">
    <PixelBackground />

    <div class="lobby-content">
      <!-- Title -->
      <div class="lobby-header">
        <PixelFish :size="64" color="gold" />
        <h1 class="lobby-title">GO FISH!</h1>
        <PixelFish :size="64" color="cyan" />
      </div>
      <p class="lobby-subtitle">MULTIPLAYER</p>

      <!-- Connection status -->
      <div class="connection-status" :class="{ connected }">
        <span class="status-dot"></span>
        <span>{{ connected ? 'CONNECTED' : 'CONNECTING...' }}</span>
      </div>

      <!-- Not in room - show create/join options -->
      <div v-if="!inRoom" class="lobby-form">
        <!-- Name input -->
        <div class="input-group">
          <label>YOUR NAME</label>
          <input
            v-model="playerName"
            type="text"
            placeholder="Enter name..."
            maxlength="12"
            :disabled="!connected || isLoading"
          />
        </div>

        <!-- Create room button -->
        <button
          class="pixel-btn create-btn"
          @click="handleCreateRoom"
          :disabled="!connected || isLoading"
        >
          CREATE ROOM
        </button>

        <div class="divider">
          <span>OR</span>
        </div>

        <!-- Join room -->
        <div class="input-group">
          <label>ROOM CODE</label>
          <input
            v-model="joinCode"
            type="text"
            placeholder="XXXX"
            maxlength="4"
            :disabled="!connected || isLoading"
            @input="joinCode = joinCode.toUpperCase()"
          />
        </div>

        <button
          class="pixel-btn join-btn"
          @click="handleJoinRoom"
          :disabled="!connected || isLoading"
        >
          JOIN ROOM
        </button>

        <!-- Error message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <!-- In room - show waiting room -->
      <div v-else class="waiting-room">
        <div class="room-code-display">
          <span class="room-label">ROOM CODE</span>
          <span class="room-code">{{ roomCode }}</span>
          <span class="room-hint">Share this code with friends!</span>
        </div>

        <div class="players-list">
          <div class="players-header">
            <PixelFish :size="24" color="orange" />
            <span>PLAYERS ({{ players.length }}/4)</span>
          </div>
          <div
            v-for="player in players"
            :key="player.id"
            class="player-item"
            :class="{ 'is-you': player.isYou, 'is-host': players[0]?.id === player.id }"
          >
            <PixelFish :size="20" :color="player.isYou ? 'gold' : 'cyan'" />
            <span class="player-name">{{ player.name }}</span>
            <span v-if="player.isYou" class="you-tag">YOU</span>
            <span v-if="players[0]?.id === player.id" class="host-tag">HOST</span>
          </div>
        </div>

        <div class="waiting-actions">
          <button
            v-if="isHost"
            class="pixel-btn start-btn"
            @click="handleStartGame"
            :disabled="players.length < 2 || isLoading"
          >
            {{ players.length < 2 ? 'WAITING FOR PLAYERS...' : 'START GAME' }}
          </button>
          <p v-else class="waiting-text">
            Waiting for host to start...
          </p>

          <button class="pixel-btn leave-btn" @click="leaveRoom">
            LEAVE ROOM
          </button>
        </div>

        <!-- Error message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Press Start 2P', monospace;
}

.lobby-content {
  position: relative;
  z-index: 1;
  background: rgba(10, 22, 40, 0.95);
  border: 4px solid #ffd700;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow:
    8px 8px 0 rgba(0, 0, 0, 0.5),
    0 0 40px rgba(255, 215, 0, 0.2);
}

.lobby-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.lobby-title {
  font-size: 2rem;
  color: #ffd700;
  text-shadow: 4px 4px 0 #cc8800;
  margin: 0;
}

.lobby-subtitle {
  text-align: center;
  color: #4fc3f7;
  font-size: 0.8rem;
  margin: 0 0 30px;
}

.connection-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  margin-bottom: 20px;
  font-size: 0.5rem;
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
  border: 2px solid #ff6b35;
}

.connection-status.connected {
  color: #5dfc9a;
  background: rgba(93, 252, 154, 0.1);
  border-color: #5dfc9a;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: currentColor;
  animation: blink 1s steps(2) infinite;
}

.connection-status.connected .status-dot {
  animation: none;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.lobby-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 0.5rem;
  color: #4fc3f7;
}

.input-group input {
  padding: 12px 16px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  background: #0d2847;
  border: 3px solid #4fc3f7;
  color: #fff;
  outline: none;
}

.input-group input:focus {
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.pixel-btn {
  padding: 14px 20px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
  box-shadow:
    inset -3px -3px 0 rgba(0, 0, 0, 0.2),
    inset 3px 3px 0 rgba(255, 255, 255, 0.2),
    4px 4px 0 rgba(0, 0, 0, 0.4);
}

.pixel-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.pixel-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.pixel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-btn {
  background: #5dfc9a;
  color: #0a1628;
}

.join-btn {
  background: #4fc3f7;
  color: #0a1628;
}

.start-btn {
  background: #ffd700;
  color: #0a1628;
}

.leave-btn {
  background: #ff6b35;
  color: #fff;
  font-size: 0.5rem;
  padding: 10px 16px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 15px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.5rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
}

.error-message {
  padding: 10px;
  background: rgba(255, 107, 53, 0.2);
  border: 2px solid #ff6b35;
  color: #ff6b35;
  font-size: 0.45rem;
  text-align: center;
}

/* Waiting room styles */
.waiting-room {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.room-code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: rgba(255, 215, 0, 0.1);
  border: 3px solid #ffd700;
}

.room-label {
  font-size: 0.5rem;
  color: #ffd700;
}

.room-code {
  font-size: 2rem;
  color: #fff;
  letter-spacing: 8px;
  text-shadow: 2px 2px 0 #0a1628;
}

.room-hint {
  font-size: 0.4rem;
  color: rgba(255, 255, 255, 0.5);
}

.players-list {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #4fc3f7;
}

.players-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #4fc3f7;
  color: #0a1628;
  font-size: 0.5rem;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.player-item:last-child {
  border-bottom: none;
}

.player-item.is-you {
  background: rgba(255, 215, 0, 0.1);
}

.player-name {
  flex: 1;
  font-size: 0.6rem;
  color: #fff;
}

.you-tag,
.host-tag {
  font-size: 0.4rem;
  padding: 4px 8px;
}

.you-tag {
  background: #ffd700;
  color: #0a1628;
}

.host-tag {
  background: #5dfc9a;
  color: #0a1628;
}

.waiting-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.waiting-text {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.5rem;
  padding: 14px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}
</style>
