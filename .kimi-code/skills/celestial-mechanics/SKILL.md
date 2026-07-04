---
name: celestial-mechanics
description: Bridge astronomy-engine and Three.js for solar-system visualizations — positions, orbits, rotations, phases, and coordinate transforms.
---

# Celestial Mechanics for Three.js

Use this skill when working with real astronomy data from `astronomy-engine` inside a Three.js scene: positioning planets and moons, applying axial tilts, computing phase angles, or converting coordinate systems.

## Coordinate Systems

- **J2000 Equatorial (EQJ):** default output of `Astronomy.HelioVector()`.
- **Ecliptic:** orbital plane of Earth; convert with `Astronomy.Ecliptic(v)`.
- **Three.js:** Y-up, right-handed; typically negate Z to align with astronomy-engine conventions.

```javascript
// astronomy-engine Vector to Three.js Vector3 in scene units
const AU_TO_VISUAL = 20; // project-specific scale
const pos = new THREE.Vector3(v.x, v.y, -v.z).multiplyScalar(AU_TO_VISUAL);
```

## Positioning Planets

```javascript
const AU_TO_VISUAL = 20;
const ASTRONOMY_TIME_THRESHOLD_MS = 1000 * 60 * 60; // recompute once per simulated hour

let lastSimDate = null;
let cachedPositions = new Map();

function shouldUpdate(simDate) {
  if (!lastSimDate) return true;
  return Math.abs(simDate.getTime() - lastSimDate.getTime()) >= ASTRONOMY_TIME_THRESHOLD_MS;
}

function getHelioPosition(bodyName, simDate) {
  if (shouldUpdate(simDate)) {
    cachedPositions.clear();
    lastSimDate = simDate;
  }
  if (!cachedPositions.has(bodyName)) {
    const vec = Astronomy.HelioVector(bodyName, simDate);
    const ecl = Astronomy.Ecliptic(vec);
    cachedPositions.set(bodyName, new THREE.Vector3(ecl.vec.x, ecl.vec.y, -ecl.vec.z).multiplyScalar(AU_TO_VISUAL));
  }
  return cachedPositions.get(bodyName);
}
```

## Positioning Moons

### Earth's Moon

```javascript
const geoMoon = Astronomy.GeoMoon(simDate);
const ecl = Astronomy.Ecliptic(geoMoon);
const angle = Math.atan2(ecl.vec.y, ecl.vec.x);
moonOrbitContainer.rotation.y = -angle; // match Three.js rotation direction
```

### Jupiter's Moons

```javascript
const jupiterMoons = Astronomy.JupiterMoons(simDate);
const io = jupiterMoons.io;
const ecl = Astronomy.Ecliptic(io);
const angle = Math.atan2(ecl.vec.y, ecl.vec.x);
ioContainer.rotation.y = -angle;
```

## Axial Tilt and Rotation

```javascript
// Parent container holds the tilt
const tiltContainer = new THREE.Object3D();
tiltContainer.rotation.z = THREE.Math.degToRad(obliquityDegrees);
scene.add(tiltContainer);

// Mesh spins inside the container
const mesh = new THREE.Mesh(geometry, material);
tiltContainer.add(mesh);
mesh.rotation.y += rotationSpeed * deltaTime;

// Retrograde rotation (Venus, Uranus)
mesh.rotation.y -= rotationSpeed * deltaTime;
```

### Tidal Locking

```javascript
// Keep the same face toward the parent planet
moonMesh.rotation.y = -moonOrbitContainer.rotation.y;
```

## Phase Calculations

```javascript
// Sun direction in Moon's local space for shaders
const sunLocal = new THREE.Vector3(0, 0, 0);
moonMesh.worldToLocal(sunLocal);
moonPhaseMaterial.uniforms.sunDirection.value.copy(sunLocal).normalize();

// Phase angle (0 = new, PI = full)
const earthPos = Astronomy.GeoVector('Earth', simDate, true);
const moonPos = Astronomy.GeoMoon(simDate);
const sunPos = Astronomy.GeoVector('Sun', simDate, true);
const phaseAngle = Astronomy.AngleBetween(moonPos, sunPos, earthPos);
```

## Visual Scaling

```javascript
// Typical project scales
const AU_TO_VISUAL = 20;
const SUN_RADIUS_VISUAL = 5.5;
const EARTH_RADIUS_VISUAL = 0.5;

// Preserve relative proportions while staying visible
function scaledRadius(realRadiusKm, referenceKm, referenceVisual) {
  return (realRadiusKm / referenceKm) * referenceVisual;
}
```

## Common Pitfalls

- Confusing ecliptic vs equatorial outputs from astronomy-engine.
- Forgetting that Three.js rotation direction is opposite to astronomy-engine angle sign.
- Passing a raw JavaScript `Date` where astronomy-engine expects an internal time object, or vice versa.
- Failing to invalidate cached positions when the simulated date jumps backward or forward rapidly.
- Treating directions and points the same way when transforming into local object space.

## See Also

- `threejs` / `threejs-fundamentals` / `threejs-shaders` — Three.js specifics
- `web-design-guidelines` / `frontend-design` — UI and visual design
- [astronomy-engine documentation](https://github.com/cosinekitty/astronomy)
