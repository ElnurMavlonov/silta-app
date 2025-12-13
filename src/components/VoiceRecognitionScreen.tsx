import { X, Mic, MicOff, Check } from 'lucide-react';
import type { Profile } from '../types';

interface VoiceRecognitionScreenProps {
  isListening: boolean;
  isProcessing?: boolean;
  statusMessage: string;
  recognizedPerson: Profile | null;
  similarity: number;
  onClose: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onRecognize: () => void;
  onRecognizeAnother?: () => void;
}

export const VoiceRecognitionScreen = ({
  isListening,
  isProcessing = false,
  statusMessage,
  recognizedPerson,
  similarity,
  onClose,
  onStartListening,
  onStopListening,
  onRecognize,
  onRecognizeAnother,
}: VoiceRecognitionScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black to-transparent z-10">
        <button 
          onClick={onClose}
          className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-white font-semibold text-lg">
          Voice Recognition
        </div>
        <div className="w-12"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto">
        {recognizedPerson ? (
          // Recognition Result
          <div className="text-center">
            <div className="relative w-40 h-40 mb-8 mx-auto">
              {recognizedPerson.photo && (
                <img 
                  src={recognizedPerson.photo} 
                  alt={recognizedPerson.name} 
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
                />
              )}
              <div className="absolute -bottom-2 right-0 bg-green-500 text-white p-2 rounded-full shadow-lg">
                <Check className="w-6 h-6" />
              </div>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-4">{recognizedPerson.name}</h2>
            <p className="text-3xl text-blue-100 mb-4">{recognizedPerson.relationship}</p>
            <p className="text-xl text-blue-200 mb-8">
              Match: {Math.round(similarity * 100)}%
            </p>

            {recognizedPerson.voiceContext && (
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 max-w-xl w-full mb-8">
                <h3 className="text-2xl font-bold mb-4">Voice Analysis</h3>
                <p className="text-lg leading-relaxed mb-4">{recognizedPerson.voiceContext.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="opacity-75">Tone:</span> <span className="font-semibold capitalize">{recognizedPerson.voiceContext.tone}</span>
                  </div>
                  <div>
                    <span className="opacity-75">Emotion:</span> <span className="font-semibold capitalize">{recognizedPerson.voiceContext.emotion}</span>
                  </div>
                  <div>
                    <span className="opacity-75">Speed:</span> <span className="font-semibold capitalize">{recognizedPerson.voiceContext.speed}</span>
                  </div>
                  <div>
                    <span className="opacity-75">Volume:</span> <span className="font-semibold capitalize">{recognizedPerson.voiceContext.volume}</span>
                  </div>
                </div>
              </div>
            )}

            {recognizedPerson.notes && (
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 max-w-xl w-full">
                <p className="text-xl leading-relaxed">{recognizedPerson.notes}</p>
              </div>
            )}

            <button 
              onClick={onRecognizeAnother || onStartListening}
              className="mt-8 bg-white text-blue-700 font-bold py-5 px-8 rounded-2xl text-xl hover:bg-gray-100 transition active:scale-95"
            >
              Recognize Another
            </button>
          </div>
        ) : (
          // Recognition Interface
          <div className="text-center">
            <div className={`w-48 h-48 rounded-full mx-auto mb-8 flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-500 animate-pulse shadow-2xl' 
                : 'bg-white bg-opacity-30 shadow-xl'
            }`}>
              {isListening ? (
                <MicOff className="w-24 h-24" />
              ) : (
                <Mic className="w-24 h-24" />
              )}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Voice Recognition'}
            </h2>
            <p className="text-2xl text-blue-100 mb-8">
              {statusMessage || (isListening ? 'Say "hello" - recognition is automatic!' : 'Starting automatic recognition...')}
            </p>

            {isProcessing && (
              <div className="mb-8">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {!isListening ? (
                <button 
                  onClick={onStartListening}
                  className="bg-white text-blue-700 font-bold py-5 px-8 rounded-2xl text-xl hover:bg-gray-100 transition active:scale-95"
                >
                  Start Listening
                </button>
              ) : (
                <>
                  <button 
                    onClick={onStopListening}
                    className="bg-red-500 text-white font-bold py-5 px-8 rounded-2xl text-xl hover:bg-red-600 transition active:scale-95"
                    disabled={isProcessing}
                  >
                    Stop
                  </button>
                  {!isProcessing && (
                    <button 
                      onClick={onRecognize}
                      className="bg-green-500 text-white font-bold py-5 px-8 rounded-2xl text-xl hover:bg-green-600 transition active:scale-95"
                    >
                      Recognize Now
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

