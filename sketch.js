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
let waitingForSong = true;
let isPaused = false;
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
let score = 0;
let lastScoredIndex = -1;
let prev = null;
let next = null;
scrollingLyrics = [];
lastLyric = "";
let feedback =  "";
let showedFinalScore = false;


//Song list
const SONG_LIST = [
  {
    title: "I Want It That Way (B99)",
    songFile: "songs/B99_I want it that way.mp3",
    lyricFile: "lyrics/B99_lyrics.txt",
    videoFile: "video/B99_I Want It That Way.mp4",
  },
  {
    title: "Baby_Justin Beiber",
    songFile: "songs/justin-bieber_baby.mp3",
    lyricFile: "lyrics/baby_lyrics.txt",
    videoFile: "video/justin-baby_vid.mp4",
  },
  {
    title: "What's My Name - Descandants2",
    songFile: "songs/D2_What's My Name.mp3",
    lyricFile: "lyrics/D2_lyrics.txt"
  },
  {
    title: "Mary Had A Little Lamb",
    songFile: "songs/Mary Had A Little Lamb.mp3",
    lyricFile: "lyrics/Mary Had A Little Lamb_lyrics.txt",
    videoFile: "video/Mary Had A Little Lamb_vid.mp4",
  },
];

//Pitch/Frequencies/Mary Had
const MARY_TARGETS = [
  {t0: 6.0, t1: 7.0, freq: 329.6}, //E4
  {t0: 7.0, t1: 8.0, freq: 293.7}, //D4
  {t0: 8.0, t1: 9.0, freq: 261.6}, //C4
  {t0: 9.0, t1: 10.0, freq: 293.7}, //D4
  {t0: 10.0, t1: 11.0, freq: 329.6}, //E4
  {t0: 11.0, t1: 12.0, freq: 329.6}, //E4
  {t0: 12.0, t1: 13.0, freq: 329.6}, //E4
];

//Notes
const NOTE_NAMES = [
  "C", "C#", "D", 
  "D#", "E", "F", 
  "F#", "G", "G#", 
  "A", "A#", "B"
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
  play = loadImage("icons/play-button.png");
  pause = loadImage("icons/pause-button.png");
  reset = loadImage("icons/reset.png");
  logoimage = loadImage("icons/perfect pitch.png");
  currentButton = loadImage("icons/pause-button.png");
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

  //Button
  resetBtn.parent("bottomPanel");
  pauseBtn.parent("bottomPanel");
  playBtn.parent("bottomPanel");
}

//Freq of song 4 match
function getTargetFreq(t){
  for (const a of MARY_TARGETS){
    if (t >= a.t0 && t < a.t1){
      return a.freq;
    }
  }
  return 0;
}


//Song order
function loadSong(index){
  currentSongIndex = index;
  currentSong = loadedSongs[index].sound;
  rawLyrics = loadedSongs[index].lyrics;

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

  //karaoke data
  karaoke = new KaraokeLyrics();
  karaoke.load(rawLyrics);

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
  pauseBtn = createImg('icons/pause-button.png', 'Pause Button');
  pauseBtn.style('width', '100px');
  pauseBtn.style('height', '100px');
  pauseBtn.mousePressed(togglePause); //
  pauseBtn.hide();

  //Play Button
  playBtn = createImg('icons/play-button.png', 'Play Button');
  playBtn.style('width', '100px');
  playBtn.style('height', '100px');
  playBtn.mousePressed(togglePause); 
  playBtn.hide();

  //Reset Button
  resetBtn = createImg('icons/reset.png', 'Reset Button');
  resetBtn.style('width', '100px');
  resetBtn.style('height', '100px');
  resetBtn.mousePressed(resetKaraoke);
  resetBtn.hide();
}

//Draw function
function draw() {
  background('#C9C6D9');
  start();
  logoDraw();
  waitForSong();

  //Pitch related
  seePitch();
  showTarget();
  pitchScore();
  scorePitch();
  pitchFeedback();
  showScore();
}

//pitch captured by mic
function seePitch(){
  let mic = window.micPitch;

  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);

  if (mic === undefined || mic === null || mic <= 0){
    text("Mic Pitch: ---", 20, 20);
  }
  else {
    text("Mic Pitch: " + frequencyToNote(mic), 20, 20);
  }
}

