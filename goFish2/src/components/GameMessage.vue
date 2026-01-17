<script setup>
defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info' // 'info', 'success', 'warning', 'action'
  }
})

// Get icon based on message type
const getTypeIcon = (type) => {
  const icons = {
    info: {
      viewBox: '0 0 16 16',
      path: `
        <rect x="7" y="3" width="2" height="2" fill="currentColor"/>
        <rect x="7" y="7" width="2" height="6" fill="currentColor"/>
        <rect x="3" y="1" width="10" height="2" fill="currentColor" opacity="0.3"/>
        <rect x="1" y="3" width="2" height="10" fill="currentColor" opacity="0.3"/>
        <rect x="13" y="3" width="2" height="10" fill="currentColor" opacity="0.3"/>
        <rect x="3" y="13" width="10" height="2" fill="currentColor" opacity="0.3"/>
      `
    },
    success: {
      viewBox: '0 0 16 16',
      path: `
        <rect x="2" y="8" width="2" height="2" fill="currentColor"/>
        <rect x="4" y="10" width="2" height="2" fill="currentColor"/>
        <rect x="6" y="8" width="2" height="2" fill="currentColor"/>
        <rect x="8" y="6" width="2" height="2" fill="currentColor"/>
        <rect x="10" y="4" width="2" height="2" fill="currentColor"/>
        <rect x="12" y="2" width="2" height="2" fill="currentColor"/>
      `
    },
    warning: {
      viewBox: '0 0 16 16',
      path: `
        <rect x="6" y="1" width="4" height="2" fill="currentColor"/>
        <rect x="4" y="3" width="2" height="2" fill="currentColor"/>
        <rect x="10" y="3" width="2" height="2" fill="currentColor"/>
        <rect x="2" y="5" width="2" height="6" fill="currentColor"/>
        <rect x="12" y="5" width="2" height="6" fill="currentColor"/>
        <rect x="4" y="11" width="2" height="2" fill="currentColor"/>
        <rect x="10" y="11" width="2" height="2" fill="currentColor"/>
        <rect x="6" y="13" width="4" height="2" fill="currentColor"/>
        <rect x="7" y="4" width="2" height="5" fill="currentColor"/>
        <rect x="7" y="10" width="2" height="2" fill="currentColor"/>
      `
    },
    action: {
      viewBox: '0 0 16 16',
      path: `
        <rect x="7" y="0" width="2" height="3" fill="currentColor"/>
        <rect x="7" y="13" width="2" height="3" fill="currentColor"/>
        <rect x="0" y="7" width="3" height="2" fill="currentColor"/>
        <rect x="13" y="7" width="3" height="2" fill="currentColor"/>
        <rect x="2" y="2" width="2" height="2" fill="currentColor"/>
        <rect x="12" y="2" width="2" height="2" fill="currentColor"/>
        <rect x="2" y="12" width="2" height="2" fill="currentColor"/>
        <rect x="12" y="12" width="2" height="2" fill="currentColor"/>
        <rect x="6" y="6" width="4" height="4" fill="currentColor"/>
      `
    }
  }
  return icons[type] || icons.info
}
</script>

<template>
  <div class="game-message pixel-message" :class="type">
    <div class="message-content">
      <!-- Type-specific pixel icon -->
      <div class="message-icon">
        <svg
          width="20"
          height="20"
          :viewBox="getTypeIcon(type).viewBox"
          class="pixel-icon"
        >
          <g v-html="getTypeIcon(type).path"></g>
        </svg>
      </div>
      <span class="message-text">{{ message }}</span>
    </div>
    <!-- Decorative speech bubble tail -->
    <div class="bubble-tail"></div>
  </div>
</template>

<style scoped>
.game-message {
  padding: 14px 20px 14px 16px;
  display: inline-flex;
  align-items: center;
  animation: message-in 0.3s steps(4);
  font-family: 'Press Start 2P', monospace;
  position: relative;
}

.pixel-message {
  border: 4px solid;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.4);
}

@keyframes message-in {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  50% {
    opacity: 1;
    transform: translateY(2px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pixel-icon {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.message-text {
  font-size: 0.65rem;
  line-height: 1.5;
}

/* Speech bubble tail */
.bubble-tail {
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 0;
  height: 0;
}

.bubble-tail::before,
.bubble-tail::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
}

.bubble-tail::before {
  bottom: 0;
  left: 0;
  background: inherit;
}

/* Types */
.game-message.info {
  background: #1a3a5c;
  border-color: #4fc3f7;
  color: #4fc3f7;
  box-shadow:
    inset -3px -3px 0 #0d2847,
    inset 3px 3px 0 #2a5a8c,
    6px 6px 0 rgba(0, 0, 0, 0.4);
}

.game-message.info .bubble-tail::before {
  background: #4fc3f7;
}

.game-message.info .bubble-tail::after {
  background: #1a3a5c;
  bottom: 4px;
  left: 4px;
}

.game-message.success {
  background: #1a4a2e;
  border-color: #5dfc9a;
  color: #5dfc9a;
  box-shadow:
    inset -3px -3px 0 #0d3018,
    inset 3px 3px 0 #2a6a4a,
    6px 6px 0 rgba(0, 0, 0, 0.4);
}

.game-message.success .bubble-tail::before {
  background: #5dfc9a;
}

.game-message.success .bubble-tail::after {
  background: #1a4a2e;
  bottom: 4px;
  left: 4px;
}

.game-message.warning {
  background: #4a2a1a;
  border-color: #ff9a6c;
  color: #ff9a6c;
  box-shadow:
    inset -3px -3px 0 #3a1a0a,
    inset 3px 3px 0 #6a4a3a,
    6px 6px 0 rgba(0, 0, 0, 0.4);
  animation: message-in 0.3s steps(4), shake 0.5s steps(4);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}

.game-message.warning .bubble-tail::before {
  background: #ff9a6c;
}

.game-message.warning .bubble-tail::after {
  background: #4a2a1a;
  bottom: 4px;
  left: 4px;
}

.game-message.action {
  background: #4a3a1a;
  border-color: #ffd700;
  color: #ffd700;
  animation: message-in 0.3s steps(4), glow-pulse 2s steps(4) infinite;
  box-shadow:
    inset -3px -3px 0 #3a2a0a,
    inset 3px 3px 0 #6a5a3a,
    6px 6px 0 rgba(0, 0, 0, 0.4);
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow:
      inset -3px -3px 0 #3a2a0a,
      inset 3px 3px 0 #6a5a3a,
      6px 6px 0 rgba(0, 0, 0, 0.4),
      0 0 10px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow:
      inset -3px -3px 0 #3a2a0a,
      inset 3px 3px 0 #6a5a3a,
      6px 6px 0 rgba(0, 0, 0, 0.4),
      0 0 20px rgba(255, 215, 0, 0.6);
  }
}

.game-message.action .message-icon {
  animation: spin 2s steps(8) infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.game-message.action .bubble-tail::before {
  background: #ffd700;
}

.game-message.action .bubble-tail::after {
  background: #4a3a1a;
  bottom: 4px;
  left: 4px;
}
</style>
