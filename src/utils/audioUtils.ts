import type { VoiceFeatures, VoiceContext } from '../types';

/**
 * Extract audio features from an AudioBuffer for speaker identification
 */
export async function extractVoiceFeatures(audioBuffer: AudioBuffer): Promise<VoiceFeatures> {
  const channelData = audioBuffer.getChannelData(0); // Use first channel
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  // Calculate basic features
  const energy = calculateEnergy(channelData);
  const pitch = calculatePitch(channelData, sampleRate);
  const zeroCrossingRate = calculateZeroCrossingRate(channelData);
  
  // Calculate MFCC (simplified version - in production, use a proper MFCC library)
  const mfcc = calculateSimpleMFCC(channelData);

  return {
    mfcc,
    pitch,
    energy,
    duration,
    zeroCrossingRate,
  };
}

/**
 * Calculate energy (RMS) of the audio signal
 */
function calculateEnergy(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

/**
 * Calculate average pitch using autocorrelation
 */
function calculatePitch(samples: Float32Array, sampleRate: number): number {
  // Simple pitch detection using autocorrelation
  const minPeriod = Math.floor(sampleRate / 800); // 800 Hz max
  const maxPeriod = Math.floor(sampleRate / 80); // 80 Hz min
  
  let maxCorrelation = 0;
  let bestPeriod = 0;

  for (let period = minPeriod; period < maxPeriod && period < samples.length / 2; period++) {
    let correlation = 0;
    for (let i = 0; i < samples.length - period; i++) {
      correlation += samples[i] * samples[i + period];
    }
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestPeriod = period;
    }
  }

  return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
}

/**
 * Calculate zero crossing rate
 */
function calculateZeroCrossingRate(samples: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i - 1] >= 0 && samples[i] < 0) || (samples[i - 1] < 0 && samples[i] >= 0)) {
      crossings++;
    }
  }
  return crossings / samples.length;
}

/**
 * Simplified MFCC calculation (13 coefficients)
 * In production, use a proper MFCC library
 */
function calculateSimpleMFCC(samples: Float32Array): Float32Array {
  const frameSize = 512;
  const numCoeffs = 13;
  const mfcc = new Float32Array(numCoeffs);
  
  // Simple frequency domain features
  const fftSize = Math.min(frameSize, samples.length);
  const fft = simpleFFT(samples.slice(0, fftSize));
  
  // Extract features from frequency domain
  for (let i = 0; i < numCoeffs; i++) {
    const freqBin = Math.floor((i + 1) * (fftSize / 2) / (numCoeffs + 1));
    mfcc[i] = Math.log(Math.abs(fft[freqBin]) + 1e-10);
  }
  
  return mfcc;
}

/**
 * Simple FFT implementation
 */
function simpleFFT(samples: Float32Array): Float32Array {
  const N = samples.length;
  const output = new Float32Array(N);
  
  for (let k = 0; k < N; k++) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      real += samples[n] * Math.cos(angle);
      imag -= samples[n] * Math.sin(angle);
    }
    output[k] = Math.sqrt(real * real + imag * imag);
  }
  
  return output;
}

/**
 * Compare two voice features and return similarity score (0-1)
 */
