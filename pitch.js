//import
import { PitchDetector } from "https://esm.sh/pitchy@4";

//const def
const SAMPLE_RATE = 44100;
const WINDOW = 1024;
const detector = PitchDetector.forFloat32Array(WINDOW);
const statusEl = document.getElementById("status");
const pitchEl = document.getElementById("pitch");
const ws = new WebSocket("ws://10.209.33.101:81"); //IP

console.log("PITCH SCRIPT LOADED");
window.micPitch = 0;
window.ws = null;

const hann = new Float32Array(WINDOW);
for (let i = 0; i < WINDOW; i++) {
  hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i) / (WINDOW - 1);
}


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

window.ws = ws;
ws.binaryType = "arraybuffer";

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
  if (intSamples.length < WINDOW){
    return;
  } 

  console.log("first10:", Array.from(intSamples.slice(0,10)));

  // debug stats
  let min = 99999, max = -99999, sum = 0;
  for (let i = 0; i < WINDOW; i++) {
    const v = intSamples[i];
    if (v < min) {
      min = v;
    }
    if (v > max) {
      max = v;
    }
    sum += Math.abs(v);
  }
  const avgAbs = sum / WINDOW;
  console.log("min/max/avgAbs:", min, max, avgAbs.toFixed(1));

  // Converting to float
  const floatSamples = new Float32Array(WINDOW);
  for (let i = 0; i < WINDOW; i++) {
    floatSamples[i] = intSamples[i] / 32768;
  }

  // DC remove
  let mean = 0;
  for (let i = 0; i < WINDOW; i++) {
    mean += floatSamples[i];
  }
  mean /= WINDOW;
  for (let i = 0; i < WINDOW; i++) {
    floatSamples[i] -= mean;
  }

  // High-pass (kills low rumble like ~43 Hz)
  let prevX = 0, prevY = 0;
  const a = 0.995; // try 0.99 if rumble still dominates
  for (let i = 0; i < WINDOW; i++) {
    const x = floatSamples[i];
    const y = a * (prevY + x - prevX);
    floatSamples[i] = y;
    prevX = x;
    prevY = y;
  }

  // Hann window
  for (let i = 0; i < WINDOW; i++) {
    floatSamples[i] *= hann[i];
  }

  //Pitch detect
  const [frequency, clarity] = detector.findPitch(floatSamples, SAMPLE_RATE);
  console.log("freq:", frequency, "clarity:", clarity);

  // DEBUG MODE: always show raw pitch
  window.micPitch = frequency || 0;

  if (frequency) {
    setPitch(`raw f=${frequency.toFixed(1)} c=${clarity.toFixed(3)}`);
  } 
  else {
    setPitch("---");
  }

};


