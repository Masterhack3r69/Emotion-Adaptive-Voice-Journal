/**
 * WaveformVisualizer - Subtle Audio Waveform Display
 *
 * Shows a simple, elegant waveform that reacts to microphone input.
 * Appears only when recording is active.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import type { AudioFeatures } from "@/types/emotion";

interface WaveformVisualizerProps {
  isActive: boolean;
  audioFeatures: AudioFeatures;
}

const BAR_COUNT = 32;

export function WaveformVisualizer({
  isActive,
  audioFeatures,
}: WaveformVisualizerProps) {
  const barsRef = useRef<number[]>(Array(BAR_COUNT).fill(0.1));

  // Update bar heights based on audio features
  useEffect(() => {
    if (isActive && audioFeatures.isActive) {
      const { rms, spectralCentroid } = audioFeatures;

      // Create a wave pattern influenced by audio
      barsRef.current = barsRef.current.map((_, i) => {
        const position = i / BAR_COUNT;
        const centerDistance = Math.abs(position - 0.5) * 2;

        // Base height from RMS
        const baseHeight = rms * 0.8;

        // Wave pattern
        const wave = Math.sin(position * Math.PI * 4 + Date.now() * 0.003) * 0.2;

        // Spectral influence (higher frequencies = more activity at edges)
        const spectralFactor = spectralCentroid / 4000;

        return Math.max(
          0.05,
          Math.min(1, baseHeight + wave + spectralFactor * (1 - centerDistance))
        );
      });
    } else {
      // Idle state - gentle wave
      barsRef.current = barsRef.current.map((_, i) => {
        const position = i / BAR_COUNT;
        return 0.05 + Math.sin(position * Math.PI * 2 + Date.now() * 0.001) * 0.03;
      });
    }
  }, [isActive, audioFeatures]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-center gap-[2px] h-16"
        >
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[2px] bg-white/30 rounded-full"
              animate={{
                height: `${barsRef.current[i] * 100}%`,
                opacity: 0.2 + barsRef.current[i] * 0.5,
              }}
              transition={{
                duration: 0.1,
                ease: "easeOut",
              }}
              style={{
                minHeight: 4,
                maxHeight: 64,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
