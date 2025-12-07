import { X, RotateCcw, Shield } from 'lucide-react';
import type { RefObject } from 'react';

interface FaceVerificationScreenProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  statusMessage: string;
  facingMode?: 'user' | 'environment';
  onClose: () => void;
  onCapture: () => void;
  onSwitchCamera?: () => void;
}

export const FaceVerificationScreen = ({
  videoRef,
  canvasRef,
  statusMessage,
  facingMode = 'user',
  onClose,
  onCapture,
  onSwitchCamera,
}: FaceVerificationScreenProps) => {
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
          <div className="text-white font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Face Verification Required
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

        {/* Instructions */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 max-w-md text-center">
            <Shield className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Verify Your Identity</h2>
            <p className="text-white text-lg mb-6">
              Please look at the camera and tap the button below to verify your face.
            </p>
            {statusMessage && (
              <p className="text-yellow-300 text-sm mb-4">{statusMessage}</p>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-6">
          <button 
            onClick={onCapture}
            className="bg-purple-600 text-white font-bold px-12 py-5 rounded-full text-xl hover:bg-purple-700 transition active:scale-95 flex items-center gap-3"
          >
            <Shield className="w-6 h-6" />
            Verify Face
          </button>
        </div>
      </div>
    </div>
  );
};

