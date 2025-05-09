import React, { useContext } from 'react';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { getChartConfig } from '../../utils/chartConfig'; // Импорт конфигурации

const ResultsSummary = ({ calculationResults, paymentType, loanAmount, darkMode }) => {
  const { formatCurrency } = useContext(CurrencyContext);
  const chartConfig = getChartConfig(darkMode); // Получение конфигурации с учетом темы

  // Извлечение результатов (оставить существующий код)
  const { totalPayments, totalInterest, monthlyPayment } = calculationResults;

  // Форматирование крупных чисел
  const formatLargeNumber = chartConfig.formatLargeNumber;

  // Компоненты иконок (оставить существующий код)
  const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
  );

  const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
        <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
          Monthly Payment
        </div>

        {paymentType === 'annuity' ? (
          <div className={`text-xl font-semibold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
            {formatCurrency(monthlyPayment)}
          </div>
        ) : (
          <div>
            <div className="flex items-center">
              <ArrowDownIcon className={darkMode ? 'text-[#74F174]' : 'text-green-500'} />
              <span className={`text-lg font-semibold ml-1 ${darkMode ? 'text-[#74F174]' : 'text-green-500'}`}>
                {formatCurrency(monthlyPayment?.last)}
              </span>
            </div>
            <div className="flex items-center">
              <ArrowUpIcon className={darkMode ? 'text-[#FAA1A4]' : 'text-red-500'} />
              <span className={`text-lg font-semibold ml-1 ${darkMode ? 'text-[#FAA1A4]' : 'text-red-500'}`}>
                {formatCurrency(monthlyPayment?.first)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
        <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
          Total Payments
        </div>
        <div className={`text-xl font-semibold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          {formatCurrency(totalPayments)}
        </div>
        <div className={`text-sm ${darkMode ? 'text-[#74F174]' : 'text-green-500'}`}>
          Overpayment: {((totalPayments / loanAmount - 1) * 100).toFixed(1)}%
        </div>
      </div>

      <div className={`p-4 rounded ${darkMode ? 'bg-[#0D1015] border border-[#2A2E39]' : 'bg-gray-50 border border-gray-200'}`}>
        <div className={`text-sm mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
          Total Interest
        </div>
        <div className={`text-xl font-semibold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          {formatCurrency(totalInterest)}
        </div>
        <div className={`text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-600'}`}>
          Effective Rate: {(totalInterest / loanAmount / (calculationResults.schedule.length / 12) * 100).toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;