# celestial-mechanics Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a project-scoped Kimi skill that bridges `astronomy-engine` and Three.js for solar-system visualizations.

**Architecture:** A single `SKILL.md` file in `.kimi-code/skills/celestial-mechanics/` containing concise reference sections and copy-pasteable vanilla JS snippets, following the format of existing skills in the project.

**Tech Stack:** Markdown, `astronomy-engine` (2.1.19), Three.js (r128), vanilla JavaScript.

## Global Constraints

- Skill must be discoverable as a top-level skill under `.kimi-code/skills/`.
- Examples must match the project's vanilla JS / no-build style.
- Skill must not duplicate full `astronomy-engine` docs; focus on the Three.js bridge.
- Keep snippets short, explicit, and copy-paste friendly.

---

### Task 1: Create the celestial-mechanics skill file

**Files:**
- Create: `.kimi-code/skills/celestial-mechanics/SKILL.md`

**Interfaces:**
- Consumes: None
- Produces: `.kimi-code/skills/celestial-mechanics/SKILL.md`

- [ ] **Step 1: Write the skill frontmatter and introduction**

  Create `.kimi-code/skills/celestial-mechanics/SKILL.md` starting with:

  ```markdown
  ---
  name: celestial-mechanics
  description: Bridge astronomy-engine and Three.js for solar-system visualizations — positions, orbits, rotations, phases, and coordinate transforms.
  ---

  # Celestial Mechanics for Three.js

  Use this skill when working with real astronomy data from `astronomy-engine` inside a Three.js scene: positioning planets and moons, applying axial tilts, computing phase angles, or converting coordinate systems.
  ```

- [ ] **Step 2: Add the coordinate systems cheat sheet**

  Add a section titled `## Coordinate Systems` covering:
  - J2000 Equatorial (EQJ): default output of `Astronomy.HelioVector()`.
  - Ecliptic: orbital plane of Earth; convert with `Astronomy.Ecliptic(v)`.
  - Three.js: Y-up, right-handed; typically negate Z to align with astronomy-engine conventions.

  Include this snippet:

  ```javascript
  // astronomy-engine Vector to Three.js Vector3 in scene units
  const AU_TO_VISUAL = 20; // project-specific scale
  const pos = new THREE.Vector3(v.x, v.y, -v.z).multiplyScalar(AU_TO_VISUAL);
  ```

- [ ] **Step 3: Add planet positioning section**

  Add `## Positioning Planets` with:

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

- [ ] **Step 4: Add moon positioning section**

  Add `## Positioning Moons` with subsections for Earth's Moon and Jupiter's moons.

  Earth's Moon:

  ```javascript
  const geoMoon = Astronomy.GeoMoon(simDate);
  const ecl = Astronomy.Ecliptic(geoMoon);
  const angle = Math.atan2(ecl.vec.y, ecl.vec.x);
  moonOrbitContainer.rotation.y = -angle; // match Three.js rotation direction
  ```

  Jupiter's moons:

  ```javascript
  const jupiterMoons = Astronomy.JupiterMoons(simDate);
  const io = jupiterMoons.io;
  const ecl = Astronomy.Ecliptic(io);
  const angle = Math.atan2(ecl.vec.y, ecl.vec.x);
  ioContainer.rotation.y = -angle;
  ```

- [ ] **Step 5: Add axial tilt and rotation section**

  Add `## Axial Tilt and Rotation` with:

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

- [ ] **Step 6: Add tidal locking subsection**

  Add under the same section:

  ```javascript
  // Keep the same face toward the parent planet
  moonMesh.rotation.y = -moonOrbitContainer.rotation.y;
  ```

- [ ] **Step 7: Add phase calculations section**

  Add `## Phase Calculations` with:

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

- [ ] **Step 8: Add visual scaling section**

  Add `## Visual Scaling` with:

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

- [ ] **Step 9: Add common pitfalls section**

  Add `## Common Pitfalls` bullet list covering:
  - Ecliptic vs equatorial outputs.
  - Three.js rotation direction vs astronomy-engine angle sign.
  - JavaScript `Date` vs astronomy-engine internal time.
  - Cache invalidation when simulated date jumps.
  - Transforming directions vs points into local space.

- [ ] **Step 10: Add See Also section**

  Add:

  ```markdown
  ## See Also

  - `threejs` / `threejs-fundamentals` / `threejs-shaders` — Three.js specifics
  - `web-design-guidelines` / `frontend-design` — UI and visual design
  - [astronomy-engine documentation](https://github.com/cosinekitty/astronomy)
  ```

- [ ] **Step 11: Verify the file contents**

  Run:

  ```bash
  ls -la .kimi-code/skills/celestial-mechanics/
  head -20 .kimi-code/skills/celestial-mechanics/SKILL.md
  ```

  Expected: file exists, starts with frontmatter and `# Celestial Mechanics for Three.js`.

- [ ] **Step 12: Commit the new skill**

  ```bash
  git add .kimi-code/skills/celestial-mechanics/SKILL.md
  git commit -m "feat: add celestial-mechanics skill for astronomy-engine + Three.js

  Adds a project skill covering coordinate transforms, planet/moon
  positioning, axial tilt, tidal locking, phase calculations, visual
  scaling, and common pitfalls."
  ```

---

## Spec Coverage

- Skill identity and scope → Task 1, Step 1.
- Coordinate systems cheat sheet → Task 1, Step 2.
- Vector → Three.js position → Task 1, Step 2.
- Planet positioning with caching → Task 1, Step 3.
- Moon positioning (Earth and Jupiter) → Task 1, Step 4.
- Axial tilt and rotation → Task 1, Step 5.
- Tidal locking → Task 1, Step 6.
- Phase calculations → Task 1, Step 7.
- Visual scaling → Task 1, Step 8.
- Common pitfalls → Task 1, Step 9.
- See also / related skills → Task 1, Step 10.

## Placeholder Scan

- No TBD/TODO placeholders.
- No vague "add error handling" steps.
- All snippets include concrete code.
- All file paths are exact.
