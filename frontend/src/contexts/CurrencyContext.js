import React, { createContext, useState } from 'react';

// Create the context
export const CurrencyContext = createContext();

// Currency symbols
export const CURRENCY_SYMBOLS = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  JPY: '¥',
};

// Create a provider component
export const CurrencyProvider = ({ children }) => {
  // Currency state
  const [currency, setCurrency] = useState('RUB');
  
  // Currency display format
  const [displayFormat, setDisplayFormat] = useState('symbol_before'); // symbol_before, symbol_after, code_before, code_after
  
  // Number format
  const [numberFormat, setNumberFormat] = useState('standard'); // standard, space, comma_as_decimal, apostrophe

  // Get current currency symbol
  const getCurrencySymbol = () => CURRENCY_SYMBOLS[currency] || '₽';

  // Format currency value
  const formatCurrency = (value, currency = null) => {
    const currencySymbol = currency ? CURRENCY_SYMBOLS[currency] : getCurrencySymbol();
    
    // Format the number according to selected format
    let formattedValue;
    switch (numberFormat) {
      case 'space':
        formattedValue = new Intl.NumberFormat('fr-FR', { 
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
        formattedValue = formattedValue.replace(/,/g, ' ');
        break;
      case 'comma_as_decimal':
        formattedValue = new Intl.NumberFormat('de-DE', { 
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
        break;
      case 'apostrophe':
        formattedValue = new Intl.NumberFormat('en-CH', { 
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
        break;
      default:
        formattedValue = new Intl.NumberFormat('en-US', { 
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
    }
    
    // Apply currency format
    switch (displayFormat) {
      case 'symbol_after':
        return `${formattedValue} ${currencySymbol}`;
      case 'code_before':
        return `${currency || this.currency} ${formattedValue}`;
      case 'code_after':
        return `${formattedValue} ${currency || this.currency}`;
      default:
        return `${currencySymbol}${formattedValue}`;
    }
  };

  // Exchange rates for static fallback
  // In a real app, we would get these from an API
  const exchangeRates = {
    'RUB': { 'USD': 0.0136, 'EUR': 0.0116, 'JPY': 1.5, 'RUB': 1.0 },
    'USD': { 'RUB': 73.5, 'EUR': 0.85, 'JPY': 110.0, 'USD': 1.0 },
    'EUR': { 'RUB': 86.5, 'USD': 1.18, 'JPY': 130.0, 'EUR': 1.0 },
    'JPY': { 'RUB': 0.67, 'USD': 0.0091, 'EUR': 0.0077, 'JPY': 1.0 }
  };

  // Convert amount from one currency to another
  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    return amount * exchangeRates[fromCurrency][toCurrency];
  };

  // Value to be provided to consumers
  const contextValue = {
    currency,
    setCurrency,
    displayFormat,
    setDisplayFormat,
    numberFormat,
    setNumberFormat,
    getCurrencySymbol,
    formatCurrency,
    exchangeRates,
    convertCurrency
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};