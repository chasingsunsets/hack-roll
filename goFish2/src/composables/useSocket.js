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
const myBannedMove = ref(null);
const sessionId = ref(null);

// Session storage keys
const SESSION_KEY = 'gofish_session_id';
const ROOM_KEY = 'gofish_room_code';

// Event callbacks
let onPlayerJoined = null;
let onPlayerLeft = null;
let onGameStarted = null;
let onCardsTransferred = null;
let onCardDrawn = null;
let onBannedMoveCaught = null;
let onPlayerDisconnected = null;
let onPlayerRejoined = null;
let onTurnChanged = null;
let onTurnSkipped = null;
let onOctopusTroll = null;
let onDeckSwapTroll = null;
let onGameStateUpdate = null;
let onEarthquakeTroll = null;
let onSlangCommentBroadcast = null;

export function useSocket() {
  // Load session from localStorage
  function loadSession() {
    const storedSession = localStorage.getItem(SESSION_KEY);
    const storedRoom = localStorage.getItem(ROOM_KEY);
    if (storedSession) {
      sessionId.value = storedSession;
    }
    if (storedRoom) {
      roomCode.value = storedRoom;
    }
    return { sessionId: storedSession, roomCode: storedRoom };
  }

  // Save session to localStorage
  function saveSession(newSessionId, newRoomCode) {
    sessionId.value = newSessionId;
    myId.value = newSessionId;
    if (newSessionId) {
      localStorage.setItem(SESSION_KEY, newSessionId);
    }
    if (newRoomCode) {
      roomCode.value = newRoomCode;
      localStorage.setItem(ROOM_KEY, newRoomCode);
    }
  }

  // Clear session from localStorage
  function clearSession() {
    sessionId.value = null;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ROOM_KEY);
  }

  function connect() {
    if (socket.value) return;

    // Load existing session
    loadSession();

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    console.log('Connecting to server:', serverUrl);
    console.log('Environment variables:', import.meta.env);
    socket.value = io(serverUrl);

    socket.value.on('connect', () => {
      connected.value = true;
      console.log('Connected to server:', socket.value.id);
      
      // Try to rejoin if we have a session
      if (sessionId.value) {
        rejoinRoom().then(response => {
          if (!response.success) {
            console.log('Failed to rejoin:', response.error);
            clearSession();
          }
        });
      }
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
      myBannedMove.value = data.yourBannedMove;
      gameStarted.value = true;
      gameOver.value = false;
      winner.value = null;
      console.log('Game started! Your banned move:', data.yourBannedMove);
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

    socket.value.on('player-rejoined', (data) => {
      players.value = data.players;
      onPlayerRejoined?.(data);
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

    socket.value.on('octopus-troll', (data) => {
      onOctopusTroll?.(data);
    });

    socket.value.on('deck-swap-troll', (data) => {
      onDeckSwapTroll?.(data);
    });

    socket.value.on('game-state-update', (data) => {
      players.value = data.players;
      hand.value = data.hand;
      deckCount.value = data.deckCount;
      onGameStateUpdate?.(data);
    });

    socket.value.on('earthquake-troll', (data) => {
      onEarthquakeTroll?.(data);
    });

    socket.value.on('slang-comment-broadcast', (data) => {
      onSlangCommentBroadcast?.(data);
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
      clearSession();
    }
  }

  function createRoom(playerName) {
    return new Promise((resolve) => {
      socket.value.emit('create-room', playerName, sessionId.value, (response) => {
        if (response.success) {
          saveSession(response.sessionId, response.roomCode);
          players.value = response.players;
          isHost.value = true;
        }
        resolve(response);
      });
    });
  }

  function joinRoom(code, playerName) {
    return new Promise((resolve) => {
      socket.value.emit('join-room', code, playerName, sessionId.value, (response) => {
        if (response.success) {
          saveSession(response.sessionId, response.roomCode);
          players.value = response.players;
          isHost.value = false;
        }
        resolve(response);
      });
    });
  }

  function rejoinRoom() {
    return new Promise((resolve) => {
      if (!sessionId.value) {
        resolve({ success: false, error: 'No session to rejoin' });
        return;
      }
      socket.value.emit('rejoin-room', sessionId.value, (response) => {
        if (response.success) {
          roomCode.value = response.roomCode;
          players.value = response.players;
          hand.value = response.hand || [];
          deckCount.value = response.deckCount || 0;
          currentTurnId.value = response.currentTurnId;
          gameStarted.value = response.gameStarted || false;
          gameOver.value = response.gameOver || false;
          winner.value = response.winner;
          myBannedMove.value = response.yourBannedMove;
          isHost.value = response.isHost || false;
          myId.value = sessionId.value;
          console.log('Rejoined room:', response.roomCode, 'Game started:', response.gameStarted);
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

  function sendSlangComment(slangData) {
    return new Promise((resolve) => {
      socket.value.emit('slang-comment', roomCode.value, slangData, (response) => {
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
    onPlayerRejoined = handlers.onPlayerRejoined;
    onTurnChanged = handlers.onTurnChanged;
    onTurnSkipped = handlers.onTurnSkipped;
    onOctopusTroll = handlers.onOctopusTroll;
    onDeckSwapTroll = handlers.onDeckSwapTroll;
    onGameStateUpdate = handlers.onGameStateUpdate;
    onEarthquakeTroll = handlers.onEarthquakeTroll;
    onSlangCommentBroadcast = handlers.onSlangCommentBroadcast;
  }

  // Check if we have an existing session
  function hasSession() {
    const stored = localStorage.getItem(SESSION_KEY);
    return !!stored;
  }

  // Get raw socket for WebRTC signaling (needs to add event listeners)
  function getRawSocket() {
    return socket.value;
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
    myBannedMove: readonly(myBannedMove),
    sessionId: readonly(sessionId),
    socket: readonly(socket),

    // Methods
    connect,
    disconnect,
    createRoom,
    joinRoom,
    rejoinRoom,
    startGame,
    askForCards,
    drawCard,
    reportBannedMove,
    reportGesture,
    sendSlangComment,
    setEventHandlers,
    hasSession,
    clearSession,
    getRawSocket  // For WebRTC signaling
  };
}
