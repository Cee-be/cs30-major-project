#include <WiFi.h>
#include <WebSocketsServer.h>
#include <driver/i2s.h>

// WiFi
const char* ssid = "Ceberta-S23";  
const char* password = "password4me";

// WebSocket (match JS :81)
WebSocketsServer webSocket(81);

// INMP441 pins
#define I2S_WS  25
#define I2S_SD  33
#define I2S_SCK 26
#define I2S_PORT I2S_NUM_0

// We want 1024 samples per packet for Pitchy
#define SAMPLES 1024
#define BUFFER_LEN 1024
int32_t i2sBuffer[BUFFER_LEN];
int16_t out16[BUFFER_LEN];

void i2s_install() {
  const i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 16000, // 
    // use 32-bit samples
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = (i2s_comm_format_t)(I2S_COMM_FORMAT_STAND_I2S | I2S_COMM_FORMAT_I2S_MSB),
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = SAMPLES,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };

  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
}


void i2s_setpin() {
  const i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = -1,
    .data_in_num = I2S_SD
  };
  i2s_set_pin(I2S_PORT, &pin_config);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  if (type == WStype_CONNECTED) Serial.println("WS client connected");
  if (type == WStype_DISCONNECTED) Serial.println("WS client disconnected");
}

void setup() {
  Serial.begin(115200);

  WiFi.setSleep(false);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  i2s_install();
  i2s_setpin();
  i2s_start(I2S_PORT);

  Serial.println("Streaming audio on ws://<ip>:81");
}

void loop() {
  webSocket.loop();

  size_t bytesIn = 0;
  i2s_read(I2S_PORT, i2sBuffer, sizeof(i2sBuffer), &bytesIn, portMAX_DELAY);

  Serial.print("bytesIn=");
  Serial.println(bytesIn);

  Serial.print("raw32 first5: ");
  for (int i = 0; i < 5; i++) {
    Serial.print(i2sBuffer[i]);
    Serial.print(" ");
  }
  Serial.println();


  int samples = bytesIn / 4;
  if (samples > SAMPLES) samples = SAMPLES;
  if (samples < SAMPLES) return;

  // 32-bit -> 16-bit (adjust shift: 14 louder, 15 quieter, 16 quieter)
  for (int i = 0; i < samples; i++) {
    out16[i] = (int16_t)(i2sBuffer[i] >> 16);
  }

static int16_t prevIn = 0;
static int32_t prevOut = 0;

// simple 1st-order high-pass filter
for (int i = 0; i < samples; i++) {
  int16_t x = out16[i];
  int32_t y = (int32_t)(0.995f * (prevOut + x - prevIn));
  prevIn = x;
  prevOut = y;
  out16[i] = (int16_t)constrain(y, -32768, 32767);
}


  // DC remove + attenuation
  int32_t mean = 0;
  for (int i = 0; i < samples; i++) mean += out16[i];
  mean /= samples;

  for (int i = 0; i < samples; i++) {
    int32_t v = (int32_t)out16[i] - mean;
    v /= 2; // adjust: /1, /2, /4
    if (v > 32767) v = 32767;
    if (v < -32768) v = -32768;
    out16[i] = (int16_t)v;
  }

  webSocket.broadcastBIN((uint8_t*)out16, samples * sizeof(int16_t));
}
