import * as THREE from 'three';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { createNoise3D } from 'simplex-noise';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const noise3D = createNoise3D();


export function asciiShader(containerId) {
  let scene, camera, renderer, controls, movingLight, effect, sphere, heart, currentShape;
  let animationFrameId;
  let scaleDirection = 1;
  let scaleSpeed = 0;
  let maxScale = 1.9;
  let minScale = 1.55;
  let heartCentroid = new THREE.Vector3(0, 1.25, 5);
  // let simplexNoise;
  const objDefaultScale = new THREE.Vector3(10, 10, 10); 
  let isRotationEnabled = true;
  

  function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 255, 255, 0 );

    // Create a moving light source at the heart's centroid
    movingLight = new THREE.PointLight(0xf00fff, 3, 100); // Higher intensity
    movingLight.position.set(heartCentroid.x, heartCentroid.y + 500, heartCentroid.z + 500);
    movingLight.color.set(0xff0000); // Red color
    scene.add(movingLight);

    // Add a static light with high intensity and distance
    const light = new THREE.PointLight(0xffffff, 3, 500);
    light.position.set(heartCentroid.x - 500, heartCentroid.y - 500, heartCentroid.z - 500);
    light.color.set(0x0000ff); // Blue color
    scene.add(light);

    //  ambient light for softer overall scene illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Spot light
    // const spotLight = new THREE.SpotLight(0xffffff, 0.5);
    // spotLight.position.set(5, 5, 5);
    // spotLight.angle = Math.PI / 4;
    // spotLight.penumbra = 0.1;
    // scene.add(spotLight);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.z = 2.5;

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf0f0f0);

    // AsciiEffect
    // Custom CharSet and Options
    // const customCharSet = 'x♡♥☦*⭒♥'
    const customCharSet = ' ♡❣♥☺x6☹%&*⛆@#❤☺☻  '
    const asciiOptions = {
        invert: true,
        resolution: 0.175, // Adjust for more or less detail
        // resolution: 0.3,
        scale: 1.0,       // Adjust based on your display requirements
        color: false,     // Set to true if you want colored ASCII characters
        block: false,
    };  

    // AsciiEffect with custom parameters
    effect = new AsciiEffect(renderer, customCharSet, asciiOptions);
    effect.setSize(window.innerWidth, window.innerHeight);

    // Adjust text color and background color
    effect.domElement.style.color = 'black'; // Adjust text color as needed
    effect.domElement.style.backgroundColor = 'white'; // Adjust background color as needed

    // Add AsciiEffect DOM element to the container
    document.getElementById(containerId).appendChild(effect.domElement);


    // Heart Shape
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();

    const geometry = new THREE.ExtrudeGeometry(heartShape, {
      steps: 1,
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.2,
      bevelOffset: 0,
      bevelSegments: 10
    });
    
    geometry.center();

    // OrbitControls
    controls = new OrbitControls(camera, effect.domElement);
    // controls = new MapControls( camera, effect.domElement );
    // controls = new TrackballControls(camera, renderer.domElement);

    console.log('Controls after init:', controls); // Debug log
    controls.enableDamping = true; // Optional, but makes the controls smoother
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;

    controls.rotateSpeed = 5.0; // Increase rotation speed
    controls.zoomSpeed = 1.2; // Increase zoom speed
    controls.panSpeed = 0.8; // Increase pan speed
    controls.dynamicDampingFactor = 0.2; // Lower damping factor for quicker stop
    controls.staticMoving = false; // Set to true to stop immediately on mouse release

    

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    switchShape(createHeart()); // Initialize with the heart shape
  }

  let swarmData = createSwarm();
  
// Add or subtract a point every 2 seconds
let lastUpdateTime = Date.now();

