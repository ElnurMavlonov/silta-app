import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export const useModels = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      // const MODEL_URL = '/models'; // Ensure files are in public/models
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log("Models loaded successfully");
      } catch (err) {
        console.error("Error loading models:", err);
        alert("Error loading AI models. Make sure /public/models folder exists.");
      }
    };
    loadModels();
  }, []);

  return modelsLoaded;
};

