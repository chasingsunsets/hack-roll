<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import PlayerHand from './PlayerHand.vue'
import OpponentHand from './OpponentHand.vue'
import DrawPile from './DrawPile.vue'
import BookPile from './BookPile.vue'
import GameMessage from './GameMessage.vue'
import PixelBackground from './PixelBackground.vue'
import PixelFish from './PixelFish.vue'
import GoFishSplash from './GoFishSplash.vue'
import BookCompleteEffect from './BookCompleteEffect.vue'
import TrollerOctopus from './TrollerOctopus.vue'
import DeckSwapTroll from './DeckSwapTroll.vue'
import EarthquakeTroll from './EarthquakeTroll.vue'

// Camera & Gesture Detection
import CameraFeed from './camera/CameraFeed.vue'
import CameraPermission from './camera/CameraPermission.vue'
import BannedMoveAlert from './banned-moves/BannedMoveAlert.vue'
import PlayerCameraFeed from './camera/PlayerCameraFeed.vue'
import { useCamera } from '../composables/useCamera'
import { useGestureDetection } from '../composables/useGestureDetection'
import { useSocket } from '../composables/useSocket'
import { BANNED_MOVES } from '../services/gestureDefinitions'

const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['leave-game'])

// Socket state
const {
  connected,
  roomCode,
  players,
  hand,
  deckCount,
  currentTurnId,
  gameOver,
  winner,
  myId,
  myBannedMove,
  askForCards,
  drawCard,
  reportBannedMove,
  reportGesture,
  setEventHandlers,
  disconnect
} = useSocket()

// Local UI state
const selectedCard = ref(null)
const gameMessage = ref({ text: 'Game started! Wait for your turn.', type: 'info' })
const selectedRank = ref(null)
const selectedOpponent = ref(null)
const mustDrawCard = ref(false) // Flag to force player to draw after "Go Fish"

// Selection flow state
const selectionStep = computed(() => {
  if (!isMyTurn.value || gameOver.value) return 'waiting'
  if (mustDrawCard.value) return 'must-draw'
  if (!selectedOpponent.value) return 'select-opponent'
  return 'select-card'
})

// Visual effects state
const showGoFishSplash = ref(false)
const showBookComplete = ref(false)
const completedBookRank = ref('')
const bookCompletePosition = ref({ x: 50, y: 50 })
const showOctopusTroll = ref(false)
const showDeckSwapTroll = ref(false)
const showEarthquakeTroll = ref(false)

// Camera & Gesture state
const { stream, isEnabled: cameraEnabled, startCamera, stopCamera } = useCamera()
const { isReady: gestureReady, currentGestures, initialize: initGesture, startDetection, stopDetection } = useGestureDetection()
const cameraFeedRef = ref(null)
const showCameraPermission = ref(false)
const showCameraFeed = ref(false)
const showBannedMoveAlert = ref(false)
const currentPenalty = ref(null)

// Computed
const myPlayer = computed(() => players.value.find(p => p.isYou))
const opponents = computed(() => players.value.filter(p => !p.isYou))
const isMyTurn = computed(() => currentTurnId.value === myId.value)

const canDrawCard = computed(() =>
  isMyTurn.value &&
  deckCount.value > 0 &&
  mustDrawCard.value
)

// Watch for turn changes
watch(isMyTurn, (myTurn) => {
  if (myTurn) {
    gameMessage.value = { text: 'Your turn! Click on a player to ask.', type: 'action' }
    // Reset selection when turn starts
    selectedOpponent.value = null
    selectedCard.value = null
    selectedRank.value = null
    mustDrawCard.value = false
  }
})

