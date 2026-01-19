// ============================================
// 3D Solar System - Three.js Implementation
// ============================================

// Scene, Camera, Renderer
let scene, camera, renderer, labelRenderer;
let controls;
let sun;
let sunLayers = [];  // For animated sun effects
let sunFlares = [];  // For solar flare particles
let planets = [];
let planetEffects = [];  // For animated planet effects
let moons = [];
let asteroidBelt;  // Asteroid belt particle system
let kuiperBelt;    // Kuiper belt particle system
let clock;

// Time control variables
let timeScale = 1.0;
let isPaused = false;
let simulationTime = 0;
const speedSteps = [0.1, 0.25, 0.5, 1.0, 2.0, 4.0, 8.0];
let currentSpeedIndex = 3; // Start at 1.0x

// Camera focus/follow
let focusedPlanet = null;
let isFollowing = false;
let cameraOffset = new THREE.Vector3(10, 10, 10);

// Raycaster for clicking
let raycaster;
let mouse;

// Settings state
let settings = {
    showLabels: true,
    showOrbits: true,
    showEffects: true,
    showAsteroids: true
};

// Orbit lines for toggle
let orbitLines = [];

// Simulation start date (J2000 epoch)
const J2000 = new Date('2000-01-01T12:00:00Z');
const baseSimulationDate = new Date();

// Planet data: name, color, size, orbitRadius, orbitSpeed, rotationSpeed, inclination (degrees), axialTilt, info
// Orbital speeds relative to Earth (1/orbital period in years)
// Sizes are scaled for visibility, not to actual scale
const planetData = [
    { 
        name: 'Mercury', color: 0x8c8c8c, size: 0.4, orbitRadius: 10, orbitSpeed: 4.15, rotationSpeed: 0.01,
        inclination: 7.0, axialTilt: 0.03,
        info: { diameter: '4,879 km', distance: '57.9 million km', dayLength: '58.6 Earth days', yearLength: '88 Earth days', moons: 0, type: 'Terrestrial' }
    },
    { 
        name: 'Venus', color: 0xe6c87a, size: 0.9, orbitRadius: 15, orbitSpeed: 1.62, rotationSpeed: -0.004,  // Retrograde rotation
        inclination: 3.4, axialTilt: 177.4,  // Nearly upside down
        info: { diameter: '12,104 km', distance: '108.2 million km', dayLength: '243 Earth days (retrograde)', yearLength: '225 Earth days', moons: 0, type: 'Terrestrial' }
    },
    { 
        name: 'Earth', color: 0x6b93d6, size: 1, orbitRadius: 20, orbitSpeed: 1, rotationSpeed: 0.02,
        inclination: 0.0, axialTilt: 23.4,
        info: { diameter: '12,742 km', distance: '149.6 million km', dayLength: '24 hours', yearLength: '365.25 days', moons: 1, type: 'Terrestrial' }
    },
    { 
        name: 'Mars', color: 0xc1440e, size: 0.5, orbitRadius: 25, orbitSpeed: 0.53, rotationSpeed: 0.018,
        inclination: 1.85, axialTilt: 25.2,
        info: { diameter: '6,779 km', distance: '227.9 million km', dayLength: '24.6 hours', yearLength: '687 Earth days', moons: 2, type: 'Terrestrial' }
    },
    { 
        name: 'Jupiter', color: 0xd8ca9d, size: 2.5, orbitRadius: 35, orbitSpeed: 0.084, rotationSpeed: 0.04,
        inclination: 1.31, axialTilt: 3.1,
        info: { diameter: '139,820 km', distance: '778.5 million km', dayLength: '9.9 hours', yearLength: '11.86 Earth years', moons: 95, type: 'Gas Giant' }
    },
    { 
        name: 'Saturn', color: 0xead6b8, size: 2.2, orbitRadius: 45, orbitSpeed: 0.034, rotationSpeed: 0.038,
        inclination: 2.49, axialTilt: 26.7,
        info: { diameter: '116,460 km', distance: '1.43 billion km', dayLength: '10.7 hours', yearLength: '29.46 Earth years', moons: 146, type: 'Gas Giant' }
    },
    { 
        name: 'Uranus', color: 0xc9eeff, size: 1.6, orbitRadius: 55, orbitSpeed: 0.012, rotationSpeed: -0.03,  // Retrograde due to extreme tilt
        inclination: 0.77, axialTilt: 97.8,  // Rotates on its side
        info: { diameter: '50,724 km', distance: '2.87 billion km', dayLength: '17.2 hours (retrograde)', yearLength: '84 Earth years', moons: 27, type: 'Ice Giant' }
    },
    { 
        name: 'Neptune', color: 0x5b7fde, size: 1.5, orbitRadius: 65, orbitSpeed: 0.006, rotationSpeed: 0.032,
        inclination: 1.77, axialTilt: 28.3,
        info: { diameter: '49,244 km', distance: '4.5 billion km', dayLength: '16.1 hours', yearLength: '164.8 Earth years', moons: 16, type: 'Ice Giant' }
    }
];

// Moon data for Earth, Jupiter and Saturn
const moonData = {
    'Earth': [
        { name: 'Moon', color: 0xaaaaaa, size: 0.27, orbitRadius: 2.5, orbitSpeed: 2.0 }
    ],
    'Jupiter': [
        { name: 'Io', color: 0xffff66, size: 0.3, orbitRadius: 4, orbitSpeed: 3.5 },
        { name: 'Europa', color: 0xf5f5dc, size: 0.25, orbitRadius: 5.2, orbitSpeed: 2.8 },
        { name: 'Ganymede', color: 0x8b8989, size: 0.4, orbitRadius: 6.5, orbitSpeed: 2.0 },
        { name: 'Callisto', color: 0x4a4a4a, size: 0.35, orbitRadius: 8, orbitSpeed: 1.2 }
    ],
    'Saturn': [
        // Ordered by distance: Mimas < Enceladus < Rhea < Titan
        { name: 'Mimas', color: 0xa9a9a9, size: 0.12, orbitRadius: 3.2, orbitSpeed: 5.0 },
        { name: 'Enceladus', color: 0xfffafa, size: 0.15, orbitRadius: 4, orbitSpeed: 3.5 },
        { name: 'Rhea', color: 0xdcdcdc, size: 0.2, orbitRadius: 5.5, orbitSpeed: 2.0 },
        { name: 'Titan', color: 0xdaa520, size: 0.4, orbitRadius: 7.5, orbitSpeed: 1.0 }
    ]
};

