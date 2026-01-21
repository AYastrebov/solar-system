# 3D Solar System

An interactive 3D visualization of our Solar System built with Three.js and powered by **astronomy-engine** for accurate real-time planetary positions. Explore the planets, their moons, and orbital mechanics as they appear on any date.

![Solar System Preview](preview.png)

## Features

### Real Astronomy Data
- **Accurate planetary positions** calculated in real-time using [astronomy-engine](https://github.com/cosinekitty/astronomy)
- **True elliptical orbits** - planets follow their actual orbital paths, not circular approximations
- **Date simulation** - view the solar system on any date (past or future)
- **Moon phase display** - shows current lunar phase with emoji indicator
- **Dynamic planet info** - real-time distance from Sun (AU) and visual magnitude

### Celestial Bodies
- **Sun** with animated corona, solar flares, and particle effects
- **8 Planets** with accurate positions, inclinations, and axial tilts
  - Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
  - Proportional sizes: gas giants are visibly larger than terrestrial planets
- **Pluto** with real orbital data (highly elliptical orbit that crosses Neptune's)
- **Moons** with real astronomical positions where available
  - Earth's Moon - position from `Astronomy.GeoMoon()`
  - Jupiter's Galilean moons (Io, Europa, Ganymede, Callisto) - from `Astronomy.JupiterMoons()`
  - Mars (Phobos, Deimos), Saturn (6 moons), Uranus (5 moons), Neptune (Triton, Nereid)
  - Pluto (Charon)
- **Asteroid Belt** between Mars and Jupiter (~1.7-4.5 AU)
- **Kuiper Belt** beyond Neptune (~30-50 AU)
- **Voyager Spacecraft** (Voyager 1 and 2) beyond Pluto's orbit

### Visual Effects
- Atmospheric glows and cloud layers for planets
- Saturn's ring system with texture
- Uranus tilted at 97.8° (rotates on its side)
- Venus and Uranus retrograde rotation
- Dynamic starfield with Milky Way background
- Sun lens flare effect

### Interactive Controls
- **Camera**: Drag to rotate, scroll to zoom, right-click to pan
- **Click on planets** to focus and follow them
- **Time controls**: Pause, reverse, speed up/slow down (0.1x to 8x)
- **Date picker**: Jump to any date to see planetary positions
- **Keyboard shortcuts**: Space (pause), Arrow keys (speed/direction)

### UI Features
- **Info Panel**: Click a planet to see facts and real-time data
  - Static info: diameter, day/year length, moons, composition
  - Dynamic info: current distance from Sun, visual magnitude
- **Moon Phase**: Shows current lunar phase (New Moon, Full Moon, etc.)
- **Mini-map**: Top-down overview of the entire solar system
- **Settings Panel**: Toggle labels, orbits, effects, and asteroid belts
- **Fullscreen Mode**: Immersive viewing experience
- **Background Music**: Ambient space soundtrack

## Demo

Open `index.html` in a modern web browser. No build tools required.

**[Live Demo](https://ayastrebov.github.io/solar-system/)**

## Tech Stack

- **Three.js** (r128) - 3D rendering
- **astronomy-engine** (2.1.19) - Real astronomical calculations
- **Vanilla JavaScript** - No frameworks
- **CSS3** - Responsive UI styling
- Pure client-side, no build process or npm install required

## Usage

```bash
# Clone the repository
git clone https://github.com/yourusername/solar-system.git

# Open in browser
cd solar-system
open index.html  # or double-click the file
```

Or serve with any static file server:
```bash
npx serve .
# or
python -m http.server 8000
```

## Controls

| Action | Control |
|--------|---------|
| Rotate camera | Left-click + drag |
| Zoom | Scroll wheel |
| Pan | Right-click + drag |
| Focus on planet | Click on planet |
| Focus planet 1-8 | Keys 1-8 |
| Focus Sun | Key 0 |
| Focus Voyager 1 | Key V |
| Toggle music | Key M |
| Pause/Play | Space or ⏸ button |
| Speed up | → or ▶ button |
| Slow down | ← or ◀ button |
| Reverse time | ↓ or ⏪ button |
| Forward time | ↑ or ⏩ button |
| Unfocus | Escape |
| Fullscreen | ⛶ button |

## Scientific Accuracy

The simulation uses **astronomy-engine** for real astronomical calculations:

- **Planetary positions** - Calculated using `Astronomy.HelioVector()` for each frame
- **Elliptical orbits** - True orbital paths sampled from astronomy-engine
- **Moon positions** - Earth's Moon via `Astronomy.GeoMoon()`, Jupiter's moons via `Astronomy.JupiterMoons()`
- **Moon phases** - Calculated using `Astronomy.MoonPhase()`
- **Visual magnitude** - Planet brightness via `Astronomy.Illumination()`
- **Orbital inclinations** - Included in the 3D heliocentric vectors
- **Axial tilts** - Accurate values (Earth 23.4°, Uranus 97.8°)

### Scale Notes
- **Distances**: 1 AU = 20 visual units (proportionally accurate)
- **Planet sizes**: Scaled for visibility but proportionally correct relative to each other
  - Terrestrial planets: 0.38-1.0 units (Mercury-Earth scale)
  - Gas giants: 4.5-5.5 units (visibly larger)
  - Ice giants: 2.1-2.2 units

## Project Structure

```
solar-system/
├── index.html      # Main HTML file with CDN imports
├── style.css       # Responsive UI styling
├── main.js         # Three.js scene and astronomy logic
├── textures/       # 2K planet and moon textures
├── audio/          # Background music tracks
├── CLAUDE.md       # AI assistant context file
└── README.md       # Documentation
```

## Browser Support

Works in all modern browsers with WebGL support:
- Chrome (recommended)
- Firefox
- Safari
- Edge

Mobile browsers supported with touch controls.

## License

MIT License - feel free to use, modify, and distribute.

## Credits

- Astronomical calculations: [astronomy-engine](https://github.com/cosinekitty/astronomy) by Don Cross
- Planet data from NASA
- Built with [Three.js](https://threejs.org/)

## Contributing

Contributions welcome from everyone! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Ideas for contributions:**
- Higher resolution planet textures (4K/8K)
- More moons with real orbital data
- Comet and asteroid trajectories
- Spacecraft mission paths (New Horizons, Voyager trajectories)
- Eclipse predictions and visualization
- VR/AR support

No contribution is too small - even fixing a typo helps!
