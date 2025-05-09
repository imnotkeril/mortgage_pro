import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CurrencyContext } from '../../contexts/CurrencyContext';

const PaymentChart = ({ scheduleData, darkMode }) => {
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  const currencySymbol = getCurrencySymbol();

  // Prepare chart data
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
    principal: '#BF9FFB',
    interest: '#90BFF9',
    background: '#0D1015',
    text: '#D1D4DC',
    grid: '#2A2E39'
  } : {
    principal: '#9333ea',
    interest: '#3b82f6',
    background: '#ffffff',
    text: '#374151',
    grid: '#e5e7eb'
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded shadow ${darkMode ? 'bg-[#141418] border-[#2A2E39]' : 'bg-white border-gray-200'}`}>
          <p className="text-sm font-medium mb-2">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
              {entry.name === 'principal' ? 'Principal' : 'Interest'}: {currencySymbol}{entry.value.toLocaleString()}
            </p>
          ))}
          <p className="text-sm font-medium mt-1">
            Total: {currencySymbol}{(payload[0].payload.payment).toLocaleString()}
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
      <div className="h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="year"
              tick={{ fill: colors.text }}
              stroke={colors.grid}
            />
            <YAxis
              tick={{ fill: colors.text }}
              stroke={colors.grid}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ color: colors.text }}>
                  {value === 'principal' ? 'Principal' : 'Interest'}
                </span>
              )}
            />
            <Bar
              dataKey="principal"
              name="principal"
              stackId="a"
              fill={colors.principal}
              animationDuration={500}
            />
            <Bar
              dataKey="interest"
              name="interest"
              stackId="a"
              fill={colors.interest}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PaymentChart;