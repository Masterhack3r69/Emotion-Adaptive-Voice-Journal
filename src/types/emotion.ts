/**
 * Emotion-Adaptive Voice Journal - Type Definitions
 * Based on Russell's Circumplex Model of Affect
 */

/**
 * Core emotion state using Valence-Arousal model
 * - Valence: positive (+1) to negative (-1)
 * - Arousal: high energy (+1) to low energy (-1)
 */
export interface EmotionState {
  valence: number; // -1 (negative/sad) to +1 (positive/happy)
  arousal: number; // -1 (low energy/calm) to +1 (high energy/excited)
}

/**
 * Audio features extracted from microphone input
 */
export interface AudioFeatures {
  rms: number; // Root Mean Square (volume) - 0 to 1
  spectralCentroid: number; // Brightness/pitch center - Hz value
  pitchVariance: number; // Variation in pitch - 0 to 1
  pitch: number; // Fundamental Frequency (F0) in Hz
  clarity: number; // Spectral flatness/tonality - 0 (noise) to 1 (tone)
  isActive: boolean; // Whether audio is being captured
}

/**
 * Visual theme generated from emotion state
 * Applied to the ambient background
 */
export interface VisualTheme {
  // Colors (HSL format for smooth interpolation)
  primaryHue: number; // 0-360
  primarySaturation: number; // 0-100
  primaryLightness: number; // 0-100
  secondaryHue: number;
  secondarySaturation: number;
  secondaryLightness: number;

  // Effects
  blurAmount: number; // px - higher = more bokeh
  opacity: number; // 0-1 for overlay intensity

  // Animation
  animationSpeed: number; // 0.1 (very slow) to 1.0 (fast)
  scaleRange: number; // breathing amplitude
  driftAmount: number; // position drift range
}

/**
 * The complete visual state for rendering
 */
export interface VisualState {
  theme: VisualTheme;
  emotion: EmotionState;
  isTransitioning: boolean;
}

/**
 * Presets for different emotional quadrants
 */
export type EmotionQuadrant =
  | "melancholic" // Low valence, low arousal (blue, blurry, slow)
  | "calm" // High valence, low arousal (teal, soft, gentle)
  | "anxious" // Low valence, high arousal (red/orange, sharp, fast)
  | "joyful"; // High valence, high arousal (gold/yellow, bright, dynamic)
