import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class EnergyAnalyzer:
    def __init__(self, emission_factor=0.82):  # kgCO2/kWh - India grid average
        self.emission_factor = emission_factor
        self.data = None
        self.results = {}
        
    def generate_sample_data(self, duration_hours=24, filename='sample_data.csv'):
        """Generate realistic sample data if hardware unavailable"""
        print("Generating sample data for demonstration...")
        
        # Time series
        timestamps = []
        current_vals = []
        temp_vals = []
        co2_vals = []
        
        base_time = datetime.now()
        samples_per_hour = 60  # 1 sample per minute
        total_samples = duration_hours * samples_per_hour
        
        for i in range(total_samples):
            # Timestamp
            timestamp = base_time + timedelta(minutes=i)
            timestamps.append(timestamp.timestamp() * 1000)  # Arduino millis format
            
            # Simulate realistic industrial load patterns
            hour = i // samples_per_hour
            
            # Base load with daily pattern
            if 6 <= hour <= 18:  # Day shift
                base_current = 8.0 + 3.0 * np.sin(2 * np.pi * hour / 24)
            else:  # Night shift - reduced load
                base_current = 3.0
            
            # Add noise and spikes
            noise = np.random.normal(0, 0.5)
            spike = 15.0 if np.random.random() < 0.02 else 0  # 2% chance of spike
            current = max(0, base_current + noise + spike)
            
            # Temperature correlation with current
            temp = 25 + current * 2.5 + np.random.normal(0, 1.5)
            
            # CO2 correlation
            co2 = 420 + current * 20 + np.random.normal(0, 30)
            
            current_vals.append(current)
            temp_vals.append(temp)
            co2_vals.append(max(350, co2))
        
        # Create DataFrame
        df = pd.DataFrame({
            'timestamp': timestamps,
            'current_A': current_vals,
            'temp_C': temp_vals,
            'co2_ppm': co2_vals
        })
        
        # Calculate power
        df['power_W'] = df['current_A'] * 230  # Assuming 230V
        
        # Save to CSV
        df.to_csv(filename, index=False)
        print(f"Sample data saved to {filename}")
        return df
    
    def load_data(self, filename):
        """Load data from CSV"""
        try:
            self.data = pd.read_csv(filename)
            print(f"Loaded {len(self.data)} data points from {filename}")
        except FileNotFoundError:
            print("Data file not found. Generating sample data...")
            self.data = self.generate_sample_data(filename=filename)
        
        # Convert timestamp to datetime
        self.data['datetime'] = pd.to_datetime(self.data['timestamp'], unit='ms')
        return self.data
    
    def analyze_consumption(self):
        """Analyze energy consumption patterns"""
        if self.data is None:
            raise ValueError("No data loaded")
        
        # Calculate time intervals
        time_diff = self.data['timestamp'].diff().fillna(100) / 1000  # Convert to seconds
        
        # Smooth data
        window = 5
        self.data['current_smooth'] = self.data['current_A'].rolling(window=window).mean()
        self.data['power_smooth'] = self.data['power_W'].rolling(window=window).mean()
        
        # Calculate energy (kWh)
        energy_wh = (self.data['power_W'] * time_diff / 3600).cumsum()  # Wh
        self.data['energy_kWh'] = energy_wh / 1000  # kWh
        
        # Identify operational states
        idle_threshold = self.data['current_A'].quantile(0.2)  # Bottom 20%
        high_load_threshold = self.data['current_A'].quantile(0.8)  # Top 20%
        
        self.data['state'] = 'normal'
        self.data.loc[self.data['current_A'] < idle_threshold, 'state'] = 'idle'
        self.data.loc[self.data['current_A'] > high_load_threshold, 'state'] = 'high_load'
        
        # Store results
        self.results = {
            'total_energy_kWh': self.data['energy_kWh'].iloc[-1],
            'avg_power_W': self.data['power_W'].mean(),
            'max_power_W': self.data['power_W'].max(),
            'idle_time_hours': (self.data['state'] == 'idle').sum() * time_diff.mean() / 3600,
            'idle_threshold_A': idle_threshold,
            'high_load_threshold_A': high_load_threshold,
            'avg_temp_C': self.data['temp_C'].mean(),
            'max_temp_C': self.data['temp_C'].max(),
            'avg_co2_ppm': self.data['co2_ppm'].mean()
        }
        
        return self.results
    
    def identify_savings_opportunities(self):
        """Identify potential energy and emission savings"""
        if not self.results:
            self.analyze_consumption()
        
        savings = {}
        
        # Opportunity 1: Eliminate idle consumption
        idle_mask = self.data['state'] == 'idle'
        idle_power_avg = self.data.loc[idle_mask, 'power_W'].mean()
        idle_hours = self.results['idle_time_hours']
        
        savings['idle_elimination'] = {
            'description': f"Switch off equipment during {idle_hours:.1f} hours of idle time",
            'energy_saved_kWh': idle_power_avg * idle_hours / 1000,
            'cost_saved_inr': (idle_power_avg * idle_hours / 1000) * 6,  # ₹6/kWh industrial rate
            'co2_saved_kg': (idle_power_avg * idle_hours / 1000) * self.emission_factor
        }
        
        # Opportunity 2: Heat recovery from high temperature periods
        high_temp_mask = self.data['temp_C'] > (self.results['avg_temp_C'] + 10)
        if high_temp_mask.sum() > 0:
            high_temp_power = self.data.loc[high_temp_mask, 'power_W'].mean()
            heat_recovery_efficiency = 0.15  # Assume 15% heat recovery
            
            savings['heat_recovery'] = {
                'description': f"Heat recovery during high-temperature operations (>{self.results['avg_temp_C']+10:.1f}°C)",
                'energy_saved_kWh': high_temp_power * len(self.data[high_temp_mask]) * 100/1000/1000 * heat_recovery_efficiency,
                'cost_saved_inr': (high_temp_power * len(self.data[high_temp_mask]) * 100/1000/1000 * heat_recovery_efficiency) * 6,
                'co2_saved_kg': (high_temp_power * len(self.data[high_temp_mask]) * 100/1000/1000 * heat_recovery_efficiency) * self.emission_factor
            }
        
        # Total savings
        total_energy_saved = sum([opp['energy_saved_kWh'] for opp in savings.values()])
        total_co2_saved = sum([opp['co2_saved_kg'] for opp in savings.values()])
        total_cost_saved = sum([opp['cost_saved_inr'] for opp in savings.values()])
        
        savings['total'] = {
            'energy_saved_kWh': total_energy_saved,
            'co2_saved_kg': total_co2_saved,
            'cost_saved_inr': total_cost_saved,
            'savings_percentage': (total_energy_saved / self.results['total_energy_kWh']) * 100
        }
        
        return savings
    
    def create_visualizations(self):
        """Create analysis plots"""
        plt.style.use('seaborn-v0_8')
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('Smart Energy & Emissions Monitor - Analysis Dashboard', fontsize=16, fontweight='bold')
        
        # Plot 1: Power consumption over time
        axes[0,0].plot(self.data['datetime'], self.data['power_W'], alpha=0.6, linewidth=0.8, label='Raw')
        axes[0,0].plot(self.data['datetime'], self.data['power_smooth'], color='red', linewidth=2, label='Smoothed')
        axes[0,0].set_title('Power Consumption Over Time')
        axes[0,0].set_ylabel('Power (W)')
        axes[0,0].legend()
        axes[0,0].grid(True, alpha=0.3)
        
        # Plot 2: Temperature vs Current correlation
        scatter = axes[0,1].scatter(self.data['current_A'], self.data['temp_C'], 
                                  c=self.data['power_W'], cmap='viridis', alpha=0.7)
        axes[0,1].set_title('Temperature vs Current (colored by Power)')
        axes[0,1].set_xlabel('Current (A)')
        axes[0,1].set_ylabel('Temperature (°C)')
        plt.colorbar(scatter, ax=axes[0,1], label='Power (W)')
        
        # Plot 3: Cumulative energy consumption
        axes[1,0].plot(self.data['datetime'], self.data['energy_kWh'], color='green', linewidth=2)
        axes[1,0].set_title('Cumulative Energy Consumption')
        axes[1,0].set_ylabel('Energy (kWh)')
        axes[1,0].grid(True, alpha=0.3)
        
        # Plot 4: Operational states
        state_colors = {'idle': 'blue', 'normal': 'green', 'high_load': 'red'}
        for state in ['idle', 'normal', 'high_load']:
            mask = self.data['state'] == state
            if mask.sum() > 0:
                axes[1,1].scatter(self.data.loc[mask, 'datetime'], 
                                self.data.loc[mask, 'current_A'],
                                c=state_colors[state], alpha=0.6, label=state.replace('_', ' ').title())
        
        axes[1,1].set_title('Operational States')
        axes[1,1].set_ylabel('Current (A)')
        axes[1,1].legend()
        axes[1,1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('energy_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        return fig
    
    def generate_report(self, savings):
        """Generate text report"""
        report = f"""
SMART ENERGY & EMISSIONS MONITOR - ANALYSIS REPORT
==================================================

SYSTEM OVERVIEW:
- Monitoring Period: {len(self.data)} samples over {(self.data['timestamp'].iloc[-1] - self.data['timestamp'].iloc[0])/3600000:.1f} hours
- Total Energy Consumed: {self.results['total_energy_kWh']:.2f} kWh
- Average Power: {self.results['avg_power_W']:.1f} W
- Peak Power: {self.results['max_power_W']:.1f} W
- Average Temperature: {self.results['avg_temp_C']:.1f}°C
- Average CO₂: {self.results['avg_co2_ppm']:.0f} ppm

OPERATIONAL ANALYSIS:
- Idle Time: {self.results['idle_time_hours']:.1f} hours ({(self.results['idle_time_hours']/(len(self.data)*100/1000/3600))*100:.1f}% of total)
- Idle Threshold: <{self.results['idle_threshold_A']:.1f} A
- High Load Threshold: >{self.results['high_load_threshold_A']:.1f} A

SAVINGS OPPORTUNITIES:
"""
        
        for key, opp in savings.items():
            if key != 'total':
                report += f"\n{key.upper().replace('_', ' ')}:\n"
                report += f"- {opp['description']}\n"
                report += f"- Energy Savings: {opp['energy_saved_kWh']:.2f} kWh\n"
                report += f"- Cost Savings: ₹{opp['cost_saved_inr']:.0f}\n"
                report += f"- CO₂ Reduction: {opp['co2_saved_kg']:.2f} kg\n"
        
        report += f"""
TOTAL IMPACT:
- Total Energy Savings: {savings['total']['energy_saved_kWh']:.2f} kWh ({savings['total']['savings_percentage']:.1f}%)
- Total Cost Savings: ₹{savings['total']['cost_saved_inr']:.0f}
- Total CO₂ Reduction: {savings['total']['co2_saved_kg']:.2f} kg
- Emission Factor Used: {self.emission_factor} kgCO₂/kWh (India grid average)

ASSUMPTIONS:
- Nominal voltage: 230V AC
- Industrial electricity rate: ₹6/kWh
- Heat recovery efficiency: 15%
- Grid emission factor: {self.emission_factor} kgCO₂/kWh
- Sensor accuracy: ±2% (typical for current sensors)

RECOMMENDATIONS:
1. Deploy automated switching for idle period elimination
2. Implement heat recovery system for high-temperature operations  
3. Scale monitoring to 5+ industrial units for validation
4. Integrate with SCADA systems for real-time optimization

TECHNICAL NOTES:
- Data smoothed using 5-point moving average
- Operational states defined by current consumption quartiles
- CO₂ estimates based on grid emission factors
"""
        
        with open('analysis_report.txt', 'w') as f:
            f.write(report)
        
        return report

def main():
    # Initialize analyzer
    analyzer = EnergyAnalyzer()
    
    # Load or generate data
    data = analyzer.load_data('sensor_data.csv')
    
    # Perform analysis
    print("Analyzing energy consumption patterns...")
    results = analyzer.analyze_consumption()
    
    # Identify savings
    print("Identifying savings opportunities...")
    savings = analyzer.identify_savings_opportunities()
    
    # Create visualizations
    print("Generating visualizations...")
    analyzer.create_visualizations()
    
    # Generate report
    print("Generating report...")
    report = analyzer.generate_report(savings)
    
    # Print key results
    print("\n" + "="*60)
    print("KEY RESULTS:")
    print("="*60)
    print(f"Total Energy: {results['total_energy_kWh']:.2f} kWh")
    print(f"Potential Savings: {savings['total']['energy_saved_kWh']:.2f} kWh ({savings['total']['savings_percentage']:.1f}%)")
    print(f"CO₂ Reduction: {savings['total']['co2_saved_kg']:.2f} kg")
    print(f"Cost Savings: ₹{savings['total']['cost_saved_inr']:.0f}")
    print("\nFiles generated: energy_analysis.png, analysis_report.txt")

if __name__ == "__main__":
    main()