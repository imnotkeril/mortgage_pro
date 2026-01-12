import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import AIChatbot from './AIChatbot';
import ScenarioRecommendations from './ScenarioRecommendations';
import ExpenseAnalyzer from './ExpenseAnalyzer';

const AI = () => {
  const { darkMode } = useContext(AppContext);
  const [activeSubTab, setActiveSubTab] = useState('chatbot');

  const subTabs = [
    { id: 'chatbot', name: 'AI Advisor' },
    { id: 'recommendations', name: 'Recommendations' },
    { id: 'expenses', name: 'Expense Analysis' },
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'chatbot':
        return <AIChatbot />;
      case 'recommendations':
        return <ScenarioRecommendations />;
      case 'expenses':
        return <ExpenseAnalyzer />;
      default:
        return <AIChatbot />;
    }
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-[#0D1015]' : 'bg-gray-50'}`}>
      <div
        className={`border-b ${
          darkMode ? 'border-[#2A2E39]' : 'border-gray-200'
        }`}
      >
        <div className="flex space-x-1 p-2">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                activeSubTab === tab.id
                  ? darkMode
                    ? 'bg-[#BF9FFB] text-[#0D1015]'
                    : 'bg-purple-600 text-white'
                  : darkMode
                  ? 'text-[#D1D4DC] hover:bg-[#2A2E39]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
};

export default AI;