//showing target pitch
function showTarget(){
  if (!started || !currentSong) {
    return;
  }

  if (SONG_LIST[currentSongIndex].title !== "Mary Had A Little Lamb") {
    return;
  }

  const t = currentSong.currentTime();
  const target = getTargetFreq(t);

  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);

  if (target <= 0){
    text("Target: ---", 20, 70);
  }
  else{
    text("Target: " + frequencyToNote(target), 20, 70);
  }
}

//getting indexoftargetpitch
function getTargetIndex(t){
  for (let i = 0; i < MARY_TARGETS.length; i++){
    if (t >= MARY_TARGETS[i].t0 && t < MARY_TARGETS[i].t1){
      return i;
    }
  }
  return -1;
}

//score pitch
function scorePitch(){
  if (!started || !currentSong) {
    return;
  }

  let mic = window.micPitch ||0;
  let t = currentSong.currentTime();
  let idx = getTargetIndex(t);

  if (idx === -1){
    return;
  }
  if (idx === lastScoredIndex){
    return;
  }

  let target = MARY_TARGETS[idx].freq;
  let diff = Math.abs(mic - target);

  if (mic > 0){
    if (diff <= 5){
      score += 2;
      feedback = "Perfect!";
    }
    else if (diff <= 15){
      score += 1;
      feedback = "Good!";
    }
    else{
      feedback = "Miss!";
    }
  }
  lastScoredIndex = idx;
}

//Pitch Score
function pitchScore(){
  fill(0);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 100);
}

//Pitch feedback
function pitchFeedback(){
  fill(0);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Result: " + feedback, 20, 130);
}

//Final score
function showScore(){
  if (!currentSong || !started || isPaused){
    return;
  }
  if (showedFinalScore){
    return;
  }
  if (!currentSong.isPlaying() && currentSong.currentTime() > 1){
    showedFinalScore = true;

    textAlign(CENTER, CENTER);
    textFont("Courier New");
    textStyle(NORMAL);
    textSize(40);
    fill(0);

    text("Final Score: " + score, width/2, height/2);
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
    //text("Select Your Song", width/2 - 150 , height/2 - 150);
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
  score = 0;
  lastScoredIndex = -1;

  // canvas design
  canvas.parent("rightPanel");
  resizeCanvas(windowWidth * 0.78, windowHeight);
  showSongList();
  document.getElementById("layout").classList.remove("hidden");
  btn.hide();
  showSongList();

  analyzer = new p5.Amplitude(0, 5);
  analyzer.setInput(currentSong);

  //currentSong.play();

  waitingForSong = true;
  started = true;
  btnvisi = false;
  logoVisible = false;
  scrollLyric = true;
  showedFinalScore = false;

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

function waitForSong(){
  if (waitingForSong){
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    textFont("Courier New");
    text("Choose your song", width/2, height/2);
    return;
  }
}

//selecting song
function selectSong(i){
  loadSong(i);

  waitingForSong = false;
  currentSong.play();

  if (videoEl && videoEl.src){
    videoEl.currentTime = 0;
    videoEl.play();
  }
  //scrollLyric = true;

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
    videoEl.currentTime = 0;
  }
}

//wPuase button function
function togglePause(){
  if (!currentSong){
    return;
  }

  if (currentSong.isPlaying()){ 
    currentSong.pause(); 
    isPaused = true;
    pauseBtn.hide();
    playBtn.show();

    if (videoEl && videoEl.src){
      videoEl.pause();
    }
  }
  else{
    currentSong.play();
    isPaused = false;
    pauseBtn.show();
    playBtn.hide();
    if (videoEl && videoEl.src){
      videoEl.play();
    }
  }
}

//Conversion
function frequencyToNote(fre){
  const A4 = 440; //main
  const semitone = Math.round(12 * Math.log2(fre/A4));

  const noteIndex = (semitone + 9 + 120) % 12;
  const octave = Math.floor((semitone + 9) / 12) + 4;

  return NOTE_NAMES[noteIndex] + octave;
}