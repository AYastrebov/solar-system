# 3D Solar System

An interactive 3D visualization of our Solar System built with Three.js. Explore the planets, their moons, and orbital mechanics in real-time.

![Solar System Preview](preview.png)

## Features

### Celestial Bodies
- **Sun** with animated corona, solar flares, and particle effects
- **8 Planets** with accurate orbital inclinations and axial tilts
  - Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
- **5 Dwarf Planets** with dashed orbit lines and high orbital inclinations
  - Ceres (asteroid belt), Pluto, Haumea, Makemake, Eris
- **Moons** for planets and dwarf planets
  - Earth (Moon), Mars (Phobos, Deimos), Jupiter (Galilean moons), Saturn (6 moons including Titan), Uranus (5 moons), Neptune (Triton, Nereid)
  - Pluto (Charon), Haumea (Hi'iaka, Namaka), Eris (Dysnomia)
- **Asteroid Belt** between Mars and Jupiter
- **Kuiper Belt** beyond Neptune
- **Voyager Spacecraft** (Voyager 1 and 2) at the edge of the solar system

### Visual Effects
- Atmospheric glows and cloud layers for planets
- Saturn's multi-layered ring system
- Uranus tilted at 97.8° (rotates on its side)
- Venus and Uranus retrograde rotation
- Dynamic starfield background

### Interactive Controls
- **Camera**: Drag to rotate, scroll to zoom, right-click to pan
- **Click on planets** to focus and follow them
- **Time controls**: Pause, reverse, speed up/slow down (0.1x to 8x)
- **Keyboard shortcuts**: Space (pause), Arrow keys (speed/direction)

### UI Features
- **Info Panel**: Click a planet to see facts (diameter, distance, day/year length, moons)
- **Mini-map**: Top-down overview of the entire solar system
- **Settings Panel**: Toggle labels, orbits, effects, and asteroid belts
- **Date Simulation**: Shows the simulated date based on orbital positions
- **Fullscreen Mode**: Immersive viewing experience

## Demo

Open `index.html` in a modern web browser. No build tools or server required.

**[Live Demo](https://ayastrebov.github.io/solar-system/)**

## Tech Stack

- **Three.js** (r128) - 3D rendering
- **Vanilla JavaScript** - No frameworks
- **CSS3** - UI styling
- Pure client-side, no dependencies to install

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

The simulation uses real astronomical data where practical:

- **Orbital periods** are proportionally accurate (relative to Earth = 1 year)
- **Orbital inclinations** match real values (Mercury 7°, etc.)
- **Axial tilts** are accurate (Earth 23.4°, Uranus 97.8°)
- **Retrograde rotation** for Venus and Uranus
- **Planet info** uses real NASA data

**Note:** Planet sizes and distances are scaled for visibility, not to actual scale (Jupiter would be 11x Earth's size, making inner planets invisible).

## Project Structure

```
solar-system/
├── index.html      # Main HTML file
├── style.css       # UI styling
├── main.js         # Three.js scene and logic (~2200 lines)
├── textures/       # 2K planet and moon textures
├── audio/          # Background music tracks
└── README.md       # Documentation
```

## Browser Support

Works in all modern browsers with WebGL support:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use, modify, and distribute.

## Credits

- Planet data from NASA
- Built with [Three.js](https://threejs.org/)

## Contributing

Contributions welcome! Ideas for improvements:
- Higher resolution planet textures
- Comet orbits and visualizations
- Spacecraft trajectories (New Horizons, Cassini, etc.)
- VR support
- Exoplanet comparison mode
