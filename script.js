import * as THREE from 'three';
// Optional: Import OrbitControls for debugging camera
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Basic Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true, // Smoother edges
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(5); // Initial camera position

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Soft ambient light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5, 100); // Brighter point light
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Optional: Light Helper for debugging
// const lightHelper = new THREE.PointLightHelper(pointLight);
// scene.add(lightHelper);

// Optional: Grid Helper for debugging
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(gridHelper);

// Optional: Orbit Controls for debugging
// const controls = new OrbitControls(camera, renderer.domElement);

// --- Objects (Create more interesting geometries!) ---
// Torus Knot for Hero
const geometryKnot = new THREE.TorusKnotGeometry(1.5, 0.3, 150, 20);
const materialKnot = new THREE.MeshStandardMaterial({
    color: 0x6200ea, // Purple
    wireframe: true, // Cool wireframe look
    roughness: 0.5,
    metalness: 0.7,
});
const torusKnot = new THREE.Mesh(geometryKnot, materialKnot);
torusKnot.position.set(0, 0, 0); // Initial position for hero
scene.add(torusKnot);

// Abstract Shape for About/Skills (Example: Icosahedron)
const geometryIcosa = new THREE.IcosahedronGeometry(1.8, 0); // Radius 1.8, detail 0
const materialIcosa = new THREE.MeshStandardMaterial({
    color: 0x03dac6, // Teal
    flatShading: true, // Faceted look
    roughness: 0.3,
    metalness: 0.5,
});
const icosahedron = new THREE.Mesh(geometryIcosa, materialIcosa);
icosahedron.position.set(-10, -15, -15); // Positioned further away initially
scene.add(icosahedron);


// Particle System for background stars/dust
const particleCount = 5000;
const particlesGeometry = new THREE.BufferGeometry();
const posArray = new Float32Array(particleCount * 3); // x, y, z for each particle

for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100; // Spread particles randomly
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending, // Brighter where particles overlap
});
const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleMesh);


// --- Mouse Interaction ---
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    // Normalize mouse position from -1 to +1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});


// --- Scroll Interaction ---
let scrollY = window.scrollY;
let currentSectionIndex = 0;
const sectionBreakpoints = [0, 0.25, 0.5, 0.75]; // Normalized scroll positions for section changes
const contentSections = document.querySelectorAll('.content-section');

function updateSceneOnScroll() {
    scrollY = window.scrollY;
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollY / scrollMax;

    // --- Camera Movement ---
    // Simple linear movement - can be improved with curves or GSAP
    // Target Z positions for camera based on scroll fraction
    const camStartZ = 5;
    const camMidZ = -10;
    const camEndZ = -25; // Adjust these values

    if (scrollFraction < 0.4) { // Move towards mid point
        camera.position.z = THREE.MathUtils.lerp(camStartZ, camMidZ, scrollFraction / 0.4);
    } else { // Move towards end point
         camera.position.z = THREE.MathUtils.lerp(camMidZ, camEndZ, (scrollFraction - 0.4) / 0.6);
    }

     // Example: Move camera slightly left/right based on scroll
    camera.position.x = THREE.MathUtils.lerp(0, -5, scrollFraction);


    // --- Object Animations based on Scroll ---
    // Rotate the Knot based on scroll
    torusKnot.rotation.y = scrollFraction * Math.PI * 2;

    // Bring Icosahedron into view and rotate
    const icosaTargetPos = new THREE.Vector3(-2, -1, -10); // Target position when 'About' is active
    const icosaStartPos = new THREE.Vector3(-10, -15, -15); // Initial position
    // Lerp position between start and target based on scroll (e.g., between 15% and 45% scroll)
    const icosaProgress = THREE.MathUtils.smoothstep(scrollFraction, 0.15, 0.45); // Smooth transition
    icosahedron.position.lerpVectors(icosaStartPos, icosaTargetPos, icosaProgress);
    icosahedron.rotation.x = scrollFraction * Math.PI * 1.5;
    icosahedron.rotation.z = scrollFraction * Math.PI * 1;


    // --- Update Overlay Content Visibility ---
    let newSectionIndex = 0;
    for (let i = sectionBreakpoints.length - 1; i >= 0; i--) {
        if (scrollFraction >= sectionBreakpoints[i]) {
            newSectionIndex = i;
            break;
        }
    }

    if (newSectionIndex !== currentSectionIndex) {
        contentSections[currentSectionIndex].classList.remove('active');
        contentSections[newSectionIndex].classList.add('active');
        currentSectionIndex = newSectionIndex;
    }
}

window.addEventListener('scroll', updateSceneOnScroll, { passive: true }); // Use passive listener


// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Subtle Idle Animations
    torusKnot.rotation.x += 0.001;
    torusKnot.rotation.y += 0.0005;

    icosahedron.rotation.y += 0.002; // Gentle continuous rotation

    // Particle Animation (subtle movement)
    particleMesh.rotation.y += 0.0002;

    // --- Mouse Interactions ---
    // Make camera slightly follow mouse for parallax effect
    // Lerp for smoothness: target = current + (destination - current) * easingFactor
    const parallaxFactor = 0.5;
    camera.position.x += (mouse.x * parallaxFactor - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * parallaxFactor - camera.position.y) * 0.02;
    camera.lookAt(scene.position); // Ensure camera always looks at the center

    // Optional: Update controls if using OrbitControls for debugging
    // controls.update();

    renderer.render(scene, camera);
}

// --- Handle Window Resize ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// --- Loading Manager & Initial Call ---
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.getElementById('loading-screen');

loadingManager.onLoad = () => {
    console.log('Assets Loaded');
    // Slight delay before fading out loader for smoother transition
    setTimeout(() => {
        if(loadingScreen) loadingScreen.classList.add('fade-out');
         // Trigger initial scroll update to set the scene correctly
        updateSceneOnScroll();
        // Start the animation loop ONLY after loading (if using loaders)
        animate();
    }, 500); // 500ms delay
};

loadingManager.onError = (url) => {
    console.error('Error loading asset:', url);
    // Handle loading errors - maybe show an error message
     if(loadingScreen) loadingScreen.innerHTML = '<p>Error loading experience. Please try refreshing.</p>';
};

// If not using external assets that need the manager, call directly:
if (!loadingManager.isLoading) {
    loadingManager.onLoad(); // Manually trigger onLoad if no assets registered
}
// Make sure updateSceneOnScroll is called once initially
updateSceneOnScroll();
// Note: If using asset loaders (like GLTFLoader), you'd pass the manager to them:
// const loader = new GLTFLoader(loadingManager);
// loader.load(...);
// In that case, you would NOT call animate() directly here, but within manager.onLoad.


        
