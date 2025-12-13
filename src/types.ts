export interface VoiceFeatures {
  mfcc: Float32Array; // Mel-frequency cepstral coefficients for speaker identification
  pitch: number; // Average pitch
  energy: number; // Average energy
  duration: number; // Duration of the audio sample
  zeroCrossingRate: number; // Voice quality indicator
}

export interface VoiceContext {
  tone: 'warm' | 'neutral' | 'cold' | 'excited' | 'calm';
  emotion: 'happy' | 'neutral' | 'sad' | 'energetic' | 'tired';
  confidence: number; // How confidently they said hello (0-1)
  speed: 'fast' | 'normal' | 'slow';
  volume: 'loud' | 'normal' | 'quiet';
  description: string; // Generated description based on analysis
}

export interface ConversationSegment {
  speakerId: number | null; // Profile ID or null if unknown
  speakerName: string | null;
  text: string;
  timestamp: number; // Time in seconds from start of conversation
  confidence: number;
}

export interface Conversation {
  id: number;
  startTime: number;
  endTime: number;
  segments: ConversationSegment[];
  summary: string;
  participants: number[]; // Profile IDs
}

export interface Profile {
  id: number;
  name: string;
  relationship: string;
  notes: string;
  photo: string | null;
  descriptor: Float32Array | null;
  voiceFeatures: VoiceFeatures | null;
  voiceContext: VoiceContext | null; // Context from how they say hello
  lastConversation: Conversation | null; // Last conversation with this person
  conversationHistory: Conversation[]; // All conversations
}

export interface NewProfile {
  name: string;
  relationship: string;
  notes: string;
  photo: string | null;
  descriptor: Float32Array | null;
  voiceFeatures: VoiceFeatures | null;
  voiceContext: VoiceContext | null;
}

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  name?: string;
  relationship?: string;
  notes?: string;
  color: string;
  badge: string;
}

export interface UserProfile {
  name: string;
  photo: string | null;
  faceDescriptor: Float32Array | null;
}

export type Screen = 'home' | 'camera' | 'recognized' | 'profiles' | 'add-profile' | 'profile' | 'face-verify' | 'help' | 'settings' | 'voice-recognition' | 'voice-capture';
export type CameraMode = 'recognize' | 'capture' | 'verify' | null;

