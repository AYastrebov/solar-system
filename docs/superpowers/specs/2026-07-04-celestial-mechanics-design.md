# Design: `celestial-mechanics` Skill

Date: 2026-07-04
Project: solar-system

## Goal

Add a project-scoped Kimi skill that bridges the `astronomy-engine` library and Three.js for solar-system visualizations. The skill should be the first place to consult when positioning bodies, computing orbits, handling coordinate transforms, or calculating phases in this codebase.

## Skill Identity

- **Name:** `celestial-mechanics`
- **Description:** Bridge astronomy-engine and Three.js for solar-system visualizations — positions, orbits, rotations, phases, and coordinate transforms.
- **Scope:** Vanilla JS + Three.js projects that use `astronomy-engine` (or similar libraries) to render the Solar System.

## Structure

The skill lives at `.kimi-code/skills/celestial-mechanics/SKILL.md` and contains the following sections:

1. **When to use**  
   Trigger conditions: positioning planets/moons, converting coordinate systems, computing Moon phase lighting, applying axial tilt, scaling real units to scene units.

2. **Coordinate systems cheat sheet**  
   - J2000 Equatorial (EQJ): `Astronomy.HelioVector()` default output.  
   - Ecliptic: `Astronomy.Ecliptic(v)`; the orbital plane of Earth.  
   - Horizontal: `Astronomy.Horizon()` for observer-local sky positions.  
   - Three.js coordinate space: Y-up, right-handed; note the necessary axis flips.

3. **Vector → Three.js position**  
   - Convert `Astronomy.Vector` (AU) to a `THREE.Vector3` in scene units.  
   - Handle handedness: astronomy-engine uses a left-handed convention in some outputs; the project negates Z to match Three.js.  
   - Show the standard mapping used in `main.js`.

4. **Planet positioning**  
   - `Astronomy.HelioVector(body, date)` for heliocentric ecliptic position.  
   - Cache positions by simulated date to avoid recomputing every frame.  
   - Time threshold guidance: recomputing once per simulated hour is usually sufficient.

5. **Moon positioning**  
   - Earth's Moon: `Astronomy.GeoMoon(date)` then convert to ecliptic.  
   - Jupiter's Galilean moons: `Astronomy.JupiterMoons(date)` and indexing `io/europa/ganymede/callisto`.  
   - Placing moons relative to parent planets using local containers and `atan2` for orbital angle.

6. **Axial tilt and rotation**  
   - Apply obliquity via a parent container tilted on X.  
   - Rotate the mesh inside the container for day/night spin.  
   - Retrograde rotators (Venus, Uranus): negative rotation speed or 180° flip.
   - Tidal locking: counter-rotate moon mesh by its orbital container angle.

7. **Phase calculations**  
   - Phase angle and elongation.  
   - Sun direction in a body's local space for custom shaders.  
   - New/Full/quarter moon determination from phase angle.

8. **Visual scaling**  
   - AU → scene units (`AU_TO_VISUAL`).  
   - Body radii scaling: keep relative proportions while remaining visible.  
   - Orbital distance scaling: often exaggerated so moons are visible next to planets.

9. **Common pitfalls**  
   - Confusing ecliptic and equatorial outputs.  
   - Three.js rotation direction vs astronomy-engine angle sign.  
   - JavaScript `Date` objects vs astronomy-engine internal time.  
   - Forgetting to update the cache key when the simulated date jumps.  
   - Transforming directions vs points when moving vectors into local space.

10. **See also**  
    - `threejs` and related `threejs-*` skills for Three.js specifics.  
    - `web-design-guidelines` / `frontend-design` for UI work.

## Code Style

- Examples use the same vanilla JS + Three.js style as `main.js` (no modules, no build step).  
- Keep snippets short and copy-paste friendly.  
- Prefer explicit variable names (`auToVisual`, `sunLocal`, `phaseAngle`).

## Success Criteria

- The skill can be invoked by name and loads successfully in a fresh Kimi session.  
- Its guidance directly references patterns already used in `main.js`.  
- It does not duplicate the full `astronomy-engine` docs; it focuses on the Three.js bridge.

## Out of Scope

- General JavaScript or Three.js tutoring (covered by existing skills).  
- Deep astrodynamics beyond what `astronomy-engine` exposes.  
- Shader authoring details (covered by `threejs-shaders`).
