export interface Profile {
  id: number;
  name: string;
  relationship: string;
  notes: string;
  photo: string | null;
  descriptor: Float32Array | null;
}

export interface NewProfile {
  name: string;
  relationship: string;
  notes: string;
  photo: string | null;
  descriptor: Float32Array | null;
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

export type Screen = 'home' | 'camera' | 'recognized' | 'profiles' | 'add-profile' | 'profile';
export type CameraMode = 'recognize' | 'capture' | null;

