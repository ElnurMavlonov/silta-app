import { ArrowLeft, Trash2, Info, AlertTriangle } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  onClearAllData: () => void;
}

export const SettingsScreen = ({ onBack, onClearAllData }: SettingsScreenProps) => {
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will delete all saved people and cannot be undone.')) {
      onClearAllData();
      alert('All data has been cleared.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 pt-12">
        <div className="flex items-center max-w-4xl mx-auto">
          <button onClick={onBack} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {/* Data Management */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700">
                Clear all saved data including profiles, photos, and face descriptors.
              </p>
              <button
                onClick={handleClearData}
                className="bg-red-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-700 transition"
              >
                Clear All Data
              </button>
            </div>
          </div>

          {/* App Information */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">About</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Silta</h3>
                <p className="text-sm">Your memory companion - AI-powered face recognition app</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Version</h3>
                <p className="text-sm">1.0.0</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Technology</h3>
                <p className="text-sm">Built with React, TypeScript, and face-api.js</p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Notice</h3>
                <p className="text-sm text-gray-700">
                  All face recognition and data processing happens locally in your browser. 
                  No data is sent to external servers. Your photos and face descriptors are 
                  stored only on your device and are cleared when you reload the page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