function animate() {
    requestAnimationFrame(animate);
    
    let currentTime = Date.now();
    if (currentTime - lastUpdateTime > 2000) { // Every 2 seconds
        lastUpdateTime = currentTime;
        if (Math.random() < 0.5 && swarmData.points.length > 5) {
            // Remove a point
            swarmData.points.pop();
        } else {
            // Add a point
            const randomPoint = swarmData.points[Math.floor(Math.random() * swarmData.points.length)];
            swarmData.points.push(new THREE.Vector3().copy(randomPoint));
        }
        swarmData.shape.geometry.dispose(); // Dispose old geometry
        swarmData.shape.geometry = new ConvexGeometry(swarmData.points);
    }

    // Update points positions using noise
    let time = Date.now() * 0.0001;
    swarmData.points.forEach((point, i) => {
        point.x += noise3D(i, time, 0) * 0.1;
        point.y += noise3D(time, i, 1) * 0.1;
        point.z += noise3D(i, time, 2) * 0.1;
    });

    // Update Convex Hull Geometry
    swarmData.shape.geometry.dispose(); // Dispose old geometry
    swarmData.shape.geometry = new ConvexGeometry(swarmData.points);

    // Ensure movingLight and its position are defined before accessing
    if (movingLight && movingLight.position) {
        // Animate the Z position of the moving light to create a bouncing effect
        const time = Date.now() * 0.00025; // Control the speed of the bounce
        movingLight.position.z = movingLight.position.z + Math.sin(time) * 0.01; // Adjust the multiplier to control the bounce amplitude

        // Create a swinging effect for the moving light
        movingLight.position.x = Math.sin(time) * 500;
        movingLight.position.y = 250 + Math.sin(time * 1.5) * 250;
        movingLight.position.z = 250 + Math.cos(time * 1.5) * 250;
    
    }

    // Only animate the current shape if it exists
    if (currentShape) {
        // Scale the current shape
        if ((currentShape.scale.x >= maxScale && scaleDirection > 0) || (currentShape.scale.x <= minScale && scaleDirection < 0)) {
            scaleDirection *= -1; // Reverse the scaling direction
        }
        currentShape.scale.x += scaleSpeed * scaleDirection;
        currentShape.scale.y += scaleSpeed * scaleDirection;
        currentShape.scale.z += scaleSpeed * scaleDirection;

        // Continuous rotation
        if (isRotationEnabled) {
          currentShape.rotation.x += 0.008; // Rotates the shape around the x-axis
          currentShape.rotation.y += 0.009; // Rotates the shape around the y-axis
          currentShape.rotation.z += 0.007; // Rotates the shape around the z-axis
      }
      
    }

    controls.update(); 

    // Render scene with AsciiEffect
    effect.render(scene, camera);

  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    effect.setSize(window.innerWidth, window.innerHeight);
  }

  function dispose() {
    // Clean up resources
    window.removeEventListener('resize', onWindowResize);
    cancelAnimationFrame(animationFrameId);

    if (heart) {
      scene.remove(heart);
      heart.geometry.dispose();
      heart.material.dispose();
    }

    // Clear the container
    const container = document.getElementById(containerId);
    if (container && effect.domElement) {
      container.removeChild(effect.domElement);
    }
  }

  function resetRotation() {
    if (currentShape) {
      // Reset rotation to initial state
      currentShape.rotation.set(0, 0, 0);
    }
  }  

  function switchShape({ shape, centroid }) {
    if (!shape || !centroid) {
        console.error("Invalid shape or centroid provided to switchShape");
        return;
    }
    if (shape && centroid) {
        if (currentShape) {
            scene.remove(currentShape);
            if (currentShape.geometry) currentShape.geometry.dispose();
            if (currentShape.material) currentShape.material.dispose();
        }
        currentShape = shape;
        scene.add(currentShape); // Add only the shape

        // Update the position of the moving light to the centroid of the current shape
        if (movingLight) {
            movingLight.position.set(centroid.x, centroid.y, centroid.z);
        }
    } else {
        console.error("Invalid shape or centroid provided to switchShape");
    }
}

function switchToObjModel(obj) {
  if (currentShape) {
    scene.remove(currentShape);
    if (currentShape.geometry) currentShape.geometry.dispose();
    if (currentShape.material) currentShape.material.dispose();
  }

  currentShape = obj;
  scene.add(currentShape);

  // Compute the bounding box of the OBJ model
  const boundingBox = new THREE.Box3().setFromObject(obj);

  // Calculate the maximum dimension of the bounding box
  const maxSize = Math.max(...boundingBox.getSize(new THREE.Vector3()).toArray());

  // Calculate the distance from the camera to the center of the bounding box
  const center = boundingBox.getCenter(new THREE.Vector3());
  const distance = camera.position.distanceTo(center);

  // Calculate the vertical field of view in radians
  const vFOV = THREE.MathUtils.degToRad(camera.fov);

  // Calculate the scale factor based on the maximum dimension and the camera's view frustum
  const scaleHeight = 2 * Math.tan(vFOV / 2) * distance; // Visible height
  const scaleFactor = scaleHeight / maxSize;

  // Apply the scale factor to the model
  currentShape.scale.setScalar(scaleFactor * 0.5); // Added a scaling factor of 0.5 for additional control

  // Center the model in the scene
  currentShape.position.sub(center);

  // Optionally: adjust the camera to frame the object nicely
  camera.lookAt(currentShape.position);
}

