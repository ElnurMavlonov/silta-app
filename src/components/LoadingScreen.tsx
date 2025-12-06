import { Loader2 } from 'lucide-react';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-700 text-white">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <h2 className="text-2xl font-bold">Loading AI Models...</h2>
      <p className="text-purple-200 mt-2">Please wait a moment</p>
    </div>
  );
};

