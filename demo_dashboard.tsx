import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Zap, Thermometer, Wind, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

const EnergyDashboard = () => {
  const [currentData, setCurrentData] = useState({
    current: 8.5,
    temperature: 45.2,
    co2: 520,
    power: 1955,
    energy: 24.8,
    timestamp: new Date().toLocaleTimeString()
  });
  
  const [historicalData, setHistoricalData] = useState([]);
  const [savings, setSavings] = useState({
    idleElimination: { energy: 3.2, co2: 2.6, cost: 192 },
    heatRecovery: { energy: 1.8, co2: 1.5, cost: 108 },
    total: { energy: 5.0, co2: 4.1, cost: 300, percentage: 20.2 }
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const baseLoad = 8 + 3 * Math.sin(Date.now() / 300000); // 5-minute cycle
      const noise = (Math.random() - 0.5) * 2;
      const spike = Math.random() < 0.05 ? 8 : 0; // 5% chance of spike
      
      const newCurrent = Math.max(0, baseLoad + noise + spike);
      const newTemp = 25 + newCurrent * 2.5 + (Math.random() - 0.5) * 3;
      const newCO2 = 420 + newCurrent * 20 + (Math.random() - 0.5) * 50;
      const newPower = newCurrent * 230;
      
      const newDataPoint = {
        current: newCurrent,
        temperature: newTemp,
        co2: newCO2,
        power: newPower,
        energy: currentData.energy + (newPower / 1000 / 3600), // Increment energy
        timestamp: new Date().toLocaleTimeString(),
        time: Date.now()
      };
      
      setCurrentData(newDataPoint);
      
      // Keep last 50 points for chart
      setHistoricalData(prev => {
        const updated = [...prev, newDataPoint].slice(-50);
        return updated;
      });
    }, 2000);

    // Initialize with some data
    const initData = [];
    for (let i = 0; i < 20; i++) {
      const baseLoad = 8 + 3 * Math.sin((Date.now() - (20-i) * 2000) / 300000);
      const current = Math.max(0, baseLoad + (Math.random() - 0.5) * 2);
      initData.push({
        current: current,
        temperature: 25 + current * 2.5 + (Math.random() - 0.5) * 3,
        co2: 420 + current * 20 + (Math.random() - 0.5) * 50,
        power: current * 230,
        energy: 20 + i * 0.2,
        timestamp: new Date(Date.now() - (20-i) * 2000).toLocaleTimeString(),
        time: Date.now() - (20-i) * 2000
      });
    }
    setHistoricalData(initData);

    return () => clearInterval(interval);
  }, [currentData.energy]);

  const getStatusColor = (value, thresholds) => {
    if (value < thresholds.low) return 'text-blue-600';
    if (value > thresholds.high) return 'text-red-600';
    return 'text-green-600';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value < thresholds.low || value > thresholds.high) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Smart Energy & Emissions Monitor
          </h1>
          <p className="text-slate-400 text-lg">Real-time industrial energy monitoring with AI-powered efficiency insights</p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-blue-400" />
              {getStatusIcon(currentData.current, { low: 2, high: 15 })}
            </div>
            <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-1">Current</h3>
            <div className={`text-3xl font-bold ${getStatusColor(currentData.current, { low: 2, high: 15 })}`}>
              {currentData.current.toFixed(1)} A
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-red-500 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="w-8 h-8 text-red-400" />
              {getStatusIcon(currentData.temperature, { low: 20, high: 60 })}
            </div>
            <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-1">Temperature</h3>
            <div className={`text-3xl font-bold ${getStatusColor(currentData.temperature, { low: 20, high: 60 })}`}>
              {currentData.temperature.toFixed(1)}°C
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-yellow-500 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Wind className="w-8 h-8 text-yellow-400" />
              {getStatusIcon(currentData.co2, { low: 400, high: 600 })}
            </div>
            <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-1">CO₂ Level</h3>
            <div className={`text-3xl font-bold ${getStatusColor(currentData.co2, { low: 400, high: 600 })}`}>
              {Math.round(currentData.co2)} ppm
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-green-500 transition-all">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 text-green-400" />
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-1">Power</h3>
            <div className="text-3xl font-bold text-green-400">
              {Math.round(currentData.power)} W
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Power Timeline */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Power Consumption Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="power" 
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Temperature vs Current */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-red-400">Temperature vs Current</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                  name="Current (A)"
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={false}
                  name="Temperature (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-green-400">Identified Savings Opportunities</h3>
            
            <div className="space-y-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-blue-300">Idle Period Elimination</h4>
                  <span className="text-2xl font-bold text-green-400">{savings.idleElimination.energy} kWh</span>
                </div>
                <p className="text-slate-400 text-sm mb-3">
                  Switch off equipment during low-usage periods (detected idle time: 3.2 hours)
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">CO₂ Reduction: {savings.idleElimination.co2} kg</span>
                  <span className="text-green-400">₹{savings.idleElimination.cost} saved</span>
                </div>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-red-300">Heat Recovery System</h4>
                  <span className="text-2xl font-bold text-green-400">{savings.heatRecovery.energy} kWh</span>
                </div>
                <p className="text-slate-400 text-sm mb-3">
                  Recover waste heat during high-temperature operations (>55°C periods)
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">CO₂ Reduction: {savings.heatRecovery.co2} kg</span>
                  <span className="text-green-400">₹{savings.heatRecovery.cost} saved</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">Total Impact</h3>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-1">
                  {savings.total.percentage}%
                </div>
                <div className="text-slate-400 text-sm">Potential Savings</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Energy Saved</span>
                  <span className="font-semibold text-green-400">{savings.total.energy} kWh</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-300">CO₂ Reduced</span>
                  <span className="font-semibold text-blue-400">{savings.total.co2} kg</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-300">Cost Savings</span>
                  <span className="font-semibold text-yellow-400">₹{savings.total.cost}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-600">
                <div className="text-xs text-slate-400">
                  Based on 24h monitoring period<br/>
                  Scaled annually: ₹{Math.round(savings.total.cost * 365)} savings
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-purple-400">System Status</h3>
            <div className="text-sm text-slate-400">
              Last Update: {currentData.timestamp}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300">Sensors Active</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300">Data Logging</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300">Analysis Running</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-700 rounded-lg">
            <h4 className="font-semibold text-green-400 mb-2">Live Recommendations</h4>
            <div className="space-y-2 text-sm">
              {currentData.current < 2 && (
                <div className="flex items-center space-x-2 text-blue-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>Idle period detected - Consider switching off non-essential loads</span>
                </div>
              )}
              {currentData.temperature > 55 && (
                <div className="flex items-center space-x-2 text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>High temperature detected - Heat recovery opportunity available</span>
                </div>
              )}
              {currentData.current >= 2 && currentData.current <= 15 && currentData.temperature <= 55 && (
                <div className="flex items-center space-x-2 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span>Operating within optimal parameters</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Smart Energy Monitor | Arduino + Python | Real-time Industrial IoT Solution</p>
          <p className="mt-1">Emission Factor: 0.82 kgCO₂/kWh | Voltage: 230V AC | Sampling: 2s intervals</p>
        </div>
      </div>
    </div>
  );
};

export default EnergyDashboard;