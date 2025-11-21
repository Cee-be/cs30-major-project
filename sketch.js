// Major project - Pitch Perfect
// Ceberta Adum
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


// const lyrics = [
//   {
//     "timeStart" : 2,
//     "timeStop" : 8,
//     "lyric" : "Oh, whoa-oh-oh-oh-oh Oh, whoa-oh-oh-oh, oh"
//   } ,
//   {
//     "timeStart" : 9,
//     "timeStop" : 13,
//     "lyric" : "Oh, whoa, oh-oh-oh, oh, oh-oh, oh, oh-oh, oh"
//   }
// ];

let song;
let rawLyrics;
let lyrics = [];
let yStart = 0;
let time;
let analyzer;
let btn;
let started = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  parseLyric();
  btn = createButton("Start Karaoke");
  btn.position(20, 20);
  btn.mousePressed(startKaraoke);
}

function preload(){
  song = loadSound('justin-bieber_baby.mp3');
  rawLyrics = loadStrings("baby_lyrics.txt");
}

function draw() {
  background(220);
  lyricDisplay();
  start();
}

function start(){
  if (started){
    lyricDisplay();
  }
  else{
    textStyle(ITALIC);
    textSize(24);
    fill(0);
    text("Click 'Start Karaoke' to begin", 20, 80);
  }
}

function startKaraoke(){
  analyzer = new p5.Amplitude(0, 5);
  analyzer.setInput(song);
  song.loop();
  started = true;
}

function lyricDisplay(){
  time = song.currentTime();

  for (let entry of lyrics){
    if (time >= entry.timeStart && time <= entry.timeStop){
      text(entry.lyric, 100, 200);
      break;
    }
  }
}

function parseLyric(){
  for (let line of rawLyrics){
    let parts = line.split("|");
    lyrics.push({
      timeStart: Number(parts[0]),
      timeStop: Number(parts[1]),
      lyric: parts[2]
    });
  }
}