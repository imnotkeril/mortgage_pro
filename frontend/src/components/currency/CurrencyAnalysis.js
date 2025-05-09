import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { analyzeCurrency } from '../../api';
import InputField from '../common/InputField';
import Loader from '../common/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getChartConfig } from '../../utils/chartConfig';

const CurrencyAnalysis = () => {
  const { darkMode } = useContext(AppContext);
  const {
    currency,
    setCurrency,
    formatCurrency,
    getCurrencySymbol,
    exchangeRates
  } = useContext(CurrencyContext);

  const chartConfig = getChartConfig(darkMode);

  // State for currency analysis parameters
  const [currencyParams, setCurrencyParams] = useState({
    loanAmount: 10000000,
    interestRate: 7.5,
    loanTermYears: 20,
    baseCurrency: currency,
    targetCurrencies: ['RUB', 'USD', 'EUR'].filter(c => c !== currency),
    currencyAnnualChange: null // Will use default values from API
  });

  // State for custom exchange rate changes
  const [customExchangeRates, setCustomExchangeRates] = useState({
    'RUB': { 'USD': -2.0, 'EUR': -1.5, 'JPY': -1.0 },
    'USD': { 'RUB': 2.0, 'EUR': 0.5, 'JPY': 1.0 },
    'EUR': { 'RUB': 1.5, 'USD': -0.5, 'JPY': 0.5 },
    'JPY': { 'RUB': 1.0, 'USD': -1.0, 'EUR': -0.5 }
  });

  // State for analysis results
  const [analysisResults, setAnalysisResults] = useState({
    currencyAnalysis: [],
    totalInterest: {}
  });

  // State for available currencies
  const [availableCurrencies, setAvailableCurrencies] = useState(['RUB', 'USD', 'EUR', 'JPY']);

  // State for selected currencies to display
  const [selectedCurrencies, setSelectedCurrencies] = useState(['RUB', 'USD']);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for currently displayed chart (payments or rates)
  const [chartType, setChartType] = useState('payments'); // 'payments' or 'rates'

  // Update base currency when global currency changes
  useEffect(() => {
    setCurrencyParams(prev => ({
      ...prev,
      baseCurrency: currency,
      targetCurrencies: availableCurrencies.filter(c => c !== currency)
    }));

    setSelectedCurrencies([
      currency,
      ...availableCurrencies.filter(c => c !== currency).slice(0, 1)
    ]);
  }, [currency, availableCurrencies]);

  // Get currency analysis when parameters change
  useEffect(() => {
    const getAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Convert custom exchange rates to format expected by API
        const apiExchangeRates = {};
        for (const fromCurr in customExchangeRates) {
          apiExchangeRates[fromCurr] = {};
          for (const toCurr in customExchangeRates[fromCurr]) {
            // Convert from percentage to decimal
            apiExchangeRates[fromCurr][toCurr] = customExchangeRates[fromCurr][toCurr] / 100;
          }
        }

        const params = {
          ...currencyParams,
          currencyAnnualChange: apiExchangeRates
        };

        const result = await analyzeCurrency(params);
        setAnalysisResults(result);
      } catch (err) {
        console.error('Error analyzing currency:', err);
        setError('Failed to analyze currency. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    getAnalysis();
  }, [currencyParams, customExchangeRates]);

  // Handle input changes
  const handleInputChange = (name, value) => {
    setCurrencyParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle custom exchange rate changes
  const handleExchangeRateChange = (fromCurrency, toCurrency, value) => {
    setCustomExchangeRates(prev => ({
      ...prev,
      [fromCurrency]: {
        ...prev[fromCurrency],
        [toCurrency]: value
      }
    }));
  };

  // Handle currency selection
  const handleCurrencySelection = (curr) => {
    if (selectedCurrencies.includes(curr)) {
      // Remove currency if already selected, but ensure at least one remains
      if (selectedCurrencies.length > 1) {
        setSelectedCurrencies(selectedCurrencies.filter(c => c !== curr));
      }
    } else {
      // Add currency if not already selected
      setSelectedCurrencies([...selectedCurrencies, curr]);
    }
  };

  // Prepare chart data - sample every 12 months for clarity
  const chartData = analysisResults.currencyAnalysis
    ? analysisResults.currencyAnalysis
        .filter((_, index) => index % 12 === 0 || index === (analysisResults.currencyAnalysis.length - 1))
        .map(item => {
          // Start with common data
          const dataPoint = {
            month: item.month,
            year: Math.ceil(item.month / 12)
          };

          // Add payment data for each selected currency
          selectedCurrencies.forEach(curr => {
            if (curr && item[`payment_${curr}`] !== undefined) {
              dataPoint[`payment_${curr}`] = item[`payment_${curr}`];
            }

            // Add exchange rate data
            if (curr !== currencyParams.baseCurrency && item[`rate_${curr}`] !== undefined) {
              dataPoint[`rate_${curr}`] = item[`rate_${curr}`];
            }
          });

          return dataPoint;
        })
    : [];

  // Color scheme with improved clarity
  const currencyColors = {
    'RUB': darkMode ? '#BF9FFB' : '#9333ea', // Purple
    'USD': darkMode ? '#90BFF9' : '#3b82f6', // Blue
    'EUR': darkMode ? '#FFF59D' : '#eab308', // Yellow
    'JPY': darkMode ? '#74F174' : '#22c55e'  // Green
  };

  const colors = {
    background: darkMode ? '#0D1015' : '#ffffff', // Background
    text: darkMode ? '#D1D4DC' : '#374151',       // Text
    grid: darkMode ? '#2A2E39' : '#e5e7eb'        // Grid lines
  };

  // Custom tooltip for currency charts with proper formatting
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded shadow ${darkMode ? 'bg-[#141418] border-[#2A2E39]' : 'bg-white border-gray-200'}`}>
          <p className="text-sm font-medium mb-2">Year {label}</p>
          {payload.map((entry, index) => {
            const currencyCode = entry.dataKey.split('_')[1];
            const dataType = entry.dataKey.split('_')[0];

            if (dataType === 'payment') {
              return (
                <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
                  Payment in {currencyCode}: {formatCurrency(entry.value, currencyCode)}
                </p>
              );
            } else if (dataType === 'rate') {
              return (
                <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
                  Rate {currencyParams.baseCurrency}/{currencyCode}: {entry.value.toFixed(4)}
                </p>
              );
            }

            return null;
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
        Currency Analysis
      </h1>

      {/* Input Form */}
      <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          Loan Parameters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <InputField
            label="Loan Amount"
            value={currencyParams.loanAmount}
            onChange={(value) => handleInputChange('loanAmount', value)}
            prefix={getCurrencySymbol()}
            darkMode={darkMode}
          />

          <InputField
            label="Interest Rate (%)"
            value={currencyParams.interestRate}
            onChange={(value) => handleInputChange('interestRate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="30"
          />

          <InputField
            label="Loan Term (years)"
            value={currencyParams.loanTermYears}
            onChange={(value) => handleInputChange('loanTermYears', value)}
            suffix="years"
            darkMode={darkMode}
            step="1"
            min="1"
            max="30"
            type="number"
          />
        </div>

        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          Currency Settings
        </h2>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
            Base Currency
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableCurrencies.map(curr => (
              <button
                key={curr}
                className={`p-2 rounded flex items-center justify-center ${
                  curr === currencyParams.baseCurrency 
                    ? (darkMode ? 'bg-[#BF9FFB] text-[#0D1015]' : 'bg-purple-600 text-white') 
                    : (darkMode ? 'bg-[#0D1015] border border-[#2A2E39] text-white' : 'bg-white border border-gray-300 text-gray-700')
                }`}
                onClick={() => {
                  setCurrency(curr);
                  // Currency context will trigger an update to currencyParams
                }}
              >
                <span className="text-lg mr-2">{currency_symbols[curr]}</span>
                <span>{curr}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
            Currencies to Compare (select to toggle)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableCurrencies.map(curr => (
              <button
                key={`select-${curr}`}
                className={`p-2 rounded flex items-center justify-center ${
                  selectedCurrencies.includes(curr) 
                    ? (darkMode ? 'bg-[#BF9FFB] text-[#0D1015]' : 'bg-purple-600 text-white') 
                    : (darkMode ? 'bg-[#0D1015] border border-[#2A2E39] text-white' : 'bg-white border border-gray-300 text-gray-700')
                }`}
                onClick={() => handleCurrencySelection(curr)}
              >
                <span className="text-lg mr-2">{currency_symbols[curr]}</span>
                <span>{curr}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className={`text-md font-medium mb-3 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
            Exchange Rate Projection (Annual % Change)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={`p-2 text-left ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                    From / To
                  </th>
                  {availableCurrencies.map(curr => (
                    <th key={curr} className={`p-2 text-center ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      {curr}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {availableCurrencies.map(fromCurr => (
                  <tr key={fromCurr} className={`${darkMode ? 'hover:bg-[#0D1015]' : 'hover:bg-gray-50'}`}>
                    <td className={`p-2 text-left font-medium ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                      {fromCurr}
                    </td>
                    {availableCurrencies.map(toCurr => (
                      <td key={`${fromCurr}-${toCurr}`} className={`p-2 text-center ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                        {fromCurr === toCurr ? (
                          <span className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-400'}>—</span>
                        ) : (
                          <input
                            type="number"
                            value={customExchangeRates[fromCurr][toCurr]}
                            onChange={(e) => handleExchangeRateChange(
                              fromCurr,
                              toCurr,
                              parseFloat(e.target.value)
                            )}
                            className={`w-20 p-1 text-center rounded ${
                              darkMode 
                                ? 'bg-[#0D1015] border border-[#2A2E39] text-white' 
                                : 'bg-white border border-gray-300 text-gray-800'
                            }`}
                            step="0.1"
                            min="-20"
                            max="20"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={`mt-2 text-xs ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
            <p>
              Positive value: Currency in row strengthens against currency in column.
              Negative value: Currency in row weakens against currency in column.
            </p>
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
      {!isLoading && !error && analysisResults.currencyAnalysis && analysisResults.currencyAnalysis.length > 0 && (
        <>
          <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
                Currency Analysis Results
              </h2>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded text-sm ${
                    chartType === 'payments'
                      ? (darkMode ? 'bg-[#BF9FFB] text-[#0D1015]' : 'bg-purple-600 text-white')
                      : (darkMode ? 'bg-[#0D1015] border border-[#2A2E39] text-white' : 'bg-white border border-gray-300 text-gray-700')
                  }`}
                  onClick={() => setChartType('payments')}
                >
                  Payment Comparison
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm ${
                    chartType === 'rates'
                      ? (darkMode ? 'bg-[#BF9FFB] text-[#0D1015]' : 'bg-purple-600 text-white')
                      : (darkMode ? 'bg-[#0D1015] border border-[#2A2E39] text-white' : 'bg-white border border-gray-300 text-gray-700')
                  }`}
                  onClick={() => setChartType('rates')}
                >
                  Exchange Rates
                </button>
              </div>
            </div>

            {/* Summary of total interest */}
            {chartType === 'payments' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {selectedCurrencies.map(curr => (
                  <div key={`interest-${curr}`} className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                      Total Interest in {curr}
                    </div>
                    <div className={`text-xl font-semibold`} style={{ color: currencyColors[curr] }}>
                      {formatCurrency(analysisResults.totalInterest?.[curr] || 0, curr)}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                      Percentage of loan: {(
                        (analysisResults.totalInterest?.[curr] || 0) /
                        (curr === currencyParams.baseCurrency
                          ? currencyParams.loanAmount
                          : (currencyParams.loanAmount * analysisResults.currencyAnalysis[0][`rate_${curr}`] || 0)
                        ) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Improved Charts with proper spacing and formatting */}
            <div className="h-64 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'payments' ? (
                  <LineChart data={chartData} margin={chartConfig.margin}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: colors.text }}
                      stroke={colors.grid}
                    />
                    <YAxis
                      tick={{ fill: colors.text }}
                      stroke={colors.grid}
                      tickFormatter={chartConfig.formatLargeNumber}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => {
                        const parts = value.split('_');
                        if (parts.length === 2) {
                          return <span style={{ color: colors.text }}>{`Payment in ${parts[1]}`}</span>;
                        }
                        return <span style={{ color: colors.text }}>{value}</span>;
                      }}
                      wrapperStyle={{ paddingTop: 10 }}
                    />
                    {selectedCurrencies.map(curr => (
                      <Line
                        key={`payment-line-${curr}`}
                        type="monotone"
                        dataKey={`payment_${curr}`}
                        name={`payment_${curr}`}
                        stroke={currencyColors[curr]}
                        strokeWidth={2}
                        dot={{
                          fill: currencyColors[curr],
                          r: 4
                        }}
                        activeDot={{
                          fill: currencyColors[curr],
                          r: 6,
                          stroke: colors.background
                        }}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <LineChart data={chartData} margin={chartConfig.margin}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: colors.text }}
                      stroke={colors.grid}
                    />
                    <YAxis
                      tick={{ fill: colors.text }}
                      stroke={colors.grid}
                      tickFormatter={(value) => value.toFixed(2)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => {
                        const parts = value.split('_');
                        if (parts.length === 2) {
                          return <span style={{ color: colors.text }}>{`Rate ${currencyParams.baseCurrency}/${parts[1]}`}</span>;
                        }
                        return <span style={{ color: colors.text }}>{value}</span>;
                      }}
                      wrapperStyle={{ paddingTop: 10 }}
                    />
                    {selectedCurrencies
                      .filter(curr => curr !== currencyParams.baseCurrency)
                      .map(curr => (
                        <Line
                          key={`rate-line-${curr}`}
                          type="monotone"
                          dataKey={`rate_${curr}`}
                          name={`rate_${curr}`}
                          stroke={currencyColors[curr]}
                          strokeWidth={2}
                          dot={{
                            fill: currencyColors[curr],
                            r: 4
                          }}
                          activeDot={{
                            fill: currencyColors[curr],
                            r: 6,
                            stroke: colors.background
                          }}
                        />
                      ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Annual Data Table with improved number formatting */}
          <div className={`p-4 rounded shadow ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
              {chartType === 'payments' ? 'Annual Payment Data' : 'Annual Exchange Rate Data'}
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className={`p-2 text-left ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Year
                    </th>
                    {chartType === 'payments' ? (
                      // Payment columns
                      selectedCurrencies.map(curr => (
                        <th
                          key={`header-payment-${curr}`}
                          className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}
                          style={{ color: currencyColors[curr] }}
                        >
                          Payment in {curr}
                        </th>
                      ))
                    ) : (
                      // Exchange rate columns
                      selectedCurrencies
                        .filter(curr => curr !== currencyParams.baseCurrency)
                        .map(curr => (
                          <th
                            key={`header-rate-${curr}`}
                            className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}
                            style={{ color: currencyColors[curr] }}
                          >
                            {currencyParams.baseCurrency}/{curr} Rate
                          </th>
                        ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item) => (
                    <tr key={item.year} className={`${darkMode ? 'hover:bg-[#0D1015]' : 'hover:bg-gray-50'}`}>
                      <td className={`p-2 text-left ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                        {item.year}
                      </td>
                      {chartType === 'payments' ? (
                        // Payment values with proper currency formatting
                        selectedCurrencies.map(curr => (
                          <td
                            key={`data-payment-${curr}-${item.year}`}
                            className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}
                          >
                            {formatCurrency(item[`payment_${curr}`] || 0, curr)}
                          </td>
                        ))
                      ) : (
                        // Exchange rate values
                        selectedCurrencies
                          .filter(curr => curr !== currencyParams.baseCurrency)
                          .map(curr => (
                            <td
                              key={`data-rate-${curr}-${item.year}`}
                              className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}
                            >
                              {item[`rate_${curr}`]?.toFixed(4) || '—'}
                            </td>
                          ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Define currency symbols
const currency_symbols = {
  'RUB': '₽',
  'USD': '$',
  'EUR': '€',
  'JPY': '¥',
};

export default CurrencyAnalysis;