// Initialize the scene
function init() {
    clock = new THREE.Clock();
    
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(50, 50, 80);
    
    // Create WebGL renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Create CSS2D renderer for labels
    labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.getElementById('container').appendChild(labelRenderer.domElement);
    
    // Add OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 300;  // Extended to see Kuiper Belt
    
    // Create starfield background
    createStarfield();
    
    // Add lighting
    addLighting();
    
    // Create the Sun
    createSun();
    
    // Create planets with orbits
    createPlanets();
    
    // Create asteroid belt
    createAsteroidBelt();
    
    // Create Kuiper belt
    createKuiperBelt();
    
    // Setup raycaster for clicking
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
        // Delay to allow browser to update dimensions
        setTimeout(onWindowResize, 100);
    });
    
    // Setup time controls
    setupTimeControls();
    
    // Setup click to focus
    setupClickToFocus();
    
    // Setup settings panel
    setupSettingsPanel();
    
    // Setup fullscreen
    setupFullscreen();
    
    // Setup info panel close button
    setupInfoPanel();
    
    // Setup background music
    setupBackgroundMusic();
    
    // Initial mini map size setup
    updateMiniMapSize();
    
    // Prevent default touch behaviors that interfere with 3D controls
    setupTouchHandling();
    
    // Start animation loop
    animate();
}

// Setup time control buttons
function setupTimeControls() {
    const pauseBtn = document.getElementById('pauseBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const ffwdBtn = document.getElementById('ffwdBtn');
    const slowBtn = document.getElementById('slowBtn');
    const fastBtn = document.getElementById('fastBtn');
    const speedDisplay = document.getElementById('speedDisplay');
    
    // Pause/Play
    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.innerHTML = isPaused ? '&#9654;' : '&#9208;';
        pauseBtn.classList.toggle('active', isPaused);
    });
    
    // Reverse time
    rewindBtn.addEventListener('click', () => {
        timeScale = -Math.abs(timeScale);
        updateSpeedDisplay();
    });
    
    // Forward time
    ffwdBtn.addEventListener('click', () => {
        timeScale = Math.abs(timeScale);
        updateSpeedDisplay();
    });
    
    // Slow down
    slowBtn.addEventListener('click', () => {
        if (currentSpeedIndex > 0) {
            currentSpeedIndex--;
            const speed = speedSteps[currentSpeedIndex];
            timeScale = timeScale < 0 ? -speed : speed;
            updateSpeedDisplay();
        }
    });
    
    // Speed up
    fastBtn.addEventListener('click', () => {
        if (currentSpeedIndex < speedSteps.length - 1) {
            currentSpeedIndex++;
            const speed = speedSteps[currentSpeedIndex];
            timeScale = timeScale < 0 ? -speed : speed;
            updateSpeedDisplay();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                pauseBtn.click();
                break;
            case 'ArrowLeft':
                slowBtn.click();
                break;
            case 'ArrowRight':
                fastBtn.click();
                break;
            case 'ArrowUp':
                ffwdBtn.click();
                break;
            case 'ArrowDown':
                rewindBtn.click();
                break;
        }
    });
    
    function updateSpeedDisplay() {
        const speed = speedSteps[currentSpeedIndex];
        const direction = timeScale < 0 ? '-' : '';
        speedDisplay.textContent = `${direction}${speed}x`;
    }
}

// Create starfield background
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        // Distribute stars in a sphere around the scene
        const radius = 300 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        sizeAttenuation: true
    });
    
    const starfield = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starfield);
}

// Add lighting to the scene
function addLighting() {
    // Ambient light for subtle illumination
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    // Point light at the Sun's position
    const sunLight = new THREE.PointLight(0xffffff, 2, 300);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
}