// Socket event handlers
onMounted(() => {
  // Set initial message based on whether it's our turn
  if (isMyTurn.value) {
    gameMessage.value = { text: 'Your turn! Click on a player to ask.', type: 'action' }
  } else {
    gameMessage.value = { text: 'Waiting for other players...', type: 'info' }
  }

  setEventHandlers({
    onCardsTransferred: (data) => {
      if (data.toPlayerId === myId.value) {
        gameMessage.value = {
          text: `You got ${data.count} ${data.rank}(s)! Ask again!`,
          type: 'success'
        }
      } else if (data.fromPlayerId === myId.value) {
        const asker = players.value.find(p => p.id === data.toPlayerId)
        gameMessage.value = {
          text: `You gave ${data.count} ${data.rank}(s) to ${asker?.name}`,
          type: 'info'
        }
      } else {
        const from = players.value.find(p => p.id === data.fromPlayerId)
        const to = players.value.find(p => p.id === data.toPlayerId)
        gameMessage.value = {
          text: `${from?.name} gave ${data.count} ${data.rank}(s) to ${to?.name}`,
          type: 'info'
        }
      }

      if (data.completedBooks?.length > 0) {
        completedBookRank.value = data.completedBooks[0]
        showBookComplete.value = true
      }
    },

    onCardDrawn: (data) => {
      if (data.playerId === myId.value) {
        if (data.drawnCard) {
          gameMessage.value = {
            text: `You drew a ${data.drawnCard.rank}${data.drawnCard.suit}!`,
            type: 'info'
          }
        }
      } else {
        const drawer = players.value.find(p => p.id === data.playerId)
        gameMessage.value = {
          text: `${drawer?.name} drew a card.`,
          type: 'info'
        }
      }

      if (data.completedBooks?.length > 0) {
        completedBookRank.value = data.completedBooks[0]
        showBookComplete.value = true
      }
    },

    onBannedMoveCaught: (data) => {
      if (data.victimId === myId.value) {
        currentPenalty.value = {
          gestureType: data.gestureType,
          gestureName: BANNED_MOVES[data.gestureType]?.name,
          victimName: data.victimName,
          reporterName: data.reporterName,
          penalties: [{ penaltyType: 'SKIP_TURN' }]
        }
        showBannedMoveAlert.value = true
        gameMessage.value = {
          text: `${data.reporterName} caught YOU doing ${BANNED_MOVES[data.gestureType]?.name}!`,
          type: 'warning'
        }
      } else {
        gameMessage.value = {
          text: `${data.reporterName} caught ${data.victimName} doing ${BANNED_MOVES[data.gestureType]?.name}!`,
          type: 'success'
        }
      }
    },

    onPlayerDisconnected: (data) => {
      gameMessage.value = {
        text: `${data.playerName} disconnected!`,
        type: 'warning'
      }
    },

    onTurnSkipped: (data) => {
      if (data.playerId === myId.value) {
        const reason = data.reason === 'octopus_troll' ? 'trolled by the octopus' : 'penalty'
        gameMessage.value = {
          text: `Your turn was SKIPPED (${reason})!`,
          type: 'warning'
        }
      } else {
        const reason = data.reason === 'octopus_troll' ? 'trolled by the octopus' : ''
        gameMessage.value = {
          text: `${data.playerName}'s turn was skipped${reason ? ' (' + reason + ')' : ''}!`,
          type: 'info'
        }
      }
    },

    onPlayerRejoined: (data) => {
      gameMessage.value = {
        text: `${data.playerName} reconnected!`,
        type: 'success'
      }
    },

    onOctopusTroll: (data) => {
      // Show octopus animation ONLY for this player (server sends event only to trolled player)
      // The black ink and "SKIPPED!" message will only appear on THIS player's screen
      showOctopusTroll.value = true
    },

    onDeckSwapTroll: (data) => {
      // Show deck swap animation to ALL players
      showDeckSwapTroll.value = true
      gameMessage.value = {
        text: data.message || 'Deck Swap! Everyone\'s hands have been randomly swapped!',
        type: 'warning'
      }
    },

    onGameStateUpdate: (data) => {
      // Game state has been updated after deck swap
      // The useSocket composable already updates hand, players, and deckCount
      // Just show a confirmation message
      gameMessage.value = {
        text: 'Your hand has been updated!',
        type: 'info'
      }
    },

    onEarthquakeTroll: (data) => {
      // Show earthquake animation to ALL players
      showEarthquakeTroll.value = true
      gameMessage.value = {
        text: data.message || 'Earthquake! The ground is shaking!',
        type: 'warning'
      }
    }
  })
})

onUnmounted(() => {
  disableCamera()
})

// Card selection
function selectCard(card) {
  if (!isMyTurn.value || gameOver.value) return

  // If player must draw, prevent card selection
  if (mustDrawCard.value) {
    gameMessage.value = { text: 'You must draw a card from the deck first!', type: 'warning' }
    return
  }

  // Must select opponent first
  if (!selectedOpponent.value) {
    gameMessage.value = { text: 'First, click on a player to ask!', type: 'warning' }
    return
  }

  // Select the card and immediately ask
  selectedCard.value = card
  selectedRank.value = card.rank

  // Immediately make the ask
  performAsk()
}

