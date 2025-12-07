// src/hooks/useFaceDetection.ts
import { useState, useEffect, useRef, useMemo } from 'react';
import * as faceapi from 'face-api.js';
import type { CameraMode, FaceBox, Profile } from '../types';

export const useFaceDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  cameraStream: MediaStream | null,
  cameraMode: CameraMode,
  profiles: Profile[]
) => {
  const [faceBox, setFaceBox] = useState<FaceBox | null>(null);
  const isProcessing = useRef(false); // PERFORMANCE: Prevent overlap

  // PERFORMANCE: Only rebuild the matcher when profiles change, not every frame
  const faceMatcher = useMemo(() => {
    if (profiles.length === 0) return null;
    const labeledDescriptors = profiles.map(p => 
      new faceapi.LabeledFaceDescriptors(p.id.toString(), [p.descriptor!])
    );
    return new faceapi.FaceMatcher(labeledDescriptors, 0.6);
  }, [profiles]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cameraMode === 'recognize' && cameraStream && videoRef.current) {
      interval = setInterval(async () => {
        // PERFORMANCE: If still thinking about the last frame, skip this one
        if (isProcessing.current || !videoRef.current || videoRef.current.paused) return;
        
        isProcessing.current = true; // Lock

        try {
          const detection = await faceapi.detectSingleFace(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            const element = videoRef.current;
            const displayWidth = element.clientWidth;
            const displayHeight = element.clientHeight;
            const videoWidth = element.videoWidth;
            const videoHeight = element.videoHeight;

            // Calculate scaling ratio
            const ratioX = displayWidth / videoWidth;
            const ratioY = displayHeight / videoHeight;

            // Recognition Logic
            let labelText = "Unrecognized";
            let personName: string | undefined;
            let personRelationship: string | undefined;
            let personNotes: string | undefined;
            let boxColor = "border-red-500 shadow-red-500/50";
            let badgeColor = "bg-red-500";

            if (faceMatcher) {
              const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
              if (bestMatch.label !== 'unknown') {
                const matchId = parseInt(bestMatch.label);
                const person = profiles.find(p => p.id === matchId);
                if (person) {
                  labelText = `${person.name}: ${person.relationship}`;
                  personName = person.name;
                  personRelationship = person.relationship;
                  personNotes = person.notes;
                  boxColor = "border-green-500 shadow-green-500/50";
                  badgeColor = "bg-green-500";
                }
              }
            }

            // MATH: Calculate Coordinates
            const box = detection.detection.box;
            const scaledWidth = box.width * ratioX;
            const scaledX = box.x * ratioX;

            // MIRRORING FIX: Flip the X coordinate
            // New X = Total Width - (Original X + Width)
            const mirroredX = displayWidth - (scaledX + scaledWidth);

            setFaceBox({
              x: mirroredX, // Use the flipped X
              y: box.y * ratioY,
              width: scaledWidth,
              height: box.height * ratioY,
              label: labelText,
              name: personName,
              relationship: personRelationship,
              notes: personNotes,
              color: boxColor,
              badge: badgeColor
            });
          } else {
            setFaceBox(null);
          }
        } catch (err) {
          console.error("Detection error:", err);
        } finally {
          isProcessing.current = false; // Unlock
        }
      }, 200);
    } else {
      setFaceBox(null);
    }

    return () => clearInterval(interval);
  }, [cameraMode, cameraStream, faceMatcher]); // Removed 'profiles' dependency (handled by useMemo)

  return { faceBox };
};