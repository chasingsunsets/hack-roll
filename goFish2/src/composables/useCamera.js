import { ref, onUnmounted } from 'vue';

export function useCamera() {
  const stream = ref(null);
  const videoElement = ref(null);
  const isEnabled = ref(false);
  const error = ref(null);
  const isLoading = ref(false);

  async function startCamera(videoEl) {
    if (isLoading.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };

      stream.value = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.value = videoEl;

      if (videoEl) {
        videoEl.srcObject = stream.value;
        try {
          await videoEl.play();
        } catch (playError) {
          // Ignore AbortError - video might already be playing via autoplay
          if (playError.name !== 'AbortError') {
            throw playError;
          }
          console.log('Play interrupted (likely already playing via autoplay)');
        }
      }

      isEnabled.value = true;
    } catch (err) {
      console.error('Camera error:', err);
      error.value = err.message || 'Failed to access camera';
      isEnabled.value = false;
    } finally {
      isLoading.value = false;
    }
  }

  function stopCamera() {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop());
      stream.value = null;
    }

    if (videoElement.value) {
      videoElement.value.srcObject = null;
    }

    isEnabled.value = false;
  }

  function getVideoElement() {
    return videoElement.value;
  }

  onUnmounted(() => {
    stopCamera();
  });

  return {
    stream,
    isEnabled,
    error,
    isLoading,
    startCamera,
    stopCamera,
    getVideoElement
  };
}
