import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Delaunay } from 'd3-delaunay';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';


export function perpetual(containerId) {
  let scene, camera, renderer, controls;
  let buildings = [];
  let panSpeed = 0.03;
  let depth = 10; 
  let myAppFont;
  let charGeometries = {};
  let charMaterials = {};
  let strokeMaterials = {};
  let textEntities = [];



  class Building {
    constructor(x, width, height, depth, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);

        this.meshes = []; 

        // Create triangulated meshes for each face and store references
        ['front', 'back', 'left', 'right', 'top', 'bottom'].forEach(face => {
            const facePoints = this.createFacePoints(width, height, depth, face);
            const mesh = createMeshFromPoints(facePoints);
            mesh.position.set(x, height / 2, z);
            scene.add(mesh);
            this.meshes.push(mesh); // Store reference to the mesh
        });


        // Solid Mesh
        this.solidMesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                transparent: true,
                alphaHash: true,
                opacity: 0.1,
             })
        );
        this.solidMesh.position.set(x, height / 2, z);
        scene.add(this.solidMesh);

        // Wireframe poly Mesh
        this.wireframeMesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ 
                color: 0xffffff, 
                wireframe: true,
                transparent: true,
                opacity: 0 })
        );
        this.wireframeMesh.position.set(x, height / 2, z);
        scene.add(this.wireframeMesh);
        // Add solidMesh and wireframeMesh to the meshes array
        this.meshes.push(this.solidMesh, this.wireframeMesh);


        // Points Geometry
        // Create points for each face
        const frontPoints = this.createFacePoints(width, height, depth, 'front');
        const backPoints = this.createFacePoints(width, height, depth, 'back');
        const leftPoints = this.createFacePoints(width, height, depth, 'left');
        const rightPoints = this.createFacePoints(width, height, depth, 'right');
        const topPoints = this.createFacePoints(width, height, depth, 'top');
        const bottomPoints = this.createFacePoints(width, height, depth, 'bottom');

        const allPoints = [...frontPoints, ...backPoints, ...leftPoints, ...rightPoints, ...topPoints, ...bottomPoints];

        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(allPoints, 3));

        // Points Material
        const pointsMaterial = new THREE.PointsMaterial({
            color: 0x000000,
            size: 4,
            opacity: 0.666,
            transparent: true,
            alphaHash: true,
        });
        
        // Points Mesh
        this.pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
        this.pointsMesh.position.set(x, height / 2, z);
        scene.add(this.pointsMesh);
        // Add pointsMesh to the meshes array
        this.meshes.push(this.pointsMesh);

        // Add text at the base of the building
        if (myAppFont) {
            const textGeometry = new TextGeometry('', {
                font: myAppFont,
                size: 3.5, // Adjust size as needed
                height: 0.5
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(x, 0, z); 
            scene.add(textMesh);
            this.meshes.push(textMesh);
        }
           
    }

    createFacePoints(width, height, depth, face) {
        const points = [];
        const pointsPerUnit = 1.2; // Adjust this for more or fewer points
    
        let gridX, gridY;
    
        // Determine grid size based on face dimensions
        switch (face) {
            case 'front':
            case 'back':
                gridX = Math.ceil(width * pointsPerUnit);
                gridY = Math.ceil(height * pointsPerUnit);
                break;
            case 'left':
            case 'right':
                gridX = Math.ceil(depth * pointsPerUnit);
                gridY = Math.ceil(height * pointsPerUnit);
                break;
            case 'top':
            case 'bottom':
                gridX = Math.ceil(width * pointsPerUnit);
                gridY = Math.ceil(depth * pointsPerUnit);
                break;
        }
    
        // Adjust loop to cover the entire face area
        for (let i = 0; i <= gridX; i++) {
            for (let j = 0; j <= gridY; j++) {
                let posX, posY, posZ;
                    switch (face) {
                    case 'front':
                        posX = (i * width / gridX) - width / 2;
                        posY = (j * height / gridY) - height / 2;
                        posZ = depth / 2;
                        break;
                    case 'back':
                        posX = (i * width / gridX) - width / 2;
                        posY = (j * height / gridY) - height / 2;
                        posZ = -depth / 2;
                        break;
                    case 'left':
                        posX = -width / 2;
                        posY = (j * height / gridY) - height / 2;
                        posZ = (i * depth / gridX) - depth / 2;
                        break;
                    case 'right':
                        posX = width / 2;
                        posY = (j * height / gridY) - height / 2;
                        posZ = (i * depth / gridX) - depth / 2;
                        break;
                    case 'top':
                        posX = (i * width / gridX) - width / 2;
                        posY = height / 2;
                        posZ = (j * depth / gridY) - depth / 2;
                        break;
                    case 'bottom':
                        posX = (i * width / gridX) - width / 2;
                        posY = -height / 2;
                        posZ = (j * depth / gridY) - depth / 2;
                        break;
                }
                points.push(posX, posY, posZ);
            }
        }
        return points;
    }
            
    pan(delta) {
        this.meshes = this.meshes.filter(mesh => {
            // Update position
            mesh.position.x -= delta;

            // Check if the mesh is out of bounds
            if (mesh.position.x < -100) {
                mesh.position.x += 200;
                return true;  // Keep the mesh in the array
            } else if (mesh.position.x > 100) {
                scene.remove(mesh); // Remove mesh from the scene
                return false; // Remove mesh from the array
            }

            return true; // Keep the mesh in the array
        });
    }
}

