import { useState, useEffect, useRef } from 'react';
import type { Profile } from '../types';
import { extractVoiceFeatures, compareVoiceFeatures } from '../utils/audioUtils';

export const useVoiceRecognition = (
  profiles: Profile[], 
  autoStart: boolean = true,
  onAutoRecognized?: (person: Profile, similarity: number) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const autoRecognizeRef = useRef(false);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      setAudioStream(stream);
      setIsListening(true);
      setStatusMessage('Listening... Say "hello"');
      autoRecognizeRef.current = true;

      // Set up audio context for voice activity detection
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up Web Speech API for automatic detection
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = async (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
          if ((transcript.includes('hello') || transcript.includes('hi') || transcript.includes('hey')) && autoRecognizeRef.current && !isProcessing) {
            autoRecognizeRef.current = false;
            setIsProcessing(true);
            setStatusMessage('Detected "hello"! Processing...');
            
            // Record audio and recognize
            try {
              const audioBuffer = await recordAudioWithMediaRecorder(stream);
              const result = await recognizeVoice(audioBuffer, onAutoRecognized);
              if (result.person && onAutoRecognized) {
                onAutoRecognized(result.person, result.similarity);
              }
            } catch (error) {
              console.error('Auto-recognition error:', error);
              setStatusMessage('Error recognizing voice. Try again.');
              setIsProcessing(false);
              autoRecognizeRef.current = true;
            }
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            setStatusMessage('Listening... (speech recognition error)');
          }
        };

        recognition.onend = () => {
          if (isListening && autoRecognizeRef.current) {
            recognition.start();
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      // Also set up voice activity detection as backup
      startVoiceActivityDetection(analyser);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Unable to access microphone. Please check permissions.');
      setIsListening(false);
    }
  };

  const startVoiceActivityDetection = (analyser: AnalyserNode) => {
    // Voice activity detection as backup (currently using Web Speech API as primary)
    // This can be enhanced later for better detection
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkVoiceActivity = () => {
      if (!isListening || isProcessing) return;

      analyser.getByteFrequencyData(dataArray);
      // Can be used for visual feedback or as backup detection
      requestAnimationFrame(checkVoiceActivity);
    };

    checkVoiceActivity();
  };

  const stopListening = () => {
    autoRecognizeRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    setIsProcessing(false);
    setStatusMessage('');
  };

  // Auto-start when component mounts if autoStart is true and there are profiles with voice
  useEffect(() => {
    if (autoStart && !isListening && profiles.some(p => p.voiceFeatures)) {
      startListening();
    }
    return () => {
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const recognizeVoice = async (
    audioBuffer: AudioBuffer,
    onRecognized?: (person: Profile, similarity: number) => void
  ): Promise<{ person: Profile | null; similarity: number }> => {
    if (profiles.length === 0) {
      setStatusMessage('No voice profiles added yet!');
      return { person: null, similarity: 0 };
    }

    setStatusMessage('Analyzing voice...');

    try {
      // Extract features from the recorded audio
      const voiceFeatures = await extractVoiceFeatures(audioBuffer);

      // Compare with all stored profiles
      let bestMatch: Profile | null = null;
      let bestSimilarity = 0;
      const threshold = 0.4; // Lower threshold for better recognition

      for (const profile of profiles) {
        if (profile.voiceFeatures) {
          const similarity = compareVoiceFeatures(voiceFeatures, profile.voiceFeatures);
          if (similarity > bestSimilarity && similarity >= threshold) {
            bestSimilarity = similarity;
            bestMatch = profile;
          }
        }
      }

      if (bestMatch) {
        setStatusMessage(`Recognized: ${bestMatch.name} (${Math.round(bestSimilarity * 100)}% match)`);
        if (onRecognized) {
          onRecognized(bestMatch, bestSimilarity);
        }
        setIsProcessing(false);
        autoRecognizeRef.current = false;
        return { person: bestMatch, similarity: bestSimilarity };
      } else {
        setStatusMessage('Voice not recognized. Try again.');
        setIsProcessing(false);
        autoRecognizeRef.current = true;
        return { person: null, similarity: 0 };
      }
    } catch (error) {
      console.error('Error recognizing voice:', error);
      setStatusMessage('Error analyzing voice. Try again.');
      setIsProcessing(false);
      autoRecognizeRef.current = true;
      return { person: null, similarity: 0 };
    }
  };

  const recordAudioWithMediaRecorder = (stream: MediaStream, duration: number = 3000): Promise<AudioBuffer> => {
    return new Promise((resolve, reject) => {
      try {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        const audioChunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioContext = new AudioContext();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            audioContext.close();
            resolve(audioBuffer);
          } catch (error) {
            console.error('Error processing audio:', error);
            reject(error);
          }
        };

        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          reject(new Error('Recording failed'));
        };

        mediaRecorder.start();
        
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, duration);
      } catch (error) {
        console.error('Error creating MediaRecorder:', error);
        reject(error);
      }
    });
  };

  const recordAudio = (duration: number = 3000): Promise<AudioBuffer> => {
    if (!audioStream) {
      return Promise.reject(new Error('No audio stream available'));
    }
    return recordAudioWithMediaRecorder(audioStream, duration);
  };

  return {
    isListening,
    isProcessing,
    statusMessage,
    startListening,
    stopListening,
    recognizeVoice,
    recordAudio,
  };
};

