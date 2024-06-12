export function noiseOverlay() {
    let noiseOverlay;
  
    function setup() {
      let canvas = createCanvas(windowWidth, windowHeight);
      canvas.style('pointer-events', 'none');
      canvas.style('z-index', '9999');
      canvas.parent('p5-container');
      noiseOverlay = createGraphics(windowWidth, windowHeight);
      noiseOverlay.noiseDetail(2, 0.5); // Coarser noise
    }
  
    function draw() {
      clear();
      noiseOverlay.loadPixels();
      for (let x = 0; x < noiseOverlay.width; x++) {
        for (let y = 0; y < noiseOverlay.height; y++) {
          let noiseValue = noise(x * 0.05, y * 0.05, frameCount * 0.01); // Coarser noise
          let colorValue = map(noiseValue, 0, 1, 0, 100); // Darker noise
          noiseOverlay.set(x, y, color(colorValue, colorValue, colorValue, 255));
        }
      }
      noiseOverlay.updatePixels();
      image(noiseOverlay, 0, 0);
    }
  
    function windowResized() {
      resizeCanvas(windowWidth, windowHeight);
      noiseOverlay.resizeCanvas(windowWidth, windowHeight);
    }
  
    window.setup = setup;
    window.draw = draw;
    window.windowResized = windowResized;
  }
  