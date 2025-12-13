import { useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import type { Screen, Profile, NewProfile, UserProfile, VoiceContext } from './types';
import { useModels } from './hooks/useModels';
import { useCamera } from './hooks/useCamera';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useFaceRecognition } from './hooks/useFaceRecognition';
import { useProfileCapture } from './hooks/useProfileCapture';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useVoiceCapture } from './hooks/useVoiceCapture';
import { useConversationRecording } from './hooks/useConversationRecording';
import { LoadingScreen } from './components/LoadingScreen';
import { HomeScreen } from './components/HomeScreen';
import { CameraScreen } from './components/CameraScreen';
import { ProfilesScreen } from './components/ProfilesScreen';
import { AddProfileScreen } from './components/AddProfileScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { FaceVerificationScreen } from './components/FaceVerificationScreen';
import { HelpScreen } from './components/HelpScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { VoiceRecognitionScreen } from './components/VoiceRecognitionScreen';
import { VoiceCaptureScreen } from './components/VoiceCaptureScreen';

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
    descriptor: null,
    voiceFeatures: null,
    voiceContext: null
  });
  const [voiceRecognizedPerson, setVoiceRecognizedPerson] = useState<Profile | null>(null);
  const [voiceSimilarity, setVoiceSimilarity] = useState<number>(0);
  const [capturedVoiceContext, setCapturedVoiceContext] = useState<VoiceContext | null>(null);

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

  const {
    isListening,
    isProcessing,
    statusMessage: voiceRecognitionStatus,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening,
    recognizeVoice,
    recordAudio,
  } = useVoiceRecognition(
    profiles, 
    true, // Auto-start enabled
    (person, similarity) => {
      // Auto-recognition callback
      setVoiceRecognizedPerson(person);
      setVoiceSimilarity(similarity);
    }
  );

  const {
    isRecording: isVoiceRecording,
    statusMessage: voiceCaptureStatus,
    startRecording: startVoiceRecording,
    stopRecording: stopVoiceRecording,
    captureAndAnalyzeVoice,
  } = useVoiceCapture();

  const {
    isRecording: isConversationRecording,
    activeSpeakers,
    startRecording: startConversationRecording,
    stopRecording: stopConversationRecording,
  } = useConversationRecording(profiles);

  const handleRecognizeClick = async () => {
    setScreen('camera');
    startCamera('recognize');
    // Start conversation recording when recognizing - wait a bit for camera to initialize
    setTimeout(async () => {
      if (!isConversationRecording) {
        try {
          await startConversationRecording();
          console.log('Conversation recording started');
        } catch (error) {
          console.error('Failed to start conversation recording:', error);
        }
      }
    }, 500);
  };

  const handleProfilesClick = () => {
    setScreen('profiles');
  };

  const saveConversationToProfiles = async () => {
    if (isConversationRecording) {
      console.log('Stopping conversation recording...');
      const conversation = await stopConversationRecording();
      if (conversation && conversation.segments.length > 0) {
        console.log('Saving conversation to profiles:', conversation);
        
        // If we have recognized faces, try to match segments to them
        // Otherwise, save conversation to all profiles that were visible during recording
        const recognizedProfileIds = profiles
          .filter(p => p.descriptor !== null)
          .map(p => p.id);
        
        // Update profiles with conversation notes
        let hasUpdates = false;
        const updatedProfiles = profiles.map(profile => {
          // If this profile was a participant, update it
          if (conversation.participants.includes(profile.id)) {
            const personSegments = conversation.segments.filter(s => s.speakerId === profile.id);
            if (personSegments.length > 0) {
              hasUpdates = true;
              const updatedHistory = [...(profile.conversationHistory || []), conversation];
              const conversationNote = `[Last conversation - ${new Date(conversation.startTime).toLocaleString()}]: ${conversation.summary}`;
              
              return {
                ...profile,
                lastConversation: conversation,
                conversationHistory: updatedHistory.slice(-10),
                notes: profile.notes 
                  ? `${profile.notes}\n\n${conversationNote}`
                  : conversationNote
              };
            }
          }
          // If no participants identified but we have segments, save to all recognized profiles
          if (conversation.participants.length === 0 && recognizedProfileIds.includes(profile.id)) {
            hasUpdates = true;
            const updatedHistory = [...(profile.conversationHistory || []), conversation];
            const conversationNote = `[Last conversation - ${new Date(conversation.startTime).toLocaleString()}]: ${conversation.summary}`;
            
            return {
              ...profile,
              lastConversation: conversation,
              conversationHistory: updatedHistory.slice(-10),
              notes: profile.notes 
                ? `${profile.notes}\n\n${conversationNote}`
                : conversationNote
            };
          }
          return profile;
        });
        
        if (hasUpdates) {
          setProfiles(updatedProfiles);
          console.log('Profiles updated with conversation');
          return true;
        } else {
          // If we have segments but no matching profiles, save to the first profile with a face descriptor
          // This handles the case where voice recognition didn't work but we still have conversation
          if (recognizedProfileIds.length > 0) {
            const firstRecognizedProfile = profiles.find(p => recognizedProfileIds.includes(p.id));
            if (firstRecognizedProfile) {
              const updatedHistory = [...(firstRecognizedProfile.conversationHistory || []), conversation];
              const conversationNote = `[Last conversation - ${new Date(conversation.startTime).toLocaleString()}]: ${conversation.summary}`;
              
              const updatedProfiles2 = profiles.map(p => 
                p.id === firstRecognizedProfile.id
                  ? {
                      ...p,
                      lastConversation: conversation,
                      conversationHistory: updatedHistory.slice(-10),
                      notes: p.notes 
                        ? `${p.notes}\n\n${conversationNote}`
                        : conversationNote
                    }
                  : p
              );
              setProfiles(updatedProfiles2);
              console.log('Conversation saved to first recognized profile');
              return true;
            }
          }
          console.log('No matching profiles found, but conversation was recorded');
          return true; // Still return true since conversation was recorded
        }
      } else {
        console.log('No conversation segments to save');
        return false;
      }
    }
    return false;
  };

  const handleEndConversation = async () => {
    const saved = await saveConversationToProfiles();
    if (saved) {
      alert('Conversation saved to profiles!');
      // Optionally restart recording for next conversation
      if (!isConversationRecording) {
        setTimeout(async () => {
          try {
            await startConversationRecording();
          } catch (error) {
            console.error('Failed to restart conversation recording:', error);
          }
        }, 500);
      }
    } else {
      alert('No conversation segments were recorded. Make sure you are speaking and microphone permissions are granted.');
    }
  };

  const handleCameraClose = async () => {
    // Stop conversation recording and save to profiles
    await saveConversationToProfiles();
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
    const hasDescriptor = newProfile.descriptor || newProfile.voiceFeatures || (isEditing && (profiles.find(p => p.id === editingProfileId)?.descriptor || profiles.find(p => p.id === editingProfileId)?.voiceFeatures));
    
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
                descriptor: newProfile.descriptor || p.descriptor,
                voiceFeatures: newProfile.voiceFeatures || p.voiceFeatures,
                voiceContext: newProfile.voiceContext || p.voiceContext
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
          descriptor: newProfile.descriptor,
          voiceFeatures: newProfile.voiceFeatures,
          voiceContext: newProfile.voiceContext,
          lastConversation: null,
          conversationHistory: []
        };
        setProfiles([...profiles, profile]);
      }
      setNewProfile({ name: '', relationship: '', notes: '', photo: null, descriptor: null, voiceFeatures: null, voiceContext: null });
      resetCapture();
      setCapturedVoiceContext(null);
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

  const handleVoiceRecognizeClick = () => {
    setScreen('voice-recognition');
    setVoiceRecognizedPerson(null);
    setVoiceSimilarity(0);
    // Auto-start will be handled by the hook when screen changes
    if (!isListening && profiles.some(p => p.voiceFeatures)) {
      startVoiceListening();
    }
  };

  const handleVoiceRecognition = async () => {
    try {
      const audioBuffer = await recordAudio();
      const result = await recognizeVoice(audioBuffer, (person, similarity) => {
        setVoiceRecognizedPerson(person);
        setVoiceSimilarity(similarity);
      });
      if (result.person) {
        setVoiceRecognizedPerson(result.person);
        setVoiceSimilarity(result.similarity);
      }
    } catch (error) {
      console.error('Error recognizing voice:', error);
      alert('Error recognizing voice. Please try again.');
    }
  };


  const handleVoiceCaptureClick = () => {
    setScreen('voice-capture');
    setCapturedVoiceContext(null);
  };

  const handleVoiceCapture = async () => {
    await captureAndAnalyzeVoice((features, context) => {
      setNewProfile(prev => ({ ...prev, voiceFeatures: features, voiceContext: context }));
      setCapturedVoiceContext(context);
    });
  };

  const handleVoiceCaptureClose = () => {
    stopVoiceRecording();
    setScreen('add-profile');
  };

  const handleVoiceRecognitionClose = () => {
    stopVoiceListening();
    setVoiceRecognizedPerson(null);
    setVoiceSimilarity(0);
    setScreen('home');
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
    setNewProfile({ name: '', relationship: '', notes: '', photo: null, descriptor: null, voiceFeatures: null, voiceContext: null });
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
          descriptor: pendingOperation.profile.descriptor,
          voiceFeatures: pendingOperation.profile.voiceFeatures,
          voiceContext: pendingOperation.profile.voiceContext
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
        onVoiceRecognizeClick={handleVoiceRecognizeClick}
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
        isRecordingConversation={isConversationRecording}
        activeSpeakers={activeSpeakers}
        onClose={handleCameraClose}
        onCapture={handleCapture}
        onSwitchCamera={switchCamera}
        onEndConversation={handleEndConversation}
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
          setNewProfile({ name: '', relationship: '', notes: '', photo: null, descriptor: null, voiceFeatures: null, voiceContext: null });
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
          setNewProfile({ name: '', relationship: '', notes: '', photo: null, descriptor: null, voiceFeatures: null, voiceContext: null });
          resetCapture();
          setCapturedVoiceContext(null);
          setScreen('profiles');
        }}
        onPhotoRemove={handlePhotoRemove}
        onTakePhoto={handleTakePhoto}
        onVoiceCaptureClick={handleVoiceCaptureClick}
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

  if (screen === 'voice-recognition') {
    return (
      <VoiceRecognitionScreen
        isListening={isListening}
        isProcessing={isProcessing}
        statusMessage={voiceRecognitionStatus}
        recognizedPerson={voiceRecognizedPerson}
        similarity={voiceSimilarity}
        onClose={handleVoiceRecognitionClose}
        onStartListening={startVoiceListening}
        onStopListening={stopVoiceListening}
        onRecognize={handleVoiceRecognition}
        onRecognizeAnother={() => {
          setVoiceRecognizedPerson(null);
          setVoiceSimilarity(0);
          if (!isListening) {
            startVoiceListening();
          }
        }}
      />
    );
  }

  if (screen === 'voice-capture') {
    return (
      <VoiceCaptureScreen
        isRecording={isVoiceRecording}
        statusMessage={voiceCaptureStatus}
        voiceContext={capturedVoiceContext}
        onClose={handleVoiceCaptureClose}
        onStartRecording={startVoiceRecording}
        onStopRecording={stopVoiceRecording}
        onCapture={handleVoiceCapture}
      />
    );
  }

  return null;
};

export default SiltaMVP;
