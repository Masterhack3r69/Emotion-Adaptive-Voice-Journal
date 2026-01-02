/**
 * useEmotionEngine - Core Audio-to-Visual Mapping Hook
 *
 * This hook translates audio features (or simulation values) into a VisualTheme
 * using Russell's Circumplex Model of Affect.
 *
 * Valence (X-axis): Positive ↔ Negative emotion
 *   - Mapped from spectral centroid (brightness of sound)
 *   - High pitch, bright sound → Positive (warm colors)
 *   - Low pitch, dark sound → Negative (cool colors)
 *
 * Arousal (Y-axis): High ↔ Low energy
 *   - Mapped from RMS (volume) and pitch variance
 *   - Loud, variable → High arousal (sharp, fast)
 *   - Quiet, steady → Low arousal (blurry, slow)
 */

import { useCallback, useEffect, useRef } from "react";
import { useEmotionStore } from "@/stores/emotionStore";
import type {
  EmotionState,
  AudioFeatures,
  VisualTheme,
} from "@/types/emotion";
import { lerp, mapRange, clamp, exponentialSmooth } from "@/lib/colorUtils";

// Visual theme presets for the four quadrants
const THEME_PRESETS = {
  // Low valence, low arousal - Deep blue bokeh (The "Melancholic" State)
  melancholic: {
    primaryHue: 210, // Deep blue
    primarySaturation: 100,
    primaryLightness: 8, // Very dark (#001020 equivalent)
    secondaryHue: 220,
    secondarySaturation: 80,
    secondaryLightness: 20,
    blurAmount: 60,
    opacity: 0.9,
    animationSpeed: 0.1, // Very slow
    scaleRange: 0.1,
    driftAmount: 20,
  },

  // High valence, low arousal - Calm teal/green
  calm: {
    primaryHue: 180, // Teal
    primarySaturation: 60,
    primaryLightness: 25,
    secondaryHue: 160,
    secondarySaturation: 50,
    secondaryLightness: 35,
    blurAmount: 45,
    opacity: 0.7,
    animationSpeed: 0.25,
    scaleRange: 0.15,
    driftAmount: 30,
  },

  // Low valence, high arousal - Red/orange sharp (The "Anxious/Angry" State)
  anxious: {
    primaryHue: 15, // Red-orange
    primarySaturation: 90,
    primaryLightness: 30,
    secondaryHue: 0, // Red
    secondarySaturation: 85,
    secondaryLightness: 25,
    blurAmount: 8,
    opacity: 0.95,
    animationSpeed: 0.9, // Fast
    scaleRange: 0.3,
    driftAmount: 80,
  },

  // High valence, high arousal - Gold/yellow bright (The "Joyful" State)
  joyful: {
    primaryHue: 45, // Gold
    primarySaturation: 85,
    primaryLightness: 50,
    secondaryHue: 35, // Orange-gold
    secondarySaturation: 90,
    secondaryLightness: 45,
    blurAmount: 15,
    opacity: 0.8,
    animationSpeed: 0.75,
    scaleRange: 0.25,
    driftAmount: 60,
  },
};

/**
 * Sigmoid transfer function to make detection more sensitive around the center
 * k = steepness (higher = more sensitive)
 */
function sigmoid(x: number, k: number = 4): number {
  return 2 / (1 + Math.exp(-k * x)) - 1;
}

/**
 * Interpolate between theme values based on emotion state
 */
