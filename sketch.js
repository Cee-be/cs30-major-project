// Major project - Perfect Pitch
// Ceberta Adum
// Date
//
// Extra for Experts:
// https://editor.p5js.org/dansakamoto/sketches/H1ICcXXtm
// https://prismic.io/blog/css-button-animations
// https://editor.p5js.org/codingtrain/sketches/1UggvR8ix
// https://www.w3schools.com/tags/ref_canvas.asp
// https://p5js.org/reference/p5/drawingContext/

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

//
let currentSong;
let rawLyrics;
let currentSong01;
let rawLyrics01;
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
let loadedSongs = [];
let currentSongIndex = 0;

// Video
const video = document.getElementById("myVideo");


const SONG_LIST = [
  {
    title: "I Want It That Way (B99)",
    songFile: "B99_I want it that way.mp3",
    lyricFile: "B99_lyrics.txt",
    
  },
  {
    title: "Baby_Justin Beiber",
    songFile: "justin-bieber_baby.mp3",
    lyricFile: "baby_lyrics.txt"
  },
];


function preload(){
  for (let song of SONG_LIST){
    loadedSongs.push({
      title: song.title,
      sound: loadSound(song.songFile),
      lyrics: loadStrings(song.lyricFile)
    });
  }

  play = loadImage("play-button.png");
  pause = loadImage("pause-button.png");
  reset = loadImage("reset.png");
  logoimage = loadImage("perfect pitch.png");
  currentButton = loadImage("pause-button.png");

  //B99_vid = load
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  cutOut();
  buttonfunction();

  karaoke = new KaraokeLyrics();
  loadSong(0);

  document.getElementById("layout").classList.add("hidden");
  document.getElementById("leftPanel").classList.add("hidden");
}

function loadSong(index){
  if (currentSong && currentSong.isPlaying()) {
    currentSong.stop();
  }

  currentSongIndex = index;
  currentSong = loadedSongs[index].sound;
  rawLyrics = loadedSongs[index].lyrics;

  //scrolling
  scrollingLyrics = [];
  lastLyric = "";

  //karaoke data
  karaoke = new KaraokeLyrics();
  karaoke.load(rawLyrics);

  //analyzer
  if (analyzer){
    analyzer.setInput(currentSong);
  }
}

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

  findCurrentIndex(currentTime){
    for (let i = 0; i < this.lyrics.length; i++){
      let e = this.lyrics[i];
      if (currentTime >= e.timeStart && currentTime <= e.timeStop){
        return i;
      }
    }
    return -1;
  }

  //displaying the lyrics
  display(currentTime){
    let idx = this.findCurrentIndex(currentTime);
    if (idx === -1){
      return;
    }

    let current = this.lyrics[idx];

    let prev = null;
    let next = null;

    if (idx > 0) {
      prev = this.lyrics[idx - 1];
    }
    if (idx < this.lyrics.length - 1){
      next = this.lyrics[idx + 1];
    }
    
    let progress = (currentTime - current.timeStart) / 
                    (current.timeStop - current.timeStart);
    progress = constrain(progress, 0, 1);

    //lyric text
    textSize(36);
    textAlign(CENTER, CENTER);
    textFont("Courier New");
    
    let x = width/2;
    let y = height/2;
    let gap = 60;

    //previous line
    if (prev && prev.lyric){
      textSize(26);
      fill(0, 90);
      text(prev.lyric, x, y - gap);
    }

    //current
    textSize(36);
    fill(40);
    text(current.lyric, x, y);

    //highlight
    let w = textWidth(current.lyric);
    let h = 44;
    let leftX = x - w/2;
    let clipW = w * progress;

    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(leftX, y - h/2, clipW, h);
    drawingContext.clip();

    fill('#F24FB3');
    text(current.lyric, x, y);

    drawingContext.restore();

    //next
    if (next){
      textSize(26);
      fill(0, 90);
      if (next && next.lyric){
        text(next.lyric, x, y + gap);
      }
    }

    // if (entry.lyric !== lastLyric){
    //   scrollingLyrics.push({
    //     text: entry.lyric,
    //     y: height + scrollingLyrics.length * (36 * 1.3)
    //   });

    //   //nextLine += scrollSpace;
    //   lastLyric = entry.lyric;
    // }
  }
}

// //Scrolling lyrics effect
// function lyricScroll(){
//   if (!scrollLyric){
//     return;
//   }

//   fill(0);
//   textAlign(CENTER, CENTER);
//   textSize(32);

//   for (let line of scrollingLyrics){
//     text(line.text, width/2, line.y);
//     line.y -= scrollSpeed;
//   }

//   //remove lyrics out of screen
//   for (let i = scrollingLyrics.length - 1; i >=0; i--){
//     if (scrollingLyrics[i].y < -50){
//       scrollingLyrics.splice(i, 1);
//     }
//   }
// }

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
  pauseBtn.mousePressed(togglePause); //
  pauseBtn.hide();

  //Play Button
  playBtn = createImg('play-button.png', 'Play Button');
  playBtn.style('width', '100px');
  playBtn.style('height', '100px');
  playBtn.mousePressed(togglePause); 
  playBtn.hide();

  //Reset Button
  resetBtn = createImg('reset.png', 'Reset Button');
  resetBtn.style('width', '100px');
  resetBtn.style('height', '100px');
  resetBtn.mousePressed(resetKaraoke);
  resetBtn.hide();

  //Btn posistion
  pauseBtn.position(width/2 - 50, height - 150);
  playBtn.position(width/2 - 50, height - 150);
  resetBtn.position(width/2 -200, height - 150);
}

function draw() {
  background('#C9C6D7');
  start();
  logoDraw();

  //lyricScroll();
  seePitch();
  //showSplit();
}

function seePitch(){
  let p = window.micPitch || 0;

  if (p > 0){
    fill(0);
    textSize(20);
    textAlign(LEFT, TOP);
    text("Mic pitch: " + p.toFixed(1) + " Hz", 20, 40);
  }
  else {
    fill(100);
    text("Mic Pitch: ---", 20, 20);
  }
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
  if (started && currentSong){
    textSize(36);
    textFont("Courier New");
    karaoke.display(currentSong.currentTime());
  }
  else {
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
  showSongList();
  
  document.getElementById("layout").classList.remove("hidden");
  btn.hide();
  showSongList();

  analyzer = new p5.Amplitude(0, 5);
  analyzer.setInput(currentSong);

  currentSong.loop();

  started = true;
  btnvisi = false;
  logoVisible = false;
  scrollLyric = true;

  pauseBtn.show();
  playBtn.hide();
  resetBtn.show();
}

function showSongList(){
  document.getElementById("leftPanel").classList.remove("hidden");
}

function selectSong(i){
  loadSong(i);
  currentSong.loop();
  scrollLyric = true;

  pauseBtn.show();
  playBtn.hide();
}


//reset button actio
function resetKaraoke(){
  if (currentSong){
    currentSong.stop(); 
    currentSong.jump(0); 
  }
  started = false;
  btnvisi = true;

  pauseBtn.hide();
  playBtn.hide();
  resetBtn.hide();

  document.getElementById("layout").classList.add("hidden");

  logoVisible = true;
  scrollLyric = false;
}

//when pause is pressed
function togglePause(){
  if (!currentSong){
    return;
  }

  if (currentSong.isPlaying()){ 
    currentSong.pause(); 
    scrollLyric = false;
    pauseBtn.hide();
    playBtn.show();
  }
  else{
    currentSong.play();
    scrollLyric = true;
    pauseBtn.show();
    playBtn.hide();
  }
};


