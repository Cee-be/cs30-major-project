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
let currentButton;
let play;
let pauseBtn;
let playBtn;
let analyzer;
let btn;
let started = false;
let btnvisi = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  parseLyric();
  buttonfunction();
}

function buttonfunction(){

  //Start Button
  btn = createButton("Start Karaoke");
  btn.style('width', '750px');
  btn.style('height', '80px');
  btn.style('font-size', '30px');
  btn.position(width/2 - 350, height/2 - 100);
  btn.mousePressed(startKaraoke);

  //Pause Button
  pauseBtn = createImg('pause-button.png', 'Pause Button');
  pauseBtn.style('width', '100px');
  pauseBtn.style('height', '100px');
  pauseBtn.position(width/2, 600);
  pauseBtn.mousePressed(togglePause); //
  pauseBtn.hide();

  //Play Button
  playBtn = createImg('play-button.png', 'Play Button');
  playBtn.style('width', '100px');
  playBtn.style('height', '100px');
  playBtn.position(width/2, 600);
  playBtn.mousePressed(togglePause); 
  playBtn.hide();

  //Reset Button
  resetBtn = createImg('reset.png', 'Reset Button');
  resetBtn.style('width', '100px');
  resetBtn.style('height', '100px');
  resetBtn.position(width/2 -200, 600);
  resetBtn.mousePressed(resetKaraoke);
  resetBtn.hide();
}

function preload(){
  song = loadSound('justin-bieber_baby.mp3');
  rawLyrics = loadStrings("baby_lyrics.txt");
  play = loadImage("play-button.png");
  pause = loadImage("pause-button.png");
  reset = loadImage("reset.png");

  currentButton = loadImage("pause-button.png");
}

function draw() {
  background(220);
  //lyricDisplay();
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
    textAlign(CENTER, CENTER);
    strokeWeight(0);
    text("Click 'Start Karaoke' to begin", width/2 , height/2);
  }

  if (btnvisi){
    btn.show();
  }
  else {
    btn.hide();
  }
}

function startKaraoke(){
  analyzer = new p5.Amplitude(0, 5);
  analyzer.setInput(song);
  song.loop();
  started = true;
  pauseBtn.show();
  playBtn.hide();
  resetBtn.show();
}

function resetKaraoke(){
  song.stop();
  song.jump(0);
  started = false;
  btnvisi = true;

  pauseBtn.hide();
  playBtn.hide();
  resetBtn.hide();
}

function togglePause(){
  if (song.isPlaying()){
    song.pause();
    pauseBtn.hide();
    playBtn.show();
  }
  else{
    song.play();
    pauseBtn.show();
    playBtn.hide();
  }
}

function lyricDisplay(){
  time = song.currentTime();

  for (let entry of lyrics){
    if (time >= entry.timeStart && time <= entry.timeStop){
      progress = (time - entry.timeStart) / (1 + entry.timeStart - entry.timeStop);
      w = textWidth(entry.lyric); //define at top
      highlightWidth = w * progress;
      
      textSize(36);
      cx = width/2;
      cy = height/2;
      h = 36 *1.2;
      fill('black');
      rect(cx, cy, highlightWidth, h);

      textAlign(CENTER, CENTER);
      fill(255);
      stroke(0);
      strokeWeight(3);
      text(entry.lyric, cx, cy);

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