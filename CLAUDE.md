# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive 3D Solar System visualization built with Three.js. Pure client-side application with no build system or npm dependencies.

## Development

**No build process required.** Run locally with any static file server:
```bash
npx serve .
# or
python -m http.server 8000
# or open index.html directly in browser
```

## Architecture

**Single-page app with three core files:**
- `index.html` - DOM structure, CDN library imports (Three.js r128)
- `main.js` - All application logic (~2000 lines)
- `style.css` - UI styling and responsive design

**main.js structure:**
- Lines 1-165: Configuration objects (`planetData`, `moonData`, global state)
- Lines 167-273: `init()` - Scene setup, calls all creation functions
- Lines 276-407: Time controls, starfield, lighting
- Lines 410-655: Sun creation with corona layers, flares, spikes
- Lines 656-743: Orbit paths and planet mesh creation
- Lines 744-1130: Planet effects (atmospheres, rings, clouds) and moon creation
- Lines 1131-1250: `animate()` loop - updates positions, rotations, effects
- Lines 1251-1383: Asteroid belt and Kuiper belt particle systems
- Lines 1384-1609: Click-to-focus, camera following, mini-map
- Lines 1610-1785: Settings panel, audio controls
- Lines 1786-1987: Voyager spacecraft, lens flare
- Lines 1988-2028: Keyboard shortcuts

**Key globals:**
- `planets[]` - Array of planet meshes with orbital data
- `moons[]` - Array of moon meshes
- `scene`, `camera`, `renderer` - Three.js core objects
- `controls` - OrbitControls instance
- `timeSpeed`, `isPaused`, `isReversed` - Simulation state
- `selectedPlanet` - Currently focused object

**External dependencies (all CDN):**
- Three.js r128 core
- OrbitControls.js
- CSS2DRenderer.js

## Assets

- `textures/` - 2K resolution planet textures (jpg/png)
- `audio/` - Background music tracks (mp3)

## Key Patterns

**Planet creation:** Each planet is a Three.js Mesh with texture, stored in `planets[]` array with orbital parameters attached as properties.

**Animation loop:** `animate()` updates all object positions based on `timeSpeed`, handles camera following, updates mini-map, and renders scene.

**User interaction:** Click raycasting for planet selection, OrbitControls for camera, keyboard shortcuts (1-8 for planets, 0 for Sun, V for Voyager).
