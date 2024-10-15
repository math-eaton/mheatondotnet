////////
import { asciiSwarm } from "./ascii_swarm.js";
import { asciiHearts } from "./asciiHearts.js";
import { contourSuccession } from "./contours.js";
import { horseLoader } from "./horse.js";
import { life } from "./life.js";
// import { wavetable } from "./wavetable.js";
// import { noiseOverlay } from "./p5_noise.js";
// import { wavetable } from "./wavetable.js";
// import { perpetual } from "./perpetual.js";

const isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;

// visualizations with their respective container IDs
const visualizations = [
  { func: horseLoader, container: "horseContainer1" },
  { func: asciiSwarm, container: "asciiContainer1" },
  { func: asciiHearts, container: "heartsContainer1" },
  { func: contourSuccession, container: "contourContainer1" },
  { func: life, container: "lifeContainer1" },
  // todo -
  // { func: perpetual, container: "perpetualContainer1" },
  // { func: wavetable, container: "wavetableContainer1" },
];

const aboutVisualizations = [
  // { func: asciiSwarm, container: "asciiContainer1" },
  { func: asciiHearts, container: "heartsContainer1" },
  // { func: life, container: "lifeContainer1" },
  // { func: wavetable, container: "wavetableContainer1" },
];

// hex codes for random background colors
// const hexCodes = ['#959595', '#3a6ea5', '#444444', '#c25237'];
const hexCodes = ['#3a6ea5', '#444444', '#c25237', '#524bd0', '#344242'];

let activeColor = null;
let activeVisualization = null;

// change the background color
function changeBackgroundColor() {
  let randomColor;
  do {
    randomColor = hexCodes[Math.floor(Math.random() * hexCodes.length)];
  } while (randomColor === activeColor);

  document.body.style.backgroundColor = randomColor;
  activeColor = randomColor;

  // const textElements = document.querySelectorAll('.text');
  // textElements.forEach((element) => {
  //   element.style.backgroundColor = randomColor;
  // });
}

// load a random visualization
function loadRandomVisualization() {
  const isAboutPage = window.location.pathname.includes('about');
  const visualizationSet = isAboutPage ? aboutVisualizations : visualizations;

  let randomIndex;
  let newVisualization;

  do {
    randomIndex = Math.floor(Math.random() * visualizationSet.length);
    newVisualization = visualizationSet[randomIndex];
  } while (activeVisualization && newVisualization.container === activeVisualization.container);

  const { func, container } = newVisualization;
  const containerElement = document.getElementById(container);

  if (containerElement) {
    if (activeVisualization) {
      // Hide the currently active visualization
      document.getElementById(activeVisualization.container).style.display = 'none';
    }
    containerElement.style.display = 'block';
    func(container);
    activeVisualization = { func, container };
  } else {
    console.error(`Container with ID ${container} not found`);
    if (isAboutPage) {
      console.log('Defaulting to hearts visualization on about page.');
      const defaultContainer = 'heartsContainer1';
      let defaultContainerElement = document.getElementById(defaultContainer);

      if (!defaultContainerElement) {
        defaultContainerElement = document.createElement('div');
        defaultContainerElement.id = defaultContainer;
        defaultContainerElement.className = 'vis-container';
        document.body.appendChild(defaultContainerElement);
      }

      defaultContainerElement.style.display = 'block';
      asciiHearts(defaultContainer);
      activeVisualization = { func: asciiHearts, container: defaultContainer };
    }
  }
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
  // changeBackgroundColor();
  loadRandomVisualization();
  setupCustomCursor();
  // window.addEventListener('resize', eyeState);
  // document.getElementById('visible').addEventListener('click', toggleTextVisibility);
});

// Add event listeners to the refresh buttons
// document.getElementById('refresh').addEventListener('click', switchVisualization);
document.getElementById('colorwheel').addEventListener('click', switchBackgroundColor);
colorwheel.addEventListener('touchstart', (event) => {
  event.preventDefault();
  switchBackgroundColor();
  // console.log("Touchstart event triggered"); // Debugging
});

// copy email to clipboard and show a temporary message
function copyEmailToClipboard(event, email) {
  // Create a temporary text area to copy the email address
  var tempTextArea = document.createElement("textarea");
  tempTextArea.value = email;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);

  // Get the message div
  var copyMessage = document.getElementById("copyMessage");

  // Position the message
  copyMessage.style.left = "25%";
  copyMessage.style.top = "20%";
  // copyMessage.style.transform = "translate(-0%, -100%)";
  copyMessage.style.transform = "translate3d(0%, 25%, -15%)";

  // Show the message
  copyMessage.classList.add("show");

  // Hide the message after 1 second
  setTimeout(function () {
    copyMessage.style.opacity = "0";
    setTimeout(function () {
      copyMessage.classList.remove("show");
      copyMessage.style.opacity = "1";
    }, 500); // Matches the transition duration
  }, 1000);
}

