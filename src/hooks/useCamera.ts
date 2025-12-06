import { useState, useRef, useEffect } from 'react';
import type { CameraMode } from '../types';

export const useCamera = () => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, cameraMode]);

  const startCamera = async (mode: 'recognize' | 'capture') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } // Lower res is faster for JS
      });
      setCameraStream(stream);
      setCameraMode(mode);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setCameraStream(null);
      setCameraMode(null);
    }
  };

  return {
    cameraStream,
    cameraMode,
    videoRef,
    startCamera,
    stopCamera,
  };
};

