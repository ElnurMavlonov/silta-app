import { Camera, X } from 'lucide-react';
import type { CameraMode, FaceBox } from '../types';

interface CameraScreenProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraMode: CameraMode;
  faceBox: FaceBox | null;
  statusMessage: string;
  isScanning: boolean;
  onClose: () => void;
  onCapture: () => void;
  onRecognize: () => void;
}

export const CameraScreen = ({
  videoRef,
  canvasRef,
  cameraMode,
  faceBox,
  statusMessage,
  isScanning,
  onClose,
  onCapture,
  onRecognize,
}: CameraScreenProps) => {
  return (
    <div className="min-h-screen bg-black relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-contain bg-black scale-x-[-1]"
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
          <div className="text-white font-semibold text-lg">
            {statusMessage || (cameraMode === 'recognize' ? 'Recognize Person' : 'Take Photo')}
          </div>
          <div className="w-12"></div>
        </div>

        {/* Dynamic Face Tracking Box with Name */}
        {cameraMode === 'recognize' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {faceBox ? (
              <div 
                className={`absolute border-4 rounded-lg transition-all duration-100 ease-linear shadow-[0_0_20px_rgba(0,0,0,0.5)] ${faceBox.color}`}
                style={{
                  left: `${faceBox.x}px`,
                  top: `${faceBox.y}px`,
                  width: `${faceBox.width}px`,
                  height: `${faceBox.height}px`,
                }}
              >
                {/* The Name Badge */}
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-white text-lg font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-md ${faceBox.badge}`}>
                  {faceBox.label}
                </div>
              </div>
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

        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-6">
          {cameraMode === 'recognize' ? (
            <button 
              onClick={onRecognize}
              disabled={isScanning}
              className="bg-purple-600 text-white font-bold px-12 py-5 rounded-full text-xl hover:bg-purple-700 transition active:scale-95 disabled:opacity-50"
            >
              {isScanning ? 'Scanning...' : 'Tap to Identify'}
            </button>
          ) : (
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