function setupThreeJS() {
    scene = new THREE.Scene();
    
    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Soft white light
    scene.add(ambientLight);
    
    camera = new THREE.OrthographicCamera(
      window.innerWidth / -2, window.innerWidth / 2,
      window.innerHeight / 2, window.innerHeight / -2,
      1, 1000
    );

    // Function to get a random value within ±5% range
    function getRandomValue(baseValue) {
        var variation = baseValue * 2; // N% of the base value
        return baseValue + (Math.random() * 2 - 1) * variation;
    }

    // Set the camera position with randomized values
    camera.position.set(
        getRandomValue(150),  // Randomized z value
        200,
        getRandomValue(200)  // Randomized z value
    );

    camera.lookAt(scene.position);
    camera.zoom = 10;
    // camera.minZoom = 3.0;
    // camera.maxZoom = 5.0;
    camera.updateProjectionMatrix();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Adjust for device pixel ratio
    document.getElementById(containerId).appendChild(renderer.domElement);

    const controls = new MapControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.3;
    // controls.screenSpacePanning = true;
    controls.enableRotate = false;

    controls.enableZoom = true;
    controls.zoomSpeed = 0.2;
    // controls.minDistance = 0.05;
    // controls.maxDistance = 5;
    controls.enablePan = true;



    const fontLoader = new FontLoader();
    fontLoader.load('src/font/helvetiker_regular.typeface.json', function (font) {
        myAppFont = font;
        initializeCharGeometries();
        addBuildings();
        // addTextSprites();
        animate();
    });
}

function addBuildings() {
    // Calculate layout parameters based on viewport size
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    // Adjust starting and ending positions of the 'city' based on viewport size
    let xStart = -viewportWidth / 4;  // 
    let xEnd = viewportWidth / 4;     // 
    let zStart = -viewportHeight / 30; // 
    let zDepth = 10;                   // Depth of each row
    let zRows = Math.ceil(viewportHeight / 200); // Number of rows based on viewport height

    // Adjust building parameters
    let minWidth = 5;
    let maxWidth = 25;
    let minDepth = 5;
    let maxDepth = zDepth * 2;
    let minGap = maxWidth;
    let maxGap = viewportWidth / 4;

    let zPositions = Array.from({ length: zRows }, (_, index) => zStart + index * zDepth);

    // Clear any existing buildings from the scene
    clearBuildings();
    // clearTextEntities();

    // Create buildings based on the new layout
    zPositions.forEach(z => {
        let x = xStart;

        while (x < xEnd) {
            let width = minWidth + Math.random() * (maxWidth - minWidth);
            let height = Math.random() * 50 + 20;
            let depth = minDepth + Math.random() * (maxDepth - minDepth);
            let building = new Building(x, width, height, depth, z);
            buildings.push(building);

            let gap = minGap + Math.random() * (maxGap - minGap);
            x += width + gap;
        }
    });
}


// delaunay mesh
function createMeshFromPoints(points) {
    let delaunayPoints = [];
    for (let i = 0; i < points.length; i += 3) {
        delaunayPoints.push([points[i], points[i + 1]]);
    }

    const delaunay = Delaunay.from(delaunayPoints);
    const triangles = delaunay.triangles;

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < triangles.length; i += 3) {
        vertices.push(
            points[triangles[i] * 3], points[triangles[i] * 3 + 1], points[triangles[i] * 3 + 2],
            points[triangles[i + 1] * 3], points[triangles[i + 1] * 3 + 1], points[triangles[i + 1] * 3 + 2],
            points[triangles[i + 2] * 3], points[triangles[i + 2] * 3 + 1], points[triangles[i + 2] * 3 + 2]
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF, 
        wireframe: true,
     });
    return new THREE.Mesh(geometry, material);
}

          
  function zoomOrthographicCamera(scaleFactor) {
    camera.left *= scaleFactor;
    camera.right *= scaleFactor;
    camera.top *= scaleFactor;
    camera.bottom *= scaleFactor;
  
    camera.updateProjectionMatrix();
  }  

  function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    if (controls) {
        controls.update();


        // Clamp camera position within defined boundaries
        clampCameraPosition();
    }

    // Update buildings
    buildings.forEach(building => building.pan(panSpeed));

    // Update text entities
    panTextEntities(panSpeed);

    renderer.render(scene, camera);

    // Print camera coordinates
    // console.log(`Camera Position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);
    // console.log(`Camera Bounds: left=${camera.left}, right=${camera.right}, top=${camera.top}, bottom=${camera.bottom}`);
    
}

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Clear existing text and buildings
    clearBuildings();
    clearTextEntities(); // Implement this function to remove existing text meshes

    // Recalculate and add buildings and text based on new window size
    addBuildings();

    // Clear and regenerate text entities
    textEntities.forEach(textEntity => scene.remove(textEntity));
    textEntities = [];
    // addTextSprites();
    
}

