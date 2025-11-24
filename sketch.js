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
let startBtn;
let pauseBtn;
let resetBtn;
let started = false;
//let btnvisi = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  parseLyric();
  buttonfunction();
}

function buttonfunction(){
  //Start Button
  startBtn = createButton("Start Karaoke");
  startBtn.style('width', '750px');
  startBtn.style('height', '80px');
  startBtn.style('font-size', '30px');
  startBtn.position(width/2 - 350, height/2 - 100);
  startBtn.mousePressed(startKaraoke);

  //Pause Button
  pauseBtn = createButton("Pause");
  pauseBtn.style('width', '150px');
  pauseBtn.style('height', '50px');
  pauseBtn.style('font-size', '30px');
  pauseBtn.position(50, 100);
  pauseBtn.mousePressed(pauseKaraoke);
  pauseBtn.hide();

  //Reset Button
  resetBtn = createButton("Reset");
  resetBtn.style('width', '150x');
  resetBtn.style('height', '50px');
  resetBtn.style('font-size', '30px');
  resetBtn.position(20, 100);
  resetBtn.mousePressed(resetKaraoke);
  resetBtn.hide();
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
    textFont('Courier New');
    textStyle(ITALIC);
    textSize(24);
    fill(0);
    text("Click 'Start Karaoke' to begin", width/2 - 200 , height/2 + 20);
  }

  // if (btnvisi){
  //   btn.show();
  // }
  // else {
  //   btn.hide();
  // }
}

function mousePressed(){
  if (mouseX > btn.x && mouseX < btn.x + btn.width && 
    mouseY > btn.y && mouseY < btn.y + btn.height){
    btnvisi = false;
  }
}

function startKaraoke(){
  analyzer = new p5.Amplitude(0, 5);
  analyzer.setInput(song);
  song.loop();
  started = true;

  startBtn.hide();
  pauseBtn.show();
  resetBtn.show();
}

function pauseKaraoke(){
  if (song.isPlaying()){
    song.pause();
  }
  else {
    song.play();
  }
}

function resetKaraoke(){
  song.stop();
  song.currentTime(0);

  started = false;
  btnvisi = true;

  startBtn.show();
  pauseBtn.hide();
  resetBtn.hide();
}

function lyricDisplay(){
  time = song.currentTime();

  for (let entry of lyrics){
    if (time >= entry.timeStart && time <= entry.timeStop){
      text(entry.lyric, width/2 - 200, height/2);
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