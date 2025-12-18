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
started = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  lyricDisplay();
}

function preload(){
  song = loadSound('justin-bieber_baby.mp3');
  rawLyrics = loadStrings("baby_lyrics.txt");
}

function draw() {
  background(220);
  lyricDisplay2();
  start();
}

function start(){
  if (started){
    lyricDisplay();
  }
  else{
    text("Click 'Start Karaoke' to begin", 20, 80);
  }
}

function startKaraoke(){
  analyzer = new p5.Amplitude(0, 5);
  analyzer.setInput(song);
  song.loop();
  started = true;
}

// function lyricDisplay(){
//   //textAlign(LEFT, LEFT);
//   time = round(song.currentTime());
//   textFont('Courier New');
//   textSize(12);
//   text(time, 10, 20);
//   for (let x = 0; x < 2; x++){
//     if (time >= lyrics[x].timeStart &&
//       time <= lyrics[x].timeStop
//     ){
//       text(lyrics[x].lyric, 100, 200);
//     }
//   }
// }

function lyricDisplay2(){
  time = song.currentTime();

  for (let entry of lyrics){
    if (time >= entry.timeStart && time <= entry.timeStop){
      text(entry.lyric, 100, 200);
      break;
    }
  }
}

function lyricDisplay(){
  for (let line of rawLyrics){
    let parts = line.split("|");
    lyrics.push({
      timeStart: Number(parts[0]),
      timeStop: Number(parts[1]),
      lyric: parts[2]
    });
  }
  btn = createButton("Start Karaoke");
  btn.position(20, 20);
  btn.mousePressed(startKaraoke);
}