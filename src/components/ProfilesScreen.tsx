import { ArrowLeft, Plus, Users, Edit, Trash2 } from 'lucide-react';
import type { Profile } from '../types';

interface ProfilesScreenProps {
  profiles: Profile[];
  onHome: () => void;
  onAddProfile: () => void;
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: (profileId: number) => void;
}

export const ProfilesScreen = ({ profiles, onHome, onAddProfile, onEditProfile, onDeleteProfile }: ProfilesScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 pt-12">
        <div className="flex items-center mb-4 max-w-4xl mx-auto">
          <button onClick={onHome} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">My People</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
        {profiles.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">No people added yet.</p>
            <p>Add family members to start recognizing them.</p>
          </div>
        )}
        {profiles.map(profile => (
          <div key={profile.id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 flex items-center gap-6">
            {profile.photo && (
              <img src={profile.photo} alt={profile.name} className="w-20 h-20 rounded-2xl object-cover bg-gray-200" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-xl mb-1">{profile.name}</h3>
              <p className="text-purple-600 text-base">{profile.relationship}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditProfile(profile)}
                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                aria-label="Edit profile"
              >
                <Edit className="w-5 h-5 text-purple-600" />
              </button>
              <button
                onClick={() => onDeleteProfile(profile.id)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                aria-label="Delete profile"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onAddProfile}
        className="m-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-5 rounded-2xl text-xl flex items-center justify-center gap-2"
      >
        <Plus className="w-6 h-6" />
        Add New Person
      </button>
    </div>
  );
};