// Create the Sun with enhanced visual effects
function createSun() {
    // Main sun container
    sun = new THREE.Object3D();
    scene.add(sun);
    
    // Core sun sphere (bright yellow-white center)
    const coreGeometry = new THREE.SphereGeometry(4.5, 64, 64);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffee
    });
    const sunCore = new THREE.Mesh(coreGeometry, coreMaterial);
    sun.add(sunCore);
    
    // Animated surface layers (simulate turbulent surface)
    const surfaceColors = [0xffdd00, 0xffaa00, 0xff8800, 0xff6600];
    const surfaceSizes = [5, 5.1, 5.2, 5.3];
    const surfaceOpacities = [0.9, 0.6, 0.4, 0.3];
    
    for (let i = 0; i < 4; i++) {
        const geometry = new THREE.SphereGeometry(surfaceSizes[i], 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: surfaceColors[i],
            transparent: true,
            opacity: surfaceOpacities[i]
        });
        const layer = new THREE.Mesh(geometry, material);
        // Random initial rotation
        layer.rotation.x = Math.random() * Math.PI;
        layer.rotation.y = Math.random() * Math.PI;
        layer.rotation.z = Math.random() * Math.PI;
        sun.add(layer);
        sunLayers.push({
            mesh: layer,
            speedX: (Math.random() - 0.5) * 0.02,
            speedY: (Math.random() - 0.5) * 0.02,
            speedZ: (Math.random() - 0.5) * 0.01
        });
    }
    
    // Inner corona glow
    const innerCoronaGeometry = new THREE.SphereGeometry(5.8, 32, 32);
    const innerCoronaMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa33,
        transparent: true,
        opacity: 0.25
    });
    const innerCorona = new THREE.Mesh(innerCoronaGeometry, innerCoronaMaterial);
    sun.add(innerCorona);
    sunLayers.push({
        mesh: innerCorona,
        speedX: 0.003,
        speedY: 0.005,
        speedZ: 0.002,
        pulseSpeed: 2,
        pulseAmount: 0.05,
        baseOpacity: 0.25
    });
    
    // Outer corona glow
    const outerCoronaGeometry = new THREE.SphereGeometry(7, 32, 32);
    const outerCoronaMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.12
    });
    const outerCorona = new THREE.Mesh(outerCoronaGeometry, outerCoronaMaterial);
    sun.add(outerCorona);
    sunLayers.push({
        mesh: outerCorona,
        speedX: -0.002,
        speedY: 0.003,
        speedZ: -0.001,
        pulseSpeed: 1.5,
        pulseAmount: 0.03,
        baseOpacity: 0.12
    });
    
    // Far corona (subtle)
    const farCoronaGeometry = new THREE.SphereGeometry(9, 32, 32);
    const farCoronaMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.06
    });
    const farCorona = new THREE.Mesh(farCoronaGeometry, farCoronaMaterial);
    sun.add(farCorona);
    sunLayers.push({
        mesh: farCorona,
        speedX: 0.001,
        speedY: -0.002,
        speedZ: 0.001,
        pulseSpeed: 1,
        pulseAmount: 0.02,
        baseOpacity: 0.06
    });
    
    // Create solar flare particles
    createSolarFlares();
    
    // Create corona spikes (flame-like protrusions)
    createCoronaSpikes();
    
    // Add label to Sun
    const labelAnchor = new THREE.Mesh(
        new THREE.SphereGeometry(5, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    sun.add(labelAnchor);
    addLabel(labelAnchor, 'Sun', true, false);
}

// Create solar flare particle system
function createSolarFlares() {
    const flareCount = 200;
    const flareGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(flareCount * 3);
    const velocities = [];
    const lifetimes = [];
    
    for (let i = 0; i < flareCount; i++) {
        // Start at sun surface
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 5 + Math.random() * 0.5;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Outward velocity
        velocities.push({
            x: positions[i * 3] * 0.02,
            y: positions[i * 3 + 1] * 0.02,
            z: positions[i * 3 + 2] * 0.02
        });
        
        lifetimes.push({
            current: Math.random() * 100,
            max: 50 + Math.random() * 50
        });
    }
    
    flareGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const flareMaterial = new THREE.PointsMaterial({
        color: 0xffaa00,
        size: 0.3,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    const flareSystem = new THREE.Points(flareGeometry, flareMaterial);
    sun.add(flareSystem);
    
    sunFlares.push({
        system: flareSystem,
        positions: positions,
        velocities: velocities,
        lifetimes: lifetimes,
        count: flareCount
    });
}

// Create corona spike effects (flame-like)
function createCoronaSpikes() {
    const spikeCount = 12;
    
    for (let i = 0; i < spikeCount; i++) {
        const angle = (i / spikeCount) * Math.PI * 2;
        
        // Create elongated cone for flame effect
        const spikeGeometry = new THREE.ConeGeometry(0.8, 3 + Math.random() * 2, 8);
        const spikeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.2
        });
        
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        
        // Position on sun surface pointing outward
        spike.position.x = Math.cos(angle) * 5.5;
        spike.position.z = Math.sin(angle) * 5.5;
        spike.position.y = (Math.random() - 0.5) * 3;
        
        // Point outward from center
        spike.lookAt(spike.position.clone().multiplyScalar(2));
        spike.rotateX(Math.PI / 2);
        
        sun.add(spike);
        
        sunLayers.push({
            mesh: spike,
            isSpike: true,
            baseScale: 1,
            pulseSpeed: 2 + Math.random() * 3,
            pulseAmount: 0.3
        });
    }
    
    // Add some vertical spikes
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const isTop = i % 2 === 0;
        
        const spikeGeometry = new THREE.ConeGeometry(0.6, 2 + Math.random() * 1.5, 6);
        const spikeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.25
        });
        
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        
        spike.position.x = Math.cos(angle) * 3;
        spike.position.z = Math.sin(angle) * 3;
        spike.position.y = isTop ? 4.5 : -4.5;
        
        if (!isTop) spike.rotation.x = Math.PI;
        
        sun.add(spike);
        
        sunLayers.push({
            mesh: spike,
            isSpike: true,
            baseScale: 1,
            pulseSpeed: 1.5 + Math.random() * 2,
            pulseAmount: 0.25
        });
    }
}

// Create orbit path visualization with inclination
function createOrbitPath(radius, inclination = 0) {
    const segments = 128;
    const orbitGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * 3);
    
    const incRad = (inclination * Math.PI) / 180; // Convert to radians
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        // Apply inclination rotation around X axis
        positions[i * 3] = x;
        positions[i * 3 + 1] = z * Math.sin(incRad);
        positions[i * 3 + 2] = z * Math.cos(incRad);
    }
    
    orbitGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.4
    });
    
    const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    orbitLines.push(orbit); // Store for toggling
    return orbit;
}

// Create all planets
function createPlanets() {
    planetData.forEach(data => {
        // Create planet mesh
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const planet = new THREE.Mesh(geometry, material);
        
        // Create a container for orbital movement with inclination
        const orbitContainer = new THREE.Object3D();
        const inclination = data.inclination || 0;
        orbitContainer.rotation.x = (inclination * Math.PI) / 180; // Apply orbital inclination
        scene.add(orbitContainer);
        
        // Position planet at its orbital distance
        planet.position.x = data.orbitRadius;
        orbitContainer.add(planet);
        
        // Apply axial tilt to planet
        if (data.axialTilt) {
            planet.rotation.z = (data.axialTilt * Math.PI) / 180;
        }
        
        // Create and add orbit path with inclination
        const orbitPath = createOrbitPath(data.orbitRadius, inclination);
        scene.add(orbitPath);
        
        // Add visual effects based on planet type
        addPlanetEffects(planet, data);
        
        // Add label to planet
        addLabel(planet, data.name, false, false);
        
        // Add moons for Earth, Jupiter and Saturn
        if (data.name === 'Earth' || data.name === 'Jupiter' || data.name === 'Saturn') {
            createMoons(planet, data.name);
        }
        
        // Store planet data for animation
        planets.push({
            mesh: planet,
            container: orbitContainer,
            data: data
        });
    });
}

