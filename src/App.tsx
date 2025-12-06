import { useState, useRef } from 'react';
import type { Screen, Profile, NewProfile } from './types';
import { useModels } from './hooks/useModels';
import { useCamera } from './hooks/useCamera';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useFaceRecognition } from './hooks/useFaceRecognition';
import { useProfileCapture } from './hooks/useProfileCapture';
import { LoadingScreen } from './components/LoadingScreen';
import { HomeScreen } from './components/HomeScreen';
import { CameraScreen } from './components/CameraScreen';
import { RecognizedScreen } from './components/RecognizedScreen';
import { ProfilesScreen } from './components/ProfilesScreen';
import { AddProfileScreen } from './components/AddProfileScreen';
import { ProfileScreen } from './components/ProfileScreen';

const SiltaMVP = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [recognizedPerson, setRecognizedPerson] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newProfile, setNewProfile] = useState<NewProfile>({ 
    name: '', 
    relationship: '', 
    notes: '', 
    photo: null, 
    descriptor: null 
  });

  const modelsLoaded = useModels();
  const { cameraStream, cameraMode, facingMode, videoRef, startCamera, stopCamera, switchCamera } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const { faceBox } = useFaceDetection(
    videoRef as React.RefObject<HTMLVideoElement>,
    cameraStream,
    cameraMode,
    profiles
  );

  const { 
    isScanning, 
    statusMessage: recognitionStatus, 
    performRecognition 
  } = useFaceRecognition(profiles);

  const {
    capturedPhoto,
    statusMessage: captureStatus,
    captureAndAnalyzeProfile,
    resetCapture,
  } = useProfileCapture();

  const handleRecognizeClick = () => {
    setScreen('camera');
    startCamera('recognize');
  };

  const handleProfilesClick = () => {
    setScreen('profiles');
  };

  const handleCameraClose = () => {
    stopCamera();
    setScreen('home');
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    await captureAndAnalyzeProfile(
      videoRef.current,
      canvasRef.current,
      (photo, descriptor) => {
        setNewProfile(prev => ({ ...prev, descriptor, photo }));
        stopCamera();
        setScreen('add-profile');
      }
    );
  };

  const handleRecognize = async () => {
    if (!videoRef.current) return;
    await performRecognition(videoRef.current, (person) => {
      setRecognizedPerson(person);
      stopCamera();
      setScreen('recognized');
    });
  };

  const handleAddProfile = () => {
    if (newProfile.name && newProfile.relationship && newProfile.descriptor) {
      const profile: Profile = {
        id: Date.now(),
        name: newProfile.name,
        relationship: newProfile.relationship,
        notes: newProfile.notes,
        photo: newProfile.photo,
        descriptor: newProfile.descriptor
      };
      setProfiles([...profiles, profile]);
      setNewProfile({ name: '', relationship: '', notes: '', photo: null, descriptor: null });
      resetCapture();
      setScreen('profiles');
    }
  };

  const handleTakePhoto = () => {
    setScreen('camera');
    startCamera('capture');
  };

  const handlePhotoRemove = () => {
    resetCapture();
    setNewProfile(prev => ({ ...prev, descriptor: null }));
  };

  const handleProfileChange = (updates: Partial<NewProfile>) => {
    setNewProfile(prev => ({ ...prev, ...updates }));
  };

  const handleScanAnother = () => {
    setScreen('camera');
    startCamera('recognize');
  };

  if (!modelsLoaded) {
    return <LoadingScreen />;
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        onRecognizeClick={handleRecognizeClick}
        onProfilesClick={handleProfilesClick}
        onProfileClick={() => setScreen('profile')}
      />
    );
  }

  if (screen === 'camera' && cameraMode) {
    const statusMessage = cameraMode === 'recognize' ? recognitionStatus : captureStatus;
    return (
      <CameraScreen
        videoRef={videoRef}
        canvasRef={canvasRef}
        cameraMode={cameraMode}
        faceBox={faceBox}
        statusMessage={statusMessage}
        isScanning={isScanning}
        facingMode={facingMode}
        onClose={handleCameraClose}
        onCapture={handleCapture}
        onRecognize={handleRecognize}
        onSwitchCamera={switchCamera}
      />
    );
  }

  if (screen === 'recognized' && recognizedPerson) {
    return (
      <RecognizedScreen
        recognizedPerson={recognizedPerson}
        onHome={() => setScreen('home')}
        onScanAnother={handleScanAnother}
      />
    );
  }

  if (screen === 'profiles') {
    return (
      <ProfilesScreen
        profiles={profiles}
        onHome={() => setScreen('home')}
        onAddProfile={() => setScreen('add-profile')}
      />
    );
  }

  if (screen === 'add-profile') {
    return (
      <AddProfileScreen
        newProfile={newProfile}
        capturedPhoto={capturedPhoto}
        onBack={() => setScreen('profiles')}
        onPhotoRemove={handlePhotoRemove}
        onTakePhoto={handleTakePhoto}
        onProfileChange={handleProfileChange}
        onSave={handleAddProfile}
      />
    );
  }

  if (screen === 'profile') {
    return (
      <ProfileScreen
        onHome={() => setScreen('home')}
      />
    );
  }

  return null;
};

export default SiltaMVP;
