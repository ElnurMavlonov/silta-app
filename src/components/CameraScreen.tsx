import { Camera, X, RotateCcw } from 'lucide-react';
import type { CameraMode, FaceBox } from '../types';

interface CameraScreenProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraMode: CameraMode;
  faceBox: FaceBox | null;
  statusMessage: string;
  isScanning: boolean;
  facingMode?: 'user' | 'environment';
  isRecordingConversation?: boolean;
  activeSpeakers?: Map<number, number>;
  onClose: () => void;
  onCapture: () => void;
  onSwitchCamera?: () => void;
  onEndConversation?: () => void;
}

export const CameraScreen = ({
  videoRef,
  canvasRef,
  cameraMode,
  faceBox,
  statusMessage,
  isScanning,
  facingMode = 'user',
  isRecordingConversation = false,
  activeSpeakers = new Map(),
  onClose,
  onCapture,
  onSwitchCamera,
  onEndConversation,
}: CameraScreenProps) => {
  return (
    <div className="min-h-screen bg-black relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-contain bg-black ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 bg-black bg-opacity-20">
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
          <button 
            onClick={onClose}
            className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-white font-semibold text-lg text-center flex-1">
            {statusMessage || (cameraMode === 'recognize' ? 'Recognize Person' : 'Take Photo')}
            {isRecordingConversation && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-200">Recording conversation</span>
                {activeSpeakers && activeSpeakers.size > 0 && (
                  <span className="text-xs text-white/70">
                    ({activeSpeakers.size} speaker{activeSpeakers.size > 1 ? 's' : ''})
                  </span>
                )}
              </div>
            )}
          </div>
          {onSwitchCamera && (
            <button 
              onClick={onSwitchCamera}
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          )}
          {!onSwitchCamera && <div className="w-12"></div>}
        </div>

        {/* Dynamic Face Tracking with Name and Role */}
        {cameraMode === 'recognize' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {faceBox ? (
              <>
                {/* Name and Role Badges - Above face */}
                <div 
                  className="absolute transition-all duration-100 ease-linear flex items-center gap-1"
                  style={{
                    left: `${faceBox.x + faceBox.width / 2}px`,
                    top: `${faceBox.y - 10}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {/* Name Badge - Teal */}
                  {faceBox.name && (
                    <div className="bg-teal-500 bg-opacity-50 text-white text-base font-semibold px-3 py-1.5 rounded shadow-md whitespace-nowrap">
                      {faceBox.name}
                    </div>
                  )}
                  {/* Role Badge - Light Blue */}
                  {faceBox.relationship && (
                    <div className="bg-sky-400 bg-opacity-50 text-white text-sm font-semibold px-2.5 py-1.5 rounded shadow-md whitespace-nowrap">
                      {faceBox.relationship}
                    </div>
                  )}
                  {/* Fallback for unrecognized */}
                  {!faceBox.name && (
                    <div className={`text-white text-lg font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-md ${faceBox.badge}`}>
                      {faceBox.label}
                    </div>
                  )}
                </div>
                {/* Notes - Below face */}
                {faceBox.notes && (
                  <div 
                    className="absolute transition-all duration-100 ease-linear"
                    style={{
                      left: `${faceBox.x + faceBox.width / 2}px`,
                      top: `${faceBox.y + faceBox.height + 10}px`,
                      transform: 'translateX(-50%)',
                      maxWidth: '300px',
                    }}
                  >
                    <div className="bg-gray-500 bg-opacity-50 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                      {faceBox.notes}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Searching state
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-dashed border-white/30 rounded-full animate-pulse flex items-center justify-center">
                  <p className="text-white/50 text-sm font-semibold">Scanning for faces...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 px-6">
          {cameraMode === 'recognize' && (
            <div className="flex gap-4 w-full max-w-md">
              {isRecordingConversation && onEndConversation && (
                <button 
                  onClick={onEndConversation}
                  className="bg-red-600 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-red-700 transition active:scale-95 flex-1"
                >
                  End Conversation
                </button>
              )}
              <button 
                onClick={onCapture}
                disabled={isScanning || !faceBox || !!faceBox.name}
                className="bg-purple-600 text-white font-bold px-12 py-5 rounded-full text-xl hover:bg-purple-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                {isScanning ? 'Scanning...' : 'Add Person'}
              </button>
            </div>
          )}
          {cameraMode !== 'recognize' && (
            <button 
              onClick={onCapture}
              className="bg-white text-purple-700 font-bold p-6 rounded-full hover:bg-gray-100 transition active:scale-95"
            >
              <Camera className="w-10 h-10" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

