/**
 * Audio Analysis Utilities
 * Extracts features from Web Audio API data
 */

/**
 * Calculate Root Mean Square (RMS) - represents volume/loudness
 * @param dataArray - Float32Array from AnalyserNode
 * @returns Normalized RMS value between 0 and 1
 */
export function calculateRMS(dataArray: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i] * dataArray[i];
  }
  const rms = Math.sqrt(sum / dataArray.length);
  // Normalize to 0-1 range (typical speech RMS is 0.01-0.3)
  return Math.min(rms * 3, 1);
}

/**
 * Calculate Spectral Centroid - represents "brightness" of sound
 * Higher values = brighter, more energetic sound (often correlates with positivity)
 * @param frequencyData - Float32Array from getFloatFrequencyData
 * @param sampleRate - Audio context sample rate
 * @returns Frequency in Hz representing the spectral center of mass
 */
export function calculateSpectralCentroid(
  frequencyData: Float32Array,
  sampleRate: number
): number {
  const nyquist = sampleRate / 2;
  const binWidth = nyquist / frequencyData.length;

  let weightedSum = 0;
  let magnitudeSum = 0;

  for (let i = 0; i < frequencyData.length; i++) {
    // Convert from dB to linear magnitude
    const magnitude = Math.pow(10, frequencyData[i] / 20);
    const frequency = i * binWidth;

    weightedSum += magnitude * frequency;
    magnitudeSum += magnitude;
  }

  if (magnitudeSum === 0) return 0;
  return weightedSum / magnitudeSum;
}

/**
 * Calculate pitch variance over time
 * Uses zero-crossing rate as a simple pitch estimator
 * @param timeData - Float32Array from getFloatTimeDomainData
 * @returns Normalized variance value between 0 and 1
 */
export function calculateZeroCrossingRate(timeData: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < timeData.length; i++) {
    if (
      (timeData[i] >= 0 && timeData[i - 1] < 0) ||
      (timeData[i] < 0 && timeData[i - 1] >= 0)
    ) {
      crossings++;
    }
  }
  // Normalize: typical speech has 50-300 crossings per frame
  return Math.min(crossings / 200, 1);
}

/**
 * Detect if there's meaningful audio signal (not just noise)
 * @param rms - Current RMS value
 * @param threshold - Noise floor threshold
 */
export function isActiveAudio(rms: number, threshold: number = 0.02): boolean {
  return rms > threshold;
}

/**
 * Autocorrelation based pitch detection
 * Finds the fundamental frequency (F0)
 */
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  // We only care about the first half for autocorrelation usually, 
  // but to be safe and simple:
  let size = buffer.length;
  let rms = 0;

  for (let i = 0; i < size; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / size);

  if (rms < 0.01) return 0; // Not enough signal

  // Unbiased autocorrelation
  // Find the first point where correlation drops, then the first peak after that
  // We trim to search for typical human voice range (e.g. 50Hz to 1000Hz)
  // At 44100Hz, 1000Hz = 44 samples, 50Hz = 882 samples
  
  // Need enough buffer for low frequencies
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rmsPadding = 0.005;
  let foundGoodCorrelation = false;
  let correlations = new Float32Array(size);

  for (let offset = 0; offset < size; offset++) {
    let correlation = 0;

    for (let i = 0; i < size - offset; i++) {
      correlation += buffer[i] * buffer[i + offset];
    }
    
    // Normalize?
    correlation = correlation / (size - offset);
    correlations[offset] = correlation;
    
    if (correlation > 1 - rmsPadding && correlation < 1 + rmsPadding) { 
        // Peak at 0 usually
    }
  }

  // Find first dip
  let lastCorrelation = 1;
  for (let i = 0; i < size; i++) {
    if (correlations[i] < lastCorrelation) {
      lastCorrelation = correlations[i];
    } else {
      // First valley passed, now climb to next peak
      // ... actually, let's use a simpler standard McLeod Pitch Method or YIN simplification?
      // Standard simple ac:
      break;
    }
  }

  // Simplified search for the first major peak after the first dip
  // We skip the first few samples to avoid the "lag 0" peak
  
  let maxCorrelation = 0;
  let startIdx = Math.floor(sampleRate / 1000); // Max 1000Hz
  let endIdx = Math.floor(sampleRate / 50);     // Min 50Hz
  
  // Guard against buffer size
  if (endIdx > size) endIdx = size;

  for (let i = startIdx; i < endIdx; i++) {
     let correlation = 0;
     // Optimization: only sum partial buffer for speed if needed, but full is better quality
     for (let j=0; j<size-i; j++) {
         correlation += buffer[j] * buffer[j+i];
     }
     
     if (correlation > maxCorrelation) {
         maxCorrelation = correlation;
         bestOffset = i;
     }
  }

  // Only trust if correlation is strong enough relative to signal energy
  // The 'correlation' at lag 0 is effectively the signal power (sum squares)
  // But we did unnormalized sum. 
  // Let's re-normalize slightly or just check relative strength
  
  if (maxCorrelation > 0.01) { // Very rough threshold
      return sampleRate / bestOffset;
  }
  
  return 0;
}

