import * as THREE from 'three';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function asciiHearts(containerId) {
  let scene, camera, renderer, effect, controls;
  let hearts = []; // Array to store multiple hearts
  let animationFrameId;
  let animateHearts = true;

  function init() {
    // Scene
    scene = new THREE.Scene();
    // scene.background = null;

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    // Renderer
    renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0xC0C0C0, 0 ); // the default

    // AsciiEffect
    const customCharSet = ' ♡❣♥☺x6☹%&*⛆@#❤☺☻'
    const asciiOptions = {
        invert: false,
        resolution: 0.2, // Adjust for more or less detail
        scale: 0.5,       // Adjust based on display requirements
        color: false,  
        block: true,
    };  

    // AsciiEffect with custom parameters
    effect = new AsciiEffect(renderer, customCharSet, asciiOptions);
    effect.setSize(window.innerWidth, window.innerHeight);

    const container = document.getElementById(containerId);
    container.appendChild(effect.domElement);
    container.style.background = '#C0C0C0'; // Set the ASCII effect container background color
  

    // document.getElementById(containerId).appendChild(effect.domElement);

    // Controls
    controls = new OrbitControls(camera, effect.domElement);
    controls.autoRotate = true;
    controls.enableZoom = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

  // Variables to store sum of all heart positions
  let sumX = 0, sumY = 0, sumZ = 0;

  // Create multiple hearts
  for (let i = 0; i < 12; i++) {
    let heartObject = createHeart();
    let heartMesh = heartObject.shape;
    heartMesh.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
    heartMesh.scale.setScalar(Math.random() * 1.0 + 1.0);
    heartMesh.rotationSpeed = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.02);
    hearts.push(heartMesh);
    scene.add(heartMesh);

    // Add position to sum
    sumX += heartMesh.position.x;
    sumY += heartMesh.position.y;
    sumZ += heartMesh.position.z;
  }

  // Calculate centroid
  const centroid = new THREE.Vector3(sumX / hearts.length, sumY / hearts.length, sumZ / hearts.length);

  // Add a bright light at the centroid
  const brightLight = new THREE.PointLight(0xffffff, 1.5, 100);
  brightLight.position.set(centroid.x, centroid.y, centroid.z);
  scene.add(brightLight);

    // Additional lights
    const numberOfLights = 20; // You can adjust the number of lights
    for (let i = 0; i < numberOfLights; i++) {
      const intensity = Math.random() * 50; // Random intensity between 0 and 1.5
      const lightColor = 0xffffff; // White light, you can change to different colors if needed
  
      const light = new THREE.PointLight(lightColor, intensity, 50); // Adjust the last parameter for the light's influence range
  
      // Random position within scene bounds
      light.position.set(
        Math.random() * 40 - 20, // Random x between -20 and 20
        Math.random() * 40 - 20, // Random y between -20 and 20
        Math.random() * 40 - 20  // Random z between -20 and 20
      );
  
      scene.add(light);
    }  

      // Keyboard event listener
  window.addEventListener('keydown', (event) => {
    if (event.key === 'r') {
        animateHearts = !animateHearts; // Toggle the state of animateHearts
        controls.autoRotate = animateHearts; // Also toggle the autoRotate feature of the OrbitControls
        console.log(animateHearts)
    } else if (event.key === 't') {
      if (hearts.length > 0) {
        const heartToRemove = hearts.pop(); // Remove the last heart
        scene.remove(heartToRemove);
        heartToRemove.geometry.dispose();
        heartToRemove.material.dispose();
      }
    } else if (event.key === 'y') {
      const newHeart = createHeart().shape; // Assuming createHeart returns { shape: heart, centroid: heartCentroid }
      newHeart.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
      newHeart.scale.setScalar(Math.random() * 1.0 + 1.0);
      newHeart.rotationSpeed = new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.02);
      hearts.push(newHeart);
      scene.add(newHeart);
    }
  });


    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);
  
    if (animateHearts) {
      hearts.forEach(heart => {
        heart.rotation.x += heart.rotationSpeed.x;
        heart.rotation.y += heart.rotationSpeed.y;
        heart.rotation.z += heart.rotationSpeed.z;
      });
    }
  
    controls.update();
    effect.render(scene, camera);
  }
  
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    effect.setSize(window.innerWidth, window.innerHeight);
  }

  function createHeart() {
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
  
    const geometry = new THREE.ExtrudeGeometry(heartShape, {
        steps: 1,
        depth: 0.15,
        bevelEnabled: true,
        bevelThickness: 0.25,
        bevelSize: 0.4,
        bevelOffset: 0,
        bevelSegments: 10
      });
    
    geometry.center();
  
    const material = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        specular: 0xffffff,
        shininess: 200,
        side: THREE.DoubleSide,
        wireframe: false,
    });
  
    const heart = new THREE.Mesh(geometry, material);
    const heartCentroid = new THREE.Vector3(0, 1.25, 0); // Define the heart's centroid
    heart.rotation.x = Math.PI;
    return { shape: heart, centroid: heartCentroid };
  }
  
  init();
  animate();

  return {
    dispose: () => {
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animationFrameId);
      hearts.forEach(heart => {
        scene.remove(heart);
        heart.geometry.dispose();
        heart.material.dispose();
      });
    }
  };
}