import React, { useState, useContext } from 'react';
import { aiRecommend } from '../../api';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import InputField from '../common/InputField';
import Loader from '../common/Loader';

const ScenarioRecommendations = () => {
  const { darkMode } = useContext(AppContext);
  const { formatCurrency } = useContext(CurrencyContext);
  const [userProfile, setUserProfile] = useState({
    age: 35,
    annual_income: 0,
    down_payment: 0,
    monthly_expenses: 0,
    children: 0,
    credit_score: 700,
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await aiRecommend(userProfile);
      
      if (response.success) {
        setRecommendations(response.recommendations);
      } else {
        throw new Error(response.error || 'Failed to get recommendations');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-[#0D1015]' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          AI Mortgage Recommendations
        </h2>
        <p className={`mb-6 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
          Fill in your profile, and AI will recommend optimal mortgage parameters
        </p>

        <div
          className={`p-6 rounded-lg mb-6 ${
            darkMode ? 'bg-[#1A1D26] border border-[#2A2E39]' : 'bg-white border border-gray-200'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Age"
              value={userProfile.age}
              onChange={(value) => handleInputChange('age', value)}
              type="number"
              min={18}
              max={80}
              darkMode={darkMode}
            />
            <InputField
              label="Annual Income"
              value={userProfile.annual_income}
              onChange={(value) => handleInputChange('annual_income', value)}
              type="number"
              min={0}
              darkMode={darkMode}
            />
            <InputField
              label="Down Payment"
              value={userProfile.down_payment}
              onChange={(value) => handleInputChange('down_payment', value)}
              type="number"
              min={0}
              darkMode={darkMode}
            />
            <InputField
              label="Monthly Expenses"
              value={userProfile.monthly_expenses}
              onChange={(value) => handleInputChange('monthly_expenses', value)}
              type="number"
              min={0}
              darkMode={darkMode}
            />
            <InputField
              label="Number of Children"
              value={userProfile.children}
              onChange={(value) => handleInputChange('children', value)}
              type="number"
              min={0}
              darkMode={darkMode}
            />
            <InputField
              label="Credit Score"
              value={userProfile.credit_score}
              onChange={(value) => handleInputChange('credit_score', value)}
              type="number"
              min={300}
              max={850}
              darkMode={darkMode}
            />
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={loading}
            className={`mt-6 w-full py-3 rounded font-medium transition-colors ${
              loading
                ? darkMode
                  ? 'bg-[#2A2E39] text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : darkMode
                ? 'bg-[#BF9FFB] text-[#0D1015] hover:bg-[#A88FE8]'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {loading ? 'Getting recommendations...' : 'Get Recommendations'}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        )}

        {error && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              darkMode ? 'bg-red-900/20 border border-red-500' : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className={darkMode ? 'text-red-400' : 'text-red-600'}>
              Error: {error}
            </p>
          </div>
        )}

        {recommendations && !loading && (
          <div
            className={`p-6 rounded-lg ${
              darkMode ? 'bg-[#1A1D26] border border-[#2A2E39]' : 'bg-white border border-gray-200'
            }`}
          >
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Recommendations
            </h3>

            <div className="space-y-4">
              <div
                className={`p-4 rounded ${
                  darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                    Optimal Loan Amount:
                  </span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatCurrency(recommendations.optimal_loan_amount)}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded ${
                  darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                    Recommended Term:
                  </span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {recommendations.suggested_term} years
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded ${
                  darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                    Payment Type:
                  </span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {recommendations.payment_type === 'annuity' ? 'Annuity' : 'Differentiated'}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded ${
                  darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                    Maximum Monthly Payment:
                  </span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatCurrency(recommendations.max_monthly_payment)}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded ${
                  darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                }`}
              >
                <div className="mb-2">
                  <span className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                    Confidence Level:
                  </span>
                  <div className="mt-2">
                    <div className={`w-full h-2 rounded ${darkMode ? 'bg-[#0D1015]' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded bg-purple-600"
                        style={{ width: `${recommendations.confidence_score * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm mt-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
                      {(recommendations.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {recommendations.reasoning && (
                <div
                  className={`p-4 rounded mt-4 ${
                    darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                  }`}
                >
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Reasoning:
                  </h4>
                  <p className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                    {recommendations.reasoning}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioRecommendations;
