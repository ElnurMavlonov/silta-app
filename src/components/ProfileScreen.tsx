import { ArrowLeft, User, Settings, HelpCircle, Shield, Camera, X } from 'lucide-react';
import type { UserProfile } from '../types';

interface ProfileScreenProps {
  userProfile: UserProfile;
  capturedPhoto: string | null;
  onHome: () => void;
  onTakePhoto: () => void;
  onProfileUpdate: (updates: Partial<UserProfile>) => void;
  onPhotoRemove: () => void;
  onHelpClick: () => void;
  onSettingsClick: () => void;
  onResetFaceID: () => void;
}

export const ProfileScreen = ({ 
  userProfile, 
  capturedPhoto, 
  onHome, 
  onTakePhoto, 
  onProfileUpdate, 
  onPhotoRemove,
  onHelpClick,
  onSettingsClick,
  onResetFaceID
}: ProfileScreenProps) => {
  const displayPhoto = capturedPhoto || userProfile.photo;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 pt-12">
        <div className="flex items-center max-w-4xl mx-auto">
          <button onClick={onHome} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {/* Profile Header - Editable */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Photo Section */}
            <div className="relative">
              {displayPhoto ? (
                <div className="relative w-32 h-32">
                  <img 
                    src={displayPhoto} 
                    alt={userProfile.name} 
                    className="w-full h-full rounded-full object-cover border-4 border-purple-200"
                  />
                  <button
                    onClick={onPhotoRemove}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              <button
                onClick={onTakePhoto}
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition shadow-lg"
                aria-label="Change photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            {/* Name Section */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => onProfileUpdate({ name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your Name"
              />
              <p className="text-gray-600 text-sm mt-2">Manage your account settings</p>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-4">
          <div 
            onClick={onSettingsClick}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Settings</h3>
                <p className="text-gray-600 text-sm">App preferences and configuration</p>
              </div>
            </div>
          </div>

          <div 
            onClick={onHelpClick}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Help & Support</h3>
                <p className="text-gray-600 text-sm">Get help and contact support</p>
              </div>
            </div>
          </div>

          <div 
            onClick={onResetFaceID}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer hover:bg-orange-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Reset Face ID</h3>
                <p className="text-gray-600 text-sm">Clear your face ID and set it up again</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

