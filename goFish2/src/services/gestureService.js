// MediaPipe gesture detection service
// This file handles the initialization and management of MediaPipe models

let faceLandmarker = null;
let handLandmarker = null;
let isInitialized = false;
let isInitializing = false;

export async function initializeMediaPipe() {
  if (isInitialized || isInitializing) {
    return { success: isInitialized };
  }

  isInitializing = true;

  try {
    const { FaceLandmarker, HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    // Initialize face landmarker
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false
    });

    // Initialize hand landmarker
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 2
    });

    isInitialized = true;
    isInitializing = false;

    return { success: true };
  } catch (error) {
    console.error('Failed to initialize MediaPipe:', error);
    isInitializing = false;
    return { success: false, error: error.message };
  }
}

export function detectGestures(videoElement, timestamp) {
  if (!isInitialized || !faceLandmarker || !handLandmarker) {
    return { face: null, hands: null };
  }

  try {
    const faceResults = faceLandmarker.detectForVideo(videoElement, timestamp);
    const handResults = handLandmarker.detectForVideo(videoElement, timestamp);

    return {
      face: faceResults,
      hands: handResults
    };
  } catch (error) {
    console.error('Detection error:', error);
    return { face: null, hands: null };
  }
}

export function cleanup() {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
  }
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
  }
  isInitialized = false;
}

export function getStatus() {
  return {
    isInitialized,
    isInitializing,
    hasFaceLandmarker: !!faceLandmarker,
    hasHandLandmarker: !!handLandmarker
  };
}
