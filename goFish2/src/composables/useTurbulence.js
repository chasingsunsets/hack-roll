import { ref } from 'vue'

// Global turbulence state
const turbulenceActive = ref(false)
const turbulenceCallbacks = []

export function useTurbulence() {
  const onTurbulenceStart = (callback) => {
    turbulenceCallbacks.push(callback)
  }

  const onTurbulenceEnd = (callback) => {
    // Store with a flag to identify end callbacks
    turbulenceCallbacks.push({ callback, isEnd: true })
  }

  const triggerTurbulence = () => {
    turbulenceActive.value = true

    // Notify all start callbacks
    turbulenceCallbacks.forEach(item => {
      if (typeof item === 'function') {
        item()
      }
    })

    // Auto-end after 3-5 seconds
    const duration = 3000 + Math.random() * 2000
    setTimeout(() => {
      turbulenceActive.value = false

      // Notify all end callbacks
      turbulenceCallbacks.forEach(item => {
        if (item.isEnd && typeof item.callback === 'function') {
          item.callback()
        }
      })
    }, duration)
  }

  return {
    turbulenceActive,
    triggerTurbulence,
    onTurbulenceStart,
    onTurbulenceEnd
  }
}
