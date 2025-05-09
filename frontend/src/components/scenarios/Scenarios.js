import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';
import EarlyRepayment from './EarlyRepayment';
import Restructuring from './Restructuring';
import Insurance from './Insurance';
import CentralBankRate from './CentralBankRate';

const Scenarios = () => {
  const { darkMode } = useContext(AppContext);
  const [activeScenario, setActiveScenario] = useState('earlyRepayment'); // 'earlyRepayment', 'restructuring', 'insurance', 'centralBankRate'
  
  const scenarios = [
    { id: 'earlyRepayment', name: 'Early Repayment', description: 'Calculate how early repayments affect your mortgage term and total interest' },
    { id: 'restructuring', name: 'Restructuring', description: 'Compare original mortgage terms with restructured options' },
    { id: 'insurance', name: 'Insurance Impact', description: 'Analyze how insurance costs affect your total mortgage payments' },
    { id: 'centralBankRate', name: 'Central Bank Rate', description: 'See how changes in central bank rates affect variable-rate mortgages' }
  ];
  
  const renderScenario = () => {
    switch (activeScenario) {
      case 'earlyRepayment':
        return <EarlyRepayment />;
      case 'restructuring':
        return <Restructuring />;
      case 'insurance':
        return <Insurance />;
      case 'centralBankRate':
        return <CentralBankRate />;
      default:
        return <EarlyRepayment />;
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
        Additional Mortgage Scenarios
      </h1>
      
      {/* Scenario Selection */}
      <div className={`p-4 rounded shadow mb-6 ${darkMode ? 'bg-[#141418]' : 'bg-white border border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-[#BF9FFB]' : 'text-purple-600'}`}>
          Select Scenario
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              className={`p-4 rounded text-left ${
                activeScenario === scenario.id
                  ? (darkMode ? 'bg-[#BF9FFB] text-[#0D1015] border-2 border-[#BF9FFB]' : 'bg-purple-600 text-white border-2 border-purple-600')
                  : (darkMode ? 'bg-[#0D1015] border border-[#2A2E39] text-white hover:border-[#BF9FFB]' : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-600')
              }`}
              onClick={() => setActiveScenario(scenario.id)}
            >
              <h3 className="font-medium text-md mb-1">{scenario.name}</h3>
              <p className={`text-sm ${
                activeScenario === scenario.id
                  ? (darkMode ? 'text-[#0D1015]/80' : 'text-white/80')
                  : (darkMode ? 'text-[#D1D4DC]' : 'text-gray-500')
              }`}>
                {scenario.description}
              </p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Render Active Scenario */}
      {renderScenario()}
    </div>
  );
};

export default Scenarios;