/**
 * DebugPanel - Development Tool for Visual Testing
 *
 * Provides sliders for Arousal and Valence to test visual transitions
 * without needing microphone input. Toggle with 'D' key.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmotionStore } from "@/stores/emotionStore";

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const {
    isSimulationMode,
    setSimulationMode,
    emotionState,
    setEmotionState,
    visualTheme,
  } = useEmotionStore();

  // Toggle with 'D' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d" && !e.ctrlKey && !e.metaKey) {
        setIsVisible((v) => !v);
        if (!isSimulationMode) {
          setSimulationMode(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSimulationMode, setSimulationMode]);

  const handleValenceChange = (value: number) => {
    setEmotionState({ ...emotionState, valence: value });
  };

  const handleArousalChange = (value: number) => {
    setEmotionState({ ...emotionState, arousal: value });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-md 
                     rounded-xl p-4 w-72 border border-white/10 font-mono text-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src="/logo-eavj.svg" alt="Logo" className="w-5 h-auto opacity-80" />
              <h3 className="text-white/70 uppercase tracking-wider text-[10px]">
                Debug Panel
              </h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Valence Slider */}
          <div className="mb-4">
            <div className="flex justify-between text-white/50 mb-1">
              <span>Valence (Mood)</span>
              <span className={emotionState.valence >= 0 ? "text-amber-400" : "text-blue-400"}>
                {emotionState.valence.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={emotionState.valence}
              onChange={(e) => handleValenceChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-blue-600 to-amber-500 
                         rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-white/30 text-[9px] mt-1">
              <span>Negative</span>
              <span>Positive</span>
            </div>
          </div>

          {/* Arousal Slider */}
          <div className="mb-4">
            <div className="flex justify-between text-white/50 mb-1">
              <span>Arousal (Energy)</span>
              <span className={emotionState.arousal >= 0 ? "text-red-400" : "text-cyan-400"}>
                {emotionState.arousal.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={emotionState.arousal}
              onChange={(e) => handleArousalChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-cyan-600 to-red-500 
                         rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-white/30 text-[9px] mt-1">
              <span>Calm</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Theme Details */}
          {visualTheme && (
            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="text-white/40 text-[9px] uppercase tracking-wider mb-2">
                Current Theme
              </div>
              <div className="grid grid-cols-2 gap-1 text-white/60">
                <div>Blur: {visualTheme.blurAmount.toFixed(0)}px</div>
                <div>Speed: {(visualTheme.animationSpeed * 100).toFixed(0)}%</div>
                <div>Hue: {visualTheme.primaryHue.toFixed(0)}°</div>
                <div>Light: {visualTheme.primaryLightness.toFixed(0)}%</div>
              </div>
            </div>
          )}

          {/* Quick States */}
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="text-white/40 text-[9px] uppercase tracking-wider mb-2">
              Quick States
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEmotionState({ valence: -0.8, arousal: -0.8 })}
                className="px-2 py-1.5 bg-blue-900/50 text-blue-300 rounded 
                           hover:bg-blue-900/70 transition-colors text-[10px]"
              >
                Melancholic
              </button>
              <button
                onClick={() => setEmotionState({ valence: 0.6, arousal: -0.5 })}
                className="px-2 py-1.5 bg-teal-900/50 text-teal-300 rounded 
                           hover:bg-teal-900/70 transition-colors text-[10px]"
              >
                Calm
              </button>
              <button
                onClick={() => setEmotionState({ valence: -0.5, arousal: 0.9 })}
                className="px-2 py-1.5 bg-red-900/50 text-red-300 rounded 
                           hover:bg-red-900/70 transition-colors text-[10px]"
              >
                Anxious
              </button>
              <button
                onClick={() => setEmotionState({ valence: 0.9, arousal: 0.8 })}
                className="px-2 py-1.5 bg-amber-900/50 text-amber-300 rounded 
                           hover:bg-amber-900/70 transition-colors text-[10px]"
              >
                Joyful
              </button>
            </div>
          </div>

          <div className="mt-3 text-white/20 text-[9px] text-center">
            Press D to toggle
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