// Add visual effects to planets
function addPlanetEffects(planet, data) {
    switch(data.name) {
        case 'Mercury':
            addMercuryEffects(planet, data);
            break;
        case 'Venus':
            addVenusEffects(planet, data);
            break;
        case 'Earth':
            addEarthEffects(planet, data);
            break;
        case 'Mars':
            addMarsEffects(planet, data);
            break;
        case 'Jupiter':
            addJupiterEffects(planet, data);
            break;
        case 'Saturn':
            addSaturnEffects(planet, data);
            break;
        case 'Uranus':
            addUranusEffects(planet, data);
            break;
        case 'Neptune':
            addNeptuneEffects(planet, data);
            break;
    }
}

// Mercury - Cratered surface with subtle heat shimmer
function addMercuryEffects(planet, data) {
    // Heat glow on sun-facing side (simulated with slight glow)
    const heatGlow = new THREE.SphereGeometry(data.size * 1.05, 16, 16);
    const heatMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa66,
        transparent: true,
        opacity: 0.1
    });
    const heat = new THREE.Mesh(heatGlow, heatMaterial);
    planet.add(heat);
    
    planetEffects.push({
        type: 'heat',
        mesh: heat,
        planet: planet,
        pulseSpeed: 3,
        baseOpacity: 0.1
    });
}

// Venus - Thick cloudy atmosphere
function addVenusEffects(planet, data) {
    // Dense cloud layer
    const cloudGeometry = new THREE.SphereGeometry(data.size * 1.08, 32, 32);
    const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffe4b5,
        transparent: true,
        opacity: 0.4
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planet.add(clouds);
    
    // Outer hazy atmosphere
    const hazeGeometry = new THREE.SphereGeometry(data.size * 1.15, 32, 32);
    const hazeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd699,
        transparent: true,
        opacity: 0.15
    });
    const haze = new THREE.Mesh(hazeGeometry, hazeMaterial);
    planet.add(haze);
    
    planetEffects.push({
        type: 'clouds',
        mesh: clouds,
        rotationSpeed: 0.003
    });
    
    planetEffects.push({
        type: 'atmosphere',
        mesh: haze,
        rotationSpeed: -0.001
    });
}

// Earth - Blue atmosphere, white clouds
function addEarthEffects(planet, data) {
    // Cloud layer
    const cloudGeometry = new THREE.SphereGeometry(data.size * 1.02, 32, 32);
    const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    planet.add(clouds);
    
    // Atmosphere glow
    const atmosGeometry = new THREE.SphereGeometry(data.size * 1.1, 32, 32);
    const atmosMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.15
    });
    const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
    planet.add(atmosphere);
    
    // Outer atmospheric haze
    const outerAtmosGeometry = new THREE.SphereGeometry(data.size * 1.2, 32, 32);
    const outerAtmosMaterial = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.08
    });
    const outerAtmosphere = new THREE.Mesh(outerAtmosGeometry, outerAtmosMaterial);
    planet.add(outerAtmosphere);
    
    planetEffects.push({
        type: 'clouds',
        mesh: clouds,
        rotationSpeed: 0.005
    });
    
    planetEffects.push({
        type: 'atmosphere',
        mesh: atmosphere,
        pulseSpeed: 1.5,
        baseOpacity: 0.15,
        pulseAmount: 0.03
    });
}

// Mars - Dusty red atmosphere
function addMarsEffects(planet, data) {
    // Dust atmosphere
    const dustGeometry = new THREE.SphereGeometry(data.size * 1.05, 32, 32);
    const dustMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6633,
        transparent: true,
        opacity: 0.12
    });
    const dust = new THREE.Mesh(dustGeometry, dustMaterial);
    planet.add(dust);
    
    // Polar ice cap effect (subtle white at top)
    const polarGeometry = new THREE.SphereGeometry(data.size * 0.3, 16, 16);
    const polarMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
    });
    const northPole = new THREE.Mesh(polarGeometry, polarMaterial);
    northPole.position.y = data.size * 0.85;
    northPole.scale.y = 0.3;
    planet.add(northPole);
    
    const southPole = new THREE.Mesh(polarGeometry.clone(), polarMaterial.clone());
    southPole.position.y = -data.size * 0.85;
    southPole.scale.y = 0.3;
    planet.add(southPole);
    
    planetEffects.push({
        type: 'dust',
        mesh: dust,
        rotationSpeed: 0.002,
        pulseSpeed: 2,
        baseOpacity: 0.12,
        pulseAmount: 0.04
    });
}

