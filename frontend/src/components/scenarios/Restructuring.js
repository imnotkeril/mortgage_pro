import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { calculateRestructuring } from '../../api';
import InputField from '../common/InputField';
import Loader from '../common/Loader';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Restructuring = () => {
  const { darkMode } = useContext(AppContext);
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  
  // State for restructuring parameters
  const [restructParams, setRestructParams] = useState({
    loanAmount: 10000000,
    originalInterestRate: 9.0,
    originalTermYears: 20,
    monthsPaid: 36,
    newInterestRate: 7.0,
    newTermYears: 15
  });
  
  // State for restructuring results
  const [restructResults, setRestructResults] = useState({
    originalSchedule: [],
    restructuredSchedule: [],
    comparison: [],
    originalRemainingPayments: 0,
    restructuredTotalPayments: 0,
    originalRemainingInterest: 0,
    restructuredTotalInterest: 0,
    originalMonthlyPayment: 0,
    restructuredMonthlyPayment: 0,
    originalRemainingTerm: 0,
    restructuredTerm: 0
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculate restructuring when parameters change
  useEffect(() => {
    const getRestructuring = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Validate inputs
        if (restructParams.monthsPaid >= restructParams.originalTermYears * 12) {
          setError('Months paid cannot exceed original loan term.');
          setIsLoading(false);
          return;
        }
        
        // Calculate restructuring
        const result = await calculateRestructuring(restructParams);
        setRestructResults(result);
      } catch (err) {
        console.error('Error calculating restructuring:', err);
        setError('Failed to calculate restructuring. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    getRestructuring();
  }, [restructParams]);
  
  // Handle input changes
  const handleInputChange = (name, value) => {
    setRestructParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Prepare chart data from comparison
  const chartData = restructResults.comparison
    ? restructResults.comparison
        .filter((_, index) => 
          index % 12 === 0 || 
          index === restructResults.comparison.length - 1 || 
          index === restructParams.monthsPaid - 1 || 
          index === restructParams.monthsPaid
        )
        .map(item => ({
          month: item.month,
          year: Math.ceil(item.month / 12),
          originalPayment: item.originalPayment,
          restructuredPayment: item.restructuredPayment,
          originalRemaining: item.originalRemaining,
          restructuredRemaining: item.restructuredRemaining,
          paymentDifference: item.paymentDifference,
          status: item.status
        }))
    : [];
  
  // Color scheme
  const colors = darkMode ? {
    original: '#90BFF9',   // Blue
    restructured: '#BF9FFB', // Purple
    paid: '#74F174',       // Green
    negative: '#FAA1A4',   // Red
    background: '#0D1015', // Dark background
    text: '#D1D4DC',       // Light text
    grid: '#2A2E39'        // Grid lines
  } : {
    original: '#3b82f6',   // Blue
    restructured: '#9333ea', // Purple
    paid: '#22c55e',       // Green
    negative: '#ef4444',   // Red
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
            if (entry.dataKey === 'originalPayment') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Original Payment: {formatCurrency(entry.value)}
                </p>
              );
            } else if (entry.dataKey === 'restructuredPayment') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Restructured Payment: {formatCurrency(entry.value)}
                </p>
              );
            }
            return null;
          })}
          
          {payload[0]?.payload?.paymentDifference !== 0 && (
            <p className="text-sm font-medium mt-1" style={{ 
              color: payload[0]?.payload?.paymentDifference > 0 ? colors.negative : colors.paid 
            }}>
              Difference: {formatCurrency(Math.abs(payload[0]?.payload?.paymentDifference))}
              {payload[0]?.payload?.paymentDifference > 0 ? ' more' : ' less'}
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
          Original Loan Parameters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <InputField
            label="Original Loan Amount"
            value={restructParams.loanAmount}
            onChange={(value) => handleInputChange('loanAmount', value)}
            prefix={getCurrencySymbol()}
            darkMode={darkMode}
          />
          
          <InputField
            label="Original Interest Rate (%)"
            value={restructParams.originalInterestRate}
            onChange={(value) => handleInputChange('originalInterestRate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="30"
          />
          
          <InputField
            label="Original Loan Term (years)"
            value={restructParams.originalTermYears}
            onChange={(value) => handleInputChange('originalTermYears', value)}
            suffix="years"
            darkMode={darkMode}
            step="1"
            min="1"
            max="30"
            type="number"
          />
        </div>
        
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          Restructuring Parameters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Months Already Paid"
            value={restructParams.monthsPaid}
            onChange={(value) => handleInputChange('monthsPaid', value)}
            suffix="months"
            darkMode={darkMode}
            step="1"
            min="1"
            max={restructParams.originalTermYears * 12 - 1}
            type="number"
          />
          
          <InputField
            label="New Interest Rate (%)"
            value={restructParams.newInterestRate}
            onChange={(value) => handleInputChange('newInterestRate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="30"
          />
          
          <InputField
            label="New Loan Term (years)"
            value={restructParams.newTermYears}
            onChange={(value) => handleInputChange('newTermYears', value)}
            suffix="years"
            darkMode={darkMode}
            step="1"
            min="1"
            max="30"
            type="number"
          />
        </div>
        
        <div className={`mt-4 p-3 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
          <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
            <p>
              <span className="font-medium">Time Elapsed:</span> {Math.floor(restructParams.monthsPaid / 12)} years {restructParams.monthsPaid % 12} months 
              ({((restructParams.monthsPaid / (restructParams.originalTermYears * 12)) * 100).toFixed(1)}% of original term)
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
      {!isLoading && !error && restructResults.comparison && restructResults.comparison.length > 0 && (
        <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
            Restructuring Results
          </h2>
          
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Change in Total Payment Amount
              </div>
              <div className={`text-xl font-semibold ${
                restructResults.restructuredTotalPayments < restructResults.originalRemainingPayments
                  ? (darkMode ? 'text-[#74F174]' : 'text-green-500')
                  : (darkMode ? 'text-[#FAA1A4]' : 'text-red-500')
              }`}>
                {restructResults.restructuredTotalPayments < restructResults.originalRemainingPayments ? '-' : '+'}
                {formatCurrency(Math.abs(restructResults.restructuredTotalPayments - restructResults.originalRemainingPayments))}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {((restructResults.restructuredTotalPayments / restructResults.originalRemainingPayments - 1) * 100).toFixed(1)}% 
                {restructResults.restructuredTotalPayments < restructResults.originalRemainingPayments ? ' less' : ' more'}
              </div>
            </div>
            
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Change in Total Interest
              </div>
              <div className={`text-xl font-semibold ${
                restructResults.restructuredTotalInterest < restructResults.originalRemainingInterest
                  ? (darkMode ? 'text-[#74F174]' : 'text-green-500')
                  : (darkMode ? 'text-[#FAA1A4]' : 'text-red-500')
              }`}>
                {restructResults.restructuredTotalInterest < restructResults.originalRemainingInterest ? '-' : '+'}
                {formatCurrency(Math.abs(restructResults.restructuredTotalInterest - restructResults.originalRemainingInterest))}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {((restructResults.restructuredTotalInterest / restructResults.originalRemainingInterest - 1) * 100).toFixed(1)}% 
                {restructResults.restructuredTotalInterest < restructResults.originalRemainingInterest ? ' less' : ' more'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Change in Monthly Payment
              </div>
              <div className={`text-xl font-semibold ${
                restructResults.restructuredMonthlyPayment < restructResults.originalMonthlyPayment
                  ? (darkMode ? 'text-[#74F174]' : 'text-green-500')
                  : (darkMode ? 'text-[#FAA1A4]' : 'text-red-500')
              }`}>
                {restructResults.restructuredMonthlyPayment < restructResults.originalMonthlyPayment ? '-' : '+'}
                {formatCurrency(Math.abs(restructResults.restructuredMonthlyPayment - restructResults.originalMonthlyPayment))}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {((restructResults.restructuredMonthlyPayment / restructResults.originalMonthlyPayment - 1) * 100).toFixed(1)}% 
                {restructResults.restructuredMonthlyPayment < restructResults.originalMonthlyPayment ? ' less' : ' more'}
              </div>
            </div>
            
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Term Change
              </div>
              {(() => {
                const originalMonthsRemaining = restructResults.originalRemainingTerm;
                const restructuredMonths = restructResults.restructuredTerm;
                const diffMonths = restructuredMonths - originalMonthsRemaining;
                
                const originalYears = Math.floor(originalMonthsRemaining / 12);
                const originalMonths = originalMonthsRemaining % 12;
                
                const restructuredYears = Math.floor(restructuredMonths / 12);
                const restructuredMonthsRem = restructuredMonths % 12;
                
                const diffYears = Math.floor(Math.abs(diffMonths) / 12);
                const diffMonthsRem = Math.abs(diffMonths) % 12;
                
                return (
                  <>
                    <div className={`text-xl font-semibold ${
                      diffMonths < 0
                        ? (darkMode ? 'text-[#74F174]' : 'text-green-500')
                        : (diffMonths > 0 ? (darkMode ? 'text-[#FAA1A4]' : 'text-red-500') : (darkMode ? 'text-white' : 'text-gray-800'))
                    }`}>
                      {diffMonths !== 0 ? (diffMonths < 0 ? '-' : '+') : ''}
                      {diffYears > 0 ? `${diffYears} ${diffYears === 1 ? 'year' : 'years'}` : ''}
                      {diffYears > 0 && diffMonthsRem > 0 ? ' ' : ''}
                      {diffMonthsRem > 0 ? `${diffMonthsRem} ${diffMonthsRem === 1 ? 'month' : 'months'}` : ''}
                      {diffMonths === 0 ? 'No change' : ''}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                      Original remaining: {originalYears > 0 ? `${originalYears} ${originalYears === 1 ? 'year' : 'years'}` : ''} 
                      {originalYears > 0 && originalMonths > 0 ? ' ' : ''}
                      {originalMonths > 0 ? `${originalMonths} ${originalMonths === 1 ? 'month' : 'months'}` : ''}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                      New term: {restructuredYears > 0 ? `${restructuredYears} ${restructuredYears === 1 ? 'year' : 'years'}` : ''} 
                      {restructuredYears > 0 && restructuredMonths > 0 ? ' ' : ''}
                      {restructuredMonths > 0 ? `${restructuredMonths} ${restructuredMonths === 1 ? 'month' : 'months'}` : ''}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          
          {/* Chart */}
          <div>
            <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Payment Comparison
            </h3>
            <div className="h-64 md:h-80">
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
                    formatter={(value) => {
                      switch (value) {
                        case 'originalPayment':
                          return <span style={{ color: colors.text }}>Original Payment</span>;
                        case 'restructuredPayment':
                          return <span style={{ color: colors.text }}>Restructured Payment</span>;
                        default:
                          return <span style={{ color: colors.text }}>{value}</span>;
                      }
                    }}
                  />
                  <Bar
                    dataKey="originalPayment"
                    fill={colors.original}
                    barSize={20}
                  />
                  <Bar
                    dataKey="restructuredPayment"
                    fill={colors.restructured}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={`mt-4 p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                  Understanding Restructuring
                </h3>
                <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                  <p>
                    Restructuring your mortgage can help you take advantage of lower interest rates or adjust your payment terms. This comparison shows you how your current remaining payments would compare with a restructured loan.
                  </p>
                  <p className="mt-2">
                    <span className="font-medium">Lower Interest Rate:</span> If the new rate is lower than your original rate, you can potentially save on total interest, even if you extend the term.
                  </p>
                  <p className="mt-2">
                    <span className="font-medium">Shorter Term:</span> Shortening your loan term typically increases monthly payments but reduces the total interest paid over the life of the loan.
                  </p>
                  <p className="mt-2">
                    <span className="font-medium">Longer Term:</span> Extending your loan term typically decreases monthly payments but increases the total interest paid over the life of the loan.
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>
            );
          };

          export default Restructuring;