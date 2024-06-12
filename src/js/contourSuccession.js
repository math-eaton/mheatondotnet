import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function contourSuccession(containerId) {
  let scene;
  let camera;
  let renderer;
  let circlesGroup;
  const container = document.getElementById(containerId);

  const noise2D = createNoise2D();

  if (!container) {
    console.error('Container element not found');
    return;
  }

  if (container.clientHeight === 0) {
    container.style.height = '100vh';
  }

  let pixelationFactor = 0.9; // Initial pixelation factor
  const decrement = 13;

  function createDeformedOval(diameter, noiseOffset = 0, segments = 50) {
    const radius = diameter / 2;
    const shape = new THREE.Shape();

    const noiseScale = 0.65;
    const amplitude = 10;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius * noiseScale;
      const y = Math.sin(angle) * radius * noiseScale;

      const noise = noise2D(x + noiseOffset, y + noiseOffset) * amplitude;
      const nx = x + noise;
      const ny = y + noise;

      if (i === 0) {
        shape.moveTo(nx, ny);
      } else {
        shape.lineTo(nx, ny);
      }
    }

    return shape;
  }

  function updateContours(noiseOffset) {
    circlesGroup.clear(); // Remove all objects from the group

    const width = container.clientWidth;
    const height = container.clientHeight;
    const initialOvalWidth = width / 1.5;
    const initialOvalHeight = height / 3;

    // Re-create and deform the exterior oval with the new noise offset
    const exteriorShape = createDeformedOval(initialOvalWidth, noiseOffset);
    const exteriorGeometry = new THREE.ShapeGeometry(exteriorShape);
    const exteriorEdges = new THREE.EdgesGeometry(exteriorGeometry);
    const exteriorLine = new THREE.LineSegments(
      exteriorEdges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    circlesGroup.add(exteriorLine);

    // Re-create interior concentric circles by scaling the exterior shape
    let scale = 1 - decrement / Math.min(initialOvalWidth, initialOvalHeight);
    for (
      let ovalWidth = initialOvalWidth - decrement,
        ovalHeight = initialOvalHeight - decrement;
      ovalWidth > 1 && ovalHeight > 1;
      ovalWidth -= decrement,
        ovalHeight -= decrement,
        scale -= decrement / Math.min(initialOvalWidth, initialOvalHeight)
    ) {
      const scaledGeometry = exteriorGeometry.clone().scale(scale, scale, 1);
      const scaledEdges = new THREE.EdgesGeometry(scaledGeometry);
      const scaledLine = new THREE.LineSegments(
        scaledEdges,
        new THREE.LineBasicMaterial({ color: 0xffffff })
      );
      circlesGroup.add(scaledLine);
    }
  }

  function updateDimensions() {
    // Adjust pixelation factor based on screen size
    pixelationFactor = Math.min(window.innerWidth, window.innerHeight) < 768 ? 0.75 : 0.7;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.left = width / -1.85;
    camera.right = width / 1.85;
    camera.top = height / 1.85;
    camera.bottom = height / -1.85;
    camera.updateProjectionMatrix();

    // Calculate low-resolution dimensions based on the pixelation factor
    const pixelatedWidth = width * pixelationFactor;
    const pixelatedHeight = height * pixelationFactor;

    renderer.setSize(pixelatedWidth, pixelatedHeight); // Apply pixelated dimensions
    renderer.setPixelRatio(1);

    // Scale the canvas to fit the full browser width while keeping the pixelated effect
    const scale = 1 / pixelationFactor;
    renderer.domElement.style.transform = `scale(${scale})`;
    renderer.domElement.style.transformOrigin = 'center';

    // Adjust the renderer and container size
    renderer.domElement.style.width = `${width}px`;
    renderer.domElement.style.height = `${height}px`;

    updateContours(0); // Update contours with new dimensions
  }

  function init() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
      container.clientWidth / -2,
      container.clientWidth / 2,
      container.clientHeight / 2,
      container.clientHeight / -2,
      0.0001,
      50000
    );
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    container.appendChild(renderer.domElement);

    circlesGroup = new THREE.Group();
    scene.add(circlesGroup); // Add the empty group to the scene

    updateDimensions(); // Initial setup

    let noiseOffset = 0;
    setInterval(() => {
      noiseOffset += 0.1; // Increment the noise offset for each update
      updateContours(noiseOffset); // Update contours with the new noise offset
    }, 50); // Update N times per second (e.g. 100 = 10fps)

    // Set up the resize event listener
    window.addEventListener('resize', updateDimensions);

    // Initialize OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    
    // Set maximum and minimum azimuthal and polar angles
    controls.maxAzimuthAngle = Math.PI * 0.05; // 5% of 360 degrees
    controls.minAzimuthAngle = -Math.PI * 0.05;
    controls.maxPolarAngle = Math.PI * 0.5; // Restrict to top-down view
    controls.minPolarAngle = Math.PI * 0.5;
    
    // Disable rotation
    // controls.enableRotate = false;
    controls.enablePan = false; // Optionally disable panning if not needed
}

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  init();
  animate();
}