// Jupiter - Atmospheric bands and Great Red Spot
function addJupiterEffects(planet, data) {
    // Atmospheric bands (multiple layers)
    const bandColors = [0xd8ca9d, 0xc4a574, 0xe8d8b8];
    
    for (let i = 0; i < 3; i++) {
        const bandGeometry = new THREE.SphereGeometry(data.size * (1.02 + i * 0.02), 32, 32);
        const bandMaterial = new THREE.MeshBasicMaterial({
            color: bandColors[i],
            transparent: true,
            opacity: 0.15 - i * 0.03
        });
        const band = new THREE.Mesh(bandGeometry, bandMaterial);
        planet.add(band);
        
        planetEffects.push({
            type: 'band',
            mesh: band,
            rotationSpeed: 0.008 - i * 0.002
        });
    }
    
    // Outer glow
    const glowGeometry = new THREE.SphereGeometry(data.size * 1.12, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffddaa,
        transparent: true,
        opacity: 0.08
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    planet.add(glow);
}

// Saturn - Enhanced rings and atmospheric glow
function addSaturnEffects(planet, data) {
    // Main ring - ring particles orbit the planet
    const ringGeometry = new THREE.RingGeometry(
        data.size * 1.4,
        data.size * 2.2,
        64
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9b896,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.5;
    planet.add(ring);
    
    // Inner ring (darker, orbits faster)
    const innerRingGeometry = new THREE.RingGeometry(
        data.size * 1.2,
        data.size * 1.38,
        64
    );
    const innerRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b7355,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
    innerRing.rotation.x = Math.PI / 2.5;
    planet.add(innerRing);
    
    // Outer faint ring (orbits slower)
    const outerRingGeometry = new THREE.RingGeometry(
        data.size * 2.25,
        data.size * 2.6,
        64
    );
    const outerRingMaterial = new THREE.MeshBasicMaterial({
        color: 0xd4c4a8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25
    });
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
    outerRing.rotation.x = Math.PI / 2.5;
    planet.add(outerRing);
    
    // Add ring rotation animations (inner rings orbit faster - Keplerian motion)
    // Rotate around Z-axis since rings are tilted with rotation.x
    planetEffects.push({
        type: 'ring',
        mesh: innerRing,
        rotationSpeed: 0.006,
        rotationAxis: 'z'
    });
    
    planetEffects.push({
        type: 'ring',
        mesh: ring,
        rotationSpeed: 0.004,
        rotationAxis: 'z'
    });
    
    planetEffects.push({
        type: 'ring',
        mesh: outerRing,
        rotationSpeed: 0.002,
        rotationAxis: 'z'
    });
    
    // Atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(data.size * 1.1, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffeedd,
        transparent: true,
        opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    planet.add(glow);
    
    // Banded atmosphere
    const bandGeometry = new THREE.SphereGeometry(data.size * 1.03, 32, 32);
    const bandMaterial = new THREE.MeshBasicMaterial({
        color: 0xf5deb3,
        transparent: true,
        opacity: 0.2
    });
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    planet.add(band);
    
    planetEffects.push({
        type: 'band',
        mesh: band,
        rotationSpeed: 0.006
    });
}

// Uranus - Ice giant with tilted rings and cyan glow
// Note: Uranus has 97.8° axial tilt, so it rotates on its side
// The planet's tilt is applied via axialTilt, rings are in equatorial plane
function addUranusEffects(planet, data) {
    // Rings (in equatorial plane - will appear vertical due to planet's 98° tilt)
    // Ring particles orbit the planet, with inner particles moving faster
    const ringGeometry = new THREE.RingGeometry(
        data.size * 1.3,
        data.size * 1.8,
        64
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a6a7a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;  // Flat in equatorial plane
    planet.add(ring);
    
    // Inner ring (orbits faster than outer ring)
    const innerRingGeometry = new THREE.RingGeometry(
        data.size * 1.15,
        data.size * 1.28,
        64
    );
    const innerRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x3a5a6a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
    innerRing.rotation.x = Math.PI / 2;  // Flat in equatorial plane
    planet.add(innerRing);
    
    // Add ring rotation animations (inner ring orbits faster)
    planetEffects.push({
        type: 'ring',
        mesh: ring,
        rotationSpeed: 0.003,
        rotationAxis: 'z'  // Rotate around Z since ring is tilted
    });
    
    planetEffects.push({
        type: 'ring',
        mesh: innerRing,
        rotationSpeed: 0.005,  // Inner ring orbits faster
        rotationAxis: 'z'
    });
    
    // Cyan atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(data.size * 1.12, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ddff,
        transparent: true,
        opacity: 0.12
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    planet.add(glow);
    
    // Outer haze
    const hazeGeometry = new THREE.SphereGeometry(data.size * 1.25, 32, 32);
    const hazeMaterial = new THREE.MeshBasicMaterial({
        color: 0x66ccee,
        transparent: true,
        opacity: 0.06
    });
    const haze = new THREE.Mesh(hazeGeometry, hazeMaterial);
    planet.add(haze);
    
    planetEffects.push({
        type: 'atmosphere',
        mesh: glow,
        pulseSpeed: 1,
        baseOpacity: 0.12,
        pulseAmount: 0.03
    });
}

// Neptune - Deep blue with storms
function addNeptuneEffects(planet, data) {
    // Atmospheric layers
    const atmosGeometry = new THREE.SphereGeometry(data.size * 1.08, 32, 32);
    const atmosMaterial = new THREE.MeshBasicMaterial({
        color: 0x4466ff,
        transparent: true,
        opacity: 0.2
    });
    const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
    planet.add(atmosphere);
    
    // Outer glow
    const glowGeometry = new THREE.SphereGeometry(data.size * 1.18, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x3355dd,
        transparent: true,
        opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    planet.add(glow);
    
    // Storm bands
    const bandGeometry = new THREE.SphereGeometry(data.size * 1.04, 32, 32);
    const bandMaterial = new THREE.MeshBasicMaterial({
        color: 0x5577ee,
        transparent: true,
        opacity: 0.15
    });
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    planet.add(band);
    
    planetEffects.push({
        type: 'atmosphere',
        mesh: atmosphere,
        rotationSpeed: 0.004
    });
    
    planetEffects.push({
        type: 'band',
        mesh: band,
        rotationSpeed: 0.007
    });
    
    planetEffects.push({
        type: 'atmosphere',
        mesh: glow,
        pulseSpeed: 1.2,
        baseOpacity: 0.1,
        pulseAmount: 0.02
    });
}

// Add CSS2D label to an object
function addLabel(object, text, isSun, isMoon) {
    const labelDiv = document.createElement('div');
    let className = 'planet-label';
    if (isSun) className += ' sun-label';
    if (isMoon) className += ' moon-label';
    labelDiv.className = className;
    labelDiv.textContent = text;
    
    const label = new THREE.CSS2DObject(labelDiv);
    const offset = isMoon ? 0.8 : 1.5;
    label.position.set(0, object.geometry.parameters.radius + offset, 0);
    object.add(label);
}

// Create moons for a planet
function createMoons(planet, planetName) {
    const planetMoons = moonData[planetName];
    if (!planetMoons) return;
    
    planetMoons.forEach(data => {
        // Create moon mesh
        const geometry = new THREE.SphereGeometry(data.size, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const moon = new THREE.Mesh(geometry, material);
        
        // Create a container for moon's orbital movement around planet
        const moonOrbitContainer = new THREE.Object3D();
        planet.add(moonOrbitContainer);
        
        // Position moon at its orbital distance from planet
        moon.position.x = data.orbitRadius;
        moonOrbitContainer.add(moon);
        
        // Create moon orbit path (smaller, more transparent)
        const moonOrbitPath = createMoonOrbitPath(data.orbitRadius);
        planet.add(moonOrbitPath);
        
        // Add label to moon
        addLabel(moon, data.name, false, true);
        
        // Store moon data for animation
        moons.push({
            mesh: moon,
            container: moonOrbitContainer,
            data: data
        });
    });
}

// Create smaller orbit path for moons
function createMoonOrbitPath(radius) {
    const segments = 64;
    const orbitGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * 3);
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    orbitGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.25
    });
    
    const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    return orbit;
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update mini map canvas size for responsive layout
    updateMiniMapSize();
}

// Update mini map canvas dimensions based on container size
function updateMiniMapSize() {
    const miniMapContainer = document.getElementById('miniMap');
    const canvas = document.getElementById('miniMapCanvas');
    const size = miniMapContainer.offsetWidth;
    canvas.width = size;
    canvas.height = size;
}

// Animate planet visual effects
function animatePlanetEffects(time) {
    planetEffects.forEach(effect => {
        // Rotate clouds, atmospheric bands, and rings
        if (effect.rotationSpeed) {
            // Use specified rotation axis or default to Y
            if (effect.rotationAxis === 'z') {
                effect.mesh.rotation.z += effect.rotationSpeed;
            } else {
                effect.mesh.rotation.y += effect.rotationSpeed;
            }
        }
        
        // Pulse opacity for atmospheres
        if (effect.pulseSpeed && effect.baseOpacity !== undefined) {
            const pulse = Math.sin(time * effect.pulseSpeed) * (effect.pulseAmount || 0.02);
            effect.mesh.material.opacity = effect.baseOpacity + pulse;
        }
        
        // Heat shimmer effect for Mercury
        if (effect.type === 'heat' && effect.planet) {
            const shimmer = Math.sin(time * effect.pulseSpeed) * 0.05;
            effect.mesh.material.opacity = effect.baseOpacity + shimmer;
            effect.mesh.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
        }
    });
}

// Animate Sun visual effects
function animateSun(time) {
    // Rotate sun container slowly
    sun.rotation.y += 0.001;
    
    // Animate all sun layers
    sunLayers.forEach(layer => {
        // Rotate layer
        layer.mesh.rotation.x += layer.speedX;
        layer.mesh.rotation.y += layer.speedY;
        if (layer.speedZ) layer.mesh.rotation.z += layer.speedZ;
        
        // Pulse effect for corona layers
        if (layer.pulseSpeed && layer.baseOpacity) {
            const pulse = Math.sin(time * layer.pulseSpeed) * layer.pulseAmount;
            layer.mesh.material.opacity = layer.baseOpacity + pulse;
        }
        
        // Scale pulsing for flame spikes
        if (layer.isSpike) {
            const scalePulse = 1 + Math.sin(time * layer.pulseSpeed) * layer.pulseAmount;
            layer.mesh.scale.y = layer.baseScale * scalePulse;
            layer.mesh.material.opacity = 0.2 + Math.sin(time * layer.pulseSpeed * 0.7) * 0.15;
        }
    });
    
    // Animate solar flare particles
    sunFlares.forEach(flare => {
        const positions = flare.positions;
        
        for (let i = 0; i < flare.count; i++) {
            const lifetime = flare.lifetimes[i];
            const velocity = flare.velocities[i];
            
            lifetime.current += 1;
            
            // Reset particle when lifetime expires
            if (lifetime.current >= lifetime.max) {
                // Respawn at sun surface
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const radius = 5 + Math.random() * 0.5;
                
                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = radius * Math.cos(phi);
                
                // New outward velocity
                velocity.x = positions[i * 3] * (0.01 + Math.random() * 0.02);
                velocity.y = positions[i * 3 + 1] * (0.01 + Math.random() * 0.02);
                velocity.z = positions[i * 3 + 2] * (0.01 + Math.random() * 0.02);
                
                lifetime.current = 0;
                lifetime.max = 50 + Math.random() * 50;
            } else {
                // Move particle outward
                positions[i * 3] += velocity.x;
                positions[i * 3 + 1] += velocity.y;
                positions[i * 3 + 2] += velocity.z;
                
                // Slow down over time
                velocity.x *= 0.98;
                velocity.y *= 0.98;
                velocity.z *= 0.98;
            }
        }
        
        flare.system.geometry.attributes.position.needsUpdate = true;
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Update simulation time based on pause state and time scale
    if (!isPaused) {
        simulationTime += delta * timeScale;
    }
    
    // Animate Sun effects (always animate for visual appeal)
    animateSun(simulationTime);
    
    // Animate planets
    planets.forEach(planet => {
        // Orbit around the Sun
        planet.container.rotation.y = simulationTime * planet.data.orbitSpeed * 0.1;
        
        // Rotate on own axis
        if (!isPaused) {
            planet.mesh.rotation.y += planet.data.rotationSpeed * timeScale;
        }
    });
    
    // Animate moons
    moons.forEach(moon => {
        // Orbit around their parent planet
        moon.container.rotation.y = simulationTime * moon.data.orbitSpeed * 0.5;
    });
    
    // Animate planet effects
    animatePlanetEffects(simulationTime);
    
    // Animate asteroid belt and Kuiper belt
    if (asteroidBelt && settings.showAsteroids) {
        asteroidBelt.rotation.y += 0.0005 * timeScale;
    }
    if (kuiperBelt && settings.showAsteroids) {
        kuiperBelt.rotation.y += 0.0002 * timeScale; // Slower rotation for outer belt
    }
    
    // Update camera if following a planet
    if (isFollowing && focusedPlanet) {
        updateCameraFollow();
    }
    
    // Update controls
    controls.update();
    
    // Update mini map
    updateMiniMap();
    
    // Update date display
    updateDateDisplay();
    
    // Render scene
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// Create asteroid belt between Mars and Jupiter
function createAsteroidBelt() {
    const asteroidCount = 2000;
    const innerRadius = 27;  // Just outside Mars
    const outerRadius = 33;  // Just inside Jupiter
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(asteroidCount * 3);
    const sizes = new Float32Array(asteroidCount);
    
    for (let i = 0; i < asteroidCount; i++) {
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 2; // Slight vertical spread
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        
        sizes[i] = 0.05 + Math.random() * 0.15;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
        color: 0x888888,
        size: 0.15,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
    });
    
    asteroidBelt = new THREE.Points(geometry, material);
    scene.add(asteroidBelt);
}

// Create Kuiper belt beyond Neptune
function createKuiperBelt() {
    const objectCount = 3000;
    const innerRadius = 70;   // Just outside Neptune
    const outerRadius = 100;  // Extends far out
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(objectCount * 3);
    
    for (let i = 0; i < objectCount; i++) {
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 5; // More vertical spread than asteroid belt
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x99aacc,  // Slightly bluish/icy color
        size: 0.2,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6
    });
    
    kuiperBelt = new THREE.Points(geometry, material);
    scene.add(kuiperBelt);
}

// Setup click to focus on planets
function setupClickToFocus() {
    renderer.domElement.addEventListener('click', onPlanetClick);
    
    // Touch support for mobile - use touchend with tap detection
    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };
    
    renderer.domElement.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        if (e.touches.length === 1) {
            touchStartPos.x = e.touches[0].clientX;
            touchStartPos.y = e.touches[0].clientY;
        }
    }, { passive: true });
    
    renderer.domElement.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        const touch = e.changedTouches[0];
        const moveDistance = Math.sqrt(
            Math.pow(touch.clientX - touchStartPos.x, 2) + 
            Math.pow(touch.clientY - touchStartPos.y, 2)
        );
        
        // Only trigger if it was a quick tap (not a drag/rotate)
        if (touchDuration < 300 && moveDistance < 20) {
            onPlanetClick({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }, { passive: true });
}

function onPlanetClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Get all planet meshes
    const planetMeshes = planets.map(p => p.mesh);
    
    // Check for intersections
    const intersects = raycaster.intersectObjects(planetMeshes, true);
    
    if (intersects.length > 0) {
        // Find which planet was clicked
        let clickedMesh = intersects[0].object;
        
        // Traverse up to find the actual planet mesh
        while (clickedMesh.parent && !planets.find(p => p.mesh === clickedMesh)) {
            clickedMesh = clickedMesh.parent;
        }
        
        const planetObj = planets.find(p => p.mesh === clickedMesh);
        if (planetObj) {
            focusOnPlanet(planetObj);
        }
    }
}

