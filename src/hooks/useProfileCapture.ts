import { useState } from 'react';
import * as faceapi from 'face-api.js';
import { createImageFromBase64 } from '../utils/imageUtils';

export const useProfileCapture = () => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const captureAndAnalyzeProfile = async (
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onCaptured: (photo: string, descriptor: Float32Array) => void
  ) => {
    setStatusMessage("Analyzing face...");
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoElement, 0, 0);
    const photoData = canvasElement.toDataURL('image/jpeg');

    // AI Detection
    const img = await createImageFromBase64(photoData);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
      alert("No face detected! Please ensure your face is clearly visible.");
      setStatusMessage("");
      return;
    }

    setCapturedPhoto(photoData);
    setStatusMessage("");
    onCaptured(photoData, detection.descriptor);
  };

  const resetCapture = () => {
    setCapturedPhoto(null);
  };

  return {
    capturedPhoto,
    statusMessage,
    setStatusMessage,
    captureAndAnalyzeProfile,
    resetCapture,
  };
};

