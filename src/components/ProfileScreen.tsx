import { ArrowLeft, User, Settings, Bell, HelpCircle, LogOut } from 'lucide-react';

interface ProfileScreenProps {
  onHome: () => void;
}

export const ProfileScreen = ({ onHome }: ProfileScreenProps) => {
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
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">User Profile</h2>
              <p className="text-gray-600">Manage your account settings</p>
            </div>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
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

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                <p className="text-gray-600 text-sm">Manage notification preferences</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
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

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer hover:bg-red-50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Sign Out</h3>
                <p className="text-gray-600 text-sm">Sign out of your account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

