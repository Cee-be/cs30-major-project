// Major project - Pitch Perfect
// Ceberta Adum
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let song;
let lyrics;
let yStart = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  song = loadSound('justin-bieber_baby.mp3');
  lyrics = loadStrings('baby_lyrics.txt');
}

function draw() {
  background(220);
  lyricDisplay();
}

function lyricDisplay(){
  //textAlign(LEFT, LEFT);
  textFont('Courier New');
  textSize(12);
  text(lyrics, 100, 10, 100);
}