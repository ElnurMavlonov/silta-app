import { ArrowLeft, Mail, MessageCircle, Book } from 'lucide-react';

interface HelpScreenProps {
  onBack: () => void;
}

export const HelpScreen = ({ onBack }: HelpScreenProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 pt-12">
        <div className="flex items-center max-w-4xl mx-auto">
          <button onClick={onBack} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">Help & Support</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {/* Getting Started */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Book className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p><strong>1. Add People:</strong> Go to "My People" and click "Add New Person". Take a photo and fill in their details.</p>
              <p><strong>2. Recognize:</strong> Use the "Recognize Someone" feature to identify people using your camera.</p>
              <p><strong>3. Face ID:</strong> Set up your face ID in Profile to enable editing and deleting saved people.</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I add someone?</h3>
                <p className="text-gray-600">Go to "My People" → "Add New Person" → Take a photo → Fill in name, relationship, and optional notes.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Why can't I edit or delete?</h3>
                <p className="text-gray-600">You need to set up Face ID first. Go to Profile and take a photo to enable these features.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my data saved?</h3>
                <p className="text-gray-600">Currently, data is stored locally in your browser. It will be cleared when you reload the page.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How does face recognition work?</h3>
                <p className="text-gray-600">The app uses AI to detect faces and match them against your saved profiles. Make sure faces are well-lit and clearly visible.</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Contact Support</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Need more help? Contact us:</p>
              <div className="flex items-center gap-2 text-purple-600">
                <Mail className="w-5 h-5" />
                <a href="mailto:support@silta.app" className="hover:underline">support@silta.app</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

