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
