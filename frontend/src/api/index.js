import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance for API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Basic mortgage calculation
export const calculateMortgage = async (params) => {
  try {
    const response = await api.post('/calculate', params);
    return response.data;
  } catch (error) {
    console.error('Error calculating mortgage:', error);
    throw error;
  }
};

// Property value forecast
export const forecastPropertyValue = async (params) => {
  try {
    const response = await api.post('/forecast', params);
    return response.data;
  } catch (error) {
    console.error('Error forecasting property value:', error);
    throw error;
  }
};

// Rent vs buy comparison
export const compareRentVsBuy = async (params) => {
  try {
    const response = await api.post('/compare', params);
    return response.data;
  } catch (error) {
    console.error('Error comparing rent vs buy:', error);
    throw error;
  }
};

// Currency analysis
export const analyzeCurrency = async (params) => {
  try {
    const response = await api.post('/currency', params);
    return response.data;
  } catch (error) {
    console.error('Error analyzing currency:', error);
    throw error;
  }
};

// Early repayment scenario
export const calculateEarlyRepayment = async (params) => {
  try {
    const response = await api.post('/scenarios/early_repayment', params);
    return response.data;
  } catch (error) {
    console.error('Error calculating early repayment:', error);
    throw error;
  }
};

// Restructuring scenario
export const calculateRestructuring = async (params) => {
  try {
    const response = await api.post('/scenarios/restructuring', params);
    return response.data;
  } catch (error) {
    console.error('Error calculating restructuring:', error);
    throw error;
  }
};

// Insurance impact scenario
export const calculateInsuranceImpact = async (params) => {
  try {
    const response = await api.post('/scenarios/insurance', params);
    return response.data;
  } catch (error) {
    console.error('Error calculating insurance impact:', error);
    throw error;
  }
};

// Central bank rate impact scenario
export const calculateCentralBankRateImpact = async (params) => {
  try {
    const response = await api.post('/scenarios/central_bank_rate', params);
    return response.data;
  } catch (error) {
    console.error('Error calculating central bank rate impact:', error);
    throw error;
  }
};

export default {
  calculateMortgage,
  forecastPropertyValue,
  compareRentVsBuy,
  analyzeCurrency,
  calculateEarlyRepayment,
  calculateRestructuring,
  calculateInsuranceImpact,
  calculateCentralBankRateImpact,
};