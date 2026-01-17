<script setup>
import { computed } from 'vue';
import { BANNED_MOVES, PENALTIES } from '../../services/gestureDefinitions';

const props = defineProps({
  penalty: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const moveInfo = computed(() => BANNED_MOVES[props.penalty.gestureType]);

const penaltyDetails = computed(() => {
  return props.penalty.penalties?.map(p => ({
    ...p,
    info: PENALTIES[p.penaltyType]
  })) || [];
});
</script>

<template>
  <div class="alert-overlay" @click.self="emit('close')">
    <div class="alert-box">
      <!-- Scanlines -->
      <div class="alert-scanlines"></div>

      <!-- Corner decorations -->
      <div class="alert-corner alert-corner--tl"></div>
      <div class="alert-corner alert-corner--tr"></div>
      <div class="alert-corner alert-corner--bl"></div>
      <div class="alert-corner alert-corner--br"></div>

      <!-- Content -->
      <div class="alert-content">
        <!-- Flashing header -->
        <div class="alert-header">
          <span class="alert-icon">{{ moveInfo?.icon || '!' }}</span>
          <h2 class="alert-title blink">OPPONENT CAUGHT!</h2>
        </div>

        <!-- Victim info -->
        <div class="victim-section">
          <span class="victim-name">{{ penalty.victimName?.toUpperCase() || 'UNKNOWN' }}</span>
          <span class="was-caught">WAS CAUGHT DOING</span>
          <span class="gesture-name">{{ moveInfo?.name?.toUpperCase() || 'BANNED MOVE' }}</span>
        </div>

        <!-- Penalty list -->
        <div v-if="penaltyDetails.length > 0" class="penalties-box">
          <div class="penalties-header">
            <span class="skull">*</span>
            <span>PENALTIES</span>
          </div>
          <div class="penalties-list">
            <div
              v-for="(p, index) in penaltyDetails"
              :key="index"
              class="penalty-row"
            >
              <span class="penalty-icon">{{ p.info?.icon || 'X' }}</span>
              <div class="penalty-info">
                <span class="penalty-name">{{ p.info?.name?.toUpperCase() }}</span>
                <span class="penalty-desc">{{ p.info?.description }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reporter -->
        <div class="reporter-section">
          <span class="eye-icon">*</span>
          <span class="reporter-text">REPORTED BY {{ penalty.reporterName?.toUpperCase() || 'YOU' }}</span>
        </div>

        <!-- Close button -->
        <button class="close-btn" @click="emit('close')">
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 22, 40, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  font-family: 'Press Start 2P', monospace;
  animation: pixel-fade-in 0.3s steps(4);
}

@keyframes pixel-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.alert-box {
  position: relative;
  background: var(--ocean-abyss, #0a1628);
  border: 8px solid var(--suit-coral, #ff6b35);
  padding: 32px;
  max-width: 400px;
  box-shadow:
    8px 8px 0 rgba(0, 0, 0, 0.5),
    0 0 60px rgba(255, 107, 53, 0.4),
    inset 0 0 30px rgba(255, 107, 53, 0.1);
  animation: alert-shake 0.5s steps(2);
}

@keyframes alert-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.alert-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  z-index: 10;
}

.alert-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 4px solid var(--gold-bright, #ffd700);
  z-index: 5;
}

.alert-corner--tl {
  top: -4px;
  left: -4px;
  border-right: none;
  border-bottom: none;
}

.alert-corner--tr {
  top: -4px;
  right: -4px;
  border-left: none;
  border-bottom: none;
}

.alert-corner--bl {
  bottom: -4px;
  left: -4px;
  border-right: none;
  border-top: none;
}

.alert-corner--br {
  bottom: -4px;
  right: -4px;
  border-left: none;
  border-top: none;
}

.alert-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.alert-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.alert-icon {
  font-size: 3rem;
  animation: icon-bounce 0.5s steps(3) infinite alternate;
}

@keyframes icon-bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}

.alert-title {
  margin: 0;
  font-size: 1rem;
  color: var(--suit-coral, #ff6b35);
  text-shadow:
    2px 2px 0 rgba(0, 0, 0, 0.5),
    -2px -2px 0 rgba(0, 0, 0, 0.5),
    2px -2px 0 rgba(0, 0, 0, 0.5),
    -2px 2px 0 rgba(0, 0, 0, 0.5);
}

.blink {
  animation: blink-text 0.5s steps(2) infinite;
}

@keyframes blink-text {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.5; }
}

.victim-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.victim-name {
  font-size: 0.7rem;
  color: var(--suit-wave, #4fc3f7);
}

.was-caught {
  font-size: 0.4rem;
  color: rgba(255, 255, 255, 0.5);
}

.gesture-name {
  font-size: 0.6rem;
  color: var(--gold-bright, #ffd700);
}

.penalties-box {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 4px solid var(--suit-pearl, #f8bbd9);
}

.penalties-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: var(--suit-pearl, #f8bbd9);
}

.penalties-header span:last-child {
  font-size: 0.5rem;
  color: var(--ocean-abyss, #0a1628);
}

.skull {
  font-size: 0.7rem;
  color: var(--ocean-abyss, #0a1628);
}

.penalties-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.penalty-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid var(--suit-coral, #ff6b35);
}

.penalty-icon {
  font-size: 1rem;
}

.penalty-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.penalty-name {
  font-size: 0.45rem;
  color: var(--gold-bright, #ffd700);
}

.penalty-desc {
  font-size: 0.35rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.reporter-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.eye-icon {
  font-size: 0.7rem;
  color: var(--suit-wave, #4fc3f7);
}

.reporter-text {
  font-size: 0.4rem;
  color: rgba(255, 255, 255, 0.5);
}

.close-btn {
  padding: 10px 30px;
  background: var(--suit-coral, #ff6b35);
  border: none;
  box-shadow:
    inset -3px -3px 0 rgba(0, 0, 0, 0.2),
    inset 3px 3px 0 rgba(255, 255, 255, 0.2),
    4px 4px 0 rgba(0, 0, 0, 0.4);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #fff;
  cursor: pointer;
  transition: transform 0.1s steps(2);
}

.close-btn:hover {
  transform: scale(1.05);
}

.close-btn:active {
  transform: scale(0.95);
}
</style>
