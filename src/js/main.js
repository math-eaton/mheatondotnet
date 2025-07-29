////////
import { shapeshift } from "./shapeshift.js";
import { asciiHearts } from "./hearts.js";
import { contour_degrade } from "./contours.js";
import { modelLoader } from "./primitives.js";
import { life } from "./life.js";
import { wavetable } from "./wavetable.js";
// import { toWords } from 'number-to-words';

const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;

const visualizations = [
  { func: modelLoader, container: "horseContainer1" },
  { func: shapeshift, container: "asciiContainer1" },
  { func: asciiHearts, container: "heartsContainer1" },
  { func: contour_degrade, container: "contourContainer1" },
  { func: life, container: "lifeContainer1" },
];

const aboutVisualizations = [
  { func: asciiHearts, container: "heartsContainer1" },
];

const cvVisualizations = [
  { func: modelLoader, container: "horseContainer1" },
  // { func: wavetable, container: "wavetableContainer1" },
  // { func: life, container: "lifeContainer1" },
];

// hex codes for random background colors
const hexCodes = ['#3a6ea5', '#444444', '#c25237', '#524bd0', '#344242'];

let activeColor = null;
let activeVisualization = null;

// Helper to determine which set of visualizations to load
function getVisualizationSet() {
  const path = window.location.pathname.toLowerCase();

  if (path.includes('about')) {
    return aboutVisualizations;
  } else if (path.includes('cv')) {
    return cvVisualizations;
  } else {
    return visualizations;
  }
}

// change the overlay color and homepage background
function changeBackgroundColor() {
  let randomColor;
  do {
    randomColor = hexCodes[Math.floor(Math.random() * hexCodes.length)];
  } while (randomColor === activeColor);

  const overlay = document.getElementById('overlay');
  if (overlay) {
    // Apply color to overlay with 50% opacity for blend effect
    overlay.style.backgroundColor = `${randomColor}`; // Adding 70 for 70% alpha
  }

  // const homepage = document.getElementById('homepage');
  // if (homepage) {
  //   // Update the homepage background color directly
  //   homepage.style.backgroundColor = randomColor;
  // }
  
  activeColor = randomColor;
  console.log(`Background color changed to: ${randomColor}`);
}

// load a random visualization
function loadRandomVisualization() {
  const visualizationSet = getVisualizationSet();

  if (visualizationSet.length === 0) {
    console.warn("No visualizations available for this page.");
    return;
  }

  let randomIndex;
  let newVisualization;

  do {
    randomIndex = Math.floor(Math.random() * visualizationSet.length);
    newVisualization = visualizationSet[randomIndex];
  } while (activeVisualization && newVisualization.container === activeVisualization.container);

  const { func, container } = newVisualization;

  // Check if the container exists, if not, create it
  let containerElement = document.getElementById(container);
  if (!containerElement) {
    // Create a new container for this visualization
    containerElement = document.createElement('div');
    containerElement.id = container;
    containerElement.className = 'vis-container';
    // Append it to the figure.interactive container
    const figureContainer = document.querySelector('.figure.interactive');
    if (figureContainer) {
      figureContainer.appendChild(containerElement);
    } else {
      console.error('.figure.interactive not found. Make sure it exists in your HTML.');
      return;
    }
  }

  // Hide the currently active visualization if there is one
  if (activeVisualization) {
    const oldContainerElement = document.getElementById(activeVisualization.container);
    if (oldContainerElement) oldContainerElement.style.display = 'none';
  }

  // Show the new one
  containerElement.style.display = 'block';
  func(container);
  activeVisualization = { func, container };

  // Show/hide GUI toggle based on whether primitives.js (modelLoader) is active
  updateGUIToggleVisibility(func);
}

// switch to a new random background color
function switchBackgroundColor() {
  changeBackgroundColor();
}

// change cursor on mousedown and mouseup
function setupCustomCursor() {
  document.addEventListener('mousedown', () => {
    document.body.style.cursor = 'url("../cursor/arrow.cur"), auto';
  });
  document.addEventListener('mouseup', () => {
    document.body.style.cursor = 'auto';
  });
}

// Initialize default background colors
function initializeBackgroundColors() {
  // TEMPORARILY COMMENTED OUT FOR RECOMPOSITION
  /*
  const defaultColor = '#c25237';
  activeColor = defaultColor;
  
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.style.backgroundColor = `${defaultColor}50`; // 70% alpha
  }

  const homepage = document.getElementById('homepage');
  if (homepage) {
    homepage.style.backgroundColor = defaultColor;
  }
  */
}