function createHeart() {
  // Heart Shape
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
      bevelThickness: 0.1,
      bevelSize: 0.2,
      bevelOffset: 0,
      bevelSegments: 10
  });
  
  geometry.center();

  const material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      specular: 0xff00ff,
      shininess: 10,
      side: THREE.FrontSide,
  });

  const heart = new THREE.Mesh(geometry, material);
  const heartCentroid = new THREE.Vector3(0, 1.25, 0); // Define the heart's centroid
  heart.rotation.x = Math.PI;
  return { shape: heart, centroid: heartCentroid };
}

function createSphere() {
  const geometry = new THREE.SphereGeometry(5.25, 20, 20);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xff0000,
    wireframe: true,
    alphaHash: true,
   });
  const sphere = new THREE.Mesh(geometry, material);
  const sphereCentroid = new THREE.Vector3(0, 0, 0); // Sphere's centroid is at its origin
  return { shape: sphere, centroid: sphereCentroid };
}

function createTorus() {
  let radius = 1.15; // Reduced radius
  let tube = 0.1;   // Reduced tube size
  let tubularSegments = 100;
  let radialSegments = 160;
  let p = 5;
  let q = 3;

  const geometry = new THREE.TorusKnotGeometry(
    radius, 
    tube, 
    tubularSegments, 
    radialSegments, 
    p, 
    q
  );

  const material = new THREE.MeshPhongMaterial({ 
    color: 0xff0000,
    wireframe: true,
   });
  const torus = new THREE.Mesh(geometry, material);
  const torusCentroid = new THREE.Vector3(0, 0, 0); // Torus's centroid is at its origin
  return { shape: torus, centroid: torusCentroid };
}

function createSwarm() {
  const points = [];
  for (let i = 0; i < 20; i++) {
      points.push(new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
      ));
  }

  const geometry = new ConvexGeometry(points);
  const material = new THREE.MeshStandardMaterial({ 
      color: 0xff00ff,
      wireframe: true,
      
  });

  const swarm = new THREE.Mesh(geometry, material);
  const swarmCentroid = new THREE.Vector3(0, 0, 0); // Initial centroid

  return { shape: swarm, centroid: swarmCentroid, points };
}

function loadObjModel(url, onLoad, onError) {
  const loader = new OBJLoader();
  loader.load(url, obj => {
      obj.traverse(function (child) {
          if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                  color: 0xff0000,
                  wireframe: false
              });
          }
      });
      onLoad(obj);
  }, undefined, onError);
}

function handleModelError(error) {
  console.error('Error loading OBJ model:', error);
}


const objFiles = [
  '3D/horse2.obj',
  '3D/cow.obj',
  '3D/internetExplorer.obj',
  '3D/untitled.obj'
  // '3D/hammer.obj',
  // '3D/head.obj',
  // '3D/television.obj',


];

let currentObjIndex = 0;

// Event listener for shape switching
window.addEventListener('keydown', (event) => {
  if (event.key === 'R' || event.key === 'r') { // 'R' key toggles rotation
    isRotationEnabled = !isRotationEnabled;
  } else if (event.key === 'T' || event.key === 't') {
    resetRotation();
  } else if (event.key === '1') {
      switchShape(createHeart());
  } else if (event.key === '2') {
      switchShape(createSphere());
  } else if (event.key === '3') {
      switchShape(createTorus());
  } else if (event.key === '4') { 
      const swarm = createSwarm(); 
      switchShape(swarm);
  } else if (event.key === '5') {
        loadObjModel(objFiles[currentObjIndex], switchToObjModel, handleModelError);

        // Increment the index and loop back if necessary
        currentObjIndex = (currentObjIndex + 1) % objFiles.length;
    }
});

    // Initialize and start the animation
    init();
    animate();

    // Return an object with all functions you want to expose
    return {
        dispose,
        switchShape
    };
}


// Usage example:
// const asciiSphere = createAsciiSphere('containerId');
// Later, to stop and clean up:
// asciiSphere.dispose();
