import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useContext(AppContext);
  const { currency, setCurrency, getCurrencySymbol } = useContext(CurrencyContext);

  return (
    <nav className={`flex items-center justify-between p-4 ${darkMode ? 'border-b border-[#2A2E39]' : 'border-b border-gray-200'}`}>
      <div className="flex items-center">
        <h1 className={`text-xl font-bold ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          Mortgage Calculator Pro
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Currency selector */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={`appearance-none px-3 py-2 rounded cursor-pointer pr-8 ${
              darkMode 
                ? 'bg-[#0D1015] border border-[#2A2E39] text-white' 
                : 'bg-white border border-gray-300 text-gray-800'
            }`}
          >
            <option value="RUB">₽ RUB</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="JPY">¥ JPY</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${
            darkMode 
              ? 'hover:bg-[#2A2E39] text-white' 
              : 'hover:bg-gray-200 text-gray-800'
          }`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;