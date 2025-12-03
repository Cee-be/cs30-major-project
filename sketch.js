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

let currentSong;
let rawLyrics;
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
  rectMode(CORNER);

  karaoke = new KaraokeLyrics();
  karaoke.load(rawLyrics);
  buttonfunction();
}

function preload(){
  currentSong = loadSound('justin-bieber_baby.mp3');
  rawLyrics = loadStrings("baby_lyrics.txt");
  play = loadImage("play-button.png");
  pause = loadImage("pause-button.png");
  reset = loadImage("reset.png");

  currentButton = loadImage("pause-button.png");
}

class KaraokeLyrics {
  constructor(){
    this.lyrics = [];
  }

  load(rawLyrics){
    for (let line of rawLyrics){
      this.parts = line.split("|");

      this.lyrics.push({
        timeStart: Number(this.parts[0]),
        timeStop: Number(this.parts[1]),
        lyric: this.parts[2]
      });
    }
  }

  findCurrentLyric(currentTime){
    for (let entry of this.lyrics){
      if (currentTime >= entry.timeStart && currentTime <= entry.timeStop){
        return entry;
      }
    }
  }

  //displaying the lyrics
  display(currentTime){
    this.lyric = this.findCurrentLyric(currentTime);
    if (!this.lyric) {
      return;
    }
    this.progress = (currentTime - this.lyric.timeStart) / 
                    (this.lyric.timeStop - this.lyric.timeStart);
    this.w = textWidth(this.lyric.lyric); 
    this.highlightWidth = this.w * this.progress;

    //design for the bar
    textSize(36);
    let h = 36 *1.2;
    let cx = width/2 - this.w/2; //22closer to words
    //let cl = cx - w/2; //start from left
    let cy = height/2 - h/2;//-20 tomove up
    fill('black');
    rect(cx + 22, cy - 20, abs(this.highlightWidth), h); //hW might be neg

    //lyric text
    textAlign(LEFT, CENTER);
    fill(255);
    stroke(0);
    strokeWeight(3);
    text(this.lyric.lyric, cx, cy);
  }
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

function draw() {
  background(220);
  start();
}

function start(){
  //button press start
  if (started){
    karaoke.display(currentSong.currentTime());
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

  //hide and show of Srtbtn
  if (btnvisi){
    btn.show();
  }
  else {
    btn.hide();
  }
}

// What happens when msc srts
function startKaraoke(){
  analyzer = new p5.Amplitude(0, 5);
  analyzer.setInput(currentSong);
  currentSong.loop();
  started = true;

  btnvisi = false;

  pauseBtn.show();
  playBtn.hide();
  resetBtn.show();
}

//reset button actio
function resetKaraoke(){
  currentSong.stop();
  currentSong.jump(0);
  started = false;
  btnvisi = true;

  pauseBtn.hide();
  playBtn.hide();
  resetBtn.hide();
}

//when pause is pressed
function togglePause(){
  if (currentSong.isPlaying()){
    currentSong.pause();
    pauseBtn.hide();
    playBtn.show();
  }
  else{
    currentSong.play();
    pauseBtn.show();
    playBtn.hide();
  }
}