function selectRank(rank) {
  selectedRank.value = rank
}

function selectOpponentForAsk(opponentId) {
  if (!isMyTurn.value || gameOver.value) return

  // If player must draw, prevent opponent selection
  if (mustDrawCard.value) {
    gameMessage.value = { text: 'You must draw a card from the deck first!', type: 'warning' }
    return
  }

  if (selectedOpponent.value === opponentId) {
    // Deselect if clicking same opponent
    selectedOpponent.value = null
    gameMessage.value = { text: 'Your turn! Click on a player to ask.', type: 'action' }
  } else {
    selectedOpponent.value = opponentId
    const opponent = opponents.value.find(o => o.id === opponentId)
    gameMessage.value = { text: `Asking ${opponent?.name}. Now click a card to ask for!`, type: 'action' }
  }
}

async function performAsk() {
  if (!selectedRank.value || !selectedOpponent.value) return

  const result = await askForCards(selectedOpponent.value, selectedRank.value)

  if (result.goFish) {
    showGoFishSplash.value = true
    const opponent = opponents.value.find(o => o.id === selectedOpponent.value)
    gameMessage.value = {
      text: `Go Fish! ${opponent?.name} doesn't have any ${selectedRank.value}s. Draw a card from the deck!`,
      type: 'warning'
    }
    // Set flag to force player to draw from deck
    mustDrawCard.value = true
  }

  selectedCard.value = null
  selectedRank.value = null
  selectedOpponent.value = null
}

async function confirmAsk() {
  await performAsk()
}

function cancelAsk() {
  selectedCard.value = null
  selectedRank.value = null
  selectedOpponent.value = null
  if (isMyTurn.value) {
    gameMessage.value = { text: 'Your turn! Click on a player to ask.', type: 'action' }
  }
}

async function handleDrawCard() {
  if (deckCount.value === 0 || !isMyTurn.value) return
  await drawCard()
  // Reset the mustDrawCard flag after drawing
  mustDrawCard.value = false
}

function onGoFishSplashComplete() {
  showGoFishSplash.value = false
}

function onBookCompleteEffectDone() {
  showBookComplete.value = false
}

function onOctopusTrollComplete() {
  showOctopusTroll.value = false
}

function onDeckSwapTrollComplete() {
  showDeckSwapTroll.value = false
}

function onEarthquakeTrollComplete() {
  showEarthquakeTroll.value = false
}

// Camera functions
async function enableCamera() {
  showCameraPermission.value = false
  showCameraFeed.value = true

  console.log('Enabling camera...')
  await initGesture()
  console.log('Gesture initialized, gestureReady:', gestureReady.value)

  await new Promise(resolve => setTimeout(resolve, 200))

  if (cameraFeedRef.value) {
    const videoEl = cameraFeedRef.value.getVideoElement()
    console.log('Got video element:', videoEl)
    await startCamera(videoEl)
    console.log('Camera started, cameraEnabled:', cameraEnabled.value)

    // Wait for video to have actual frame data before starting detection
    await waitForVideoReady(videoEl)
    console.log('Video ready, dimensions:', videoEl.videoWidth, 'x', videoEl.videoHeight)

    if (gestureReady.value && cameraEnabled.value) {
      console.log('Starting gesture detection...')
      startDetection(videoEl, onGestureDetected)
    } else {
      console.log('Cannot start detection - gestureReady:', gestureReady.value, 'cameraEnabled:', cameraEnabled.value)
    }
  } else {
    console.log('No camera feed ref!')
  }
}

// Helper to wait for video to have valid frame data
function waitForVideoReady(videoEl) {
  return new Promise((resolve) => {
    if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
      resolve()
      return
    }

    const checkReady = () => {
      if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        videoEl.removeEventListener('loadeddata', checkReady)
        resolve()
      }
    }

    videoEl.addEventListener('loadeddata', checkReady)

    // Also check periodically in case event was missed
    const interval = setInterval(() => {
      if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        clearInterval(interval)
        videoEl.removeEventListener('loadeddata', checkReady)
        resolve()
      }
    }, 100)

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(interval)
      videoEl.removeEventListener('loadeddata', checkReady)
      resolve() // Resolve anyway to not block forever
    }, 5000)
  })
}

