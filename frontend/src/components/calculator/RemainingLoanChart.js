import React, { useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CurrencyContext } from '../../contexts/CurrencyContext';

const RemainingLoanChart = ({ scheduleData, darkMode }) => {
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  const currencySymbol = getCurrencySymbol();
  
  // Prepare chart data - sample every 12 months for clarity
  const chartData = scheduleData
    .filter((_, index) => index % 12 === 0 || index === scheduleData.length - 1)
    .map(item => ({
      month: item.month,
      remainingLoan: parseFloat(item.remainingLoan.toFixed(2)),
      year: Math.ceil(item.month / 12)
    }));
  
  // Color scheme
  const colors = darkMode ? {
    line: '#BF9FFB',       // Purple
    dot: '#BF9FFB',        // Purple
    activeDot: '#ffffff',  // White
    background: '#0D1015', // Dark background
    text: '#D1D4DC',       // Light text
    grid: '#2A2E39'        // Grid lines
  } : {
    line: '#9333ea',       // Purple
    dot: '#9333ea',        // Purple
    activeDot: '#ffffff',  // White
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
              Remaining Balance: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
        Remaining Balance
      </h3>
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
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
                value: currencySymbol, 
                angle: -90, 
                position: 'insideLeft', 
                fill: colors.text 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="remainingLoan" 
              stroke={colors.line}
              strokeWidth={2}
              dot={{ 
                fill: colors.dot,
                r: 4
              }}
              activeDot={{ 
                fill: colors.line,
                r: 6,
                stroke: colors.activeDot
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RemainingLoanChart;