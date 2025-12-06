import { ArrowLeft, Camera, X } from 'lucide-react';
import type { NewProfile } from '../types';

interface AddProfileScreenProps {
  newProfile: NewProfile;
  capturedPhoto: string | null;
  onBack: () => void;
  onPhotoRemove: () => void;
  onTakePhoto: () => void;
  onProfileChange: (updates: Partial<NewProfile>) => void;
  onSave: () => void;
}

export const AddProfileScreen = ({
  newProfile,
  capturedPhoto,
  onBack,
  onPhotoRemove,
  onTakePhoto,
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
          <h1 className="text-3xl font-bold">Add New Person</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        <div>
          <label className="block text-gray-700 font-semibold mb-3 text-lg">Photo (Required for AI)</label>
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
        disabled={!newProfile.name || !newProfile.relationship || !newProfile.descriptor}
        className="m-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-5 rounded-2xl text-xl disabled:opacity-50"
      >
        Save Person
      </button>
    </div>
  );
};