function disableCamera() {
  stopDetection()
  stopCamera()
  showCameraFeed.value = false
}

function toggleCamera() {
  if (showCameraFeed.value) {
    disableCamera()
  } else {
    showCameraPermission.value = true
  }
}

function onCameraPermissionGranted() {
  enableCamera()
}

function onCameraPermissionDenied() {
  showCameraPermission.value = false
}

async function onGestureDetected(gesture) {
  console.log('Gesture detected:', gesture.type, 'confidence:', gesture.confidence)

  // Report detected gesture to server - server will check if it matches
  // the LOCAL player's banned move (since camera watches the local player)
  const result = await reportGesture(gesture.type)
  console.log('Server response:', result)

  if (result.caught) {
    console.log(`You got caught doing your banned move by ${result.catcherName}!`)
    // Alert will be shown via socket event 'banned-move-caught'
  }
}

function onBannedMoveAlertClose() {
  showBannedMoveAlert.value = false
  currentPenalty.value = null
}

function handleLeaveGame() {
  disconnect()
  emit('leave-game')
}
</script>

<template>
  <div class="game-board">
    <PixelBackground />

    <!-- Visual Effects -->
    <GoFishSplash :show="showGoFishSplash" @complete="onGoFishSplashComplete" />
    <BookCompleteEffect
      :show="showBookComplete"
      :rank="completedBookRank"
      :position="bookCompletePosition"
      @complete="onBookCompleteEffectDone"
    />
    <TrollerOctopus v-if="showOctopusTroll" @complete="onOctopusTrollComplete" />
    <DeckSwapTroll v-if="showDeckSwapTroll" @complete="onDeckSwapTrollComplete" />
    <EarthquakeTroll v-if="showEarthquakeTroll" @complete="onEarthquakeTrollComplete" />

    <!-- Camera Permission Modal -->
    <CameraPermission
      v-if="showCameraPermission"
      @granted="onCameraPermissionGranted"
      @denied="onCameraPermissionDenied"
    />

    <!-- Banned Move Alert -->
    <BannedMoveAlert
      v-if="showBannedMoveAlert && currentPenalty"
      :penalty="currentPenalty"
      @close="onBannedMoveAlertClose"
    />

    <!-- Camera Feed -->
    <CameraFeed
      v-if="showCameraFeed"
      ref="cameraFeedRef"
      :is-detecting="gestureReady && cameraEnabled"
      :current-gestures="currentGestures"
      :stream="stream"
    />

    <!-- Header -->
    <div class="game-header">
      <div class="title-container">
        <PixelFish :size="40" color="gold" />
        <h1 class="game-title">GO FISH!</h1>
        <span class="room-badge">{{ roomCode }}</span>
      </div>
      <div class="header-buttons">
        <button class="camera-btn pixel-btn" @click="toggleCamera" :class="{ active: showCameraFeed }">
          {{ showCameraFeed ? 'CAM ON' : 'CAM OFF' }}
        </button>
        <button class="leave-btn pixel-btn" @click="handleLeaveGame">LEAVE</button>
      </div>
    </div>

    <!-- Main game area -->
    <div class="game-table">
      <!-- Opponents row -->
      <div class="opponents-row">
        <OpponentHand
          v-for="opp in opponents"
          :key="opp.id"
          :name="opp.name"
          :card-count="opp.cardCount"
          :is-current-turn="currentTurnId === opp.id"
          :is-selected="selectedOpponent === opp.id"
          :is-selectable="isMyTurn && !gameOver && !mustDrawCard"
          position="top"
          :show-camera="showCameraFeed"
          :camera-stream="stream"
          @select="selectOpponentForAsk(opp.id)"
        />
      </div>

      <!-- Center area -->
      <div class="table-center">
        <div class="message-area">
          <GameMessage :message="gameMessage.text" :type="gameMessage.type" />
        </div>
        <div class="center-content">
          <DrawPile
            :cards-remaining="deckCount"
            :can-draw="canDrawCard"
            @draw="handleDrawCard"
          />
          <div class="all-book-piles">
            <BookPile
              v-for="player in players"
              :key="player.id"
              :books="player.books"
              :player-name="player.isYou ? 'You' : player.name"
              :fish-color="player.isYou ? 'orange' : 'cyan'"
              :is-current-player="currentTurnId === player.id"
            />
          </div>
        </div>
      </div>

      <!-- Player area -->
      <div class="table-bottom">
        <div class="player-area">
          <div class="player-info">
            <PixelFish :size="32" color="orange" />
            <span class="player-name">YOUR HAND</span>
            <span class="card-count-badge">{{ hand.length }} cards</span>
            <span v-if="isMyTurn" class="turn-indicator">YOUR TURN!</span>
            <span v-if="myBannedMove" class="banned-move-badge" :title="'Don\'t do this!'">
              AVOID: {{ BANNED_MOVES[myBannedMove]?.name || myBannedMove }}
            </span>
          </div>
          <PlayerHand
            :cards="hand"
            :selected-card="selectedCard"
            @select-card="selectCard"
          />
        </div>
      </div>
    </div>

    <!-- Game over overlay -->
    <div v-if="gameOver" class="game-over-overlay">
      <div class="game-over-content pixel-panel">
        <div class="trophy-fish">
          <PixelFish :size="80" color="gold" />
        </div>
        <h2>GAME OVER!</h2>
        <p class="winner-text">{{ winner?.name }} wins with {{ winner?.books }} books!</p>
        <div class="final-scores">
          <div v-for="player in players" :key="player.id" class="score-item">
            <span>{{ player.isYou ? 'You' : player.name }}</span>
            <span>{{ player.books?.length || 0 }} books</span>
          </div>
        </div>
        <button class="leave-btn pixel-btn" @click="handleLeaveGame">BACK TO LOBBY</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  font-family: 'Press Start 2P', monospace;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: 4px solid #ffd700;
  box-shadow:
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.1),
    8px 8px 0 rgba(0, 0, 0, 0.4);
}

