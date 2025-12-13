import { ArrowLeft, Camera, X, Mic, Check } from 'lucide-react';
import type { NewProfile } from '../types';

interface AddProfileScreenProps {
  newProfile: NewProfile;
  capturedPhoto: string | null;
  isEditing?: boolean;
  onBack: () => void;
  onPhotoRemove: () => void;
  onTakePhoto: () => void;
  onVoiceCaptureClick: () => void;
  onProfileChange: (updates: Partial<NewProfile>) => void;
  onSave: () => void;
}

export const AddProfileScreen = ({
  newProfile,
  capturedPhoto,
  isEditing = false,
  onBack,
  onPhotoRemove,
  onTakePhoto,
  onVoiceCaptureClick,
  onProfileChange,
  onSave,
}: AddProfileScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 pt-12">
        <div className="flex items-center max-w-4xl mx-auto">
          <button onClick={onBack} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">{isEditing ? 'Edit Person' : 'Add New Person'}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        <div>
          <label className="block text-gray-700 font-semibold mb-3 text-lg">
            Photo {isEditing ? '(Update if needed)' : '(Optional for AI)'}
          </label>
          {capturedPhoto ? (
            <div className="relative w-48 h-48 mx-auto">
              <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover rounded-2xl" />
              <button
                onClick={onPhotoRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onTakePhoto}
              className="w-full py-6 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 font-semibold flex items-center justify-center gap-3 text-lg bg-purple-50"
            >
              <Camera className="w-6 h-6" />
              Take Photo & Analyze Face
            </button>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-3 text-lg">Voice (Optional - Say "hello")</label>
          {newProfile.voiceContext ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Check className="w-6 h-6 text-green-600" />
                <span className="text-green-800 font-semibold">Voice recorded!</span>
              </div>
              <p className="text-gray-700 text-sm mb-2">{newProfile.voiceContext.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Tone: <span className="font-semibold capitalize">{newProfile.voiceContext.tone}</span></div>
                <div>Emotion: <span className="font-semibold capitalize">{newProfile.voiceContext.emotion}</span></div>
                <div>Speed: <span className="font-semibold capitalize">{newProfile.voiceContext.speed}</span></div>
                <div>Volume: <span className="font-semibold capitalize">{newProfile.voiceContext.volume}</span></div>
              </div>
              <button
                onClick={onVoiceCaptureClick}
                className="mt-3 w-full py-2 border border-green-400 rounded-xl text-green-700 font-semibold text-sm hover:bg-green-100"
              >
                Record Again
              </button>
            </div>
          ) : (
            <button
              onClick={onVoiceCaptureClick}
              className="w-full py-6 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 font-semibold flex items-center justify-center gap-3 text-lg bg-purple-50"
            >
              <Mic className="w-6 h-6" />
              Record Voice & Analyze
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Name (e.g., Ahmad)"
          className="w-full px-5 py-4 rounded-xl border border-gray-300 text-lg"
          value={newProfile.name}
          onChange={(e) => onProfileChange({ name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Relationship (e.g., Son)"
          className="w-full px-5 py-4 rounded-xl border border-gray-300 text-lg"
          value={newProfile.relationship}
          onChange={(e) => onProfileChange({ relationship: e.target.value })}
        />
        <textarea
          placeholder="Notes (Optional)"
          className="w-full px-5 py-4 rounded-xl border border-gray-300 text-lg resize-none"
          rows={3}
          value={newProfile.notes}
          onChange={(e) => onProfileChange({ notes: e.target.value })}
        />
      </div>

      <button 
        onClick={onSave}
        disabled={!newProfile.name || !newProfile.relationship || (!newProfile.descriptor && !newProfile.voiceFeatures && !isEditing)}
        className="m-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-5 rounded-2xl text-xl disabled:opacity-50"
      >
        {isEditing ? 'Update Person' : 'Save Person'}
      </button>
    </div>
  );
};

