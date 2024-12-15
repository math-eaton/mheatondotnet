////////
import { shapeshift } from "./shapeshift.js";
import { asciiHearts } from "./hearts.js";
import { contour_degrade } from "./contours.js";
import { modelLoader } from "./primitives.js";
import { life } from "./life.js";
import { wavetable } from "./wavetable.js";

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

// change the background color
function changeBackgroundColor() {
  let randomColor;
  do {
    randomColor = hexCodes[Math.floor(Math.random() * hexCodes.length)];
  } while (randomColor === activeColor);

  document.body.style.backgroundColor = randomColor;
  activeColor = randomColor;
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

// Execute functions when the DOM loads
document.addEventListener("DOMContentLoaded", () => {
  loadRandomVisualization();
  setupCustomCursor();
});

// Add event listeners to the refresh buttons
document.getElementById('colorwheel').addEventListener('click', switchBackgroundColor);
colorwheel.addEventListener('touchstart', (event) => {
  event.preventDefault();
  switchBackgroundColor();
});

// copy email to clipboard and show a temporary message
function copyEmailToClipboard(event, email) {
  var tempTextArea = document.createElement("textarea");
  tempTextArea.value = email;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);

  var copyMessage = document.getElementById("copyMessage");
  copyMessage.style.left = "25%";
  copyMessage.style.top = "20%";
  copyMessage.style.transform = "translate3d(0%, 25%, -15%)";

  copyMessage.classList.add("show");

  setTimeout(function () {
    copyMessage.style.opacity = "0";
    setTimeout(function () {
      copyMessage.classList.remove("show");
      copyMessage.style.opacity = "1";
    }, 500);
  }, 1000);
}

// Attach the the window object
window.copyEmailToClipboard = copyEmailToClipboard;

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
  if (hasClass(elementUnderCursor, "crosshair")) return;

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
