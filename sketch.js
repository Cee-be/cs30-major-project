// Major project - Pitch Perfect
// Ceberta Adum
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let song;

function setup() {
  createCanvas(windowWidth, windowHeight);
  song = loadSound('Omah-Lay-Holy-Ghost.mp3');
}

function draw() {
  background(220);
  circle(mouseX, mouseY, 100);
}
