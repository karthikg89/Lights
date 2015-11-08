#include "application.h"
#include "neopixel/neopixel.h"

SYSTEM_MODE(AUTOMATIC);

// IMPORTANT: Set pixel COUNT, PIN and TYPE
#define PIXEL_PIN D2
#define PIXEL_COUNT 240
#define PIXEL_TYPE WS2812B

// Turns off status led
#define RGB_NOTIFICATIONS_CONNECTING_ONLY

#ifdef __AVR__
#include <avr/power.h>
#endif

#define PIN D0
#define DELAY 250
#define MAX 6

int state = 0;
int brightness = 1;
uint32_t color = (125 << 16) | (43 << 8) | 245;

bool changed = false;

// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(PIXEL_COUNT, PIXEL_PIN, PIXEL_TYPE);

// IMPORTANT: To reduce NeoPixel burnout risk, add 1000 uF capacitor across
// pixel power leads, add 300 - 500 Ohm resistor on first pixel's data input
// and minimize distance between Arduino and first pixel.  Avoid connecting
// on a live circuit...if you must, connect GND first.

void setup() {
    RGB.control(true);
    RGB.brightness(0);
    
    Spark.function("led", updateState);
    Spark.function("brightness", setBrightness);
    Spark.function("color", setColor);
  
    strip.begin();
    strip.show(); // Initialize all pixels to 'off'
}

void loop() {
    increment("");
}
int subOrZero(int x, int y) {
    return y > x ? 0 : x - y;
}
void setPixelColor(int pixel, uint32_t c) {
    int r = subOrZero(((c & 0x00ff0000) >> 16), brightness);
    int g = subOrZero(((c & 0x0000ff00) >> 8), brightness);
    int b = subOrZero((c & 0x000000ff), brightness);
    
    strip.setPixelColor(pixel, rgb(r,g,b));
}

int setBrightness(String command) {
    brightness = 255 - atoi(command);
    changed = true;
    return brightness;
}

int setColor(String command) {
    color = atoi(command);
    changed = true;
    
    return color;
}

int updateState(String command) {
    state++;
    if (state > MAX) {
        state = 0;
    }
    
    int val = atoi(command);
    if (val >= 0 && val <= MAX) {
        state = val;
    } else {
        state = 0;
    }

    changed = true;
    
    return state;
}

int increment(String command) {
  if (state == 0) {
    solid(rgb(0,0,0));
    while (changed == false) {
        delay(100);
    }
    changed = false;
  } else if (state == 1) {
    rainbow(15);
  } else if (state == 2) {
    rainbowCycle(15);
  } else if (state == 3) {
    solid(rgb(255, 255, 255));
    while (changed == false) {
        delay(100);
    }
    changed = false;
  } else if (state == 4) {
    solid(rgb(0, 0, 255));
    while (changed == false) {
        delay(100);
    }
    changed = false;
  } else if (state == 5) {
    byte time = millis() >> 2;

    for (uint16_t i = 0; i < strip.numPixels(); i++) {
        byte x = time - 8 * i;
        setPixelColor(i, rgb(x, 255 - x, x));
    }

    strip.show();

    delay(10);
  } else if (state == 6) {
    // Color Picker
    solid(color);
    while (changed == false) {
        delay(10);
    }
    changed = false;
  }

    
    
  return 0;
}

void clear() {
  for (uint16_t i = 0; i < strip.numPixels(); i++) {
    setPixelColor(i, 0);
    strip.show();
  }
}

// Fill the dots one after the other with a color
void colorWipe(uint32_t c, uint8_t wait) {
  for (uint16_t i = 0; i < strip.numPixels(); i++) {
    setPixelColor(i, c);
    strip.show();
    delay(wait);
  }
}

void rainbow(uint8_t wait) {
  uint16_t i, j;

  for (j = 0; j < 256; j++) {
    for (i = 0; i < strip.numPixels(); i++) {
      setPixelColor(i, Wheel((i + j) & 255));
    }
    strip.show();
    if (changed) {
        changed = false;
        return;
    }
    
    delay(wait);
  }
}

// Slightly different, this makes the rainbow equally distributed throughout
void rainbowCycle(uint8_t wait) {
  uint16_t i, j;

  for (j = 0; j < 256 * 5; j++) { // 5 cycles of all colors on wheel
    for (i = 0; i < strip.numPixels(); i++) {
      setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
    }
    strip.show();
    
    if (changed) {
        changed = false;
        return;
    }
    
    delay(wait);
  }
}

void solid(uint32_t c) {
  for (int i = 0; i < strip.numPixels(); i++) {
    setPixelColor(i, c);
  }
  strip.show();
}

uint32_t rgb(uint32_t r, uint32_t g, uint32_t b) {
  return (r << 16) | (g << 8) | b;
}


// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if (WheelPos < 85) {
    return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if (WheelPos < 170) {
    WheelPos -= 85;
    return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}
