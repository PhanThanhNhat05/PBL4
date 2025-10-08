#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Fonts/FreeSerif9pt7b.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define REPORTING_PERIOD_MS 1000

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(115200);

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }

  display.setFont(&FreeSerif9pt7b);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(10,20);
  display.println("Pulse Oximeter Test");
  display.display();
  delay(2000);
}

void loop() {
  // Tạo dữ liệu giả
  float hr = 72 + random(-5, 6);    // nhịp tim giả 67–77 bpm
  float spo2 = 96 + random(-2, 3);  // SpO2 giả 94–99 %

  // In ra Serial
  Serial.print("Heart Rate: "); Serial.print(hr);
  Serial.print(" bpm | SpO2: "); Serial.print(spo2);
  Serial.println(" %");

  // ==== Hiển thị trên OLED ====
  display.clearDisplay();
  display.setCursor(0,12);
  display.print("Heart Rate:");
  display.setCursor(90,12);
  display.print(hr,0); 
  display.println(" bpm");

  display.setCursor(0,40);
  display.print("SpO2:");
  display.setCursor(50,40);
  display.print(spo2,0);
  display.println(" %");

  display.display();

  delay(REPORTING_PERIOD_MS);
}