// Attach the the window object
window.copyEmailToClipboard = copyEmailToClipboard;

// toggle visibility of text elements
function toggleTextVisibility() {
  const textElements = document.querySelectorAll('.text');
  textElements.forEach((element) => {
    if (element.style.display === 'none') {
      element.style.display = '';
    } else {
      element.style.display = 'none';
    }
  });
}

// adjust the visibility of the "visible" element based on device type
function eyeState() {
  console.log("eye state");
  if (isMobile) {
    document.getElementById('visible').style.display = 'block';
  } else {
    document.getElementById('visible').style.display = 'none';
  }
}

// Cursor trail effect
document.addEventListener("mousemove", function (e) {
  // check if the element or its parent has the specified class
  function hasClass(element, className) {
    while (element) {
      if (element.classList && element.classList.contains(className)) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  // Get the element under the cursor
  let elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);

  // Check for the 'crosshair' class, and if found, do nothing (no trail)
  if (hasClass(elementUnderCursor, "crosshair")) {
    return; // Exit the function, no trail is created
  }

  let trail = document.createElement("div");
  trail.className = "cursor-trail";

  // Check for the 'text' class
  if (hasClass(elementUnderCursor, "text")) {
    return; // Exit the function, no trail is created
  } else if (hasClass(elementUnderCursor, "pointer")) {
    trail.classList.add("pointer-cursor-trail"); // Add specific trail class for pointer
  } else {
    trail.classList.add("default-cursor-trail"); // Default trail class for others
  }

  // Adjust positioning based on cursor size
  trail.style.left = e.pageX + 1 + "px"; // Adjust for half the width of the cursor
  trail.style.top = e.pageY - 2 + "px"; // Adjust for half the height of the cursor

  document.body.appendChild(trail);

  setTimeout(() => {
    trail.remove();
  }, 500); // Remove trail element after N ms
});

// remove all cursor trails
function removeAllCursorTrails() {
  const trails = document.querySelectorAll(".cursor-trail");
  trails.forEach((trail) => trail.remove());
}


// header text ticker

// class Ticker {
//   constructor(containerId, text, speed = 0.025) {
//     this.container = document.getElementById(containerId);
//     this.text = text;
//     this.speed = speed; // Pixels per millisecond
//     this.lastTime = 0;
//     this.totalWidth = 0;

//     this.init();
//   }

//   // create a text div
//   createTextDiv() {
//     const div = document.createElement("div");
//     div.classList.add("ticker-text");
//     div.textContent = this.text;
//     return div;
//   }

//   // Initialize the ticker
//   init() {
//     const vwToPixels = window.innerWidth / 100;
//     const tempTextDiv = this.createTextDiv(); // Temporary div to calculate width
//     this.container.appendChild(tempTextDiv);
//     const textWidth = tempTextDiv.offsetWidth; // Width of the text block
//     this.container.removeChild(tempTextDiv); // Remove temporary div

//     const totalContainerWidth = window.innerWidth;
//     const numberOfBlocks = Math.ceil(totalContainerWidth / (textWidth + vwToPixels));

//     // Populate the container with the required number of text blocks
//     for (let i = 0; i < numberOfBlocks * 2; i++) { // Duplicate for seamless looping
//       const textDiv = this.createTextDiv();
//       this.container.appendChild(textDiv);
//     }

//     this.textElements = Array.from(this.container.querySelectorAll(".ticker-text"));
//     this.positionTextElements();
//     requestAnimationFrame(this.scrollText.bind(this));
//   }

//   // Position text elements
//   positionTextElements() {
//     const vwToPixels = window.innerWidth / 100;
//     let accumulatedWidth = 0;
//     this.textElements.forEach((text, index) => {
//       text.style.left = `${accumulatedWidth}px`;
//       accumulatedWidth += text.offsetWidth + vwToPixels;
//     });
//   }

//   // Scroll the text
//   scrollText(timestamp) {
//     if (!this.lastTime) this.lastTime = timestamp;
//     const deltaTime = timestamp - this.lastTime;

//     this.textElements.forEach((text) => {
//       let currentLeft = parseFloat(text.style.left);
//       currentLeft -= this.speed * deltaTime; // Move based on time

//       if (currentLeft <= -text.offsetWidth) {
//         currentLeft += this.textElements.length * (text.offsetWidth + (window.innerWidth / 100));
//       }
//       text.style.left = `${Math.round(currentLeft)}px`;
//     });

//     this.lastTime = timestamp;
//     requestAnimationFrame(this.scrollText.bind(this));
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {

//     const textArray1 = ["capstone"];
//     const ticker1 = new Ticker("tickerContainer1", textArray1);
  
//     const textArray2 = ["towers"];
//     const ticker2 = new Ticker("tickerContainer2", textArray2);

//   });


