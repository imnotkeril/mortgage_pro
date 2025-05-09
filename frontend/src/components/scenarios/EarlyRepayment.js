import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { calculateEarlyRepayment } from '../../api';
import InputField from '../common/InputField';
import Loader from '../common/Loader';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EarlyRepayment = () => {
  const { darkMode } = useContext(AppContext);
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  
  // State for early repayment parameters
  const [earlyParams, setEarlyParams] = useState({
    loanAmount: 10000000,
    interestRate: 7.5,
    loanTermYears: 20,
    earlyPayments: []
  });
  
  // State for early repayment results
  const [earlyResults, setEarlyResults] = useState({
    earlySchedule: [],
    regularSchedule: [],
    totalPaymentsEarly: 0,
    totalPaymentsRegular: 0,
    totalInterestEarly: 0,
    totalInterestRegular: 0,
    monthsSaved: 0
  });
  
  // State for new early payment
  const [newPayment, setNewPayment] = useState({
    month: 12,
    amount: 500000,
    type: 'reduce_term'
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculate early repayment when parameters change
  useEffect(() => {
    const getEarlyRepayment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await calculateEarlyRepayment(earlyParams);
        setEarlyResults(result);
      } catch (err) {
        console.error('Error calculating early repayment:', err);
        setError('Failed to calculate early repayment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    getEarlyRepayment();
  }, [earlyParams]);
  
  // Handle input changes
  const handleInputChange = (name, value) => {
    setEarlyParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle new payment input changes
  const handleNewPaymentChange = (name, value) => {
    setNewPayment(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new early payment
  const handleAddPayment = () => {
    setEarlyParams(prev => ({
      ...prev,
      earlyPayments: [...prev.earlyPayments, { ...newPayment }]
    }));
    
    // Reset amount but keep month and type
    setNewPayment(prev => ({
      ...prev,
      month: prev.month + 12, // Increment month by 1 year for convenience
      amount: 500000 // Reset to default amount
    }));
  };
  
  // Remove early payment
  const handleRemovePayment = (index) => {
    setEarlyParams(prev => ({
      ...prev,
      earlyPayments: prev.earlyPayments.filter((_, i) => i !== index)
    }));
  };
  
  // Clear all early payments
  const handleClearPayments = () => {
    setEarlyParams(prev => ({
      ...prev,
      earlyPayments: []
    }));
  };
  
  // Prepare chart data - sample every 12 months for clarity
  const chartData = (earlyResults.earlySchedule.length > 0 && earlyResults.regularSchedule.length > 0)
    ? Array.from({ length: Math.max(earlyResults.earlySchedule.length, earlyResults.regularSchedule.length) }, (_, i) => {
        const month = i + 1;
        const earlyData = earlyResults.earlySchedule.find(item => item.month === month);
        const regularData = earlyResults.regularSchedule.find(item => item.month === month);
        
        return {
          month,
          year: Math.ceil(month / 12),
          earlyRemaining: earlyData ? earlyData.remainingLoan : 0,
          regularRemaining: regularData ? regularData.remainingLoan : 0,
          earlyPayment: earlyData ? earlyData.earlyPayment : 0,
          isEarlyPaymentMonth: earlyParams.earlyPayments.some(p => p.month === month)
        };
      }).filter((item, index) => index % 12 === 0 || index === earlyResults.regularSchedule.length - 1 || item.isEarlyPaymentMonth)
    : [];
  
  // Color scheme
  const colors = darkMode ? {
    regular: '#90BFF9',    // Blue
    early: '#BF9FFB',      // Purple
    payment: '#74F174',    // Green
    background: '#0D1015', // Dark background
    text: '#D1D4DC',       // Light text
    grid: '#2A2E39'        // Grid lines
  } : {
    regular: '#3b82f6',    // Blue
    early: '#9333ea',      // Purple
    payment: '#22c55e',    // Green
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
          {payload.map((entry, index) => {
            if (entry.dataKey === 'earlyRemaining') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Early Repayment Balance: {formatCurrency(entry.value)}
                </p>
              );
            } else if (entry.dataKey === 'regularRemaining') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Standard Balance: {formatCurrency(entry.value)}
                </p>
              );
            } else if (entry.dataKey === 'earlyPayment' && entry.value > 0) {
              return (
                <p key={index} className="text-sm" style={{ color: colors.payment }}>
                  Early Payment: {formatCurrency(entry.value)}
                </p>
              );
            }
            return null;
          })}
          
          if (payload[0]?.payload?.earlyRemaining && payload[0]?.payload?.regularRemaining) {
            const diff = payload[0].payload.regularRemaining - payload[0].payload.earlyRemaining;
            if (diff > 0) {
              return (
                <>
                  {[...payload].map((entry, index) => {
                    if (entry.dataKey === 'earlyRemaining') {
                      return (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          Early Repayment Balance: {formatCurrency(entry.value)}
                        </p>
                      );
                    } else if (entry.dataKey === 'regularRemaining') {
                      return (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                          Standard Balance: {formatCurrency(entry.value)}
                        </p>
                      );
                    } else if (entry.dataKey === 'earlyPayment' && entry.value > 0) {
                      return (
                        <p key={index} className="text-sm" style={{ color: colors.payment }}>
                          Early Payment: {formatCurrency(entry.value)}
                        </p>
                      );
                    }
                    return null;
                  })}
                  <p className="text-sm font-medium mt-1" style={{ color: colors.payment }}>
                    Savings: {formatCurrency(diff)}
                  </p>
                </>
              );
            }
          }
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
            value={earlyParams.loanAmount}
            onChange={(value) => handleInputChange('loanAmount', value)}
            prefix={getCurrencySymbol()}
            darkMode={darkMode}
          />
          
          <InputField
            label="Interest Rate (%)"
            value={earlyParams.interestRate}
            onChange={(value) => handleInputChange('interestRate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="30"
          />
          
          <InputField
            label="Loan Term (years)"
            value={earlyParams.loanTermYears}
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
          Early Payments
        </h2>
        
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <InputField
              label="Payment Month"
              value={newPayment.month}
              onChange={(value) => handleNewPaymentChange('month', value)}
              darkMode={darkMode}
              step="1"
              min="1"
              max={earlyParams.loanTermYears * 12}
              type="number"
            />
            
            <InputField
              label="Payment Amount"
              value={newPayment.amount}
              onChange={(value) => handleNewPaymentChange('amount', value)}
              prefix={getCurrencySymbol()}
              darkMode={darkMode}
            />
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                Payment Type
              </label>
              <select
                value={newPayment.type}
                onChange={(e) => handleNewPaymentChange('type', e.target.value)}
                className={`w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                  darkMode 
                    ? 'bg-[#0D1015] border border-[#2A2E39] text-white' 
                    : 'bg-white border border-gray-300 text-gray-800'
                }`}
              >
                <option value="reduce_term">Reduce Term</option>
                <option value="reduce_payment">Reduce Payment</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleAddPayment}
                className={`w-full p-2 rounded ${
                  darkMode 
                    ? 'bg-[#BF9FFB] text-[#0D1015] hover:bg-purple-400' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Add Payment
              </button>
            </div>
          </div>
          
          {/* Display scheduled early payments */}
          {earlyParams.earlyPayments.length > 0 && (
            <div className="mb-4">
              <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                Scheduled Early Payments
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className={`p-2 text-left ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                        Month
                      </th>
                      <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                        Amount
                      </th>
                      <th className={`p-2 text-center ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                        Type
                      </th>
                      <th className={`p-2 text-center ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {earlyParams.earlyPayments
                      .sort((a, b) => a.month - b.month)
                      .map((payment, index) => (
                        <tr key={index} className={`${darkMode ? 'hover:bg-[#0D1015]' : 'hover:bg-gray-50'}`}>
                          <td className={`p-2 text-left ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                            {payment.month} (Year {Math.ceil(payment.month / 12)})
                          </td>
                          <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className={`p-2 text-center ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                            {payment.type === 'reduce_term' ? 'Reduce Term' : 'Reduce Payment'}
                          </td>
                          <td className={`p-2 text-center ${darkMode ? 'border-b border-[#2A2E39]' : 'border-b border-gray-200'}`}>
                            <button
                              onClick={() => handleRemovePayment(index)}
                              className={`px-3 py-1 rounded text-sm ${
                                darkMode 
                                  ? 'bg-red-600 text-white hover:bg-red-700' 
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleClearPayments}
                  className={`px-4 py-2 rounded text-sm ${
                    darkMode 
                      ? 'bg-[#0D1015] border border-[#2A2E39] text-white hover:border-red-600' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-red-500'
                  }`}
                >
                  Clear All Payments
                </button>
              </div>
            </div>
          )}
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
      {!isLoading && !error && earlyResults.earlySchedule && earlyResults.earlySchedule.length > 0 && (
        <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
            Early Repayment Results
          </h2>
          
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Payment Savings
              </div>
              <div className={`text-xl font-semibold ${darkMode ? 'text-[#74F174]' : 'text-green-500'}`}>
                {formatCurrency(earlyResults.totalPaymentsRegular - earlyResults.totalPaymentsEarly)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {((earlyResults.totalPaymentsRegular - earlyResults.totalPaymentsEarly) / earlyResults.totalPaymentsRegular * 100).toFixed(1)}% reduction
              </div>
            </div>
            
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Interest Savings
              </div>
              <div className={`text-xl font-semibold ${darkMode ? 'text-[#74F174]' : 'text-green-500'}`}>
                {formatCurrency(earlyResults.totalInterestRegular - earlyResults.totalInterestEarly)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {((earlyResults.totalInterestRegular - earlyResults.totalInterestEarly) / earlyResults.totalInterestRegular * 100).toFixed(1)}% reduction
              </div>
            </div>
            
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              {earlyResults.monthsSaved > 0 ? (
                <>
                  <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                    Term Reduction
                  </div>
                  <div className={`text-xl font-semibold ${darkMode ? 'text-[#74F174]' : 'text-green-500'}`}>
                    {Math.floor(earlyResults.monthsSaved / 12)} years {earlyResults.monthsSaved % 12} months
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                    {(earlyResults.monthsSaved / (earlyParams.loanTermYears * 12) * 100).toFixed(1)}% shorter term
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                    Payment Reduction
                  </div>
                  <div className={`text-xl font-semibold ${darkMode ? 'text-[#74F174]' : 'text-green-500'}`}>
                    {formatCurrency(
                      earlyResults.regularSchedule[0]?.payment - 
                      earlyResults.earlySchedule[earlyResults.earlySchedule.length - 1]?.monthlyPayment || 0
                    )}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                    {((earlyResults.regularSchedule[0]?.payment - 
                       earlyResults.earlySchedule[earlyResults.earlySchedule.length - 1]?.monthlyPayment) / 
                       earlyResults.regularSchedule[0]?.payment * 100 || 0).toFixed(1)}% lower monthly payment
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Chart */}
          <div>
            <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Principal Balance Comparison
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
                    formatter={(value) => {
                      switch (value) {
                        case 'regularRemaining':
                          return <span style={{ color: colors.text }}>Standard Schedule</span>;
                        case 'earlyRemaining':
                          return <span style={{ color: colors.text }}>With Early Payments</span>;
                        default:
                          return <span style={{ color: colors.text }}>{value}</span>;
                      }
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="regularRemaining" 
                    stroke={colors.regular}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ 
                      fill: colors.regular,
                      r: 4
                    }}
                    activeDot={{ 
                      fill: colors.regular,
                      r: 6,
                      stroke: colors.background
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earlyRemaining" 
                    stroke={colors.early}
                    strokeWidth={2}
                    dot={{ 
                      fill: colors.early,
                      r: 4
                    }}
                    activeDot={{ 
                      fill: colors.early,
                      r: 6,
                      stroke: colors.background
                    }}
                  />
                  {/* Add reference dots for early payments */}
                  {chartData
                    .filter(item => item.earlyPayment > 0)
                    .map((item, index) => (
                      <Bar
                        key={`payment-${index}`}
                        dataKey="earlyPayment"
                        fill={colors.payment}
                        fillOpacity={0.6}
                        isAnimationActive={false}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={`mt-4 p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                Understanding Early Repayment Options
              </h3>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                <p>
                  <span className="font-medium">Reduce Term:</span> Keeps your monthly payment the same but shortens the loan term. This typically saves more interest over the life of the loan.
                </p>
                <p className="mt-2">
                  <span className="font-medium">Reduce Payment:</span> Keeps the loan term the same but lowers your monthly payment. This provides immediate cash flow relief but typically saves less interest overall.
                </p>
                <p className="mt-2">
                  The green marks on the chart represent early payments. Notice how they accelerate the reduction of your loan balance compared to the standard schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};