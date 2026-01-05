import { PitchDetector } from "https://esm.sh/pitchy@4";

const SAMPLE_RATE = 16000;
const WINDOW = 1024;
const detector = PitchDetector.forFloat32Array(WINDOW);

console.log("PITCH SCRIPT LOADED");
window.micPitch = 0;
window.ws = null;

///connecting wothh mic
//const ESP32_IP = "10.231.242.101";


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



const ws = new WebSocket("ws://10.213.113.101:81");
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
  if (intSamples.length < WINDOW) {
    return;
  }
  const floatSamples = new Float32Array(WINDOW);
  for (let i = 0; i < WINDOW; i++) {
    floatSamples[i] = intSamples[i] / 32768;
  }

  // remove DC offset
  let mean = 0;
  for (let i = 0; i < WINDOW; i++){
    mean += floatSamples[i];
    mean /= WINDOW;
  } 
  for (let i = 0; i < WINDOW; i++) {
    floatSamples[i] -= mean;
  }

  const [frequency, clarity] = detector.findPitch(floatSamples, SAMPLE_RATE);

  if (
    frequency &&
    clarity > 0.6 &&
    frequency >= 80 &&
    frequency <= 1000
  ) {
    window.micPitch = frequency;
  } 
  else {
    window.micPitch = 0;
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
