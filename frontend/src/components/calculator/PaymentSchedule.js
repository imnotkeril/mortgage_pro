import React, { useContext, useState } from 'react';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import { getChartConfig } from '../../utils/chartConfig'; // Импорт конфигурации

const PaymentSchedule = ({ scheduleData, showFull, darkMode }) => {
  const { formatCurrency } = useContext(CurrencyContext);
  const chartConfig = getChartConfig(darkMode); // Получение конфигурации с учетом темы
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // Подготовка данных расписания (оставить существующий код)
  let tableData = showFull
    ? [...scheduleData]
    : scheduleData.filter((_, index) => index % 12 === 0 || index === scheduleData.length - 1);

  // Если отображаются годовые данные, добавить информацию о годе
  if (!showFull) {
    tableData = tableData.map(item => ({
      ...item,
      year: Math.ceil(item.month / 12)
    }));
  }

  // Пагинация (оставить существующий код)
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = tableData.slice(startIndex, startIndex + rowsPerPage);

  // Обработка изменения страницы (оставить существующий код)
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Форматирование крупных чисел для таблицы
  const formatLargeNumber = chartConfig.formatLargeNumber;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className={`p-2 text-left ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                {showFull ? 'Month' : 'Year'}
              </th>
              <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                Payment
              </th>
              <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                Principal
              </th>
              <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                Interest
              </th>
              <th className={`p-2 text-right ${darkMode ? 'text-[#D1D4DC] border-b border-[#2A2E39]' : 'text-gray-600 border-b border-gray-200'}`}>
                Remaining Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.month} className={`${darkMode ? 'hover:bg-[#0D1015]' : 'hover:bg-gray-50'}`}>
                <td className={`p-2 text-left ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                  {showFull ? `Month ${item.month}` : `Year ${item.year}`}
                </td>
                <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                  {formatCurrency(item.payment)}
                </td>
                <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                  {formatCurrency(item.principal)}
                </td>
                <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                  {formatCurrency(item.interest)}
                </td>
                <td className={`p-2 text-right ${darkMode ? 'text-white border-b border-[#2A2E39]' : 'text-gray-800 border-b border-gray-200'}`}>
                  {formatCurrency(item.remainingLoan)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация (оставить существующий код) */}
      {showFull && totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              darkMode 
                ? 'bg-[#0D1015] border border-[#2A2E39] text-white disabled:text-gray-500' 
                : 'bg-white border border-gray-300 text-gray-700 disabled:text-gray-400'
            }`}
          >
            &laquo;
          </button>
          
          <span className={darkMode ? 'text-white' : 'text-gray-700'}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              darkMode 
                ? 'bg-[#0D1015] border border-[#2A2E39] text-white disabled:text-gray-500' 
                : 'bg-white border border-gray-300 text-gray-700 disabled:text-gray-400'
            }`}
          >
            &raquo;
          </button>
        </div>
      )}
      
      <div className={`mt-4 text-sm ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
        <p>
          {showFull 
            ? '* The table shows monthly payment data.' 
            : '* The table shows data at the end of each year. For the full payment schedule, click the "Show Full Schedule" button.'}
        </p>
      </div>
    </div>
  );
};

export default PaymentSchedule;