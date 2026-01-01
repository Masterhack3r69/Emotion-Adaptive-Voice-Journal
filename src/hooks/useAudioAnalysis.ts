/**
 * useAudioAnalysis - Web Audio API Integration Hook
 *
 * Captures microphone input and extracts audio features in real-time:
 * - RMS (volume/loudness)
 * - Spectral Centroid (brightness/pitch center)
 * - Zero Crossing Rate (pitch variance estimate)
 */

"use client";

import { useCallback, useRef, useEffect } from "react";
import { useEmotionStore } from "@/stores/emotionStore";
import {
  calculateRMS,
  calculateSpectralCentroid,
  calculateZeroCrossingRate,
  isActiveAudio,
} from "@/lib/audioUtils";
import type { AudioFeatures } from "@/types/emotion";

interface UseAudioAnalysisReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  isSupported: boolean;
}

export function useAudioAnalysis(): UseAudioAnalysisReturn {
  const { setAudioFeatures, isSimulationMode } = useEmotionStore();

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Check for Web Audio API support
  const isSupported =
    typeof window !== "undefined" && "AudioContext" in window;

  const startRecording = useCallback(async () => {
    // Automatically disable simulation mode if it was active
    if (isSimulationMode) {
      useEmotionStore.getState().setSimulationMode(false);
    }
    
    if (!isSupported) {
      console.warn("Web Audio API not supported");
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Create audio context and analyser
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Data buffers
      const frequencyData = new Float32Array(analyser.frequencyBinCount);
      const timeData = new Float32Array(analyser.fftSize);

      // Analysis loop
      const analyze = () => {
        if (!analyserRef.current || !audioContextRef.current) return;

        analyserRef.current.getFloatFrequencyData(frequencyData);
        analyserRef.current.getFloatTimeDomainData(timeData);

        const rms = calculateRMS(timeData);
        const spectralCentroid = calculateSpectralCentroid(
          frequencyData,
          audioContextRef.current.sampleRate
        );
        const pitchVariance = calculateZeroCrossingRate(timeData);
        const isActive = isActiveAudio(rms);

        const features: AudioFeatures = {
          rms,
          spectralCentroid,
          pitchVariance,
          isActive,
        };

        setAudioFeatures(features);

        animationIdRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, [isSupported, isSimulationMode, setAudioFeatures]);

  const stopRecording = useCallback(() => {
    // Stop animation loop
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;

    // Reset audio features
    setAudioFeatures({
      rms: 0,
      spectralCentroid: 0,
      pitchVariance: 0,
      isActive: false,
    });
  }, [setAudioFeatures]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    startRecording,
    stopRecording,
    isSupported,
  };
}
