import { X, Mic, MicOff } from 'lucide-react';
import type { VoiceContext } from '../types';

interface VoiceCaptureScreenProps {
  isRecording: boolean;
  statusMessage: string;
  voiceContext: VoiceContext | null;
  onClose: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCapture: () => void;
}

export const VoiceCaptureScreen = ({
  isRecording,
  statusMessage,
  voiceContext,
  onClose,
  onStartRecording,
  onStopRecording,
  onCapture,
}: VoiceCaptureScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 text-white flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black to-transparent z-10">
        <button 
          onClick={onClose}
          className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-white font-semibold text-lg">
          Record Voice
        </div>
        <div className="w-12"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto">
        {voiceContext ? (
          // Analysis Result
          <div className="text-center w-full">
            <div className="w-32 h-32 bg-green-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
              <Mic className="w-16 h-16" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-8">Voice Captured!</h2>

            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 max-w-xl w-full mb-8">
              <h3 className="text-2xl font-bold mb-4">Voice Analysis</h3>
              <p className="text-lg leading-relaxed mb-6">{voiceContext.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="opacity-75">Tone:</span> <span className="font-semibold capitalize">{voiceContext.tone}</span>
                </div>
                <div>
                  <span className="opacity-75">Emotion:</span> <span className="font-semibold capitalize">{voiceContext.emotion}</span>
                </div>
                <div>
                  <span className="opacity-75">Speed:</span> <span className="font-semibold capitalize">{voiceContext.speed}</span>
                </div>
                <div>
                  <span className="opacity-75">Volume:</span> <span className="font-semibold capitalize">{voiceContext.volume}</span>
                </div>
                <div className="col-span-2">
                  <span className="opacity-75">Confidence:</span> <span className="font-semibold">{Math.round(voiceContext.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            <p className="text-xl text-purple-100 mb-8">
              This voice profile will help recognize this person in the future.
            </p>

            <button 
              onClick={onStartRecording}
              className="bg-white text-purple-700 font-bold py-5 px-8 rounded-2xl text-xl hover:bg-gray-100 transition active:scale-95"
            >
              Record Again
            </button>
          </div>
        ) : (
          // Recording Interface
          <div className="text-center">
            <div className={`w-48 h-48 rounded-full mx-auto mb-8 flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-red-500 animate-pulse shadow-2xl' 
                : 'bg-white bg-opacity-30 shadow-xl'
            }`}>
              {isRecording ? (
                <MicOff className="w-24 h-24" />
              ) : (
                <Mic className="w-24 h-24" />
              )}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {isRecording ? 'Recording...' : 'Record Voice'}
            </h2>
            <p className="text-2xl text-purple-100 mb-8">
              {statusMessage || (isRecording ? 'Say "hello" clearly' : 'Click to start recording')}
            </p>

            <div className="flex gap-4 justify-center">
              {!isRecording ? (
                <button 
                  onClick={onStartRecording}
                  className="bg-white text-purple-700 font-bold py-5 px-8 rounded-2xl text-xl hover:bg-gray-100 transition active:scale-95"
                >
                  Start Recording
                </button>
              ) : (
                <>
                  <button 
                    onClick={onStopRecording}
                    className="bg-red-500 text-white font-bold py-5 px-8 rounded-2xl text-xl hover:bg-red-600 transition active:scale-95"
                  >
                    Stop
                  </button>
                  <button 
                    onClick={onCapture}
                    className="bg-green-500 text-white font-bold py-5 px-8 rounded-2xl text-xl hover:bg-green-600 transition active:scale-95"
                  >
                    Capture & Analyze
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