function clearTextEntities() {
    textEntities.forEach(textEntity => scene.remove(textEntity));
    textEntities = [];
}


function addTextSprites() {
    const word = 'x'; // Word to be displayed
    const charSize = 2; // Size of each character
    const charSpacingX = 36; // Horizontal spacing between characters
    const charSpacingZ = 12; // Vertical spacing between characters

    // Calculate how many characters can fit in the viewport
    const numCharsX = Math.floor(window.innerWidth / charSpacingX);
    const numCharsZ = Math.floor(window.innerHeight / charSpacingZ);

    // Calculate starting positions
    const startX = -(numCharsX * charSpacingX) / 2;
    const startZ = -(numCharsZ * charSpacingZ) / 2;

    // Create text meshes in a grid
    for (let i = 0; i < numCharsX; i++) {
        for (let j = 0; j < numCharsZ; j++) {
            const charIndex = (i + j) % word.length; // Cycle through the word
            const character = word[charIndex];
            const position = new THREE.Vector3(startX + i * charSpacingX, 0.5, startZ + j * charSpacingZ);
            const textMesh = createTextMesh(character, position, charSize);
            if (textMesh) {
                scene.add(textMesh);
            }
        }
    }
}


function createTextMesh(character, position, size) {
    if (!myAppFont || !charGeometries[character]) {
        console.error("Font is not loaded or character geometry is not created yet.");
        return;
    }

    const fillMesh = new THREE.Mesh(charGeometries[character], charMaterials[character]);
    fillMesh.position.set(0, 0, 0); // Position set to 0 since group will be positioned
    fillMesh.rotation.x = -Math.PI / 2;

    const strokeMesh = new THREE.Mesh(charGeometries[character], strokeMaterials[character]);
    strokeMesh.position.set(0, -0.1, 0); // Slightly lower to avoid z-fighting
    strokeMesh.rotation.x = -Math.PI / 2;
    strokeMesh.scale.multiplyScalar(1.04); // Scale up for stroke effect

    // Group the fill and stroke meshes
    const textGroup = new THREE.Group();
    textGroup.add(strokeMesh);
    textGroup.add(fillMesh);

    // Position the group
    textGroup.position.set(position.x, position.y, position.z);

    textEntities.push(textGroup);
    return textGroup;
}

function panTextEntities(delta) {
    textEntities = textEntities.filter(textEntity => {
        textEntity.position.x -= delta;

        // Check bounds and reset position if necessary
        if (textEntity.position.x < -100) {
            textEntity.position.x += 200;
            return true;
        } else if (textEntity.position.x > 100) {
            // Remove textEntity from the scene and array
            scene.remove(textEntity);
            return false;
        }

        return true;
    });
}


function initializeCharGeometries() {
    const word = 'x';
    const size = 4;
    const height = 0.2;
    const curveSegments = 4; // Reduced for performance

    word.split('').forEach(char => {
        if (!charGeometries[char]) {
            charGeometries[char] = new TextGeometry(char, {
                font: myAppFont,
                size: size,
                height: height,
                curveSegments: curveSegments,
                bevelEnabled: false
            });

            charMaterials[char] = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Fill color
            strokeMaterials[char] = new THREE.MeshBasicMaterial({ color: 0xFFFFFF }); // Stroke color
        }
    });
}


function clearBuildings() {
    buildings.forEach(building => {
        building.meshes.forEach(mesh => {
            scene.remove(mesh); // Remove each mesh from the scene
        });
    });
    buildings = []; // Clear the buildings array
}

function clampCameraPosition() {
    const minX = -50, maxX = 50;
    const minY = 10, maxY = 100;
    const minZ = -50, maxZ = 50;

    // Clamp camera position
    camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
    camera.position.y = Math.max(minY, Math.min(maxY, camera.position.y));
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
}


  setupThreeJS();
  addBuildings();
  animate();

  window.addEventListener('resize', onWindowResize, false);
}
