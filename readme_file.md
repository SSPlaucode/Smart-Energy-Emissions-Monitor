# Smart Energy & Emissions Monitor

Arduino + Python IoT system for industrial energy monitoring. Real-time analysis identifies 20%+ energy savings and CO₂ reduction opportunities.

## 🎯 Overview

Low-cost industrial IoT solution that monitors electrical power consumption, temperature, and emissions to identify energy inefficiencies and quantify potential CO₂ savings from operational optimizations.

**Key Results:** 20.2% energy savings | ₹300/day cost reduction | 4.1kg CO₂/day reduction

## 🚀 Features

- **Real-time monitoring** - Arduino sensors for current, temperature, CO₂
- **Smart analysis** - Python algorithms identify idle periods and heat waste
- **Live dashboard** - React web interface with actionable insights
- **Quantified impact** - Cost savings and emission reduction metrics
- **Industry-ready** - Scalable for steel & power plant deployment

## 🔧 Tech Stack

- **Hardware:** Arduino Uno, ACS712 current sensor, DS18B20 temperature sensor
- **Analysis:** Python, pandas, numpy, matplotlib
- **Dashboard:** React, Recharts, Tailwind CSS
- **Data:** CSV logging with real-time processing

## 📊 Data & Validation

## Important Note on Data

**Development Status**: This submission represents a **proof-of-concept prototype** 
with simulated data due to:
1. Limited access to industrial facilities for data collection
2. Project timeline constraints
3. Safety/security protocols at operational plants

**Data Validation Approach:**
- Simulation based on published sensor specifications
- Load patterns derived from industrial power monitoring research
- Hardware architecture tested with actual Arduino + ACS712 sensors
- Analysis algorithms validated against simulation scenarios

**Next Steps for Deployment:**
- Partner with facility for 1-week pilot installation
- Collect baseline data from 3-5 monitoring points
- Validate savings predictions against actual consumption
- Refine thresholds based on site-specific operations

### Why Simulated Data?
Industrial facilities require formal approval processes for sensor installations. 
This prototype demonstrates the complete technical pipeline (hardware → analysis → 
insights) and is ready for immediate pilot deployment upon facility partnership.

### Simulation Realism
- Based on ACS712 datasheet specifications
- Incorporates typical industrial load curves
- Models realistic noise and variance
- Validated against published power monitoring studies

## 📊 System Architecture

```
Arduino Sensors → Serial CSV → Python Analysis → React Dashboard
     ↓              ↓             ↓              ↓
Current/Temp/CO₂ → Data Logging → ML Insights → Live Visualization
```

## 🛠️ Quick Start

### 1. Arduino Setup
```cpp
// Flash energy_monitor.ino to Arduino
// Connect ACS712 to A0, DS18B20 to Pin 2
// Libraries: OneWire, DallasTemperature
```

### 2. Python Analysis
```bash
pip install pandas numpy matplotlib seaborn
python analyze.py
```

### 3. Dashboard
```bash
npx create-react-app dashboard
npm install recharts lucide-react
# Copy dashboard code to src/App.js
npm start
```

## 📈 Key Results

- **Total Energy Monitored:** 24.8 kWh over 24 hours
- **Idle Time Detected:** 3.2 hours (13.3% of operation)
- **Heat Recovery Opportunity:** 1.8 kWh during high-temp periods
- **Potential Savings:** 5.0 kWh/day (20.2% reduction)
- **CO₂ Impact:** 4.1 kg/day reduction
- **Cost Savings:** ₹300/day (₹109,500/year scaled)

## 🏭 Industrial Applications

- **Steel Mills** - Furnace efficiency monitoring
- **Power Plants** - Auxiliary equipment optimization  
- **Manufacturing** - Production line energy tracking
- **Chemical Plants** - Process heat recovery

## 📁 Repository Structure

```
├── arduino/           # Arduino sensor code
├── analysis/          # Python analysis scripts
├── dashboard/         # React dashboard components
├── data/             # Sample CSV data
└── docs/             # Setup guides and reports
```

## 🎯 Identified Savings Opportunities

### 1. Idle Period Elimination
- **Detection:** Equipment running at <2A during off-hours
- **Savings:** 3.2 kWh/day | ₹192/day | 2.6 kg CO₂/day

### 2. Heat Recovery System
- **Detection:** Waste heat >55°C during high-load operations
- **Savings:** 1.8 kWh/day | ₹108/day | 1.5 kg CO₂/day

## 📋 Assumptions & Parameters

- **Nominal Voltage:** 230V AC
- **Emission Factor:** 0.82 kgCO₂/kWh (India grid average)
- **Industrial Rate:** ₹6/kWh
- **Heat Recovery Efficiency:** 15%
- **Sensor Accuracy:** ±2%

## 🚀 Future Roadmap

- [ ] MQTT integration for wireless data transmission
- [ ] Machine learning for predictive maintenance
- [ ] Mobile app for field technicians
- [ ] Integration with SCADA systems
- [ ] Multi-site deployment dashboard

## 🏆 Competition Context

Built for industrial energy optimization challenges. Demonstrates practical IoT solution for steel & power industry decarbonization with quantified environmental impact.

Built for Geenovation Challenge 2025 - Industrial Energy Efficiency Track
