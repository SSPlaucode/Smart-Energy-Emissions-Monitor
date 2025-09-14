#include <OneWire.h>
#include <DallasTemperature.h>
#include <SoftwareSerial.h>

// Pin definitions
#define CURRENT_SENSOR_PIN A0
#define TEMP_SENSOR_PIN 2
#define CO2_RX_PIN 7
#define CO2_TX_PIN 6

// Sensor setup
OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature tempSensor(&oneWire);
SoftwareSerial co2Serial(CO2_RX_PIN, CO2_TX_PIN);

// Calibration constants
const float CURRENT_SENSITIVITY = 66.0; // mV/A for ACS712-30A
const float VOLTAGE_REF = 5000.0; // mV
const float VOLTAGE_OFFSET = 2500.0; // mV (VCC/2)
const int ADC_RESOLUTION = 1024;
const float NOMINAL_VOLTAGE = 230.0; // V

// Sampling parameters
const int SAMPLES = 50;
const unsigned long SAMPLE_INTERVAL = 100; // ms
unsigned long lastReading = 0;

void setup() {
  Serial.begin(9600);
  tempSensor.begin();
  co2Serial.begin(9600);
  
  // Initialize analog reference
  analogReference(DEFAULT);
  
  // Print CSV header
  Serial.println("timestamp,current_A,temp_C,co2_ppm,power_W");
  
  delay(2000); // Sensor stabilization
}

void loop() {
  if (millis() - lastReading >= SAMPLE_INTERVAL) {
    
    // Read current sensor (averaged)
    float currentSum = 0;
    for (int i = 0; i < SAMPLES; i++) {
      int adcValue = analogRead(CURRENT_SENSOR_PIN);
      float voltage = (adcValue * VOLTAGE_REF) / ADC_RESOLUTION;
      float current = (voltage - VOLTAGE_OFFSET) / CURRENT_SENSITIVITY;
      currentSum += abs(current); // RMS approximation for AC
      delay(2);
    }
    float avgCurrent = currentSum / SAMPLES;
    
    // Read temperature
    tempSensor.requestTemperatures();
    float temperature = tempSensor.getTempCByIndex(0);
    if (temperature == DEVICE_DISCONNECTED_C) {
      temperature = 25.0; // Default if sensor disconnected
    }
    
    // Read CO2 (simplified - actual MH-Z19B requires specific commands)
    int co2_ppm = readCO2();
    
    // Calculate instantaneous power
    float power = NOMINAL_VOLTAGE * avgCurrent;
    
    // Output data as CSV
    Serial.print(millis());
    Serial.print(",");
    Serial.print(avgCurrent, 3);
    Serial.print(",");
    Serial.print(temperature, 2);
    Serial.print(",");
    Serial.print(co2_ppm);
    Serial.print(",");
    Serial.println(power, 2);
    
    lastReading = millis();
  }
}

int readCO2() {
  // Simplified CO2 reading - in real implementation, send proper MH-Z19B commands
  // For demo, we'll simulate based on current (higher current = more CO2)
  static int baseCO2 = 420; // ppm baseline
  float currentReading = analogRead(CURRENT_SENSOR_PIN);
  int co2_variation = (currentReading / 1024.0) * 200; // 0-200ppm variation
  return baseCO2 + co2_variation;
}

// Alternative function for CT clamp (SCT-013-000)
float readCurrentCT() {
  float sum = 0;
  int samples = 1000;
  
  for (int i = 0; i < samples; i++) {
    int adcValue = analogRead(CURRENT_SENSOR_PIN);
    float voltage = (adcValue * 5.0) / 1024.0;
    float current = (voltage - 2.5) / 0.185; // Assuming 185mV/A sensitivity
    sum += current * current; // Square for RMS calculation
    delayMicroseconds(500);
  }
  
  float rms = sqrt(sum / samples);
  return rms;
}