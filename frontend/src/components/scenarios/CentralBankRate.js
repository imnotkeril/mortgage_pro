import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { calculateCentralBankRateImpact } from '../../api';
import InputField from '../common/InputField';
import Loader from '../common/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CentralBankRate = () => {
  const { darkMode } = useContext(AppContext);
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  
  // State for central bank rate parameters
  const [cbParams, setCbParams] = useState({
    loanAmount: 10000000,
    baseInterestRate: 7.5,
    loanTermYears: 20,
    centralBankRate: 6.0,
    margin: 2.5,
    predictedCbRates: [
      { month: 12, rate: 5.5 },
      { month: 24, rate: 5.0 },
      { month: 48, rate: 5.5 }
    ]
  });
  
  // State for new rate prediction
  const [newPrediction, setNewPrediction] = useState({
    month: 12,
    rate: 5.5
  });
  
  // State for central bank rate results
  const [cbResults, setCbResults] = useState({
    cbSchedule: [],
    fixedSchedule: [],
    totalPaymentsCb: 0,
    totalPaymentsFixed: 0,
    totalInterestCb: 0,
    totalInterestFixed: 0,
    paymentDifference: 0,
    interestDifference: 0
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for chart type (payments or rates)
  const [chartType, setChartType] = useState('payments'); // 'payments' or 'rates'
  
  // Calculate central bank rate impact when parameters change
  useEffect(() => {
    const getCbRateImpact = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure predictions are sorted by month
        const sortedPredictions = [...cbParams.predictedCbRates].sort((a, b) => a.month - b.month);
        
        // Calculate impact
        const result = await calculateCentralBankRateImpact({
          ...cbParams,
          predictedCbRates: sortedPredictions
        });
        
        setCbResults(result);
      } catch (err) {
        console.error('Error calculating central bank rate impact:', err);
        setError('Failed to calculate central bank rate impact. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    getCbRateImpact();
  }, [cbParams]);
  
  // Handle input changes
  const handleInputChange = (name, value) => {
    setCbParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle new prediction input changes
  const handlePredictionChange = (name, value) => {
    setNewPrediction(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new rate prediction
  const handleAddPrediction = () => {
    // Check if already exists and replace
    const existingIndex = cbParams.predictedCbRates.findIndex(p => p.month === newPrediction.month);
    
    if (existingIndex >= 0) {
      // Replace existing prediction for this month
      const updatedPredictions = [...cbParams.predictedCbRates];
      updatedPredictions[existingIndex] = { ...newPrediction };
      
      setCbParams(prev => ({
        ...prev,
        predictedCbRates: updatedPredictions
      }));
    } else {
      // Add new prediction
      setCbParams(prev => ({
        ...prev,
        predictedCbRates: [...prev.predictedCbRates, { ...newPrediction }]
      }));
    }
    
    // Increment month by 12 for convenience
    setNewPrediction(prev => ({
      ...prev,
      month: prev.month + 12
    }));
  };
  
  // Remove rate prediction
  const handleRemovePrediction = (month) => {
    setCbParams(prev => ({
      ...prev,
      predictedCbRates: prev.predictedCbRates.filter(p => p.month !== month)
    }));
  };
  
  // Reset to default predictions
  const handleResetPredictions = () => {
    setCbParams(prev => ({
      ...prev,
      predictedCbRates: [
        { month: 12, rate: 5.5 },
        { month: 24, rate: 5.0 },
        { month: 48, rate: 5.5 }
      ]
    }));
  };
  
  // Prepare chart data - sample every 12 months for clarity
  const chartData = (cbResults.cbSchedule && cbResults.fixedSchedule)
    ? (() => {
        // Find max length of schedules
        const maxLength = Math.max(
          cbResults.cbSchedule.length,
          cbResults.fixedSchedule.length
        );
        
        return Array.from({ length: maxLength }, (_, i) => {
          const month = i + 1;
          const cbData = cbResults.cbSchedule.find(item => item.month === month);
          const fixedData = cbResults.fixedSchedule.find(item => item.month === month);
          
          // Skip months not divisible by 12 (except last month)
          if (month % 12 !== 0 && month !== maxLength) return null;
          
          return {
            month,
            year: Math.ceil(month / 12),
            cbPayment: cbData ? cbData.payment : null,
            fixedPayment: fixedData ? fixedData.payment : null,
            cbRate: cbData ? cbData.cbRate : null,
            interestRate: cbData ? cbData.interestRate : null,
            // Check if this month is a rate change point
            isRateChange: cbParams.predictedCbRates.some(p => p.month === month)
          };
        }).filter(Boolean); // Remove null values
      })()
    : [];
  
  // Color scheme
  const colors = darkMode ? {
    fixed: '#90BFF9',      // Blue
    cb: '#BF9FFB',         // Purple
    cbRate: '#FFF59D',     // Yellow
    interestRate: '#FAA1A4', // Red
    background: '#0D1015', // Dark background
    text: '#D1D4DC',       // Light text
    grid: '#2A2E39'        // Grid lines
  } : {
    fixed: '#3b82f6',      // Blue
    cb: '#9333ea',         // Purple
    cbRate: '#eab308',     // Yellow
    interestRate: '#ef4444', // Red
    background: '#ffffff', // White background
    text: '#374151',       // Dark text
    grid: '#e5e7eb'        // Grid lines
  };
  
  // Custom tooltip for payments chart
  const PaymentsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 border rounded shadow ${darkMode ? 'bg-[#141418] border-[#2A2E39]' : 'bg-white border-gray-200'}`}>
          <p className="text-sm font-medium">Year {label}</p>
          {payload.map((entry, index) => {
            if (entry.dataKey === 'fixedPayment') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Fixed Rate Payment: {formatCurrency(entry.value)}
                </p>
              );
            } else if (entry.dataKey === 'cbPayment') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Floating Rate Payment: {formatCurrency(entry.value)}
                </p>
              );
            }
            return null;
          })}
          
          {payload.length >= 2 && payload[0].value && payload[1].value && (
            <p className="text-sm font-medium mt-1" style={{ 
              color: payload[0].value > payload[1].value ? colors.interestRate : colors.cbRate 
            }}>
              Difference: {formatCurrency(Math.abs(payload[0].value - payload[1].value))}
              {payload[0].value > payload[1].value ? ' more' : ' less'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for rates chart
  const RatesTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 border rounded shadow ${darkMode ? 'bg-[#141418] border-[#2A2E39]' : 'bg-white border-gray-200'}`}>
          <p className="text-sm font-medium">Year {label}</p>
          {payload.map((entry, index) => {
            if (entry.dataKey === 'cbRate') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Central Bank Rate: {entry.value.toFixed(2)}%
                </p>
              );
            } else if (entry.dataKey === 'interestRate') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Loan Interest Rate: {entry.value.toFixed(2)}%
                </p>
              );
            }
            return null;
          })}
          
          {payload.length >= 2 && (
            <p className="text-sm font-medium mt-1" style={{ color: colors.text }}>
              Margin: {(payload[1].value - payload[0].value).toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      {/* Input Form */}
      <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          Loan Parameters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <InputField
            label="Loan Amount"
            value={cbParams.loanAmount}
            onChange={(value) => handleInputChange('loanAmount', value)}
            prefix={getCurrencySymbol()}
            darkMode={darkMode}
          />
          
          <InputField
            label="Initial Interest Rate (%)"
            value={cbParams.baseInterestRate}
            onChange={(value) => handleInputChange('baseInterestRate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="30"
          />
          
          <InputField
            label="Loan Term (years)"
            value={cbParams.loanTermYears}
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
          Floating Rate Parameters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InputField
            label="Current Central Bank Rate (%)"
            value={cbParams.centralBankRate}
            onChange={(value) => handleInputChange('centralBankRate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="20"
          />
          
          <InputField
            label="Bank Margin (percentage points)"
            value={cbParams.margin}
            onChange={(value) => handleInputChange('margin', value)}
            suffix="points"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="10"
          />
        </div>
        
        <h3 className={`text-md font-medium mb-3 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
          Central Bank Rate Forecast
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <InputField
            label="Month of Change"
            value={newPrediction.month}
            onChange={(value) => handlePredictionChange('month', value)}
            suffix="month"
            darkMode={darkMode}
            step="1"
            min="1"
            max={cbParams.loanTermYears * 12}
            type="number"
          />
          
          <InputField
            label="New Central Bank Rate (%)"
            value={newPrediction.rate}
            onChange={(value) => handlePredictionChange('rate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="20"
          />
          
          <div className="flex items-end">
            <button
              onClick={handleAddPrediction}
              className={`w-full p-2 rounded ${
                darkMode 
                  ? 'bg-[#BF9FFB] text-[#0D1015] hover:bg-purple-400' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Add Rate Change
            </button>
          </div>
        </div>
        
        {/* Display projected rate changes */}
        {cbParams.predictedCbRates.length > 0 && (
          <div className="mb-4">
            <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Projected Central Bank Rate Changes
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className={`p-2 text-left ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Month
                    </th>
                    <th className={`p-2 text-center ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Period
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Central Bank Rate (%)
                    </th>
                    <th className={`p-2 text-center ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cbParams.predictedCbRates
                    .sort((a, b) => a.month - b.month)
                    .map((prediction, index) => {
                      const years = Math.floor(prediction.month / 12);
                      const months = prediction.month % 12;
                      const timeLabel = `${years > 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : ''} ${years > 0 && months > 0 ? 'and ' : ''} ${months > 0 ? `${months} ${months === 1 ? 'month' : 'months'}` : ''}`.trim();
                      
                      return (
                        <tr key={prediction.month} className={`${darkMode ? 'hover:bg-[#0D1015]' : 'hover:bg-gray-50'}`}>
                          <td className={`p-2 text-left ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                            {prediction.month}
                          </td>
                          <td className={`p-2 text-center ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                            {timeLabel}
                          </td>
                          <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                            {prediction.rate.toFixed(1)}%
                          </td>
                          <td className={`p-2 text-center ${darkMode ? 'border-b border-[#2A2E39]' : 'border-b border-gray-200'}`}>
                            {/* Allow removing predictions except the first one which is the current rate */}
                            {index > 0 && (
                              <button
                                onClick={() => handleRemovePrediction(prediction.month)}
                                className={`px-3 py-1 rounded text-sm ${
                                  darkMode 
                                    ? 'bg-red-600 text-white hover:bg-red-700' 
                                    : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleResetPredictions}
                className={`px-4 py-2 rounded text-sm ${
                  darkMode 
                    ? 'bg-[#0D1015] border border-[#2A2E39] text-white hover:border-red-600' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-red-500'
                }`}
              >
                Reset to Default Forecast
              </button>
            </div>
          </div>
        )}
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
      {!isLoading && !error && cbResults.cbSchedule && cbResults.cbSchedule.length > 0 && (
        <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
              Central Bank Rate Impact Results
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
                Interest Rates
              </button>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Difference in Total Payments
              </div>
              <div className={`text-xl font-semibold ${
                cbResults.paymentDifference < 0
                  ? (darkMode ? 'text-[#74F174]' : 'text-green-500')
                  : (darkMode ? 'text-[#FAA1A4]' : 'text-red-500')
              }`}>
                {cbResults.paymentDifference < 0 ? '-' : '+'}
                {formatCurrency(Math.abs(cbResults.paymentDifference))}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {((cbResults.totalPaymentsCb / cbResults.totalPaymentsFixed - 1) * 100).toFixed(1)}% 
                {cbResults.paymentDifference < 0 ? ' less' : ' more'} with floating rate
              </div>
            </div>
            
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Difference in Total Interest
              </div>
              <div className={`text-xl font-semibold ${
                cbResults.interestDifference < 0
                  ? (darkMode ? 'text-[#74F174]' : 'text-green-500')
                  : (darkMode ? 'text-[#FAA1A4]' : 'text-red-500')
              }`}>
                {cbResults.interestDifference < 0 ? '-' : '+'}
                {formatCurrency(Math.abs(cbResults.interestDifference))}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {((cbResults.totalInterestCb / cbResults.totalInterestFixed - 1) * 100).toFixed(1)}% 
                {cbResults.interestDifference < 0 ? ' less' : ' more'} with floating rate
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div>
            <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              {chartType === 'payments' ? 'Payment Comparison' : 'Interest Rate Projection'}
            </h3>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'payments' ? (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
                    <Tooltip content={<PaymentsTooltip />} />
                    <Legend
                      formatter={(value) => {
                        switch (value) {
                          case 'fixedPayment':
                            return <span style={{ color: colors.text }}>Fixed Rate Payment</span>;
                          case 'cbPayment':
                            return <span style={{ color: colors.text }}>Floating Rate Payment</span>;
                          default:
                            return <span style={{ color: colors.text }}>{value}</span>;
                        }
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fixedPayment"
                      stroke={colors.fixed}
                      strokeWidth={2}
                      dot={{
                        fill: colors.fixed,
                        r: 4
                      }}
                      activeDot={{
                        fill: colors.fixed,
                        r: 6,
                        stroke: colors.background
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cbPayment"
                      stroke={colors.cb}
                      strokeWidth={2}
                      dot={{
                        fill: colors.cb,
                        r: 4
                      }}
                      activeDot={{
                        fill: colors.cb,
                        r: 6,
                        stroke: colors.background
                      }}
                    />
                  </LineChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: colors.text }}
                      stroke={colors.grid}
                    />
                    <YAxis
                      tick={{ fill: colors.text }}
                      stroke={colors.grid}
                    />
                    <Tooltip content={<RatesTooltip />} />
                    <Legend
                      formatter={(value) => {
                        switch (value) {
                          case 'cbRate':
                            return <span style={{ color: colors.text }}>Central Bank Rate</span>;
                          case 'interestRate':
                            return <span style={{ color: colors.text }}>Loan Interest Rate</span>;
                          default:
                            return <span style={{ color: colors.text }}>{value}</span>;
                        }
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cbRate"
                      stroke={colors.cbRate}
                      strokeWidth={2}
                      dot={{
                        fill: colors.cbRate,
                        r: 4
                      }}
                      activeDot={{
                        fill: colors.cbRate,
                        r: 6,
                        stroke: colors.background
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interestRate"
                      stroke={colors.interestRate}
                      strokeWidth={2}
                      dot={{
                        fill: colors.interestRate,
                        r: 4
                      }}
                      activeDot={{
                        fill: colors.interestRate,
                        r: 6,
                        stroke: colors.background
                      }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={`mt-4 p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
            <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Understanding Floating Rate Mortgages
            </h3>
            <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
              <p>
                <span className="font-medium">Fixed Rate Mortgage:</span> The interest rate remains constant throughout the loan term, providing predictable monthly payments.
              </p>
              <p className="mt-2">
                <span className="font-medium">Floating Rate Mortgage:</span> The interest rate varies based on changes in a reference rate (typically the central bank rate) plus a margin. This means your monthly payments can change over time.
              </p>
              <p className="mt-2">
                <span className="font-medium">Rate Adjustment:</span> Floating rates typically adjust periodically (e.g., monthly, quarterly, or annually) based on changes in the reference rate.
              </p>
              <p className="mt-2">
                <span className="font-medium">Risk vs. Reward:</span> Floating rate mortgages often start with lower interest rates than fixed-rate mortgages, but carry the risk of higher payments if interest rates rise. They can be advantageous in a falling interest rate environment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralBankRate;