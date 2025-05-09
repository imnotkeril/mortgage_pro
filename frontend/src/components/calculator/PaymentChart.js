import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CurrencyContext } from '../../contexts/CurrencyContext';

const PaymentChart = ({ scheduleData, darkMode }) => {
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  const currencySymbol = getCurrencySymbol();
  
  // Prepare chart data - sample every 12 months for clarity
  const chartData = scheduleData
    .filter((_, index) => index % 12 === 0 || index === scheduleData.length - 1)
    .map(item => ({
      month: item.month,
      payment: parseFloat(item.payment.toFixed(2)),
      principal: parseFloat(item.principal.toFixed(2)),
      interest: parseFloat(item.interest.toFixed(2)),
      remainingLoan: parseFloat(item.remainingLoan.toFixed(2)),
      year: Math.ceil(item.month / 12)
    }));
  
  // Color scheme
  const colors = darkMode ? {
    principal: '#BF9FFB',  // Purple
    interest: '#90BFF9',   // Blue
    background: '#0D1015', // Dark background
    text: '#D1D4DC',       // Light text
    grid: '#2A2E39'        // Grid lines
  } : {
    principal: '#9333ea',  // Purple
    interest: '#3b82f6',   // Blue
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
          <p className="text-sm font-medium mt-1">
            Total: {formatCurrency(payload[0].payload.payment)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
        Payment Structure
      </h3>
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
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
            <Legend 
              formatter={(value) => <span style={{ color: colors.text }}>{value}</span>}
            />
            <Bar 
              dataKey="principal" 
              name="Principal" 
              stackId="a" 
              fill={colors.principal} 
            />
            <Bar 
              dataKey="interest" 
              name="Interest" 
              stackId="a" 
              fill={colors.interest} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PaymentChart;