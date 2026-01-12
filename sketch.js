// Major project - Perfect Pitch
// Ceberta Adum
// January 19, 2026
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// Defining 
let currentSong;
let rawLyrics;
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
let logoVisible = true;
let scrollLyric = true;
let logoimage;
let theta = 0;
let maxScale = 0.10;
let baseScale = 1;
let karaoke;
let scrollingLyrics = [];
let lastLyric = '';
let loadedSongs = [];
let currentSongIndex = 0;
let currentVideo = null;
let videoEl;

//Song list
const SONG_LIST = [
  {
    title: "I Want It That Way (B99)",
    songFile: "B99_I want it that way.mp3",
    lyricFile: "B99_lyrics.txt",
    videoFile: "B99_I Want It That Way.mp4",
  },
  {
    title: "Baby_Justin Beiber",
    songFile: "justin-bieber_baby.mp3",
    lyricFile: "baby_lyrics.txt",
    videoFile: "justin-baby_vid.mp4",
  },
  {
    title: "What's My Name - Descandants2",
    songFile: "D2_What's My Name.mp3",
    lyricFile: "D2_lyrics.txt"
  },
];

//Loading songs
function preload(){
  for (let song of SONG_LIST){
    loadedSongs.push({
      title: song.title,
      sound: loadSound(song.songFile),
      lyrics: loadStrings(song.lyricFile),
    });
  }

  //loading images
  play = loadImage("play-button.png");
  pause = loadImage("pause-button.png");
  reset = loadImage("reset.png");
  logoimage = loadImage("perfect pitch.png");
  currentButton = loadImage("pause-button.png");
}

// Setup
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  buttonfunction();

  // Karoke lyrics and audio
  karaoke = new KaraokeLyrics();
  loadSong(0);

  //connecting to html
  document.getElementById("layout").classList.add("hidden");
  document.getElementById("leftPanel").classList.add("hidden");

  // Video
  videoEl = document.getElementById("myVideo");
  videoEl.style.display = "none"; 
}

//Song order
function loadSong(index){
  currentSongIndex = index;
  currentSong = loadedSongs[index].sound;
  rawLyrics = loadedSongs[index].lyrics;

  if (currentSong) {
    currentSong.stop();
  }

  //Video
  const v = SONG_LIST[index].videoFile;
  if (videoEl){
    if (v){
      videoEl.src = v;
      console.log("vid src:", videoEl.src);
      videoEl.load();
      videoEl.muted = true;
      videoEl.style.display = "block";
      videoEl.pause();
    }
    else{
      videoEl.pause();
      videoEl.removeAttribute("src");
      videoEl.load();
      videoEl.style.display = "none";
    }
  }

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

// Creating a class for lyrics
class KaraokeLyrics {
  constructor(){
    this.lyrics = [];
  }

  // Start and stop time of lyrics
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
    let y = height/2 + 100;
    let gap = 50;

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

    //highlight def
    let w = textWidth(current.lyric);
    let h = 44;
    let leftX = x - w/2;
    let clipW = w * progress;

    //highlight using drawing Context
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(leftX, y - h/2, clipW, h);
    drawingContext.clip();

    //design
    fill('#F24FB3');
    text(current.lyric, x, y);

    drawingContext.restore();

    //next
    if (next && next.lyric){
      textSize(26);
      fill(0, 90);
      text(next.lyric, x, y + gap);
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

//Draw function
function draw() {
  background('#C9C6D7');
  start();
  logoDraw();

  seePitch();
}

//pitch captured by mic
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
    textAlign(LEFT, TOP);
    text("Mic Pitch: ---", 20, 20);
  }
}

//drawing the logo
function logoDraw(){
  if (logoVisible === false){
    return;
  }

  //Pulsing effect
  let scaleAmount = baseScale + sin(theta) * maxScale;
  let w = logoimage.width * scaleAmount;
  let h = logoimage.height * scaleAmount;

  imageMode(CENTER);
  image(logoimage, width/2, height/2 - 100, w, h);

  theta += 0.05;
}

// intializing witha button click
function start(){
  //button press start
  if (started && currentSong){
    textSize(36);
    textFont("Courier New");
    karaoke.display(currentSong.currentTime());
  }
  //text style
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
  // canvas design
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

  //button display
  pauseBtn.show();
  playBtn.hide();
  resetBtn.show();

  if (videoEl && videoEl.src){
    videoEl.currentTime = 0;
    videoEl.play();
  }
}

//display the list of songs
function showSongList(){
  document.getElementById("leftPanel").classList.remove("hidden");
}

//selecting song
function selectSong(i){
  loadSong(i);
  currentSong.loop();
  if (videoEl && videoEl.src){
    videoEl.currentTime = 0;
    videoEl.play();
  }
  scrollLyric = true;

  //btn display
  pauseBtn.show();
  playBtn.hide();
}


//reset button function
function resetKaraoke(){
  //stopping song
  if (currentSong){
    currentSong.stop(); 
    currentSong.jump(0); 
  }
  started = false;
  btnvisi = true;

  //hiding buttons
  pauseBtn.hide();
  playBtn.hide();
  resetBtn.hide();
  //video.hide();

  document.getElementById("layout").classList.add("hidden");

  //hiding features
  logoVisible = true;
  scrollLyric = false;

  if (videoEl && videoEl.src){
    videoEl.pause();
    VideoE1.currentTime = 0;
  }
}

//wPuase button function
function togglePause(){
  if (!currentSong){
    return;
  }

  const shouldPause = currentSong.isPlaying();

  //switching btwn pause and play btn
  if (shouldPause){ 
    currentSong.pause(); 
    scrollLyric = false;
    pauseBtn.hide();
    playBtn.show();

    if (videoEl && videoEl.src){
      videoEl.pause();
    }
  }
  else{
    currentSong.play();
    scrollLyric = true;
    pauseBtn.show();
    playBtn.hide();
    if (videoEl && videoEl.src){
      videoEl.play();
    }
  }
}