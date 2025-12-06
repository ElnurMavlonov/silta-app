import { useState } from 'react';
import * as faceapi from 'face-api.js';
import type { Profile } from '../types';

export const useFaceRecognition = (profiles: Profile[]) => {
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const performRecognition = async (
    videoElement: HTMLVideoElement,
    onRecognized: (person: Profile) => void
  ) => {
    if (profiles.length === 0) {
      alert("No profiles added yet!");
      return;
    }

    setIsScanning(true);
    setStatusMessage("Scanning...");

    // Create a FaceMatcher from saved profiles
    const labeledDescriptors = profiles
      .filter(profile => profile.descriptor !== null)
      .map(profile => {
        return new faceapi.LabeledFaceDescriptors(profile.id.toString(), [profile.descriptor!]);
      });
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // 0.6 is threshold

    // Detect face in current video frame
    const detection = await faceapi.detectSingleFace(videoElement).withFaceLandmarks().withFaceDescriptor();

    if (detection) {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
      
      if (bestMatch.label !== 'unknown') {
        const matchId = parseInt(bestMatch.label);
        const person = profiles.find(p => p.id === matchId);
        if (person) {
          setIsScanning(false);
          onRecognized(person);
          return;
        }
      } else {
        alert("Face detected, but not recognized.");
        setIsScanning(false);
        setStatusMessage("");
      }
    } else {
      alert("No face detected in frame.");
      setIsScanning(false);
      setStatusMessage("");
    }
  };

  return {
    isScanning,
    statusMessage,
    setStatusMessage,
    performRecognition,
  };
};

