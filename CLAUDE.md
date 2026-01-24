# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive 3D Solar System visualization built with Three.js and astronomy-engine for accurate real-time planetary positions. Pure client-side application with no build system or npm dependencies.

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
- `index.html` - DOM structure, CDN library imports (Three.js r128, astronomy-engine 2.1.19)
- `main.js` - All application logic (~2450 lines)
- `style.css` - UI styling and responsive design

**main.js structure:**
| Lines | Content |
|-------|---------|
| 1-70 | Global state, date/time functions |
| 69-230 | `planetData`, `moonData`, `dwarfPlanetData` configuration arrays |
| 230-345 | `init()` - Scene setup, calls all creation functions |
| 345-475 | Time controls, starfield creation, lighting |
| 479-725 | Sun creation (layers, corona, flares, spikes) |
| 725-875 | Orbit path creation using astronomy-engine ecliptic coordinates |
| 875-1220 | Planet creation and per-planet effects (atmospheres, rings, clouds) |
| 1220-1370 | Moons: creation, position updates via astronomy-engine |
| 1370-1590 | Window resize, mini-map, animation effects |
| 1487-1590 | `animate()` loop - updates positions, rotations, camera follow |
| 1589-1670 | Asteroid belt and Kuiper belt particle systems |
| 1670-1850 | Click-to-focus, info panel |
| 1849-2000 | Mini-map rendering, date display, moon phase |
| 2000-2210 | Settings panel, fullscreen, touch handling, audio |
| 2209-2420 | Voyager spacecraft, lens flare, keyboard shortcuts |

**Key globals:**
- `planets[]` - Planet meshes with orbital data attached as properties
- `moons[]` - Moon meshes
- `dwarfPlanets[]` - Dwarf planet meshes (Pluto, etc.)
- `scene`, `camera`, `renderer`, `labelRenderer` - Three.js core objects
- `controls` - OrbitControls instance
- `timeScale`, `isPaused`, `simulationTime` - Simulation state
- `focusedPlanet`, `isFollowing` - Camera tracking state
- `selectedDate` - Current simulation date (used with astronomy-engine)

**External dependencies (all CDN):**
- Three.js r128 (core, OrbitControls, CSS2DRenderer)
- astronomy-engine 2.1.19 - Real astronomical calculations

## Astronomy Engine Integration

The simulation uses astronomy-engine for scientifically accurate positions:

- **Planet positions**: `Astronomy.HelioVector()` → `Astronomy.Ecliptic()` for true ecliptic coordinates
- **Moon positions**: `Astronomy.GeoMoon()` for Earth's Moon, `Astronomy.JupiterMoons()` for Galilean moons
- **Moon phases**: `Astronomy.MoonPhase()`
- **Visual magnitude**: `Astronomy.Illumination()`
- **Coordinate system**: Ecliptic coordinates (planets orbit in true orbital planes)
- **Scale**: 1 AU = 20 visual units (`AU_TO_VISUAL` constant at line 778)

## Key Patterns

**Planet creation:** Each planet is a Three.js Mesh with texture. Orbital position calculated via astronomy-engine at each frame based on `getSimulatedDate()`.

**Animation loop:** `animate()` calls astronomy-engine to get real positions for the simulated date, updates all object positions, handles camera following, renders mini-map.

**User interaction:** Click raycasting for planet selection, OrbitControls for camera, keyboard shortcuts (1-8 for planets, 0 for Sun, V for Voyager, M for music).

## Assets

- `textures/` - 2K resolution planet/moon textures (jpg/png)
- `audio/` - Background music tracks (mp3)
