import { PitchDetector } from "https://esm.sh/pitchy@4";

///connecting wothh mic
//const ESP32_IP = "10.231.242.101";
const SAMPLE_RATE = 44100;

const statusEl = document.getElementById("status");
const pitchEl = document.getElementById("pitch");

const detector = PitchDetector.forFloat32Array(SAMPLE_RATE);

const ws = new WebSocket("ws://10.219.126.101:81");
ws.binaryType = "arraybuffer";

ws.onopen = () => {
  statusEl.innerText = "Connected";
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

  const floatSamples = new Float32Array(intSamples.length);
  for (let i = 0; i < intSamples.length; i++) {
    floatSamples[i] = intSamples[i] / 32768;
  }

  if (floatSamples.length < 1024) {
    return; // not enough data yet
  }

  const [frequency, clarity] = detector.findPitch(floatSamples);



  if (frequency && clarity > 0.8) {
    pitchEl.innerText = `Pitch: ${frequency.toFixed(1)} Hz`;
  } 
  else {
    pitchEl.innerText = "---";
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