.title-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.game-title {
  margin: 0;
  font-size: 1.5rem;
  color: #ffd700;
  text-shadow: 3px 3px 0 #cc8800;
}

.room-badge {
  background: #4fc3f7;
  color: #0a1628;
  padding: 6px 12px;
  font-size: 0.6rem;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.pixel-btn {
  padding: 10px 16px;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  border: none;
  cursor: pointer;
  box-shadow:
    inset -3px -3px 0 rgba(0, 0, 0, 0.2),
    inset 3px 3px 0 rgba(255, 255, 255, 0.2),
    4px 4px 0 rgba(0, 0, 0, 0.4);
}

.camera-btn {
  background: #666;
  color: #fff;
}

.camera-btn.active {
  background: #5dfc9a;
  color: #0a1628;
}

.leave-btn {
  background: #ff6b35;
  color: #fff;
}

.game-table {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 140px);
  gap: 20px;
}

.opponents-row {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px;
}

.table-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.message-area {
  display: flex;
  justify-content: center;
}

.center-content {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 30px;
}

.all-book-piles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.table-bottom {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.player-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border: 3px solid #4fc3f7;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
  flex-wrap: wrap;
}

.player-name {
  font-weight: bold;
  color: #fff;
  font-size: 0.7rem;
}

.card-count-badge {
  background: #1a3a5c;
  padding: 6px 12px;
  font-size: 0.5rem;
  color: #4fc3f7;
  border: 2px solid #4fc3f7;
}

.turn-indicator {
  background: #ffd700;
  color: #0a1628;
  padding: 6px 12px;
  font-size: 0.5rem;
  animation: pulse 1s ease-in-out infinite;
}

.banned-move-badge {
  background: #ff4444;
  color: #fff;
  padding: 6px 12px;
  font-size: 0.45rem;
  border: 2px solid #ff6666;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.game-over-content {
  background: rgba(10, 22, 40, 0.95);
  border: 4px solid #ffd700;
  padding: 40px;
  text-align: center;
  max-width: 400px;
}

.trophy-fish {
  margin-bottom: 20px;
  animation: bounce 1s steps(4) infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.game-over-content h2 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  color: #ffd700;
}

.winner-text {
  font-size: 0.8rem;
  color: #fff;
  margin-bottom: 25px;
}

.final-scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 25px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.5rem;
}

@media (max-width: 768px) {
  .opponents-row {
    flex-wrap: wrap;
    gap: 20px;
  }

  .center-content {
    flex-direction: column;
    align-items: center;
  }

  .all-book-piles {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
