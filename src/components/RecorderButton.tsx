/**
 * RecorderButton - Minimalist "Listen" Interface
 *
 * A central circular button that initiates voice recording.
 * Shows subtle pulse animation when active.
 * No text labels - purely visual feedback.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEmotionStore } from "@/stores/emotionStore";

interface RecorderButtonProps {
  onStart: () => void;
  onStop: () => void;
}

export function RecorderButton({ onStart, onStop }: RecorderButtonProps) {
  const { isRecording, setRecording } = useEmotionStore();

  const handleClick = () => {
    if (isRecording) {
      onStop();
      setRecording(false);
    } else {
      onStart();
      setRecording(true);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulsing ring (when recording) */}
      <AnimatePresence>
        {isRecording && (
          <>
            {/* Multiple pulse rings for depth */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-white/20"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeOut",
                }}
                style={{
                  width: 120,
                  height: 120,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={handleClick}
        className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:from-white/15 hover:to-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-4 focus:ring-offset-transparent"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={
          isRecording
            ? {
                boxShadow: [
                  "0 0 20px rgba(255,255,255,0.1)",
                  "0 0 40px rgba(255,255,255,0.2)",
                  "0 0 20px rgba(255,255,255,0.1)",
                ],
              }
            : {}
        }
        transition={
          isRecording
            ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {}
        }
      >
        {/* Inner icon/indicator */}
        <motion.div
          className="relative"
          animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
          transition={
            isRecording
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : {}
          }
        >
          {/* Microphone-like shape */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-colors duration-500 ${
              isRecording ? "text-white" : "text-white/60"
            }`}
          >
            <path
              d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z"
              fill="currentColor"
              fillOpacity={isRecording ? 0.9 : 0.5}
            />
            <path
              d="M6 10V12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12V10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity={isRecording ? 0.9 : 0.5}
            />
            <path
              d="M12 18V22M12 22H8M12 22H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity={isRecording ? 0.9 : 0.5}
            />
          </svg>
        </motion.div>
      </motion.button>

      {/* Recording indicator dot */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full"
          >
            <motion.div
              className="absolute inset-0 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
