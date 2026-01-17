<script setup>
import { computed } from 'vue';
import { BANNED_MOVES } from '../../services/gestureDefinitions';

const props = defineProps({
  moveType: {
    type: String,
    required: true
  }
});

const moveInfo = computed(() => BANNED_MOVES[props.moveType]);
</script>

<template>
  <div class="banned-hint">
    <!-- Warning header -->
    <div class="hint-header">
      <span class="warning-flash blink">!</span>
      <span class="header-text">YOUR BANNED MOVE</span>
      <span class="warning-flash blink">!</span>
    </div>

    <!-- Move display -->
    <div class="move-display">
      <div class="move-icon-box">
        <span class="move-icon">{{ moveInfo?.icon }}</span>
      </div>
      <div class="move-details">
        <span class="move-name">{{ moveInfo?.name?.toUpperCase() }}</span>
        <span class="move-desc">{{ moveInfo?.description }}</span>
      </div>
    </div>

    <!-- Warning text -->
    <div class="danger-zone">
      <div class="danger-bar"></div>
      <span class="danger-text">DON'T DO THIS!</span>
      <div class="danger-bar"></div>
    </div>

    <!-- Watching eyes -->
    <div class="watching-eyes">
      <span>*</span>
      <span>*</span>
      <span>*</span>
    </div>
  </div>
</template>

<style scoped>
.banned-hint {
  background: var(--ocean-abyss, #0a1628);
  border: 4px solid var(--gold-bright, #ffd700);
  box-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.2);
  overflow: hidden;
  font-family: 'Press Start 2P', monospace;
}

.hint-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--gold-bright, #ffd700);
}

.warning-flash {
  font-size: 0.6rem;
  color: var(--suit-coral, #ff6b35);
}

.blink {
  animation: blink-anim 0.5s steps(2) infinite;
}

@keyframes blink-anim {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.header-text {
  font-size: 0.5rem;
  color: var(--ocean-abyss, #0a1628);
}

.move-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(
    90deg,
    var(--ocean-abyss, #0a1628) 0%,
    rgba(255, 215, 0, 0.1) 50%,
    var(--ocean-abyss, #0a1628) 100%
  );
}

.move-icon-box {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ocean-deep, #0d2847);
  border: 4px solid var(--gold-bright, #ffd700);
  box-shadow: inset 0 0 10px rgba(255, 215, 0, 0.2);
}

.move-icon {
  font-size: 1.8rem;
}

.move-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.move-name {
  font-size: 0.6rem;
  color: var(--gold-bright, #ffd700);
}

.move-desc {
  font-size: 0.4rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.danger-zone {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--suit-coral, #ff6b35);
}

.danger-bar {
  flex: 1;
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    var(--gold-bright, #ffd700) 0px,
    var(--gold-bright, #ffd700) 4px,
    var(--ocean-abyss, #0a1628) 4px,
    var(--ocean-abyss, #0a1628) 8px
  );
}

.danger-text {
  font-size: 0.4rem;
  color: #fff;
  white-space: nowrap;
}

.watching-eyes {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 8px;
  background: var(--ocean-deep, #0d2847);
}

.watching-eyes span {
  font-size: 1rem;
  color: var(--suit-wave, #4fc3f7);
  animation: eye-look 2s steps(2) infinite;
}

.watching-eyes span:nth-child(2) {
  animation-delay: 0.3s;
}

.watching-eyes span:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes eye-look {
  0%, 40%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px); }
  60% { transform: translateX(3px); }
}
</style>
