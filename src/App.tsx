import { useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import type { Screen, Profile, NewProfile, UserProfile } from './types';
import { useModels } from './hooks/useModels';
import { useCamera } from './hooks/useCamera';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useFaceRecognition } from './hooks/useFaceRecognition';
import { useProfileCapture } from './hooks/useProfileCapture';
import { LoadingScreen } from './components/LoadingScreen';
import { HomeScreen } from './components/HomeScreen';
import { CameraScreen } from './components/CameraScreen';
import { ProfilesScreen } from './components/ProfilesScreen';
import { AddProfileScreen } from './components/AddProfileScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { FaceVerificationScreen } from './components/FaceVerificationScreen';
import { HelpScreen } from './components/HelpScreen';
import { SettingsScreen } from './components/SettingsScreen';

const SiltaMVP = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [captureForUserProfile, setCaptureForUserProfile] = useState(false);
  
  // User profile - not persisted, cleared on reload
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    name: 'User Profile', 
    photo: null, 
    faceDescriptor: null 
  });

  // State for pending operations that require verification
  const [pendingOperation, setPendingOperation] = useState<{
    type: 'edit' | 'delete';
    profile?: Profile;
    profileId?: number;
  } | null>(null);

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
    statusMessage: recognitionStatus
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
    setCaptureForUserProfile(false);
    setScreen('home');
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    await captureAndAnalyzeProfile(
      videoRef.current,
      canvasRef.current,
      (photo, descriptor) => {
        if (captureForUserProfile) {
          // Update user profile photo and face descriptor
          handleUserProfileUpdate({ photo, faceDescriptor: descriptor });
          stopCamera();
          setScreen('profile');
          setCaptureForUserProfile(false);
        } else if (cameraMode === 'verify') {
          // Face verification for edit/delete
          handleFaceVerification(descriptor);
        } else {
          // For adding/editing a person profile
          setNewProfile(prev => ({ ...prev, descriptor, photo }));
          stopCamera();
          setScreen('add-profile');
        }
      }
    );
  };

  const handleAddProfile = () => {
    const isEditing = editingProfileId !== null;
    const hasRequiredFields = newProfile.name && newProfile.relationship;
    const hasDescriptor = newProfile.descriptor || (isEditing && profiles.find(p => p.id === editingProfileId)?.descriptor);
    
    if (hasRequiredFields && hasDescriptor) {
      if (isEditing) {
        // Update existing profile
        setProfiles(profiles.map(p => 
          p.id === editingProfileId 
            ? {
                ...p,
                name: newProfile.name,
                relationship: newProfile.relationship,
                notes: newProfile.notes,
                photo: newProfile.photo || p.photo,
                descriptor: newProfile.descriptor || p.descriptor
              }
            : p
        ));
        setEditingProfileId(null);
      } else {
        // Add new profile
        const profile: Profile = {
          id: Date.now(),
          name: newProfile.name,
          relationship: newProfile.relationship,
          notes: newProfile.notes,
          photo: newProfile.photo,
          descriptor: newProfile.descriptor!
        };
        setProfiles([...profiles, profile]);
      }
      setNewProfile({ name: '', relationship: '', notes: '', photo: null, descriptor: null });
      resetCapture();
      setScreen('profiles');
    }
  };

  const handleEditProfile = (profile: Profile) => {
    // Check if user has face descriptor set up
    if (!userProfile.faceDescriptor) {
      alert('Please set up face ID in your profile first to enable editing.');
      return;
    }
    // Require face verification before editing
    setPendingOperation({ type: 'edit', profile });
    setScreen('face-verify');
    startCamera('verify');
  };

  const handleDeleteProfile = (profileId: number) => {
    // Check if user has face descriptor set up
    if (!userProfile.faceDescriptor) {
      alert('Please set up face ID in your profile first to enable deleting.');
      return;
    }
    // Require face verification before deleting
    setPendingOperation({ type: 'delete', profileId });
    setScreen('face-verify');
    startCamera('verify');
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

  const handleUserProfileUpdate = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const handleClearAllData = () => {
    setProfiles([]);
    setUserProfile({ name: 'User Profile', photo: null, faceDescriptor: null });
    setNewProfile({ name: '', relationship: '', notes: '', photo: null, descriptor: null });
    resetCapture();
    setEditingProfileId(null);
    setPendingOperation(null);
  };

  const handleResetFaceID = () => {
    if (window.confirm('Are you sure you want to reset your Face ID? You will need to set it up again to edit or delete profiles.')) {
      handleUserProfileUpdate({ faceDescriptor: null });
      alert('Face ID has been reset. You can set it up again by taking a new photo in your profile.');
    }
  };

  const handleFaceVerification = async (detectedDescriptor: Float32Array) => {
    if (!userProfile.faceDescriptor || !pendingOperation) {
      stopCamera();
      setScreen('profiles');
      setPendingOperation(null);
      return;
    }

    // Compare detected face with user's stored face descriptor
    const distance = faceapi.euclideanDistance(
      detectedDescriptor,
      userProfile.faceDescriptor
    );

    // Threshold for face match (lower is more strict)
    const threshold = 0.6;
    const isMatch = distance < threshold;

    stopCamera();

    if (isMatch) {
      // Verification successful - proceed with operation
      if (pendingOperation.type === 'edit' && pendingOperation.profile) {
        setEditingProfileId(pendingOperation.profile.id);
        setNewProfile({
          name: pendingOperation.profile.name,
          relationship: pendingOperation.profile.relationship,
          notes: pendingOperation.profile.notes,
          photo: pendingOperation.profile.photo,
          descriptor: pendingOperation.profile.descriptor
        });
        setScreen('add-profile');
      } else if (pendingOperation.type === 'delete' && pendingOperation.profileId) {
        if (window.confirm('Are you sure you want to delete this person?')) {
          setProfiles(profiles.filter(p => p.id !== pendingOperation.profileId));
        }
        setScreen('profiles');
      }
      setPendingOperation(null);
    } else {
      // Verification failed
      alert('Face verification failed. Access denied.');
      setScreen('profiles');
      setPendingOperation(null);
    }
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

  if (screen === 'face-verify' && cameraMode === 'verify') {
    return (
      <FaceVerificationScreen
        videoRef={videoRef}
        canvasRef={canvasRef}
        statusMessage={captureStatus}
        facingMode={facingMode}
        onClose={() => {
          stopCamera();
          setPendingOperation(null);
          setScreen('profiles');
        }}
        onCapture={handleCapture}
        onSwitchCamera={switchCamera}
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
        onSwitchCamera={switchCamera}
      />
    );
  }

  if (screen === 'profiles') {
    return (
      <ProfilesScreen
        profiles={profiles}
        onHome={() => setScreen('home')}
        onAddProfile={() => {
          setEditingProfileId(null);
          setNewProfile({ name: '', relationship: '', notes: '', photo: null, descriptor: null });
          setScreen('add-profile');
        }}
        onEditProfile={handleEditProfile}
        onDeleteProfile={handleDeleteProfile}
      />
    );
  }

  if (screen === 'add-profile') {
    return (
      <AddProfileScreen
        newProfile={newProfile}
        capturedPhoto={capturedPhoto || newProfile.photo}
        isEditing={editingProfileId !== null}
        onBack={() => {
          setEditingProfileId(null);
          setNewProfile({ name: '', relationship: '', notes: '', photo: null, descriptor: null });
          resetCapture();
          setScreen('profiles');
        }}
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
        userProfile={userProfile}
        capturedPhoto={capturedPhoto}
        onHome={() => setScreen('home')}
        onTakePhoto={() => {
          setCaptureForUserProfile(true);
          setScreen('camera');
          startCamera('capture');
        }}
        onProfileUpdate={handleUserProfileUpdate}
        onPhotoRemove={() => {
          resetCapture();
          handleUserProfileUpdate({ photo: null });
          setCaptureForUserProfile(false);
        }}
        onHelpClick={() => setScreen('help')}
        onSettingsClick={() => setScreen('settings')}
        onResetFaceID={handleResetFaceID}
      />
    );
  }

  if (screen === 'settings') {
    return (
      <SettingsScreen
        onBack={() => setScreen('profile')}
        onClearAllData={handleClearAllData}
      />
    );
  }

  if (screen === 'help') {
    return (
      <HelpScreen
        onBack={() => setScreen('profile')}
      />
    );
  }

  return null;
};

export default SiltaMVP;