function focusOnPlanet(planetObj) {
    focusedPlanet = planetObj;
    isFollowing = true;
    
    // Update info panel
    showInfoPanel(planetObj.data);
    
    // Animate camera to planet
    const planetWorldPos = new THREE.Vector3();
    planetObj.mesh.getWorldPosition(planetWorldPos);
    
    // Set camera offset based on planet size
    const distance = planetObj.data.size * 8 + 5;
    cameraOffset.set(distance, distance * 0.6, distance);
    
    // Show unfocus button
    document.getElementById('unfocusBtn').classList.remove('hidden');
}

function updateCameraFollow() {
    if (!focusedPlanet) return;
    
    const planetWorldPos = new THREE.Vector3();
    focusedPlanet.mesh.getWorldPosition(planetWorldPos);
    
    // Smoothly move camera to follow planet
    const targetPos = planetWorldPos.clone().add(cameraOffset);
    camera.position.lerp(targetPos, 0.05);
    controls.target.lerp(planetWorldPos, 0.05);
}

function unfocusPlanet() {
    isFollowing = false;
    focusedPlanet = null;
    document.getElementById('unfocusBtn').classList.add('hidden');
}

// Info panel functions
function setupInfoPanel() {
    document.getElementById('closePanelBtn').addEventListener('click', () => {
        document.getElementById('infoPanel').classList.add('hidden');
        unfocusPlanet();
    });
    
    document.getElementById('unfocusBtn').addEventListener('click', () => {
        unfocusPlanet();
    });
}

