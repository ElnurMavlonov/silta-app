import { ArrowLeft, Check } from 'lucide-react';
import type { Profile } from '../types';

interface RecognizedScreenProps {
  recognizedPerson: Profile;
  onHome: () => void;
  onScanAnother: () => void;
}

export const RecognizedScreen = ({ recognizedPerson, onHome, onScanAnother }: RecognizedScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 text-white flex flex-col">
      <button 
        onClick={onHome}
        className="absolute top-6 left-6 bg-black bg-opacity-30 backdrop-blur-sm text-white p-3 rounded-full z-10 hover:bg-opacity-40 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto">
        <div className="relative w-40 h-40 mb-8">
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

        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="bg-teal-500 bg-opacity-50 text-white text-2xl md:text-3xl font-semibold px-6 py-3 rounded shadow-md">
            {recognizedPerson.name}
          </div>
          <div className="bg-sky-400 bg-opacity-50 text-white text-xl md:text-2xl font-semibold px-5 py-3 rounded shadow-md">
            {recognizedPerson.relationship}
          </div>
        </div>

        {recognizedPerson.notes && (
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 max-w-xl w-full">
            <p className="text-xl leading-relaxed">{recognizedPerson.notes}</p>
          </div>
        )}
      </div>

      <button 
        onClick={onScanAnother}
        className="m-6 bg-white text-green-700 font-bold py-5 rounded-2xl text-xl hover:bg-gray-100 transition active:scale-95 max-w-2xl mx-auto w-full"
      >
        Scan Another Person
      </button>
    </div>
  );
};

