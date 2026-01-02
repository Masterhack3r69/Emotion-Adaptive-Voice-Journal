/**
 * Zustand Store for Emotion-Adaptive Voice Journal
 * Manages global state for audio analysis and visual theming
 */

import { create } from "zustand";
import type { EmotionState, AudioFeatures, VisualTheme } from "@/types/emotion";

interface EmotionStore {
  // Recording state
  isRecording: boolean;
  setRecording: (value: boolean) => void;

  // Debug/simulation mode
  isSimulationMode: boolean;
  setSimulationMode: (value: boolean) => void;

  // Emotion state (from audio analysis or simulation)
  emotionState: EmotionState;
  setEmotionState: (state: EmotionState) => void;

  // Raw audio features
  audioFeatures: AudioFeatures;
  setAudioFeatures: (features: AudioFeatures) => void;

  // Current visual theme (derived from emotion state)
  visualTheme: VisualTheme | null;
  setVisualTheme: (theme: VisualTheme) => void;

  // Transition state
  isTransitioning: boolean;
  setTransitioning: (value: boolean) => void;
}

// Default "melancholic" state - deep blue, blurry, slow
const defaultEmotionState: EmotionState = {
  valence: -0.5,
  arousal: -0.5,
};

const defaultAudioFeatures: AudioFeatures = {
  rms: 0,
  spectralCentroid: 0,
  pitchVariance: 0,
  pitch: 0,
  clarity: 0,
  isActive: false,
};

export const useEmotionStore = create<EmotionStore>((set) => ({
  // Recording
  isRecording: false,
  setRecording: (value) => set({ isRecording: value }),

  // Simulation
  isSimulationMode: false,
  setSimulationMode: (value) => set({ isSimulationMode: value }),

  // Emotion
  emotionState: defaultEmotionState,
  setEmotionState: (state) => set({ emotionState: state }),

  // Audio
  audioFeatures: defaultAudioFeatures,
  setAudioFeatures: (features) => set({ audioFeatures: features }),

  // Visual
  visualTheme: null,
  setVisualTheme: (theme) => set({ visualTheme: theme }),

  // Transition
  isTransitioning: false,
  setTransitioning: (value) => set({ isTransitioning: value }),
}));