/**
 * Modern robust autocorrelation (Standard implementation)
 */
export function improvedAutoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
        const val = buffer[i];
        sumOfSquares += val * val;
    }
    
    // RMS check
    if (Math.sqrt(sumOfSquares / SIZE) < 0.01) {
        return 0;
    }

    // Normalized autocorrelation
    // R[k] = (1/N) * sum(x[n] * x[n+k])
    
    // Find the first peak after the first zero-crossing or dip
    // We strictly look for the largest peak in the valid voice range
    const minPeriod = Math.floor(sampleRate / 1000); // ~44 samples
    const maxPeriod = Math.floor(sampleRate / 60);   // ~735 samples
    
    if (maxPeriod > SIZE) return 0;

    let bestPeriod = 0;
    let maxCorr = -1;

    for (let period = minPeriod; period <= maxPeriod; period++) {
        let correlation = 0;
        
        // Sum products
        for (let i = 0; i < SIZE - period; i++) {
            correlation += buffer[i] * buffer[i + period];
        }
        
        // Normalize by the partial signals' energy to get correlation coefficient -1 to 1
        // (Simplified: just compare raw sums if amplitude is roughly constant, but usually not)
        // Correct normalization is complex, but for pitch *detection* finding max is often enough
        
        if (correlation > maxCorr) {
            maxCorr = correlation;
            bestPeriod = period;
        }
    }

    if (maxCorr > 0.5 * sumOfSquares) { // Threshold for "periodicity"
        return sampleRate / bestPeriod;
    }
    
    return 0;
}


/**
 * Calculate Spectral Flatness (Wiener entropy)
 * Low flatness = tonal (sine wave, music, clear voice)
 * High flatness = noisy (white noise, unvoiced speech)
 */
export function calculateSpectralFlatness(frequencyData: Float32Array): number {
  let sum = 0;
  let logSum = 0;
  const len = frequencyData.length;
  
  // frequencyData is usually in Decibels (dB). 
  // We need linear magnitude for the geometric/arithmetic mean calculation.
  // magnitude = 10^(dB/20)

  let count = 0;

  for (let i = 0; i < len; i++) {
    // Basic filter: ignore very low frequencies/DC
    if (i < 5) continue; 
    
    const db = frequencyData[i];
    // Min-clamp to avoid -Infinity
    if (db < -100) continue; 

    const mag = Math.pow(10, db / 20);
    
    if (mag > 0) {
        sum += mag;
        logSum += Math.log(mag);
        count++;
    }
  }

  if (count === 0) return 0;

  const geometricMean = Math.exp(logSum / count);
  const arithmeticMean = sum / count;

  if (arithmeticMean === 0) return 0;
  
  return geometricMean / arithmeticMean;
}
