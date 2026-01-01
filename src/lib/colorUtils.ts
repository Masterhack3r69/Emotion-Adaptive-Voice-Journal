/**
 * Color and Math Utilities for smooth visual transitions
 */

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const normalized = (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, normalized);
}

/**
 * Smooth step function for eased interpolation
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Interpolate between two HSL colors
 * Returns [hue, saturation, lightness]
 */
export function lerpHSL(
  h1: number,
  s1: number,
  l1: number,
  h2: number,
  s2: number,
  l2: number,
  t: number
): [number, number, number] {
  // Handle hue wrap-around (go the shorter way around the color wheel)
  let hueDiff = h2 - h1;
  if (hueDiff > 180) hueDiff -= 360;
  if (hueDiff < -180) hueDiff += 360;

  const h = (h1 + hueDiff * t + 360) % 360;
  const s = lerp(s1, s2, t);
  const l = lerp(l1, l2, t);

  return [h, s, l];
}

/**
 * Convert HSL to CSS string
 */
export function hslToString(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

/**
 * Exponential smoothing for real-time value updates
 * Higher alpha = more responsive, lower alpha = smoother
 */
export function exponentialSmooth(
  current: number,
  target: number,
  alpha: number = 0.1
): number {
  return current + alpha * (target - current);
}

/**
 * Generate a seeded random number for deterministic animations
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
