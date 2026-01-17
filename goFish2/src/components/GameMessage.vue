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
</script>

<template>
  <div class="game-message pixel-message" :class="type">
    <div class="message-content">
      <span class="message-text">{{ message }}</span>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.game-message {
  padding: 14px 28px;
  display: inline-flex;
  align-items: center;
  animation: slideIn 0.3s ease;
  font-family: 'Press Start 2P', monospace;
}

.pixel-message {
  border: 4px solid;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.4);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-text {
  font-size: 0.7rem;
  line-height: 1.4;
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

.game-message.success {
  background: #1a4a2e;
  border-color: #5dfc9a;
  color: #5dfc9a;
  box-shadow:
    inset -3px -3px 0 #0d3018,
    inset 3px 3px 0 #2a6a4a,
    6px 6px 0 rgba(0, 0, 0, 0.4);
}

.game-message.warning {
  background: #4a2a1a;
  border-color: #ff9a6c;
  color: #ff9a6c;
  box-shadow:
    inset -3px -3px 0 #3a1a0a,
    inset 3px 3px 0 #6a4a3a,
    6px 6px 0 rgba(0, 0, 0, 0.4);
}

.game-message.action {
  background: #4a3a1a;
  border-color: #ffd700;
  color: #ffd700;
  animation: slideIn 0.3s ease, pulse 2s ease-in-out infinite;
  box-shadow:
    inset -3px -3px 0 #3a2a0a,
    inset 3px 3px 0 #6a5a3a,
    6px 6px 0 rgba(0, 0, 0, 0.4);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}
</style>
