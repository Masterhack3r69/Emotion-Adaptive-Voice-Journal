# EAVJ | Emotion-Adaptive Voice Journal

A high-fidelity generative visual interface that acts as a sensory "mirror" for your voice. In contrast to traditional mood trackers that use restrictive text labels or categorical classification, EAVJ interprets the raw _quality_ of speech to render an immersive, shifting environment in real-time.

![EAVJ Wave Demo](public/screenshot.png)

## 🌌 Philosophy: The Mirror Concept

EAVJ is designed as a mature, atmospheric space for self-reflection. It adheres to three core design pillars:

1. **Zero Labels**: Avoiding judgment. The system never says "You sound sad." Instead, it reflects your state back to you through color and motion, allowing for subjective interpretation.
2. **Abstract Expression**: Utilizing fluid, amorphous gradients that mimic biological breathing patterns and aurora-like shifting.
3. **High Fidelity**: A "Blade Runner" meets "Headspace" aesthetic—dark, somber, and deeply atmospheric.

## 🛠 Technical Architecture

### 1. Audio Processing Engine

The system utilizes the **Web Audio API (`AnalyserNode`)** to extract real-time frequency and time-domain data directly from the microphone:

- **RMS (Root Mean Square)**: Maps to vocal intensity and "Arousal."
- **Spectral Centroid**: Determines the "brightness" or pitch of the voice, mapping to "Valence."
- **Zero Crossing Rate**: Calculates pitch variance to detect agitation or calmness.

### 2. The Emotion Engine (Russell's Circumplex Model)

Audio features are normalized and mapped onto the **Valence-Arousal** coordinate system:

- **Valence (X-axis)**: Maps Pitch/Brightness to Color Temperature (Deep Blue/Teal ↔ Warm Gold/Amber).
- **Arousal (Y-axis)**: Maps Volume/Variance to Motion Dynamics (Slow/Fluid ↔ Fast/Sharp).

The engine uses **Bilinear Interpolation** to blend between four predefined emotional quadrants, ensuring that transitions between "Melancholic" and "Joyful" are continuous and seamless.

### 3. Generative Visual System

The background is a custom-built generative canvas using **Framer Motion**:

- **Blob Morphing**: Uses `border-radius` interpolation to create organic, liquid shapes.
- **Exponential Smoothing**: Prevents visual "jitter" from raw audio noise, creating a smooth, high-inertia motion feel.
- **Mix-Blend Modes**: Utilizes `screen` and `overlay` blending for complex, high-depth color layering.

## 🔒 Privacy First

Privacy is not an add-on; it is the foundation.

- **Local-Only Processing**: Audio is processed in-memory using the client-side Web Audio API.
- **No Storage**: The microphone stream is never recorded, saved, or transmitted to any server.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- NPM / PNPM / Yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the journal at `http://localhost:3000`

## ⌨️ Controls

- **Central Button**: Toggle microphone listening.
- **`D` Key**: Open the **Debug Override Panel** to manually simulate emotion states and test visual transitions.

## 🏗 Technology Stack

- **Framework**: Next.js 15 (App Router / TypeScript)
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Audio Logic**: Web Audio API
- **Styling**: Tailwind CSS / Vanilla CSS Gradients

---

_Built as a high-end portfolio project focusing on Signal Processing and Generative Design._
