<script setup>
import { ref } from 'vue'

const emit = defineEmits(['slang-clicked'])

const slangs = [
  { text: 'Walao eh!', icon: '😤' },
  { text: 'Alamak!', icon: '😱' },
  { text: 'Aiyo!', icon: '😩' },
  { text: 'Wah lau!', icon: '😮' },
  { text: 'Shiok ah!', icon: '😋' },
  { text: 'Can lah!', icon: '👍' },
  { text: 'Paiseh leh!', icon: '😅' },
  { text: 'Sian diao!', icon: '😑' }
]

const isExpanded = ref(false)
const cooldown = ref(false)

function handleSlangClick(slang) {
  if (cooldown.value) return

  emit('slang-clicked', slang.text)

  // Cooldown to prevent spam
  cooldown.value = true
  setTimeout(() => {
    cooldown.value = false
  }, 2000)
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="singlish-buttons">
    <button
      class="toggle-btn pixel-btn"
      @click="toggleExpanded"
      :class="{ active: isExpanded }"
    >
      <span class="emoji">💬</span>
      <span class="label">Singlish</span>
    </button>

    <transition name="slide-up">
      <div v-if="isExpanded" class="slang-grid">
        <button
          v-for="slang in slangs"
          :key="slang.text"
          class="slang-btn pixel-btn"
          @click="handleSlangClick(slang)"
          :disabled="cooldown"
        >
          <span class="emoji">{{ slang.icon }}</span>
          <span class="text">{{ slang.text }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.singlish-buttons {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.pixel-btn {
  font-family: 'Press Start 2P', monospace;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 4px solid #000;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow:
    4px 4px 0 #000,
    inset -2px -2px 0 rgba(0,0,0,0.3),
    inset 2px 2px 0 rgba(255,255,255,0.3);
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pixel-btn:hover:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow:
    2px 2px 0 #000,
    inset -2px -2px 0 rgba(0,0,0,0.3),
    inset 2px 2px 0 rgba(255,255,255,0.3);
}

.pixel-btn:active:not(:disabled) {
  transform: translate(4px, 4px);
  box-shadow:
    0px 0px 0 #000,
    inset -2px -2px 0 rgba(0,0,0,0.5),
    inset 2px 2px 0 rgba(255,255,255,0.2);
}

.pixel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-btn {
  font-size: 0.8rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.toggle-btn.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.emoji {
  font-size: 1.2rem;
  line-height: 1;
}

.label {
  font-size: 0.6rem;
  white-space: nowrap;
}

.slang-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  background: rgba(0, 0, 0, 0.8);
  padding: 12px;
  border: 4px solid #000;
  border-radius: 8px;
  box-shadow: 4px 4px 0 #000;
}

.slang-btn {
  font-size: 0.6rem;
  padding: 10px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.slang-btn .emoji {
  font-size: 1.5rem;
}

.slang-btn .text {
  font-size: 0.5rem;
  white-space: nowrap;
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .singlish-buttons {
    bottom: 15px;
    right: 15px;
  }

  .slang-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    padding: 8px;
  }

  .slang-btn {
    min-width: 100px;
    padding: 8px 10px;
  }

  .slang-btn .text {
    font-size: 0.45rem;
  }

  .toggle-btn {
    font-size: 0.7rem;
  }

  .label {
    font-size: 0.5rem;
  }
}

@media (max-width: 480px) {
  .singlish-buttons {
    bottom: 10px;
    right: 10px;
  }

  .slang-grid {
    grid-template-columns: 1fr;
    max-height: 300px;
    overflow-y: auto;
  }

  .slang-btn {
    min-width: 140px;
  }
}
</style>
