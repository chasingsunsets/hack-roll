import { ref, readonly } from 'vue';
import { io } from 'socket.io-client';

const socket = ref(null);
const connected = ref(false);
const roomCode = ref(null);
const players = ref([]);
const hand = ref([]);
const deckCount = ref(0);
const currentTurnId = ref(null);
const gameStarted = ref(false);
const gameOver = ref(false);
const winner = ref(null);
const isHost = ref(false);
const myId = ref(null);

// Event callbacks
let onPlayerJoined = null;
let onPlayerLeft = null;
let onGameStarted = null;
let onCardsTransferred = null;
let onCardDrawn = null;
let onBannedMoveCaught = null;
let onPlayerDisconnected = null;
let onTurnChanged = null;
let onTurnSkipped = null;

export function useSocket() {
  function connect() {
    if (socket.value) return;

    socket.value = io('http://localhost:3001');

    socket.value.on('connect', () => {
      connected.value = true;
      myId.value = socket.value.id;
      console.log('Connected to server:', socket.value.id);
    });

    socket.value.on('disconnect', () => {
      connected.value = false;
      console.log('Disconnected from server');
    });

    // Game events
    socket.value.on('player-joined', (data) => {
      players.value = data.players;
      onPlayerJoined?.(data);
    });

    socket.value.on('player-left', (data) => {
      players.value = data.players;
      if (data.newHostId === myId.value) {
        isHost.value = true;
      }
      onPlayerLeft?.(data);
    });

    socket.value.on('game-started', (data) => {
      players.value = data.players;
      hand.value = data.hand;
      deckCount.value = data.deckCount;
      currentTurnId.value = data.currentTurnId;
      gameStarted.value = true;
      gameOver.value = false;
      winner.value = null;
      onGameStarted?.(data);
    });

    socket.value.on('cards-transferred', (data) => {
      players.value = data.players;
      hand.value = data.hand;
      deckCount.value = data.deckCount;
      currentTurnId.value = data.currentTurnId;
      if (data.gameOver) {
        gameOver.value = true;
        winner.value = data.winner;
      }
      onCardsTransferred?.(data);
    });

    socket.value.on('card-drawn', (data) => {
      players.value = data.players;
      hand.value = data.hand;
      deckCount.value = data.deckCount;
      currentTurnId.value = data.currentTurnId;
      if (data.gameOver) {
        gameOver.value = true;
        winner.value = data.winner;
      }
      onCardDrawn?.(data);
    });

    socket.value.on('banned-move-caught', (data) => {
      onBannedMoveCaught?.(data);
    });

    socket.value.on('player-disconnected', (data) => {
      players.value = data.players;
      onPlayerDisconnected?.(data);
    });

    socket.value.on('turn-changed', (data) => {
      currentTurnId.value = data.currentTurnId;
      onTurnChanged?.(data);
    });

    socket.value.on('turn-skipped', (data) => {
      onTurnSkipped?.(data);
    });
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      connected.value = false;
      roomCode.value = null;
      players.value = [];
      hand.value = [];
      gameStarted.value = false;
      isHost.value = false;
    }
  }

  function createRoom(playerName) {
    return new Promise((resolve) => {
      socket.value.emit('create-room', playerName, (response) => {
        if (response.success) {
          roomCode.value = response.roomCode;
          players.value = response.players;
          isHost.value = true;
        }
        resolve(response);
      });
    });
  }

  function joinRoom(code, playerName) {
    return new Promise((resolve) => {
      socket.value.emit('join-room', code, playerName, (response) => {
        if (response.success) {
          roomCode.value = response.roomCode;
          players.value = response.players;
          isHost.value = false;
        }
        resolve(response);
      });
    });
  }

  function startGame() {
    return new Promise((resolve) => {
      socket.value.emit('start-game', roomCode.value, (response) => {
        resolve(response);
      });
    });
  }

  function askForCards(targetPlayerId, rank) {
    return new Promise((resolve) => {
      socket.value.emit('ask-for-cards', roomCode.value, targetPlayerId, rank, (response) => {
        resolve(response);
      });
    });
  }

  function drawCard() {
    return new Promise((resolve) => {
      socket.value.emit('draw-card', roomCode.value, (response) => {
        resolve(response);
      });
    });
  }

  function reportBannedMove(victimId, gestureType) {
    return new Promise((resolve) => {
      socket.value.emit('report-banned-move', roomCode.value, victimId, gestureType, (response) => {
        resolve(response);
      });
    });
  }

  function reportGesture(gestureType) {
    return new Promise((resolve) => {
      socket.value.emit('gesture-detected', roomCode.value, gestureType, (response) => {
        resolve(response);
      });
    });
  }

  function setEventHandlers(handlers) {
    onPlayerJoined = handlers.onPlayerJoined;
    onPlayerLeft = handlers.onPlayerLeft;
    onGameStarted = handlers.onGameStarted;
    onCardsTransferred = handlers.onCardsTransferred;
    onCardDrawn = handlers.onCardDrawn;
    onBannedMoveCaught = handlers.onBannedMoveCaught;
    onPlayerDisconnected = handlers.onPlayerDisconnected;
    onTurnChanged = handlers.onTurnChanged;
    onTurnSkipped = handlers.onTurnSkipped;
  }

  return {
    // State
    connected: readonly(connected),
    roomCode: readonly(roomCode),
    players: readonly(players),
    hand: readonly(hand),
    deckCount: readonly(deckCount),
    currentTurnId: readonly(currentTurnId),
    gameStarted: readonly(gameStarted),
    gameOver: readonly(gameOver),
    winner: readonly(winner),
    isHost: readonly(isHost),
    myId: readonly(myId),

    // Methods
    connect,
    disconnect,
    createRoom,
    joinRoom,
    startGame,
    askForCards,
    drawCard,
    reportBannedMove,
    reportGesture,
    setEventHandlers
  };
}
