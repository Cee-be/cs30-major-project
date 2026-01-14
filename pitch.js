import { PitchDetector } from "https://esm.sh/pitchy@4";

const SAMPLE_RATE = 16000;
const WINDOW = 1024;
const detector = PitchDetector.forFloat32Array(WINDOW);

console.log("PITCH SCRIPT LOADED");
window.micPitch = 0;
window.ws = null;

///connecting wothh mic
//const ESP32_IP = "10.231.242.101";

const hann = new Float32Array(WINDOW);
for (let i = 0; i < WINDOW; i++) {
  hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i) / (WINDOW - 1);
}


const statusEl = document.getElementById("status");
const pitchEl = document.getElementById("pitch");

function setStatus(msg){
  if (statusEl){
    statusEl.innerText = msg;
    console.log(msg);
  }
}

function setPitch(msg){
  if (pitchEl){
    pitchEl.innerText = msg;
  }
}



const ws = new WebSocket("ws://10.209.33.101:81");
window.ws = ws;
ws.binaryType = "arraybuffer";

// ws.onopen = () => document.getElementById("status").innerText = "Connected!";
// ws.onclose = () => document.getElementById("status").innerText = "Closed!";

ws.onopen = () => {
  setStatus("Connected");
  console.log("WebSocket connected");
};

ws.onerror = (e) => {
  statusEl.innerText = "WebSocket error";
  console.error(e);
};

ws.onclose = (e) => {
  statusEl.innerText = `Disconnected (${e.code})`;
  console.log("Closed:", e.code);
};

ws.onmessage = (event) => {
  const intSamples = new Int16Array(event.data);
  if (intSamples.length < WINDOW) return;

  // debug stats
  let min = 99999, max = -99999, sum = 0;
  for (let i = 0; i < WINDOW; i++) {
    const v = intSamples[i];
    if (v < min) min = v;
    if (v > max) max = v;
    sum += Math.abs(v);
  }
  const avgAbs = sum / WINDOW;
  console.log("min/max/avgAbs:", min, max, avgAbs.toFixed(1));

  // 1) Convert to float (-1..1)
  const floatSamples = new Float32Array(WINDOW);
  for (let i = 0; i < WINDOW; i++) {
    floatSamples[i] = intSamples[i] / 32768;
  }

  // 2) DC remove
  let mean = 0;
  for (let i = 0; i < WINDOW; i++) mean += floatSamples[i];
  mean /= WINDOW;
  for (let i = 0; i < WINDOW; i++) floatSamples[i] -= mean;

  // 3) High-pass (kills low rumble like ~43 Hz)
  let prevX = 0, prevY = 0;
  const a = 0.995; // try 0.99 if rumble still dominates
  for (let i = 0; i < WINDOW; i++) {
    const x = floatSamples[i];
    const y = a * (prevY + x - prevX);
    floatSamples[i] = y;
    prevX = x;
    prevY = y;
  }

  // 4) Hann window
  for (let i = 0; i < WINDOW; i++) {
    floatSamples[i] *= hann[i];
  }

  // 5) Pitch detect
  const [frequency, clarity] = detector.findPitch(floatSamples, SAMPLE_RATE);
  console.log("freq:", frequency, "clarity:", clarity);

  // show + accept
  if (frequency && clarity > 0.4 && frequency >= 80 && frequency <= 1000) {
    window.micPitch = frequency;
    setPitch(`f=${frequency.toFixed(1)} c=${clarity.toFixed(2)}`);
  } else {
    window.micPitch = 0;
    setPitch("---");
  }
};






//notes
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

//Conversion
function frequencyToNote(fre){
  const A4 = 440; //main
  const semitone = Math.round(12 * Math.log2(fre/A4));

  const noteIndex = (semitone + 9 + 120) % 12;
  const octave = Math.floor((semitone + 9) / 12) + 4;

  return NOTE_NAMES[noteIndex] + octave;
}
