import React, { createContext, useState } from 'react';

// Create the context
export const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  // Default parameters for mortgage calculation
  const [mortgageParams, setMortgageParams] = useState({
    propertyValue: 10000000,
    downPayment: 1500000,
    interestRate: 7.5,
    loanTerm: 20,
    paymentType: 'annuity'
  });

  // Calculation results
  const [calculationResults, setCalculationResults] = useState({
    schedule: [],
    totalInterest: 0,
    totalPayments: 0,
    monthlyPayment: 0
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(true);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Update mortgage parameters
  const updateMortgageParams = (newParams) => {
    setMortgageParams({
      ...mortgageParams,
      ...newParams
    });
  };

  // Value to be provided to consumers
  const contextValue = {
    mortgageParams,
    updateMortgageParams,
    calculationResults,
    setCalculationResults,
    isLoading,
    setIsLoading,
    error,
    setError,
    darkMode,
    toggleDarkMode
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};