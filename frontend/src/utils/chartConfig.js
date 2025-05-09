// src/utils/chartConfig.js

export const getChartConfig = (darkMode) => {
  const colors = darkMode ? {
    text: '#D1D4DC',
    grid: '#2A2E39'
  } : {
    text: '#374151',
    grid: '#e5e7eb'
  };

  // Определяем функцию форматирования больших чисел
  const formatLargeNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value;
  };

  // Определяем функцию formatValue как алиас для formatLargeNumber
  const formatValue = formatLargeNumber;

  return {
    // Отступы графика
    margin: { top: 20, right: 20, left: 20, bottom: 30 },

    // Конфигурация оси X
    xAxisConfig: {
      tick: { fill: colors.text },
      stroke: colors.grid,
      height: 45,
      dy: 10,
      label: {
        value: 'Year',
        position: 'insideBottom',
        offset: 15,
        fill: colors.text
      }
    },

    // Конфигурация оси Y
    yAxisConfig: {
      tick: { fill: colors.text },
      stroke: colors.grid,
      width: 60,
    },

    // Функции форматирования теперь доступны в возвращаемом объекте
    formatLargeNumber,
    formatValue,

    // Конфигурация для отображения символа валюты
    getCurrencyLabel: (currencySymbol) => ({
      value: currencySymbol,
      angle: 0,
      position: 'insideLeft',
      offset: -5,
      dy: -15,
      dx: 10,
      fill: colors.text
    })
  };
};