function showInfoPanel(data) {
    const panel = document.getElementById('infoPanel');
    panel.classList.remove('hidden');
    
    document.getElementById('planetName').textContent = data.name;
    document.getElementById('planetType').textContent = data.info.type;
    document.getElementById('planetDiameter').textContent = data.info.diameter;
    document.getElementById('planetDistance').textContent = data.info.distance;
    document.getElementById('planetDay').textContent = data.info.dayLength;
    document.getElementById('planetYear').textContent = data.info.yearLength;
    document.getElementById('planetMoons').textContent = data.info.moons;
}

// Mini map functions
function updateMiniMap() {
    const canvas = document.getElementById('miniMapCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    // Dynamic scale based on canvas size (base scale for 180px canvas)
    const baseSize = 180;
    const scaleFactor = canvas.width / baseSize;
    const scale = 1.3 / scaleFactor; // Adjust scale for smaller canvas
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Responsive size multiplier
    const sizeMultiplier = canvas.width / 180;
    
    // Draw Sun
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.max(2, 4 * sizeMultiplier), 0, Math.PI * 2);
    ctx.fillStyle = '#ffdd00';
    ctx.fill();
    
    // Draw orbit lines and planets
    planets.forEach(planet => {
        const orbitRadius = planet.data.orbitRadius / scale;
        
        // Draw orbit
        if (settings.showOrbits) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = Math.max(0.5, 0.5 * sizeMultiplier);
            ctx.stroke();
        }
        
        // Get planet position
        const angle = planet.container.rotation.y;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;
        
        // Draw planet
        ctx.beginPath();
        const size = Math.max(1.5, planet.data.size * 1.5 * sizeMultiplier);
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = '#' + planet.data.color.toString(16).padStart(6, '0');
        ctx.fill();
        
        // Highlight focused planet
        if (focusedPlanet === planet) {
            ctx.beginPath();
            ctx.arc(x, y, size + 2 * sizeMultiplier, 0, Math.PI * 2);
            ctx.strokeStyle = '#88ccff';
            ctx.lineWidth = Math.max(1, 2 * sizeMultiplier);
            ctx.stroke();
        }
    });
    
    // Draw camera position indicator
    const camDist = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2) / scale;
    const camAngle = Math.atan2(camera.position.z, camera.position.x);
    const maxCamDist = (canvas.width / 2) - 5;
    const camX = centerX + Math.cos(camAngle) * Math.min(camDist, maxCamDist);
    const camY = centerY + Math.sin(camAngle) * Math.min(camDist, maxCamDist);
    
    const triSize = Math.max(3, 4 * sizeMultiplier);
    ctx.beginPath();
    ctx.moveTo(camX, camY);
    ctx.lineTo(camX - triSize, camY - triSize * 1.5);
    ctx.lineTo(camX + triSize, camY - triSize * 1.5);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