export function compareVoiceFeatures(features1: VoiceFeatures, features2: VoiceFeatures): number {
  // Compare MFCC using cosine similarity
  const mfccSimilarity = cosineSimilarity(features1.mfcc, features2.mfcc);
  
  // Compare pitch (normalized difference)
  const pitchDiff = Math.abs(features1.pitch - features2.pitch);
  const pitchSimilarity = Math.max(0, 1 - pitchDiff / 200); // 200 Hz tolerance
  
  // Compare energy (normalized difference)
  const energyDiff = Math.abs(features1.energy - features2.energy);
  const energySimilarity = Math.max(0, 1 - energyDiff / 0.5); // 0.5 tolerance
  
  // Weighted average
  return (mfccSimilarity * 0.6 + pitchSimilarity * 0.2 + energySimilarity * 0.2);
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Analyze voice context from how someone says "hello"
 */
export function analyzeVoiceContext(
  audioBuffer: AudioBuffer,
  transcribedText: string
): VoiceContext {
  const channelData = audioBuffer.getChannelData(0);
  const duration = audioBuffer.duration;
  const energy = calculateEnergy(channelData);
  const pitch = calculatePitch(channelData, audioBuffer.sampleRate);
  
  // Determine speed
  const wordsPerSecond = transcribedText.split(' ').length / duration;
  const speed: 'fast' | 'normal' | 'slow' = 
    wordsPerSecond > 3 ? 'fast' : 
    wordsPerSecond < 1.5 ? 'slow' : 'normal';
  
  // Determine volume
  const volume: 'loud' | 'normal' | 'quiet' = 
    energy > 0.1 ? 'loud' : 
    energy < 0.03 ? 'quiet' : 'normal';
  
  // Determine tone based on pitch and energy
  let tone: 'warm' | 'neutral' | 'cold' | 'excited' | 'calm';
  if (pitch > 200 && energy > 0.08) {
    tone = 'excited';
  } else if (pitch < 150 && energy < 0.05) {
    tone = 'calm';
  } else if (pitch > 180 && energy > 0.06) {
    tone = 'warm';
  } else if (pitch < 140) {
    tone = 'cold';
  } else {
    tone = 'neutral';
  }
  
  // Determine emotion
  let emotion: 'happy' | 'neutral' | 'sad' | 'energetic' | 'tired';
  if (pitch > 200 && speed === 'fast') {
    emotion = 'energetic';
  } else if (pitch > 180 && energy > 0.07) {
    emotion = 'happy';
  } else if (pitch < 140 && energy < 0.04 && speed === 'slow') {
    emotion = 'tired';
  } else if (pitch < 150 && energy < 0.05) {
    emotion = 'sad';
  } else {
    emotion = 'neutral';
  }
  
  // Calculate confidence (based on clarity and energy)
  const zeroCrossingRate = calculateZeroCrossingRate(channelData);
  const confidence = Math.min(1, Math.max(0, 
    (energy * 5) * (1 - Math.abs(zeroCrossingRate - 0.1) * 10)
  ));
  
  // Generate description
  const description = generateVoiceDescription(tone, emotion, speed, volume, confidence);
  
  return {
    tone,
    emotion,
    confidence,
    speed,
    volume,
    description,
  };
}

/**
 * Generate a human-readable description of voice characteristics
 */
function generateVoiceDescription(
  tone: string,
  emotion: string,
  speed: string,
  volume: string,
  confidence: number
): string {
  const parts: string[] = [];
  
  if (tone === 'warm') parts.push('speaks with a warm, friendly tone');
  if (tone === 'excited') parts.push('sounds excited and enthusiastic');
  if (tone === 'calm') parts.push('speaks calmly and peacefully');
  if (tone === 'cold') parts.push('has a more reserved, formal tone');
  
  if (emotion === 'happy') parts.push('sounds happy and cheerful');
  if (emotion === 'energetic') parts.push('has high energy');
  if (emotion === 'tired') parts.push('sounds tired or low-energy');
  if (emotion === 'sad') parts.push('sounds a bit down');
  
  if (speed === 'fast') parts.push('speaks quickly');
  if (speed === 'slow') parts.push('speaks slowly and deliberately');
  
  if (volume === 'loud') parts.push('speaks loudly');
  if (volume === 'quiet') parts.push('speaks quietly');
  
  if (confidence > 0.7) parts.push('speaks with confidence');
  if (confidence < 0.4) parts.push('sounds uncertain or hesitant');
  
  if (parts.length === 0) {
    return 'speaks in a neutral manner';
  }
  
  return parts.join(', ');
}

