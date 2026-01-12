import React, { useState, useContext } from 'react';
import { aiAnalyzeExpenses } from '../../api';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import InputField from '../common/InputField';
import Loader from '../common/Loader';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ExpenseAnalyzer = () => {
  const { darkMode } = useContext(AppContext);
  const { formatCurrency } = useContext(CurrencyContext);
  const [text, setText] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const COLORS = ['#BF9FFB', '#A88FE8', '#8F7FD5', '#6F5FC2', '#4F3FAF', '#2F2F9C', '#1F1F89'];

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter expense description');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await aiAnalyzeExpenses(text, monthlyIncome);
      
      if (response.success) {
        setAnalysis(response);
      } else {
        throw new Error(response.error || 'Failed to analyze expenses');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!analysis?.expenses) return [];

    const categories = [
      { name: 'Utilities', value: analysis.expenses.utilities || 0, key: 'utilities' },
      { name: 'Transportation', value: analysis.expenses.transportation || 0, key: 'transportation' },
      { name: 'Food', value: analysis.expenses.food || 0, key: 'food' },
      { name: 'Entertainment', value: analysis.expenses.entertainment || 0, key: 'entertainment' },
      { name: 'Healthcare', value: analysis.expenses.healthcare || 0, key: 'healthcare' },
      { name: 'Education', value: analysis.expenses.education || 0, key: 'education' },
      { name: 'Shopping', value: analysis.expenses.shopping || 0, key: 'shopping' },
      { name: 'Other', value: analysis.expenses.other || 0, key: 'other' },
    ];

    return categories.filter((cat) => cat.value > 0);
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-[#0D1015]' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          AI Expense Analyzer
        </h2>
        <p className={`mb-6 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
          Describe your expenses in natural language, and AI will automatically categorize and analyze them
        </p>

        <div
          className={`p-6 rounded-lg mb-6 ${
            darkMode ? 'bg-[#1A1D26] border border-[#2A2E39]' : 'bg-white border border-gray-200'
          }`}
        >
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
              Expense Description (e.g., "I spend $500 on car, $300 on food, $150 on utilities...")
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your expense description..."
              rows={4}
              className={`w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none ${
                darkMode
                  ? 'bg-[#0D1015] border border-[#2A2E39] text-white placeholder-gray-500'
                  : 'bg-white border border-gray-300 text-gray-800 placeholder-gray-400'
              }`}
            />
          </div>

          <InputField
            label="Monthly Income (optional, for mortgage affordability calculation)"
            value={monthlyIncome}
            onChange={setMonthlyIncome}
            type="number"
            min={0}
            darkMode={darkMode}
          />

          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className={`mt-4 w-full py-3 rounded font-medium transition-colors ${
              loading || !text.trim()
                ? darkMode
                  ? 'bg-[#2A2E39] text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : darkMode
                ? 'bg-[#BF9FFB] text-[#0D1015] hover:bg-[#A88FE8]'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {loading ? 'Analyzing...' : 'Analyze Expenses'}
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

        {analysis && !loading && (
          <div className="space-y-6">
            {/* Expenses Breakdown */}
            <div
              className={`p-6 rounded-lg ${
                darkMode ? 'bg-[#1A1D26] border border-[#2A2E39]' : 'bg-white border border-gray-200'
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Expense Categories
              </h3>

              {analysis.expenses && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {prepareChartData().map((category) => (
                      <div
                        key={category.key}
                        className={`p-3 rounded ${
                          darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                            {category.name}:
                          </span>
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {formatCurrency(category.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div
                      className={`p-3 rounded mt-2 ${
                        darkMode ? 'bg-[#BF9FFB] text-[#0D1015]' : 'bg-purple-600 text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span>
                          {formatCurrency(analysis.expenses.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {prepareChartData().length > 0 && (
                    <div>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={prepareChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Affordability Analysis */}
            {analysis.affordability && (
              <div
                className={`p-6 rounded-lg ${
                  darkMode ? 'bg-[#1A1D26] border border-[#2A2E39]' : 'bg-white border border-gray-200'
                }`}
              >
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Mortgage Affordability Analysis
                </h3>

                <div className="space-y-4">
                  <div
                    className={`p-4 rounded ${
                      darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                        Debt-to-Income Ratio:
                      </span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {analysis.affordability.debt_to_income_ratio.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className={`w-full h-2 rounded ${darkMode ? 'bg-[#0D1015]' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded ${
                            analysis.affordability.debt_to_income_ratio < 30
                              ? 'bg-green-500'
                              : analysis.affordability.debt_to_income_ratio < 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(analysis.affordability.debt_to_income_ratio, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded ${
                      darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                        Available for Mortgage:
                      </span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {formatCurrency(analysis.affordability.available_for_mortgage || 0)}/month
                      </span>
                    </div>
                  </div>

                  {analysis.affordability.recommendation && (
                    <div
                      className={`p-4 rounded ${
                        darkMode ? 'bg-[#2A2E39]' : 'bg-gray-50'
                      }`}
                    >
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Recommendation:
                      </h4>
                      <p className={darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}>
                        {analysis.affordability.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseAnalyzer;
