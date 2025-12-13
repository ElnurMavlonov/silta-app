import { Camera, Home, Users, User, Mic } from 'lucide-react';

interface HomeScreenProps {
  onRecognizeClick: () => void;
  onVoiceRecognizeClick: () => void;
  onProfilesClick: () => void;
  onProfileClick: () => void; // Assuming this leads to a user settings profile
}

export const HomeScreen = ({ onRecognizeClick, onVoiceRecognizeClick, onProfilesClick, onProfileClick }: HomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
      {/* Header */}
      <div className="p-6 pt-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Silta</h1>
        <p className="text-purple-200 text-lg">Your memory companion</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-6 py-8 space-y-4 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {/* Recognize Buttons */}
        <div className="space-y-4">
          <div 
            onClick={onRecognizeClick}
            className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 text-center cursor-pointer hover:bg-opacity-30 transition-all active:scale-95 shadow-xl"
          >
            <div className="w-32 h-32 bg-white bg-opacity-30 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Camera className="w-16 h-16" />
            </div>
            <h2 className="text-4xl font-bold mb-3">Recognize Face</h2>
            <p className="text-purple-100 text-xl">Point camera at a person's face</p>
          </div>

          <div 
            onClick={onVoiceRecognizeClick}
            className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 text-center cursor-pointer hover:bg-opacity-30 transition-all active:scale-95 shadow-xl"
          >
            <div className="w-32 h-32 bg-white bg-opacity-30 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Mic className="w-16 h-16" />
            </div>
            <h2 className="text-4xl font-bold mb-3">Recognize Voice</h2>
            <p className="text-purple-100 text-xl">Listen to someone say "hello"</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="w-full bg-white bg-opacity-10 backdrop-blur-lg border-t border-white border-opacity-20 px-8 py-6 flex justify-around">
        <button 
          onClick={() => {}} // Already on Home
          className="p-2 rounded-full bg-white bg-opacity-20 transition-all"
        >
          <Home className="w-8 h-8" />
        </button>
        <button 
          onClick={onProfilesClick}
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
        >
          <Users className="w-8 h-8 opacity-50" />
        </button>
        <button 
          onClick={onProfileClick}
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
        >
          <User className="w-8 h-8 opacity-50" />
        </button>
      </div>
    </div>
  );
};