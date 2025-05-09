import React, { useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { getChartConfig } from '../../utils/chartConfig'; // Импорт конфигурации

const RemainingLoanChart = ({ scheduleData, darkMode }) => {
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  const currencySymbol = getCurrencySymbol();
  const chartConfig = getChartConfig(darkMode); // Получение конфигурации с учетом темной темы

  // Подготовка данных для графика (оставить существующий код)
  const chartData = scheduleData
    .filter((_, index) => index % 12 === 0 || index === scheduleData.length - 1)
    .map(item => ({
      month: item.month,
      remainingLoan: parseFloat(item.remainingLoan.toFixed(2)),
      year: Math.ceil(item.month / 12)
    }));

  // Цветовая схема (оставить существующий код)
  const colors = darkMode ? {
    line: '#BF9FFB',
    dot: '#BF9FFB',
    activeDot: '#ffffff',
    background: '#0D1015',
    text: '#D1D4DC',
    grid: '#2A2E39'
  } : {
    line: '#9333ea',
    dot: '#9333ea',
    activeDot: '#ffffff',
    background: '#ffffff',
    text: '#374151',
    grid: '#e5e7eb'
  };

  // Пользовательская подсказка (оставить существующий код)
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
      <div className="h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={chartConfig.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="year"
              {...chartConfig.xAxisConfig}
            />
            <YAxis
              {...chartConfig.yAxisConfig}
              tickFormatter={chartConfig.formatLargeNumber}
              label={chartConfig.getCurrencyLabel(currencySymbol)}
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