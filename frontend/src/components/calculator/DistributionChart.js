import React, { useContext } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CurrencyContext } from '../../contexts/CurrencyContext';

const DistributionChart = ({ totalInterest, loanAmount, darkMode }) => {
  const { formatCurrency } = useContext(CurrencyContext);
  
  // Prepare chart data
  const data = [
    { name: 'Principal', value: loanAmount, color: darkMode ? '#BF9FFB' : '#9333ea' },
    { name: 'Interest', value: totalInterest, color: darkMode ? '#90BFF9' : '#3b82f6' }
  ];
  
  // Calculate percentages
  const totalAmount = loanAmount + totalInterest;
  const principalPercentage = (loanAmount / totalAmount * 100).toFixed(1);
  const interestPercentage = (totalInterest / totalAmount * 100).toFixed(1);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-2 border rounded shadow ${darkMode ? 'bg-[#141418] border-[#2A2E39]' : 'bg-white border-gray-200'}`}>
          <p className="text-sm font-medium" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm">
            {formatCurrency(data.value)} ({data.name === 'Principal' ? principalPercentage : interestPercentage}%)
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={darkMode ? '#ffffff' : '#000000'} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };
  
  return (
    <div>
      <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
        Payment Distribution
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={40}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value, entry, index) => (
                  <span style={{ color: darkMode ? '#D1D4DC' : '#374151' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col justify-center space-y-4">
          <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: data[0].color }}></div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>Principal</div>
            </div>
            <div className={`text-lg font-semibold mt-1`} style={{ color: data[0].color }}>
              {formatCurrency(loanAmount)}
              <span className={`text-sm font-normal ml-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                ({principalPercentage}%)
              </span>
            </div>
          </div>
          
          <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: data[1].color }}></div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>Interest</div>
            </div>
            <div className={`text-lg font-semibold mt-1`} style={{ color: data[1].color }}>
              {formatCurrency(totalInterest)}
              <span className={`text-sm font-normal ml-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                ({interestPercentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionChart;