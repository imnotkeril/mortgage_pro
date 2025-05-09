import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { calculateMortgage } from '../../api';
import InputField from '../common/InputField';
import ResultsSummary from './ResultSummary';
import PaymentChart from './PaymentChart';
import RemainingLoanChart from './RemainingLoanChart';
import DistributionChart from './DistributionChart';
import PaymentSchedule from './PaymentSchedule';
import Loader from '../common/Loader';

const Calculator = () => {
  const { 
    mortgageParams, 
    updateMortgageParams, 
    calculationResults, 
    setCalculationResults,
    isLoading,
    setIsLoading,
    error,
    setError,
    darkMode
  } = useContext(AppContext);

  const { 
    currency, 
    formatCurrency, 
    getCurrencySymbol 
  } = useContext(CurrencyContext);
  
  const [localParams, setLocalParams] = useState(mortgageParams);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Calculate loan amount when property value or down payment changes
  const loanAmount = localParams.propertyValue - localParams.downPayment;

  // Calculate mortgage when parameters change
  useEffect(() => {
    const calculateResults = async () => {
      // Check if loan amount is valid
      if (loanAmount <= 0) {
        setError('Down payment must be less than property value');
        return;
      }
      
      // Check if interest rate is valid
      if (localParams.interestRate <= 0) {
        setError('Interest rate must be greater than 0');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const params = {
          loanAmount,
          interestRate: localParams.interestRate,
          loanTermYears: localParams.loanTerm,
          paymentType: localParams.paymentType
        };
        
        const result = await calculateMortgage(params);
        
        setCalculationResults({
          schedule: result.schedule || [],
          totalInterest: result.totalInterest || 0,
          totalPayments: result.totalPayments || 0,
          monthlyPayment: result.schedule && result.schedule.length > 0 
            ? (localParams.paymentType === 'annuity' 
              ? result.schedule[0].payment 
              : { first: result.schedule[0].payment, last: result.schedule[result.schedule.length - 1].payment })
            : 0
        });
      } catch (err) {
        console.error('Error calculating mortgage:', err);
        setError('Failed to calculate mortgage. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Perform calculation only if parameters have changed
    if (
      localParams.propertyValue !== mortgageParams.propertyValue ||
      localParams.downPayment !== mortgageParams.downPayment ||
      localParams.interestRate !== mortgageParams.interestRate ||
      localParams.loanTerm !== mortgageParams.loanTerm ||
      localParams.paymentType !== mortgageParams.paymentType
    ) {
      calculateResults();
      updateMortgageParams(localParams);
    }
  }, [localParams]);

  // Handle input changes
  const handleInputChange = (name, value) => {
    setLocalParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle down payment percentage change
  const handleDownPaymentPercentChange = (percentage) => {
    const newDownPayment = Math.round(localParams.propertyValue * (percentage / 100));
    setLocalParams(prev => ({
      ...prev,
      downPayment: newDownPayment
    }));
  };

  // Format inputs for display
  const formatInput = (value) => {
    return new Intl.NumberFormat().format(value);
  };

  // Parse formatted input
  const parseInput = (formattedValue) => {
    return parseFloat(formattedValue.replace(/[^\d]/g, ''));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
        Mortgage Calculator
      </h1>
      
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`p-4 rounded shadow ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
            Property Parameters
          </h2>
          <div className="space-y-4">
            <InputField
              label="Property Value"
              value={localParams.propertyValue}
              onChange={(value) => handleInputChange('propertyValue', value)}
              prefix={getCurrencySymbol()}
              darkMode={darkMode}
            />
            
            <InputField
              label="Down Payment"
              value={localParams.downPayment}
              onChange={(value) => handleInputChange('downPayment', value)}
              prefix={getCurrencySymbol()}
              darkMode={darkMode}
            />
            
            {/* Down payment percentage slider */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                Down Payment Percentage: {((localParams.downPayment / localParams.propertyValue) * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={((localParams.downPayment / localParams.propertyValue) * 100).toFixed(1)}
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
          </div>
        </div>
        
        <div className={`p-4 rounded shadow ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
            Loan Parameters
          </h2>
          <div className="space-y-4">
            <InputField
              label="Interest Rate (%)"
              value={localParams.interestRate}
              onChange={(value) => handleInputChange('interestRate', value)}
              suffix="%"
              darkMode={darkMode}
              step="0.1"
              min="0.1"
              max="30"
            />
            
            <InputField
              label="Loan Term (years)"
              value={localParams.loanTerm}
              onChange={(value) => handleInputChange('loanTerm', value)}
              suffix="years"
              darkMode={darkMode}
              step="1"
              min="1"
              max="30"
              type="number"
            />
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
                Payment Type
              </label>
              <div className="flex space-x-2">
                <button
                  className={`flex-1 p-2 rounded ${
                    localParams.paymentType === 'annuity' 
                      ? (darkMode ? 'bg-[#BF9FFB] text-[#0D1015]' : 'bg-purple-600 text-white') 
                      : (darkMode ? 'bg-[#0D1015] border border-[#2A2E39] text-white' : 'bg-white border border-gray-300 text-gray-700')
                  }`}
                  onClick={() => handleInputChange('paymentType', 'annuity')}
                >
                  Annuity
                </button>
                <button
                  className={`flex-1 p-2 rounded ${
                    localParams.paymentType === 'differentiated' 
                      ? (darkMode ? 'bg-[#BF9FFB] text-[#0D1015]' : 'bg-purple-600 text-white') 
                      : (darkMode ? 'bg-[#0D1015] border border-[#2A2E39] text-white' : 'bg-white border border-gray-300 text-gray-700')
                  }`}
                  onClick={() => handleInputChange('paymentType', 'differentiated')}
                >
                  Differentiated
                </button>
              </div>
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
      {!isLoading && !error && calculationResults.schedule.length > 0 && (
        <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
            Calculation Results
          </h2>
          
          {/* Results Summary Cards */}
          <ResultsSummary 
            calculationResults={calculationResults} 
            paymentType={localParams.paymentType}
            loanAmount={loanAmount}
            darkMode={darkMode}
          />
          
          {/* Results Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <PaymentChart 
              scheduleData={calculationResults.schedule} 
              darkMode={darkMode} 
            />
            
            <RemainingLoanChart 
              scheduleData={calculationResults.schedule} 
              darkMode={darkMode} 
            />
          </div>
          
          <DistributionChart 
            totalInterest={calculationResults.totalInterest}
            loanAmount={loanAmount}
            darkMode={darkMode}
          />
        </div>
      )}
      
      {/* Payment Schedule */}
      {!isLoading && !error && calculationResults.schedule.length > 0 && (
        <div className={`p-4 rounded shadow ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
              Payment Schedule
            </h2>
            <button
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              className={`px-4 py-2 rounded ${
                darkMode 
                  ? 'bg-[#BF9FFB] text-[#0D1015] hover:bg-purple-400' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {showFullSchedule ? 'Show Annual' : 'Show Full Schedule'}
            </button>
          </div>
          
          <PaymentSchedule 
            scheduleData={calculationResults.schedule} 
            showFull={showFullSchedule}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
};

export default Calculator;