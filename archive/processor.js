class ESP32Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.port.onmessage = (event) => {
      console.log("Packet received", event.data.byteLength);
      const intData = new Int32Array(event.data);
      for (let i = 0; i < intData.length; i++) {
        // Normalize 32-bit PCM to -1..1 float
        this.buffer.push(intData[i] / 2147483648);
      }
    };
  }

  process(inputs, outputs) {
    const output = outputs[0][0];

    for (let i = 0; i < output.length; i++) {
      output[i] = this.buffer.length > 0 ? this.buffer.shift() : 0;
      if (i === 0) {
        console.log("Sample", output[i]);
      }
    }

    return true;
  }
}

registerProcessor("esp32-processor", ESP32Processor);