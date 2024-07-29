import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let grid = [];
let nextGrid = [];
const aliveColor = 255; // White
const deadColor = 0;    // Black
let intervalId;
let simulationSpeed = 100; // Speed of the simulation in milliseconds

// Initialize grid with random values
function initGrid(gridWidth, gridHeight) {
  for (let y = 0; y < gridHeight; y++) {
    grid[y] = [];
    nextGrid[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      grid[y][x] = Math.random() < 0.2 ? 1 : 0; // 20% chance of being alive
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

  function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Canvas setup
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    document.getElementById(containerId).appendChild(canvas);

    // Calculate grid dimensions and cell size
    gridWidth = 100; // You can adjust this value for more or fewer cells
    gridHeight = Math.round(gridWidth * (window.innerHeight / window.innerWidth));
    cellWidth = window.innerWidth / gridWidth;
    cellHeight = window.innerHeight / gridHeight;

    camera.position.z = 5;
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    initGrid(gridWidth, gridHeight);
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
        ctx.fillStyle = grid[y][x] === 1 ? `rgb(${aliveColor},${aliveColor},${aliveColor})` : `rgb(${deadColor},${deadColor},${deadColor})`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }

  init();
}
