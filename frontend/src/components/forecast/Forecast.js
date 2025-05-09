import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { forecastPropertyValue } from '../../api';
import InputField from '../common/InputField';
import Loader from '../common/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Forecast = () => {
  const { darkMode } = useContext(AppContext);
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  
  // State for forecast parameters
  const [forecastParams, setForecastParams] = useState({
    initialValue: 10000000,
    growthRate: 4.0,
    years: 10,
    model: 'linear',
    inflationRate: 4.0,
    regionalAdjustment: 0.0,
    seasonalFactors: null // Will use default seasonal factors from API
  });
  
  // State for forecast results
  const [forecastResults, setForecastResults] = useState({
    forecast: [],
    finalNominalValue: 0,
    finalRealValue: 0,
    totalGrowth: 0,
    realGrowth: 0
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculate forecast when parameters change
  useEffect(() => {
    const getForecast = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await forecastPropertyValue(forecastParams);
        setForecastResults(result);
      } catch (err) {
        console.error('Error forecasting property value:', err);
        setError('Failed to generate forecast. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    getForecast();
  }, [forecastParams]);
  
  // Handle input changes
  const handleInputChange = (name, value) => {
    setForecastParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Prepare chart data - sample every 12 months for clarity
  const chartData = forecastResults.forecast
    ? forecastResults.forecast
        .filter((_, index) => index % 12 === 0 || index === (forecastResults.forecast.length - 1))
        .map(item => ({
          month: item.month,
          year: Math.ceil(item.month / 12),
          nominalValue: item.nominalValue,
          realValue: item.realValue
        }))
    : [];
  
  // Color scheme
  const colors = darkMode ? {
    nominal: '#BF9FFB',    // Purple
    real: '#90BFF9',       // Blue
    background: '#0D1015', // Dark background
    text: '#D1D4DC',       // Light text
    grid: '#2A2E39'        // Grid lines
  } : {
    nominal: '#9333ea',    // Purple
    real: '#3b82f6',       // Blue
    background: '#ffffff', // White background
    text: '#374151',       // Dark text
    grid: '#e5e7eb'        // Grid lines
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 border rounded shadow ${darkMode ? 'bg-[#141418] border-[#2A2E39]' : 'bg-white border-gray-200'}`}>
          <p className="text-sm font-medium">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
        Property Value Forecast
      </h1>
      
      {/* Input Form */}
      <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          Forecast Parameters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Initial Property Value"
            value={forecastParams.initialValue}
            onChange={(value) => handleInputChange('initialValue', value)}
            prefix={getCurrencySymbol()}
            darkMode={darkMode}
          />
          
          <InputField
            label="Annual Growth Rate (%)"
            value={forecastParams.growthRate}
            onChange={(value) => handleInputChange('growthRate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="-10"
            max="30"
          />
          
          <InputField
            label="Forecast Period (years)"
            value={forecastParams.years}
            onChange={(value) => handleInputChange('years', value)}
            suffix="years"
            darkMode={darkMode}
            step="1"
            min="1"
            max="30"
            type="number"
          />
          
          <InputField
            label="Annual Inflation Rate (%)"
            value={forecastParams.inflationRate}
            onChange={(value) => handleInputChange('inflationRate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="0"
            max="30"
          />
          
          <InputField
            label="Regional Adjustment (%)"
            value={forecastParams.regionalAdjustment}
            onChange={(value) => handleInputChange('regionalAdjustment', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="-10"
            max="10"
          />
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Forecast Model
            </label>
            <select
              value={forecastParams.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className={`w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                darkMode 
                  ? 'bg-[#0D1015] border border-[#2A2E39] text-white' 
                  : 'bg-white border border-gray-300 text-gray-800'
              }`}
            >
              <option value="linear">Linear</option>
              <option value="exponential">Exponential</option>
              <option value="ml">Machine Learning</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <Loader />
        </div>
      )}
      
      {error && (
        <div className={`p-4 mb-6 rounded ${darkMode ? 'bg-red-900' : 'bg-red-100 border border-red-400'}`}>
          <p className={darkMode ? 'text-red-200' : 'text-red-700'}>{error}</p>
        </div>
      )}
      
      {/* Results Section */}
      {!isLoading && !error && forecastResults.forecast && forecastResults.forecast.length > 0 && (
        <>
          <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
              Forecast Results
            </h2>
            
            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                  Projected Nominal Value
                </div>
                <div className={`text-xl font-semibold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
                  {formatCurrency(forecastResults.finalNominalValue)}
                </div>
                <div className={`text-sm ${forecastResults.totalGrowth >= 0 ? (darkMode ? 'text-[#74F174]' : 'text-green-500') : (darkMode ? 'text-[#FAA1A4]' : 'text-red-500')}`}>
                  {forecastResults.totalGrowth >= 0 ? '+' : ''}{(forecastResults.totalGrowth * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                  Projected Real Value (Inflation-Adjusted)
                </div>
                <div className={`text-xl font-semibold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
                  {formatCurrency(forecastResults.finalRealValue)}
                </div>
                <div className={`text-sm ${forecastResults.realGrowth >= 0 ? (darkMode ? 'text-[#74F174]' : 'text-green-500') : (darkMode ? 'text-[#FAA1A4]' : 'text-red-500')}`}>
                  {forecastResults.realGrowth >= 0 ? '+' : ''}{(forecastResults.realGrowth * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            {/* Forecast Chart */}
            <div>
              <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                Property Value Projection
              </h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis 
                      dataKey="year" 
                      tick={{ fill: colors.text }} 
                      stroke={colors.grid}
                      label={{ 
                        value: 'Year', 
                        position: 'insideBottom', 
                        offset: -5, 
                        fill: colors.text 
                      }}
                    />
                    <YAxis 
                      tick={{ fill: colors.text }} 
                      stroke={colors.grid}
                      label={{ 
                        value: getCurrencySymbol(), 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: colors.text 
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      formatter={(value) => <span style={{ color: colors.text }}>{value}</span>}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="nominalValue" 
                      name="Nominal Value" 
                      stroke={colors.nominal}
                      strokeWidth={2}
                      dot={{ 
                        fill: colors.nominal,
                        r: 4
                      }}
                      activeDot={{ 
                        fill: colors.nominal,
                        r: 6,
                        stroke: colors.background
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="realValue" 
                      name="Real Value (Inflation-Adjusted)" 
                      stroke={colors.real}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ 
                        fill: colors.real,
                        r: 4
                      }}
                      activeDot={{ 
                        fill: colors.real,
                        r: 6,
                        stroke: colors.background
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Annual Data Table */}
          <div className={`p-4 rounded shadow ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
              Annual Forecast Data
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className={`p-2 text-left ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Year
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Nominal Value
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Real Value
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Nominal Growth
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Real Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item) => {
                    const nominalGrowth = (item.nominalValue / forecastParams.initialValue) - 1;
                    const realGrowth = (item.realValue / forecastParams.initialValue) - 1;
                    
                    return (
                      <tr key={item.year} className={`${darkMode ? 'hover:bg-[#0D1015]' : 'hover:bg-gray-50'}`}>
                        <td className={`p-2 text-left ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                          {item.year}
                        </td>
                        <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                          {formatCurrency(item.nominalValue)}
                        </td>
                        <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                          {formatCurrency(item.realValue)}
                        </td>
                        <td className={`p-2 text-right ${
                          nominalGrowth >= 0 
                            ? (darkMode ? 'text-[#74F174] border-b border-[#2A2E39]' : 'text-green-500 border-b border-gray-200') 
                            : (darkMode ? 'text-[#FAA1A4] border-b border-[#2A2E39]' : 'text-red-500 border-b border-gray-200')
                        }`}>
                          {nominalGrowth >= 0 ? '+' : ''}{(nominalGrowth * 100).toFixed(1)}%
                        </td>
                        <td className={`p-2 text-right ${
                          realGrowth >= 0 
                            ? (darkMode ? 'text-[#74F174] border-b border-[#2A2E39]' : 'text-green-500 border-b border-gray-200') 
                            : (darkMode ? 'text-[#FAA1A4] border-b border-[#2A2E39]' : 'text-red-500 border-b border-gray-200')
                        }`}>
                          {realGrowth >= 0 ? '+' : ''}{(realGrowth * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Forecast;