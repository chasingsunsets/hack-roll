import { ref, onUnmounted } from 'vue';

export function useGestureDetection() {
  const isReady = ref(false);
  const isLoading = ref(false);
  const error = ref(null);
  const currentGestures = ref([]);

  let faceLandmarker = null;
  let handLandmarker = null;
  let animationFrameId = null;
  let lastDetectionTime = 0;
  const DETECTION_INTERVAL = 100; // ms between detections

  // Gesture confirmation state
  const gestureConfirmation = {};
  const CONFIRMATION_FRAMES = 5;
  const COOLDOWN_MS = 3000;
  const gestureLastTriggered = {};

  async function initialize() {
    if (isLoading.value || isReady.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const { FaceLandmarker, HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1
      });

      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2
      });

      isReady.value = true;
    } catch (err) {
      console.error('MediaPipe initialization error:', err);
      error.value = err.message || 'Failed to initialize gesture detection';
    } finally {
      isLoading.value = false;
    }
  }

  function startDetection(videoElement, onGestureDetected) {
    if (!isReady.value || !videoElement) return;

    function detectFrame() {
      const now = performance.now();

      if (now - lastDetectionTime >= DETECTION_INTERVAL) {
        lastDetectionTime = now;

        try {
          const faceResults = faceLandmarker.detectForVideo(videoElement, now);
          const handResults = handLandmarker.detectForVideo(videoElement, now);

          const detectedGestures = analyzeGestures(faceResults, handResults);
          currentGestures.value = detectedGestures;

          // Process confirmed gestures
          for (const gesture of detectedGestures) {
            if (confirmGesture(gesture.type)) {
              if (canTriggerGesture(gesture.type)) {
                gestureLastTriggered[gesture.type] = now;
                onGestureDetected?.(gesture);
              }
            }
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
      }

      animationFrameId = requestAnimationFrame(detectFrame);
    }

    detectFrame();
  }

  function stopDetection() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    currentGestures.value = [];
  }

  function analyzeGestures(faceResults, handResults) {
    const gestures = [];

    const faceLandmarks = faceResults.faceLandmarks?.[0];
    const hands = handResults.landmarks || [];

    if (!faceLandmarks) return gestures;

    // Get key face points
    const nose = faceLandmarks[1];
    const leftEye = faceLandmarks[33];
    const rightEye = faceLandmarks[263];
    const mouth = faceLandmarks[13];
    const forehead = faceLandmarks[10];
    const chin = faceLandmarks[152];

    const eyeCenter = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2
    };

    // LOOK_AWAY detection
    const noseOffset = Math.abs(nose.x - eyeCenter.x);
    if (noseOffset > 0.05) {
      gestures.push({
        type: 'LOOK_AWAY',
        confidence: Math.min(noseOffset * 10, 1.0)
      });
    }

    // Hand-based gestures
    for (const hand of hands) {
      const wrist = hand[0];
      const indexTip = hand[8];
      const middleTip = hand[12];
      const palmCenter = {
        x: (hand[0].x + hand[5].x + hand[17].x) / 3,
        y: (hand[0].y + hand[5].y + hand[17].y) / 3
      };

      // SCRATCH_HEAD - hand above forehead
      if (indexTip.y < forehead.y && indexTip.y < 0.3) {
        const dist = distance(indexTip, forehead);
        if (dist < 0.15) {
          gestures.push({
            type: 'SCRATCH_HEAD',
            confidence: Math.max(0, 1 - dist * 5)
          });
        }
      }

      // TOUCH_FACE - hand near cheek/chin
      const faceDist = Math.min(
        distance(indexTip, chin),
        distance(palmCenter, { x: leftEye.x - 0.1, y: leftEye.y + 0.1 }),
        distance(palmCenter, { x: rightEye.x + 0.1, y: rightEye.y + 0.1 })
      );
      if (faceDist < 0.08) {
        gestures.push({
          type: 'TOUCH_FACE',
          confidence: Math.max(0, 1 - faceDist * 10)
        });
      }

      // COVER_MOUTH - palm near mouth
      const mouthDist = distance(palmCenter, mouth);
      if (mouthDist < 0.12) {
        gestures.push({
          type: 'COVER_MOUTH',
          confidence: Math.max(0, 1 - mouthDist * 5)
        });
      }
    }

    // RAISE_HANDS - both hands above shoulder level
    if (hands.length >= 2) {
      const wrists = hands.map(h => h[0]);
      if (wrists.every(w => w.y < 0.4)) {
        gestures.push({
          type: 'RAISE_HANDS',
          confidence: 0.9
        });
      }
    }

    return gestures;
  }

  function confirmGesture(gestureType) {
    if (!gestureConfirmation[gestureType]) {
      gestureConfirmation[gestureType] = 0;
    }

    gestureConfirmation[gestureType]++;

    if (gestureConfirmation[gestureType] >= CONFIRMATION_FRAMES) {
      gestureConfirmation[gestureType] = 0;
      return true;
    }

    return false;
  }

  function canTriggerGesture(gestureType) {
    const lastTriggered = gestureLastTriggered[gestureType] || 0;
    return performance.now() - lastTriggered >= COOLDOWN_MS;
  }

  function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  function cleanup() {
    stopDetection();
    faceLandmarker?.close();
    handLandmarker?.close();
    faceLandmarker = null;
    handLandmarker = null;
    isReady.value = false;
  }

  onUnmounted(() => {
    cleanup();
  });

  return {
    isReady,
    isLoading,
    error,
    currentGestures,
    initialize,
    startDetection,
    stopDetection,
    cleanup
  };
}