// Date simulation
function updateDateDisplay() {
    // Earth completes one orbit when simulationTime * 1 * 0.1 = 2*PI
    // So one Earth year = 2*PI / 0.1 = ~62.8 simulation time units
    const earthYearInSimTime = (2 * Math.PI) / 0.1;
    const yearsElapsed = simulationTime / earthYearInSimTime;
    
    // Calculate simulated date
    const simDate = new Date(baseSimulationDate);
    simDate.setFullYear(simDate.getFullYear() + Math.floor(yearsElapsed));
    const dayOfYear = (yearsElapsed % 1) * 365;
    simDate.setDate(simDate.getDate() + Math.floor(dayOfYear));
    
    // Format date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('simDate').textContent = simDate.toLocaleDateString('en-US', options);
}

// Settings panel
function setupSettingsPanel() {
    const toggle = document.getElementById('settingsToggle');
    const content = document.getElementById('settingsContent');
    
    toggle.addEventListener('click', () => {
        content.classList.toggle('hidden');
    });
    
    // Labels toggle
    document.getElementById('toggleLabels').addEventListener('change', (e) => {
        settings.showLabels = e.target.checked;
        toggleLabels(settings.showLabels);
    });
    
    // Orbits toggle
    document.getElementById('toggleOrbits').addEventListener('change', (e) => {
        settings.showOrbits = e.target.checked;
        toggleOrbits(settings.showOrbits);
    });
    
    // Effects toggle
    document.getElementById('toggleEffects').addEventListener('change', (e) => {
        settings.showEffects = e.target.checked;
        toggleEffects(settings.showEffects);
    });
    
    // Asteroids toggle
    document.getElementById('toggleAsteroids').addEventListener('change', (e) => {
        settings.showAsteroids = e.target.checked;
        if (asteroidBelt) {
            asteroidBelt.visible = settings.showAsteroids;
        }
        if (kuiperBelt) {
            kuiperBelt.visible = settings.showAsteroids;
        }
    });
}

function toggleLabels(show) {
    // Labels are inside the labelRenderer's DOM element
    const labelContainer = labelRenderer.domElement;
    labelContainer.querySelectorAll('.planet-label').forEach(label => {
        label.style.opacity = show ? '1' : '0';
    });
}

function toggleOrbits(show) {
    orbitLines.forEach(orbit => {
        orbit.visible = show;
    });
}

function toggleEffects(show) {
    // Toggle sun effects
    sunLayers.forEach(layer => {
        if (layer.mesh) layer.mesh.visible = show;
    });
    
    // Toggle planet effects
    planetEffects.forEach(effect => {
        if (effect.mesh) effect.mesh.visible = show;
    });
}

// Fullscreen
function setupFullscreen() {
    const btn = document.getElementById('fullscreenBtn');
    
    btn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            btn.innerHTML = '&#x2716;'; // X symbol
        } else {
            document.exitFullscreen();
            btn.innerHTML = '&#x26F6;'; // Fullscreen symbol
        }
    });
    
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            btn.innerHTML = '&#x26F6;';
        }
    });
}

// Touch handling for mobile devices
function setupTouchHandling() {
    // Prevent pull-to-refresh and other default gestures on the canvas
    const container = document.getElementById('container');
    
    container.addEventListener('touchmove', (e) => {
        // Allow OrbitControls to handle touch, prevent page scroll
        if (e.touches.length > 0) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent double-tap zoom on buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.click();
        });
    });
}

// Background music control
function setupBackgroundMusic() {
    const bgMusic = document.getElementById('bgMusic');
    const soundBtn = document.getElementById('soundBtn');
    let musicStarted = false;
    
    // Set initial volume
    bgMusic.volume = 0.5;
    
    // Function to start music and update UI
    function startMusic() {
        if (musicStarted) return;
        bgMusic.play().then(() => {
            musicStarted = true;
            soundBtn.innerHTML = '&#128266;'; // Speaker with sound waves
            soundBtn.classList.add('playing');
        }).catch(err => {
            console.log('Audio autoplay blocked, waiting for user interaction');
        });
    }
    
    // Try to autoplay immediately
    startMusic();
    
    // If autoplay was blocked, start on first user interaction
    function startOnInteraction() {
        if (!musicStarted) {
            startMusic();
        }
        // Remove listeners after first successful play
        if (musicStarted) {
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('touchstart', startOnInteraction);
            document.removeEventListener('keydown', startOnInteraction);
        }
    }
    
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('touchstart', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
    
    // Toggle music on button click
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering startOnInteraction twice
        
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                musicStarted = true;
                soundBtn.innerHTML = '&#128266;'; // Speaker with sound waves
                soundBtn.classList.add('playing');
            }).catch(err => {
                console.log('Audio playback failed:', err);
            });
        } else {
            bgMusic.pause();
            soundBtn.innerHTML = '&#128264;'; // Muted speaker
            soundBtn.classList.remove('playing');
        }
    });
    
    // Add keyboard shortcut (M key)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyM') {
            soundBtn.click();
        }
    });
}

// Start the application
init();
