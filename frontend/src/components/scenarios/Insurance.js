import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { calculateInsuranceImpact } from '../../api';
import InputField from '../common/InputField';
import Loader from '../common/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Insurance = () => {
  const { darkMode } = useContext(AppContext);
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  
  // State for insurance parameters
  const [insuranceParams, setInsuranceParams] = useState({
    loanAmount: 10000000,
    interestRate: 7.5,
    loanTermYears: 20,
    insuranceRate: 0.5,
    insuranceTermYears: 20 // Default to full loan term
  });
  
  // State for insurance results
  const [insuranceResults, setInsuranceResults] = useState({
    insuranceSchedule: [],
    totalInsurance: 0,
    totalPaymentsWithInsurance: 0,
    totalPaymentsRegular: 0,
    increaseTotalPayments: 0
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculate insurance impact when parameters change
  useEffect(() => {
    const getInsuranceImpact = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Validate insurance term
        if (insuranceParams.insuranceTermYears > insuranceParams.loanTermYears) {
          setInsuranceParams(prev => ({
            ...prev,
            insuranceTermYears: insuranceParams.loanTermYears
          }));
          return;
        }
        
        // Calculate insurance impact
        const result = await calculateInsuranceImpact(insuranceParams);
        setInsuranceResults(result);
      } catch (err) {
        console.error('Error calculating insurance impact:', err);
        setError('Failed to calculate insurance impact. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    getInsuranceImpact();
  }, [insuranceParams]);
  
  // Handle input changes
  const handleInputChange = (name, value) => {
    setInsuranceParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Prepare chart data - sample every 12 months for clarity
  const chartData = insuranceResults.insuranceSchedule
    ? insuranceResults.insuranceSchedule
        .filter((_, index) => index % 12 === 0 || index === (insuranceResults.insuranceSchedule.length - 1))
        .map(item => ({
          month: item.month,
          year: Math.ceil(item.month / 12),
          payment: item.payment,
          insurance: item.insurance,
          totalPayment: item.totalPayment,
          hasInsurance: item.insurance > 0
        }))
    : [];
  
  // Color scheme
  const colors = darkMode ? {
    payment: '#90BFF9',    // Blue
    insurance: '#FAA1A4',  // Red
    background: '#0D1015', // Dark background
    text: '#D1D4DC',       // Light text
    grid: '#2A2E39'        // Grid lines
  } : {
    payment: '#3b82f6',    // Blue
    insurance: '#ef4444',  // Red
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
            if (entry.dataKey === 'payment') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Mortgage Payment: {formatCurrency(entry.value)}
                </p>
              );
            } else if (entry.dataKey === 'insurance') {
              return (
                <p key={index} className="text-sm" style={{ color: entry.color }}>
                  Insurance: {formatCurrency(entry.value)}
                </p>
              );
            }
            return null;
          })}
          
          {payload.length > 0 && (
            <p className="text-sm font-medium mt-1" style={{ color: colors.text }}>
              Total Monthly Payment: {formatCurrency(payload[0]?.payload?.totalPayment || 0)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Calculate monthly insurance cost
  const monthlyInsurance = insuranceParams.loanAmount * (insuranceParams.insuranceRate / 100) / 12;
  
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
            value={insuranceParams.loanAmount}
            onChange={(value) => handleInputChange('loanAmount', value)}
            prefix={getCurrencySymbol()}
            darkMode={darkMode}
          />
          
          <InputField
            label="Interest Rate (%)"
            value={insuranceParams.interestRate}
            onChange={(value) => handleInputChange('interestRate', value)}
            suffix="%"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="30"
          />
          
          <InputField
            label="Loan Term (years)"
            value={insuranceParams.loanTermYears}
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
          Insurance Parameters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Annual Insurance Rate (%)"
            value={insuranceParams.insuranceRate}
            onChange={(value) => handleInputChange('insuranceRate', value)}
            suffix="% of loan"
            darkMode={darkMode}
            step="0.1"
            min="0.1"
            max="10"
          />
          
          <InputField
            label="Insurance Term (years)"
            value={insuranceParams.insuranceTermYears}
            onChange={(value) => handleInputChange('insuranceTermYears', value)}
            suffix="years"
            darkMode={darkMode}
            step="1"
            min="1"
            max={insuranceParams.loanTermYears}
            type="number"
          />
        </div>
        
        <div className={`mt-4 p-3 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
          <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
            <p>
              <span className="font-medium">Monthly Insurance Payment:</span> {formatCurrency(monthlyInsurance)}
            </p>
            <p className="mt-1">
              <span className="font-medium">Insurance Coverage Period:</span> {
                insuranceParams.insuranceTermYears === insuranceParams.loanTermYears 
                  ? 'Full loan term' 
                  : `First ${insuranceParams.insuranceTermYears} ${insuranceParams.insuranceTermYears === 1 ? 'year' : 'years'} of the loan`
              }
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
      {!isLoading && !error && insuranceResults.insuranceSchedule && insuranceResults.insuranceSchedule.length > 0 && (
        <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
            Insurance Impact Results
          </h2>
          
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Total Insurance Cost
              </div>
              <div className={`text-xl font-semibold ${darkMode ? 'text-[#FAA1A4]' : 'text-red-500'}`}>
                {formatCurrency(insuranceResults.totalInsurance)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {(insuranceResults.totalInsurance / insuranceParams.loanAmount * 100).toFixed(1)}% of loan amount
              </div>
            </div>
            
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Increase in Total Payments
              </div>
              <div className={`text-xl font-semibold ${darkMode ? 'text-[#FAA1A4]' : 'text-red-500'}`}>
                {formatCurrency(insuranceResults.increaseTotalPayments)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {(insuranceResults.increaseTotalPayments / insuranceResults.totalPaymentsRegular * 100).toFixed(1)}% increase
              </div>
            </div>
            
            <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                Monthly Payment Increase
              </div>
              <div className={`text-xl font-semibold ${darkMode ? 'text-[#FAA1A4]' : 'text-red-500'}`}>
                {formatCurrency(monthlyInsurance)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                {(monthlyInsurance / (insuranceResults.totalPaymentsRegular / (insuranceParams.loanTermYears * 12)) * 100).toFixed(1)}% of mortgage payment
              </div>
            </div>
          </div>
          
          {/* Chart */}
          <div>
            <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Payment Structure with Insurance
            </h3>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
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
                        case 'payment':
                          return <span style={{ color: colors.text }}>Mortgage Payment</span>;
                        case 'insurance':
                          return <span style={{ color: colors.text }}>Insurance</span>;
                        default:
                          return <span style={{ color: colors.text }}>{value}</span>;
                      }
                    }}
                  />
                  <Bar 
                    dataKey="payment" 
                    fill={colors.payment}
                    stackId="a"
                    barSize={20}
                  />
                  <Bar 
                    dataKey="insurance" 
                    fill={colors.insurance}
                    stackId="a"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={`mt-4 p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
            <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Understanding Mortgage Insurance
            </h3>
            <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
              <p>
                <span className="font-medium">Mortgage Insurance:</span> This is typically required if your down payment is less than 20% of the property value. It protects the lender in case you default on the loan.
              </p>
              <p className="mt-2">
                <span className="font-medium">Private Mortgage Insurance (PMI):</span> In many countries, you can cancel PMI once you've built up enough equity in your home (typically 20-22%).
              </p>
              <p className="mt-2">
                <span className="font-medium">FHA Loan Insurance:</span> For FHA loans in the U.S., mortgage insurance is typically required for the entire loan term if your down payment is less than 10%.
              </p>
              <p className="mt-2">
                <span className="font-medium">Insurance Cost Considerations:</span> While insurance adds to your monthly payment, it may allow you to purchase a home with a smaller down payment, potentially entering the market sooner.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurance;