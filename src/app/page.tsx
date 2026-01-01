/**
 * EAVJ - Emotion-Adaptive Voice Journal
 *
 * Main application page. A minimalist interface with:
 * - Generative ambient background responding to emotion
 * - Central recorder button
 * - Subtle waveform visualization
 * - Privacy-first messaging
 */

"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AmbientBackground } from "@/components/AmbientBackground";
import { RecorderButton } from "@/components/RecorderButton";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { DebugPanel } from "@/components/DebugPanel";
import { useEmotionEngine } from "@/hooks/useEmotionEngine";
import { useAudioAnalysis } from "@/hooks/useAudioAnalysis";
import { useEmotionStore } from "@/stores/emotionStore";

export default function Home() {
  const { visualTheme, audioFeatures, processAudio } = useEmotionEngine();
  const { startRecording, stopRecording } = useAudioAnalysis();
  const { isRecording, audioFeatures: currentFeatures } = useEmotionStore();

  // Process audio features when they change
  useEffect(() => {
    if (currentFeatures.isActive) {
      processAudio(currentFeatures);
    }
  }, [currentFeatures, processAudio]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Generative ambient background */}
      <AmbientBackground theme={visualTheme} />

      {/* Main content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">


        {/* Waveform visualization (above button when recording) */}
        <div className="mb-8 h-16">
          <WaveformVisualizer
            isActive={isRecording}
            audioFeatures={currentFeatures}
          />
        </div>

        {/* Central recorder button */}
        <RecorderButton onStart={startRecording} onStop={stopRecording} />

        {/* Subtle instruction text (fades when recording) */}
        <motion.p
          className="mt-12 text-white/40 text-sm font-light tracking-wide"
          animate={{ opacity: isRecording ? 0.2 : 0.4 }}
          transition={{ duration: 0.5 }}
        >
          {isRecording ? "listening..." : "tap to begin"}
        </motion.p>

        {/* Privacy notice - bottom of screen */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <p className="text-white/20 text-xs font-light tracking-wider text-center max-w-xs">
            Processing happens locally. No audio is stored.
          </p>
        </motion.div>
      </div>

      {/* Debug panel (toggle with 'D' key) */}
      <DebugPanel />
    </main>
  );
}