// Execute functions when the DOM loads
document.addEventListener("DOMContentLoaded", () => {
  initializeBackgroundColors();
  loadRandomVisualization();
  setupCustomCursor();
});

// Add event listeners to the refresh buttons
const colorwheelElement = document.getElementById('colorwheel');
if (colorwheelElement) {
  colorwheelElement.addEventListener('click', switchBackgroundColor);
  colorwheelElement.addEventListener('touchstart', (event) => {
    event.preventDefault();
    switchBackgroundColor();
  });
} else {
  console.warn('colorwheel element not found');
}

// copy email to clipboard and show a temporary message
function copyEmailToClipboard(event, email) {
  navigator.clipboard.writeText(email).then(function() {
    var copyMessage = document.getElementById("copyMessage");

    copyMessage.classList.add("show");

    setTimeout(function () {
      copyMessage.style.opacity = "0";
      setTimeout(function () {
        copyMessage.classList.remove("show");
        copyMessage.style.opacity = "1";
      }, 500);
    }, 1000);
  }).catch(function(err) {
    console.error('Failed to copy email: ', err);
  });
}

// Attach the the window object
window.copyEmailToClipboard = copyEmailToClipboard;

// Toggle GUI panel visibility
function toggleGUIPanel() {
  const guiWrapper = document.getElementById('gui-wrapper');
  if (guiWrapper) {
    if (guiWrapper.style.display === 'none' || guiWrapper.style.display === '') {
      guiWrapper.style.display = 'block';
    } else {
      guiWrapper.style.display = 'none';
    }
  }
}

// Show/hide GUI toggle based on active visualization and setup right-click
function updateGUIToggleVisibility(currentVisualizationFunc) {
  // Remove any existing right-click listeners
  document.removeEventListener('contextmenu', handleRightClick);
  
  if (currentVisualizationFunc === modelLoader) {
    // Add right-click listener when primitives visualization is active
    document.addEventListener('contextmenu', handleRightClick);
    console.log('Right-click anywhere to toggle GUI controls for 3D model');
  } else {
    // Hide the GUI panel if it's open when switching away from primitives
    const guiWrapper = document.getElementById('gui-wrapper');
    if (guiWrapper) {
      guiWrapper.style.display = 'none';
    }
  }
}

// Handle right-click to toggle GUI
function handleRightClick(event) {
  // Only toggle GUI if primitives visualization is active
  if (activeVisualization && activeVisualization.func === modelLoader) {
    event.preventDefault(); // Prevent context menu
    toggleGUIPanel();
  }
}

// toggle visibility of text elements
function toggleTextVisibility() {
  const textElements = document.querySelectorAll('.text');
  textElements.forEach((element) => {
    element.style.display = (element.style.display === 'none') ? '' : 'none';
  });
}

// adjust the visibility of the "visible" element based on device type
function eyeState() {
  if (isMobile) {
    document.getElementById('visible').style.display = 'block';
  } else {
    document.getElementById('visible').style.display = 'none';
  }
}

// Cursor trail effect
document.addEventListener("mousemove", function (e) {
  function hasClass(element, className) {
    while (element) {
      if (element.classList && element.classList.contains(className)) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  let elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);

  let trail = document.createElement("div");
  trail.className = "cursor-trail";

  if (hasClass(elementUnderCursor, "text")) {
    return;
  } else if (hasClass(elementUnderCursor, "pointer")) {
    trail.classList.add("pointer-cursor-trail");
  } else {
    trail.classList.add("default-cursor-trail");
  }

  trail.style.left = e.pageX + 1 + "px";
  trail.style.top = e.pageY - 2 + "px";

  document.body.appendChild(trail);

  setTimeout(() => {
    trail.remove();
  }, 500);
});

function removeAllCursorTrails() {
  const trails = document.querySelectorAll(".cursor-trail");
  trails.forEach((trail) => trail.remove());
}

// export function calculateExperience() {
//   const startYear = 2016;
//   const currentYear = new Date().getFullYear();
//   const experienceYears = currentYear - startYear;

//   const toTitleCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);

//   try {
//       const gisExperienceElement = document.getElementById('gis-experience');
//       if (gisExperienceElement) {
//           const experienceText = toWords ? toWords(experienceYears) : experienceYears.toString();
//           gisExperienceElement.textContent = toTitleCase(experienceText);
//           console.log(`Experience: ${experienceYears} years`);
//       } else {
//           console.error('Element with id "gis-experience" not found.');
//       }
//   } catch (error) {
//       console.error('Error calculating experience:', error);
//   }
// }