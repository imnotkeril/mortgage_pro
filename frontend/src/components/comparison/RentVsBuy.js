import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { compareRentVsBuy } from '../../api';
import InputField from '../common/InputField';
import Loader from '../common/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';

const RentVsBuy = () => {
  const { darkMode } = useContext(AppContext);
  const { formatCurrency, getCurrencySymbol } = useContext(CurrencyContext);
  
  // State for comparison parameters
  const [comparisonParams, setComparisonParams] = useState({
    propertyValue: 10000000,
    downPayment: 1500000,
    interestRate: 7.5,
    loanTermYears: 20,
    monthlyRent: 40000,
    rentGrowthRate: 4.0,
    propertyGrowthRate: 3.0,
    maintenanceCostPercent: 1.0,
    propertyTaxPercent: 0.1,
    rentalIncome: 0,
    taxBenefitRate: 13.0,
    inflationRate: 4.0,
    opportunityCostRate: 5.0
  });
  
  // State for comparison results
  const [comparisonResults, setComparisonResults] = useState({
    comparison: [],
    breakEvenMonth: null,
    breakEvenYears: null,
    totalBuyCosts: 0,
    totalRentCosts: 0,
    finalPropertyValue: 0,
    finalInvestmentValue: 0,
    buyPosition: 0,
    rentPosition: 0
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Additional states
  const [activeTab, setActiveTab] = useState('costs'); // 'costs' or 'netWorth'
  
  // Loan amount is derived from property value and down payment
  const loanAmount = comparisonParams.propertyValue - comparisonParams.downPayment;
  
  // Calculate rent vs buy comparison when parameters change
  useEffect(() => {
    const getComparison = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if loan amount is valid
        if (loanAmount <= 0) {
          setError('Down payment must be less than property value');
          setIsLoading(false);
          return;
        }
        
        const result = await compareRentVsBuy(comparisonParams);
        setComparisonResults(result);
      } catch (err) {
        console.error('Error comparing rent vs buy:', err);
        setError('Failed to calculate comparison. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    getComparison();
  }, [comparisonParams, loanAmount]);
  
  // Handle input changes
  const handleInputChange = (name, value) => {
    setComparisonParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle down payment percentage change
  const handleDownPaymentPercentChange = (percentage) => {
    const newDownPayment = Math.round(comparisonParams.propertyValue * (percentage / 100));
    setComparisonParams(prev => ({
      ...prev,
      downPayment: newDownPayment
    }));
  };
  
  // Prepare chart data - sample every 12 months for clarity
  const chartData = comparisonResults.comparison
    ? comparisonResults.comparison
        .filter((_, index) => index % 12 === 0 || index === (comparisonResults.comparison.length - 1))
        .map(item => ({
          month: item.month,
          year: Math.ceil(item.month / 12),
          totalBuyCost: item.totalBuyCost,
          totalRentCost: item.totalRentCost,
          netWorthBuy: item.netWorthBuy,
          netWorthRent: item.netWorthRent,
          breakEven: item.breakEven
        }))
    : [];
  
  // Color scheme
  const colors = darkMode ? {
    buy: '#BF9FFB',       // Purple
    rent: '#90BFF9',      // Blue
    breakEven: '#74F174', // Green
    background: '#0D1015',// Dark background
    text: '#D1D4DC',      // Light text
    grid: '#2A2E39'       // Grid lines
  } : {
    buy: '#9333ea',       // Purple
    rent: '#3b82f6',      // Blue
    breakEven: '#22c55e', // Green
    background: '#ffffff',// White background
    text: '#374151',      // Dark text
    grid: '#e5e7eb'       // Grid lines
  };
  
  // Find break-even point coordinates if it exists
  let breakEvenPoint = null;
  if (comparisonResults.breakEvenMonth && chartData.length > 0) {
    const breakEvenYear = Math.ceil(comparisonResults.breakEvenMonth / 12);
    const closestDataPoint = chartData.find(item => item.year >= breakEvenYear) || chartData[chartData.length - 1];
    
    breakEvenPoint = {
      x: breakEvenYear,
      y: closestDataPoint.netWorthBuy
    };
  }
  
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
          {activeTab === 'netWorth' && (
            <p className="text-sm font-medium mt-1">
              Difference: {formatCurrency(
                payload[0].dataKey === 'netWorthBuy' 
                  ? payload[0].value - payload[1].value 
                  : payload[1].value - payload[0].value
              )}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
        Rent vs Buy Comparison
      </h1>
      
      {/* Input Form */}
      <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          Comparison Parameters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Property Parameters */}
          <div>
            <h3 className={`text-md font-medium mb-3 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Property Parameters
            </h3>
            <div className="space-y-4">
              <InputField
                label="Property Value"
                value={comparisonParams.propertyValue}
                onChange={(value) => handleInputChange('propertyValue', value)}
                prefix={getCurrencySymbol()}
                darkMode={darkMode}
              />
              
              <InputField
                label="Down Payment"
                value={comparisonParams.downPayment}
                onChange={(value) => handleInputChange('downPayment', value)}
                prefix={getCurrencySymbol()}
                darkMode={darkMode}
              />
              
              {/* Down payment percentage slider */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                  Down Payment Percentage: {((comparisonParams.downPayment / comparisonParams.propertyValue) * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={((comparisonParams.downPayment / comparisonParams.propertyValue) * 100).toFixed(1)}
                  onChange={(e) => handleDownPaymentPercentChange(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>5%</span>
                  <span>90%</span>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                  Loan Amount
                </label>
                <div className={`p-2 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-100 border border-gray-300'}`}>
                  {formatCurrency(loanAmount)}
                </div>
              </div>
              
              <InputField
                label="Interest Rate (%)"
                value={comparisonParams.interestRate}
                onChange={(value) => handleInputChange('interestRate', value)}
                suffix="%"
                darkMode={darkMode}
                step="0.1"
                min="0.1"
                max="30"
              />
              
              <InputField
                label="Loan Term (years)"
                value={comparisonParams.loanTermYears}
                onChange={(value) => handleInputChange('loanTermYears', value)}
                suffix="years"
                darkMode={darkMode}
                step="1"
                min="1"
                max="30"
                type="number"
              />
              
              <InputField
                label="Property Growth Rate (%)"
                value={comparisonParams.propertyGrowthRate}
                onChange={(value) => handleInputChange('propertyGrowthRate', value)}
                suffix="%"
                darkMode={darkMode}
                step="0.1"
                min="-10"
                max="30"
              />
            </div>
          </div>
          
          {/* Rent and Additional Parameters */}
          <div>
            <h3 className={`text-md font-medium mb-3 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Rent & Additional Parameters
            </h3>
            <div className="space-y-4">
              <InputField
                label="Monthly Rent"
                value={comparisonParams.monthlyRent}
                onChange={(value) => handleInputChange('monthlyRent', value)}
                prefix={getCurrencySymbol()}
                darkMode={darkMode}
              />
              
              <InputField
                label="Rent Growth Rate (%)"
                value={comparisonParams.rentGrowthRate}
                onChange={(value) => handleInputChange('rentGrowthRate', value)}
                suffix="%"
                darkMode={darkMode}
                step="0.1"
                min="0"
                max="30"
              />
              
              <InputField
                label="Inflation Rate (%)"
                value={comparisonParams.inflationRate}
                onChange={(value) => handleInputChange('inflationRate', value)}
                suffix="%"
                darkMode={darkMode}
                step="0.1"
                min="0"
                max="30"
              />
              
              <InputField
                label="Alternative Investment Return (%)"
                value={comparisonParams.opportunityCostRate}
                onChange={(value) => handleInputChange('opportunityCostRate', value)}
                suffix="%"
                darkMode={darkMode}
                step="0.1"
                min="0"
                max="30"
              />
              
              <InputField
                label="Annual Maintenance Cost (%)"
                value={comparisonParams.maintenanceCostPercent}
                onChange={(value) => handleInputChange('maintenanceCostPercent', value)}
                suffix="%"
                darkMode={darkMode}
                step="0.1"
                min="0"
                max="10"
              />
              
              <InputField
                label="Property Tax (%)"
                value={comparisonParams.propertyTaxPercent}
                onChange={(value) => handleInputChange('propertyTaxPercent', value)}
                suffix="%"
                darkMode={darkMode}
                step="0.1"
                min="0"
                max="5"
              />
              
              <InputField
                label="Potential Rental Income"
                value={comparisonParams.rentalIncome}
                onChange={(value) => handleInputChange('rentalIncome', value)}
                prefix={getCurrencySymbol()}
                darkMode={darkMode}
                min="0"
              />
              
              <InputField
                label="Tax Benefit Rate (%)"
                value={comparisonParams.taxBenefitRate}
                onChange={(value) => handleInputChange('taxBenefitRate', value)}
                suffix="%"
                darkMode={darkMode}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
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
      {!isLoading && !error && comparisonResults.comparison && comparisonResults.comparison.length > 0 && (
        <>
          <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
              Comparison Results
            </h2>
            
            {/* Break-even information */}
            {comparisonResults.breakEvenYears && (
              <div className={`p-4 mb-6 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`text-lg font-medium ${darkMode ? 'text-[#74F174]' : 'text-green-500'}`}>
                  Break-even Period: {comparisonResults.breakEvenYears.toFixed(1)} years ({comparisonResults.breakEvenMonth} months)
                </div>
                <div className={`text-sm mt-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                  After this period, buying becomes more financially advantageous than renting.
                </div>
              </div>
            )}
            {!comparisonResults.breakEvenYears && (
              <div className={`p-4 mb-6 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`text-lg font-medium ${darkMode ? 'text-[#FAA1A4]' : 'text-red-500'}`}>
                  Break-even point not reached within the specified loan term.
                </div>
                <div className={`text-sm mt-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                  Based on the current parameters, renting remains more advantageous throughout the entire period.
                </div>
              </div>
            )}
            
            {/* Final position summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                  Final Position When Buying
                </div>
                <div className={`text-xl font-semibold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
                  {formatCurrency(comparisonResults.buyPosition)}
                </div>
                <div className={`text-sm ${
                  comparisonResults.buyPosition > comparisonResults.rentPosition 
                    ? (darkMode ? 'text-[#74F174]' : 'text-green-500') 
                    : (darkMode ? 'text-[#FAA1A4]' : 'text-red-500')
                }`}>
                  {comparisonResults.buyPosition > comparisonResults.rentPosition ? '+' : ''}
                  {formatCurrency(comparisonResults.buyPosition - comparisonResults.rentPosition)}
                </div>
              </div>
              
              <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
                  Final Position When Renting
                </div>
                <div className={`text-xl font-semibold ${darkMode ? 'text-[#90BFF9]' : 'text-blue-600'}`}>
                  {formatCurrency(comparisonResults.rentPosition)}
                </div>
                <div className={`text-sm ${
                  comparisonResults.rentPosition > comparisonResults.buyPosition 
                    ? (darkMode ? 'text-[#74F174]' : 'text-green-500') 
                    : (darkMode ? 'text-[#FAA1A4]' : 'text-red-500')
                }`}>
                  {comparisonResults.rentPosition > comparisonResults.buyPosition ? '+' : ''}
                  {formatCurrency(comparisonResults.rentPosition - comparisonResults.buyPosition)}
                </div>
              </div>
            </div>
            
            {/* Chart selection tabs */}
            <div className="mb-4">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`py-2 px-4 text-sm font-medium ${
                    activeTab === 'costs'
                      ? (darkMode ? 'text-[#BF9FFB] border-b-2 border-[#BF9FFB]' : 'text-purple-600 border-b-2 border-purple-600')
                      : (darkMode ? 'text-[#D1D4DC] hover:text-white' : 'text-gray-500 hover:text-gray-700')
                  }`}
                  onClick={() => setActiveTab('costs')}
                >
                  Monthly Costs
                </button>
                <button
                  className={`py-2 px-4 text-sm font-medium ${
                    activeTab === 'netWorth'
                      ? (darkMode ? 'text-[#BF9FFB] border-b-2 border-[#BF9FFB]' : 'text-purple-600 border-b-2 border-purple-600')
                      : (darkMode ? 'text-[#D1D4DC] hover:text-white' : 'text-gray-500 hover:text-gray-700')
                  }`}
                  onClick={() => setActiveTab('netWorth')}
                >
                  Net Worth
                </button>
              </div>
            </div>
            
            {/* Charts */}
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'costs' ? (
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span style={{ color: colors.text }}>{value}</span>}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalBuyCost"
                      name="Monthly Buying Costs"
                      stroke={colors.buy}
                      strokeWidth={2}
                      dot={{
                        fill: colors.buy,
                        r: 4
                      }}
                      activeDot={{
                        fill: colors.buy,
                        r: 6,
                        stroke: colors.background
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalRentCost"
                      name="Monthly Renting Costs"
                      stroke={colors.rent}
                      strokeWidth={2}
                      dot={{
                        fill: colors.rent,
                        r: 4
                      }}
                      activeDot={{
                        fill: colors.rent,
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
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return value;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span style={{ color: colors.text }}>{value}</span>}
                  />
                  <Line
                    type="monotone"
                    dataKey="netWorthBuy"
                    name="Net Worth When Buying"
                    stroke={colors.buy}
                    strokeWidth={2}
                    dot={{
                      fill: colors.buy,
                      r: 4
                    }}
                    activeDot={{
                      fill: colors.buy,
                      r: 6,
                      stroke: colors.background
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netWorthRent"
                    name="Net Worth When Renting"
                    stroke={colors.rent}
                    strokeWidth={2}
                    dot={{
                      fill: colors.rent,
                      r: 4
                    }}
                    activeDot={{
                      fill: colors.rent,
                      r: 6,
                      stroke: colors.background
                    }}
                  />
                  {breakEvenPoint && (
                    <ReferenceDot
                      x={breakEvenPoint.x}
                      y={breakEvenPoint.y}
                      r={6}
                      fill={colors.breakEven}
                      stroke={colors.background}
                    />
                  )}
                </LineChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {/* Additional explanation */}
            <div className={`mt-4 p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
              <h3 className={`text-md font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                Understanding the Results
              </h3>
              <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                <p>
                  <span className="font-medium">Monthly Costs:</span> Shows the ongoing monthly expenses for both buying and renting over time. For buying, this includes mortgage payment, property tax, maintenance, and insurance, offset by potential rental income and tax benefits. For renting, this includes rent and the opportunity cost of not investing your down payment.
                </p>
                <p className="mt-2">
                  <span className="font-medium">Net Worth:</span> Compares how your financial position evolves over time with each option. For buying, this includes your property equity. For renting, this includes the value of investments you could make with the down payment and the difference in monthly costs.
                </p>
                {breakEvenPoint && (
                  <p className="mt-2">
                    <span className="font-medium">Break-even Point:</span> The point at which buying becomes more financially advantageous than renting (marked by a green dot on the Net Worth chart).
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Annual Data Table */}
          <div className={`p-4 rounded shadow ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
              Annual Comparison Data
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className={`p-2 text-left ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Year
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Monthly Buy Cost
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Monthly Rent Cost
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Property Value
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Net Worth (Buy)
                    </th>
                    <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                      Net Worth (Rent)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item) => (
                    <tr key={item.year} className={`${darkMode ? 'hover:bg-[#0D1015]' : 'hover:bg-gray-50'} ${
                      item.breakEven ? (darkMode ? 'bg-[#0D1015]' : 'bg-green-50') : ''
                    }`}>
                      <td className={`p-2 text-left ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                        {item.year} {item.breakEven ? '(Break-even)' : ''}
                      </td>
                      <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                        {formatCurrency(item.totalBuyCost)}
                      </td>
                      <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                        {formatCurrency(item.totalRentCost)}
                      </td>
                      <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                        {formatCurrency(comparisonResults.comparison[item.month - 1]?.propertyValue || 0)}
                      </td>
                      <td className={`p-2 text-right ${
                        item.netWorthBuy > item.netWorthRent 
                          ? (darkMode ? 'text-[#74F174] border-b border-[#2A2E39]' : 'text-green-500 border-b border-gray-200') 
                          : (darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200')
                      }`}>
                        {formatCurrency(item.netWorthBuy)}
                      </td>
                      <td className={`p-2 text-right ${
                        item.netWorthRent > item.netWorthBuy 
                          ? (darkMode ? 'text-[#74F174] border-b border-[#2A2E39]' : 'text-green-500 border-b border-gray-200') 
                          : (darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200')
                      }`}>
                        {formatCurrency(item.netWorthRent)}
                      </td>
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

export default RentVsBuy;