function interpolateThemes(emotion: EmotionState): VisualTheme {
  const { valence, arousal } = emotion;

  // Determine blend weights for each quadrant
  // valence: -1 to +1, arousal: -1 to +1
  const vPos = clamp((valence + 1) / 2, 0, 1); // 0 = negative, 1 = positive
  const aPos = clamp((arousal + 1) / 2, 0, 1); // 0 = low, 1 = high

  // Bilinear interpolation across the four quadrants
  // Bottom-left: melancholic (v=0, a=0)
  // Bottom-right: calm (v=1, a=0)
  // Top-left: anxious (v=0, a=1)
  // Top-right: joyful (v=1, a=1)

  const theme: VisualTheme = {
    primaryHue: 0,
    primarySaturation: 0,
    primaryLightness: 0,
    secondaryHue: 0,
    secondarySaturation: 0,
    secondaryLightness: 0,
    blurAmount: 0,
    opacity: 0,
    animationSpeed: 0,
    scaleRange: 0,
    driftAmount: 0,
  };

  // Interpolate each property
  const properties = Object.keys(theme) as (keyof VisualTheme)[];

  for (const prop of properties) {
    const bl = THEME_PRESETS.melancholic[prop]; // bottom-left
    const br = THEME_PRESETS.calm[prop]; // bottom-right
    const tl = THEME_PRESETS.anxious[prop]; // top-left
    const tr = THEME_PRESETS.joyful[prop]; // top-right

    // Bilinear interpolation
    const bottom = lerp(bl, br, vPos);
    const top = lerp(tl, tr, vPos);
    theme[prop] = lerp(bottom, top, aPos);
  }

  return theme;
}

/**
 * Map audio features to emotion state
 */
function audioToEmotion(features: AudioFeatures): EmotionState {
  // Valence: derived from spectral centroid (brightness)
  // Typical speech: 1000-3000 Hz centroid (narrowed for better sensitivity)
  // Higher = brighter, more energetic = more positive
  let valence = mapRange(
    features.spectralCentroid,
    1000, // low/sad voice start
    3000, // bright/happy voice start (lowered from 3500 to catch more inputs)
    -1,
    1
  );

  // Apply sigmoid to make it "snap" more to positive/negative, avoiding the "gray zone"
  valence = sigmoid(valence, 3); // Steepness of 3

  // Arousal: derived from RMS (volume) + pitch variance
  // Loud + variable = high arousal, quiet + steady = low arousal
  const volumeComponent = mapRange(features.rms, 0.02, 0.4, -1, 1); // Lowered max from 0.5
  const varianceComponent = mapRange(features.pitchVariance, 0, 0.5, -0.5, 0.5);
  let arousal = clamp(volumeComponent + varianceComponent, -1, 1);
  
  // Apply slightly gentler sigmoid to arousal
  arousal = sigmoid(arousal, 2.5);

  return { valence, arousal };
}

/**
 * Main hook for the emotion engine
 */
export function useEmotionEngine() {
  const {
    isSimulationMode,
    emotionState,
    setEmotionState,
    audioFeatures,
    setVisualTheme,
    visualTheme,
  } = useEmotionStore();

  // Smoothed values for transition
  const smoothedEmotion = useRef<EmotionState>({ valence: 0, arousal: 0 });

  // Update visual theme when emotion state changes
  const updateTheme = useCallback(() => {
    // Smooth the emotion values
    smoothedEmotion.current = {
      valence: exponentialSmooth(
        smoothedEmotion.current.valence,
        emotionState.valence,
        0.15 // Increased from 0.08 for more responsive feel
      ),
      arousal: exponentialSmooth(
        smoothedEmotion.current.arousal,
        emotionState.arousal,
        0.15
      ),
    };

    const theme = interpolateThemes(smoothedEmotion.current);
    setVisualTheme(theme);
  }, [emotionState, setVisualTheme]);

  // Process audio features into emotion (when not in simulation mode)
  const processAudio = useCallback(
    (features: AudioFeatures) => {
      if (isSimulationMode) return;

      if (features.isActive) {
        const emotion = audioToEmotion(features);
        setEmotionState(emotion);
      }
    },
    [isSimulationMode, setEmotionState]
  );

  // Set emotion directly (for simulation mode)
  const setSimulatedEmotion = useCallback(
    (valence: number, arousal: number) => {
      setEmotionState({ valence, arousal });
    },
    [setEmotionState]
  );

  // Animation loop for smooth updates
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      updateTheme();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [updateTheme]);

  return {
    visualTheme,
    emotionState,
    audioFeatures,
    processAudio,
    setSimulatedEmotion,
    isSimulationMode,
  };
}
