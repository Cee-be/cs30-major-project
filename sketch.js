// Major project - Perfect Pitch
// Ceberta Adum
// Date
//
// Extra for Experts:
// https://editor.p5js.org/dansakamoto/sketches/H1ICcXXtm
//https://prismic.io/blog/css-button-animations
//https://editor.p5js.org/codingtrain/sketches/1UggvR8ix

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
let layer;
let p;
let logoX;
let logoY;
let jiggleEndTime;
let jiggleAmount = 4;
let logoVisible = true;
let scrollLyric = true;
let frame = 0;
let logoimage;
let theta = 0;
let maxScale = 0.10;
let baseScale = 1;
let karaoke;
let scrollY = 0;
let scrollingLyrics = [];
let lastLyric = '';
let lineSpace = 2;
let scrollSpeed = 1;

function preload(){
  currentSong = loadSound('justin-bieber_baby.mp3');
  rawLyrics = loadStrings("baby_lyrics.txt");
  play = loadImage("play-button.png");
  pause = loadImage("pause-button.png");
  reset = loadImage("reset.png");
  logoimage = loadImage("perfect pitch.png");
  currentButton = loadImage("pause-button.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  rectMode(CORNER);

  cutOut();
  buttonfunction();

  karaoke = new KaraokeLyrics();
  karaoke.load(rawLyrics);

  document.getElementById("layout").classList.add("hidden").classList.add("bottomPanel");
}

//https://editor.p5js.org/aferriss/sketches/BJnHtrpnz
//adding class



function cutOut(){
  layer = createGraphics(windowWidth, windowHeight);
  layer.textAlign(LEFT, CENTER);
  layer.textSize(36);
  layer.strokeWeight(3);
}

let delay_animation = 50;
let lastMoveTime = 0;
const create_gif = true;
const image_width = 300;


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
    let highlightWidth = this.w * this.progress;

    //lyric text
    textAlign(LEFT, CENTER);
    fill(0);
    stroke(255);
    strokeWeight(3);
    //text(this.lyric.lyric, cx, cy);
    //text(this.lyric.lyric, textX, textY);

    if (this.lyric.lyric !== lastLyric){
      scrollingLyrics.push({
        text: this.lyric.lyric,
        y: height + scrollingLyrics.length * lineSpace
      });

      //nextLine += scrollSpace;
      lastLyric = this.lyric.lyric;
    }

    // //design for the bar
    // textSize(36);
    // let h = 36 *1.2;
    // let cx = width/2 - this.w/2; //22closer to words
    // //let cl = cx - w/2; //start from left
    // let cy = height/2 - h/2;//-20 tomove up
    // fill('black');
    // rect(cx + 22, line.y, abs(highlightWidth), h); //hW might be neg
  }
}

//Scrolling lyrics effect
function lyricScroll(){
  if (scrollLyric === true){
    return;
  }

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(32);

  for (let i = 0; i < scrollingLyrics.length; i++){
    let line = scrollingLyrics[i];
    text(line.text, width/2, line.y);

    line.y -= scrollSpeed;
  }

  //remove lyrics out of screen
  for (let i = scrollingLyrics.length - 1; i >= 0; i--){
    if (scrollingLyrics[i].y < -50){
      scrollingLyrics.splice(i, 1);
    }
  }
}

function buttonfunction(){

  //Start Button
  btn = createButton("Start Karaoke");
  btn.addClass("glow");
  btn.addClass("neon-btn");
  btn.style('width', '300px');
  btn.style('height', '50px');
  btn.style('font-size', '30px');
  btn.style('background-color', '#0294CF');
  btn.style('color', '#F8B1EA');
  btn.position(width/2 - 150, height/2 + 50);
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
  background('#C9C6D7');
  start();
  logoDraw();

  lyricScroll();
  //showSplit();
}

function logoDraw(){
  if (logoVisible === false){
    return;
  }

  //Pulsing
  let scaleAmount = baseScale + sin(theta) * maxScale;
  let w = logoimage.width * scaleAmount;
  let h = logoimage.height * scaleAmount;

  imageMode(CENTER);
  image(logoimage, width/2, height/2 - 100, w, h);

  theta += 0.05;
}

function start(){
  //button press start
  if (started){
    textSize(36);
    textFont("Courier New");
    karaoke.display(currentSong.currentTime());
    lyricScroll();
  }
  else{
    textFont('Courier New');
    textStyle(ITALIC);
    textSize(24);

    fill(0);
    textAlign(CENTER, CENTER);
    strokeWeight(0);
    text("Click 'Start Karaoke' to begin", width/2 , height/2 + 140);
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
  canvas.parent("rightPanel");
  resizeCanvas(windowWidth * 0.78, windowHeight);
  
  document.getElementById("layout").classList.remove("hidden");
  btn.hide();
  showSongList();

  analyzer = new p5.Amplitude(0, 5);
  analyzer.setInput(currentSong);
  currentSong.loop();
  started = true;

  btnvisi = false;
  logoVisible = false;
  scrollLyric = false;

  pauseBtn.show();
  playBtn.hide();
  resetBtn.show();
}

function showSongList(){
  let left = document.getElementById("leftPanel");

  left.innerHTML = `
    <h2>Song List</h2>
    <ul class = "songs">
      <li>Baby - Justin Bieber</li>
      <li>I am still standing - Sing</li>
    </ul>
  `;
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

  logoVisible = true;
}

//when pause is pressed
function togglePause(){
  if (currentSong.isPlaying()){
    currentSong.pause();
    scrollLyric = false;
    pauseBtn.hide();
    playBtn.show();
  }
  else{
    currentSong.play();
    pauseBtn.show();
    playBtn.hide();
  }
};