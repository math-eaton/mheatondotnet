import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let grid = [];
let nextGrid = [];
const aliveColor = 55; // greyscale
// const deadColor = 55; // min
let simulationSpeed = 50; // Speed of the simulation in milliseconds
let isMouseDown = false; // Track mouse/touch state
let mouseDownStartTime = 0; // Track mouse down start time
let raycaster, mouse; // Raycaster and mouse vector
let currentRuleIndex = 2; // Track current rule set - init with day & night
let intervalId;

// Different cellular automata rules
const rules = [
  { // Conway's Game of Life
    survive: [2, 3],
    birth: [3]
  },
  { // Rule 30 (Wolfram's Rule 30 approximation for 2D)
    survive: [],
    birth: [1, 2]
  },
  { // Day & Night
    survive: [3, 4, 6, 7, 8],
    birth: [3, 6, 7, 8]
  },
  // { // Seeds
  //   survive: [],
  //   birth: [2]
  // },
  { // Maze
    survive: [1, 2, 3, 4, 5],
    birth: [3]
  },
  { // Coral
    survive: [4, 5, 6, 7, 8],
    birth: [3]
  },
  { // Morley
    survive: [2, 4, 5],
    birth: [3, 6, 8]
  },
  { // Anneal
    survive: [4, 6, 7, 8],
    birth: [3, 5, 6, 7, 8]
  }
];

// Initialize grid with random values
function initGrid(gridWidth, gridHeight) {
  for (let y = 0; y < gridHeight; y++) {
    grid[y] = [];
    nextGrid[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      grid[y][x] = Math.random() < 0.4 ? 1 : 0; // N% chance of being alive -> 1 else 0
      nextGrid[y][x] = 0;
    }
  }
}

// Compute next grid state based on selected rule set
function computeNextGrid(gridWidth, gridHeight) {
  let changes = 0;
  const rule = rules[currentRuleIndex];
  
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const aliveNeighbors = getAliveNeighbors(x, y, gridWidth, gridHeight);
      if (grid[y][x] === 1) {
        if (!rule.survive.includes(aliveNeighbors)) {
          nextGrid[y][x] = 0; // Cell dies
          changes++;
        } else {
          nextGrid[y][x] = 1; // Cell stays alive
        }
      } else {
        if (rule.birth.includes(aliveNeighbors)) {
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
    camera = new THREE.PerspectiveCamera(
        52, 
        (window.innerWidth / window.innerHeight),
        0.1,
        1000,);

    
    // alt ortho version
    // const aspectRatio = window.innerWidth / window.innerHeight;
    // const viewSize = 50;
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

    // Calculate grid dimensions and cell size with responsive resolution
    const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
    let resolutionFactor;
    
    if (isMobile) {
      // Lower resolution factor for mobile = larger cells
      resolutionFactor = 80; // Larger cells on mobile for better visibility
    } else {
      resolutionFactor = 250; // Higher resolution on desktop
    }
    
    const initialResolution = Math.min(window.innerWidth, window.innerHeight) / resolutionFactor;
    gridWidth = Math.floor(window.innerWidth / initialResolution);
    gridHeight = Math.floor(window.innerHeight / initialResolution);
    cellWidth = window.innerWidth / gridWidth;
    cellHeight = window.innerHeight / gridHeight;

    camera.position.z = resolutionFactor;
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;

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
    // Adjust simulation speed based on device type for better performance
    const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
    const adaptiveSpeed = isMobile ? 75 : simulationSpeed; // Slightly slower on mobile for better performance
    
    intervalId = setInterval(() => {
      const changes = computeNextGrid(gridWidth, gridHeight);
      drawGrid();

      if (changes === 0) {
        initGrid(gridWidth, gridHeight); // Reinitialize grid if no changes
      }

      controls.update();
    }, adaptiveSpeed);
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
      if (event.button === 2) {
        event.preventDefault();
        cycleRules();
      } else {
        isMouseDown = true;
        mouseDownStartTime = Date.now();
        createAgent(event, true);
      }
    });

    canvas.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    canvas.addEventListener('mousemove', (event) => {
      if (isMouseDown) {
        createAgent(event, true);
      } else {
        createAgent(event, false); // Create agent on mouse move
      }
    });

    canvas.addEventListener('touchstart', (event) => {
      isMouseDown = true;
      mouseDownStartTime = Date.now();
      createAgent(event.touches[0], true);
      if (event.targetTouches.length === 2) {
        cycleRules();
      }
    });

    canvas.addEventListener('touchend', () => {
      isMouseDown = false;
    });

    canvas.addEventListener('touchmove', (event) => {
      if (isMouseDown) {
        createAgent(event.touches[0], true);
      } else {
        createAgent(event.touches[0], false); // Create agent on touch move
      }
    });

    // Disable context menu on canvas to allow right-click detection
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    // Handle window resize for responsive behavior
    window.addEventListener('resize', () => {
      // Clear existing interval
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      // Reinitialize with new dimensions
      setTimeout(() => {
        init();
      }, 100); // Small delay to ensure window has finished resizing
    });
  }

  function createAgent(event, isMouseDown) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);

    // console.log(`Mouse: (${mouse.x}, ${mouse.y})`);
    // console.log(`Intersects:`, intersects);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const worldX = intersect.point.x + gridWidth / 2;
      const worldY = gridHeight / 2 - intersect.point.y;

      const x = Math.floor((worldX * gridWidth) / plane.geometry.parameters.width);
      const y = Math.floor((worldY * gridHeight) / plane.geometry.parameters.height);

      // console.log(`Grid Position: (${x}, ${y})`);

      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
        let clusterSize = isMobile ? 2 : 3; // Smaller default cluster on mobile due to larger cells
        
        if (isMouseDown) {
          const timeHeld = Math.floor((Date.now() - mouseDownStartTime) / 1000);
          clusterSize = Math.floor((isMobile ? 1.5 : 2) * Math.pow(2, timeHeld)); // Adjust growth rate for mobile
        }

        // Create a NxN cluster of living cells
        for (let dy = -clusterSize; dy < clusterSize; dy++) {
          for (let dx = -clusterSize; dx < clusterSize; dx++) {
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

  function cycleRules() {
    currentRuleIndex = (currentRuleIndex + 1) % rules.length;
    console.log(`Switched to rule set: ${currentRuleIndex}`);
  }

  init();
}
