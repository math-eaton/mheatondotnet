import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let grid = [];
let nextGrid = [];
const aliveColor = 255; // max greyscale
const deadColor = 55; // min
let intervalId;
let simulationSpeed = 75; // Speed of the simulation in milliseconds
let isMouseDown = false; // Track mouse/touch state
let raycaster, mouse; // Raycaster and mouse vector

// Initialize grid with random values
function initGrid(gridWidth, gridHeight) {
  for (let y = 0; y < gridHeight; y++) {
    grid[y] = [];
    nextGrid[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      grid[y][x] = Math.random() < 0.0666 ? 1 : 0; // N% chance of being alive -> 1 else 0
      nextGrid[y][x] = 0;
    }
  }
}

// Compute next grid state based on Game of Life rules
function computeNextGrid(gridWidth, gridHeight) {
  let changes = 0;
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const aliveNeighbors = getAliveNeighbors(x, y, gridWidth, gridHeight);
      if (grid[y][x] === 1) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
          nextGrid[y][x] = 0; // Cell dies
          changes++;
        } else {
          nextGrid[y][x] = 1; // Cell stays alive
        }
      } else {
        if (aliveNeighbors === 3) {
          nextGrid[y][x] = 1; // Cell becomes alive
          changes++;
        } else {
          nextGrid[y][x] = 0; // Cell stays dead
        }
      }
    }
  }

  // Swap grids
  [grid, nextGrid] = [nextGrid, grid];

  return changes; // Return number of changes
}

// Get number of alive neighbors for a cell
function getAliveNeighbors(x, y, gridWidth, gridHeight) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
        count += grid[ny][nx];
      }
    }
  }
  return count;
}

// Initialize Three.js scene and canvas
export function life(containerId) {
  let scene, camera, renderer, controls, canvas, ctx;
  let gridWidth, gridHeight;
  let cellWidth, cellHeight;
  let plane;

  function init() {

    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    // camera = new THREE.OrthographicCamera(
    //     (viewSize * aspectRatio) / -2,
    //     (viewSize * aspectRatio) / 2,
    //     viewSize / 2,
    //     viewSize / -2,
    //     0.1,
    //     1000
    //   );
  
  
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Canvas setup
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.zIndex = '1'; // Ensure the canvas is behind other elements
    ctx = canvas.getContext('2d');
    document.getElementById(containerId).appendChild(canvas);

    // Calculate grid dimensions and cell size
    let resolutionFactor = 250; // greater number = higher res grid
    const initialResolution = Math.min(window.innerWidth, window.innerHeight) / resolutionFactor;
    gridWidth = Math.floor(window.innerWidth / initialResolution);
    gridHeight = Math.floor(window.innerHeight / initialResolution);
    cellWidth = window.innerWidth / gridWidth;
    cellHeight = window.innerHeight / gridHeight;

    camera.position.z = Math.max(gridWidth, gridHeight) / 2;
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    initGrid(gridWidth, gridHeight);

    // Create a plane for raycasting
    const planeGeometry = new THREE.PlaneGeometry(gridWidth, gridHeight);
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 0, 0);
    scene.add(plane);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    addEventListeners(); // Add event listeners for mouse and touch events
    animate();
  }

  function animate() {
    intervalId = setInterval(() => {
      const changes = computeNextGrid(gridWidth, gridHeight);
      drawGrid();

      if (changes === 0) {
        initGrid(gridWidth, gridHeight); // Reinitialize grid if no changes
      }

      controls.update();
    }, simulationSpeed);
  }

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (grid[y][x] === 1) {
          ctx.fillStyle = `rgb(${aliveColor},${aliveColor},${aliveColor})`;
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }
      }
    }
  }

  function addEventListeners() {
    canvas.addEventListener('mousedown', (event) => {
      isMouseDown = true;
      createAgent(event);
    });

    canvas.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    canvas.addEventListener('mousemove', (event) => {
      if (isMouseDown) {
        createAgent(event);
      }
      createAgent(event); // Create agent on mouse move
    });

    canvas.addEventListener('touchstart', (event) => {
      isMouseDown = true;
      createAgent(event.touches[0]);
    });

    canvas.addEventListener('touchend', () => {
      isMouseDown = false;
    });

    canvas.addEventListener('touchmove', (event) => {
      if (isMouseDown) {
        createAgent(event.touches[0]);
      }
      createAgent(event.touches[0]); // Create agent on touch move
    });
  }

  function createAgent(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);

    console.log(`Mouse: (${mouse.x}, ${mouse.y})`);
    console.log(`Intersects:`, intersects);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const worldX = intersect.point.x + gridWidth / 2;
      const worldY = gridHeight / 2 - intersect.point.y;

      const x = Math.floor((worldX * gridWidth) / plane.geometry.parameters.width);
      const y = Math.floor((worldY * gridHeight) / plane.geometry.parameters.height);

      console.log(`Grid Position: (${x}, ${y})`);

      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        // Create a NxN cluster of living cells
        let cluster = 2;
        for (let dy = -cluster; dy < cluster; dy++) {
          for (let dx = -cluster; dx < cluster; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
              grid[ny][nx] = 1; // Set the cell to alive
            }
          }
        }
      }
    }
  }

  init();
}
