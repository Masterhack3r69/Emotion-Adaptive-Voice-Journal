/**
 * AmbientBackground - Generative Visual Canvas
 *
 * Creates an immersive, abstract visual environment that responds to the
 * current emotional state. Uses multiple overlapping "blobs" with fluid
 * morphing shapes to achieve a wave-like aesthetic.
 *
 * Visual mapping:
 * - Valence → Color temperature (cool blues ↔ warm oranges)
 * - Arousal → Motion speed and shape complexity
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import type { VisualTheme } from "@/types/emotion";
import { hslToString, seededRandom } from "@/lib/colorUtils";

interface AmbientBackgroundProps {
  theme: VisualTheme | null;
}

// Configuration for the blob particles
const BLOB_COUNT = 15; // Increased for bokeh density
const BLOB_CONFIGS = Array.from({ length: BLOB_COUNT }, (_, i) => ({
  id: i,
  // Smaller sizes for "light" effect
  baseSize: 150 + seededRandom(i * 17) * 250, // 150-400px
  initialX: seededRandom(i * 31) * 100 - 10,
  initialY: seededRandom(i * 47) * 100 - 10,
  // More circular shapes (bokeh)
  shape1: "50%", 
  shape2: `${40 + seededRandom(i) * 20}%`, // Slight waviness
  
  rotation: seededRandom(i * 91) * 360,
  opacityMultiplier: 0.3 + seededRandom(i * 89) * 0.5, // 0.3-0.8x
}));

// Default theme (melancholic/low energy)
const DEFAULT_THEME: VisualTheme = {
  primaryHue: 210,
  primarySaturation: 100,
  primaryLightness: 8,
  secondaryHue: 220,
  secondarySaturation: 80,
  secondaryLightness: 20,
  blurAmount: 80, // High blur for melding
  opacity: 0.9,
  animationSpeed: 0.1,
  scaleRange: 0.1,
  driftAmount: 20,
};

export function AmbientBackground({ theme }: AmbientBackgroundProps) {
  const activeTheme = theme ?? DEFAULT_THEME;

  // Calculate animation duration based on speed
  const baseDuration = useMemo(() => {
    return 25 - activeTheme.animationSpeed * 20; // 5s to 25s
  }, [activeTheme.animationSpeed]);

  // Generate blob elements
  const blobs = useMemo(() => {
    return BLOB_CONFIGS.map((config, index) => {
      const isPrimary = index % 2 === 0;
      const hue = isPrimary ? activeTheme.primaryHue : activeTheme.secondaryHue;
      const saturation = isPrimary
        ? activeTheme.primarySaturation
        : activeTheme.secondarySaturation;
      const lightness = isPrimary
        ? activeTheme.primaryLightness
        : activeTheme.secondaryLightness;

      const color = hslToString(hue, saturation, lightness);
      const size = config.baseSize;
      const opacity = activeTheme.opacity * config.opacityMultiplier;
      const blur = activeTheme.blurAmount;
      const drift = activeTheme.driftAmount;

      return {
        ...config,
        color,
        size,
        opacity,
        blur,
        drift,
        duration: baseDuration * (0.9 + seededRandom(index * 13) * 0.3),
      };
    });
  }, [activeTheme, baseDuration]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Deep background gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `linear-gradient(to bottom right,
            ${hslToString(
              activeTheme.primaryHue,
              activeTheme.primarySaturation * 0.8,
              Math.max(0, activeTheme.primaryLightness - 5)
            )} 0%, 
            ${hslToString(
              activeTheme.secondaryHue,
              activeTheme.secondarySaturation * 0.8,
              Math.max(0, activeTheme.secondaryLightness - 10)
            )} 100%)`,
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
        }}
      />

      {/* Fluid Blobs */}
      <AnimatePresence>
        {blobs.map((blob) => (
          <motion.div
            key={blob.id}
            className="absolute pointer-events-none mix-blend-screen"
            style={{
              width: `${blob.size.toFixed(3)}px`,
              height: `${blob.size.toFixed(3)}px`,
              left: `${blob.initialX.toFixed(3)}%`,
              top: `${blob.initialY.toFixed(3)}%`,
              filter: `blur(${blob.blur.toFixed(0)}px)`,
              background: blob.color,
              borderRadius: blob.shape1, // Start shape
              opacity: blob.opacity,
            }}
            animate={{
              x: [
                -blob.drift,
                blob.drift,
                -blob.drift,
              ],
              y: [
                -blob.drift,
                blob.drift,
                -blob.drift,
              ],
              rotate: [blob.rotation, blob.rotation + 45, blob.rotation], // Gentle rotation
              scale: [1, 1.2, 1], // Breathing light effect
              opacity: [
                blob.opacity,
                blob.opacity * 1.5, // "Twinkle"
                blob.opacity,
              ],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
          />
        ))}
      </AnimatePresence>

      {/* Noise Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
