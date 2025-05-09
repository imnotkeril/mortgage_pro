import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

// Tab icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const ComparisonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const CurrencyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const ScenariosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { darkMode } = useContext(AppContext);

  const tabs = [
    { id: 'calculator', name: 'Calculator', icon: <HomeIcon /> },
    { id: 'forecast', name: 'Forecast', icon: <ChartIcon /> },
    { id: 'comparison', name: 'Rent vs Buy', icon: <ComparisonIcon /> },
    { id: 'currency', name: 'Currency', icon: <CurrencyIcon /> },
    { id: 'scenarios', name: 'Scenarios', icon: <ScenariosIcon /> }
  ];

  return (
    <aside className={`w-16 md:w-64 ${darkMode ? 'border-r border-[#2A2E39]' : 'border-r border-gray-200'} flex flex-col py-4`}>
      <div className="flex flex-col items-center space-y-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`p-2 rounded flex items-center md:w-full ${
              activeTab === tab.id 
                ? (darkMode ? 'bg-[#BF9FFB] text-[#0D1015]' : 'bg-purple-600 text-white') 
                : (darkMode ? 'text-[#D1D4DC] hover:bg-[#2A2E39]' : 'text-gray-600 hover:bg-gray-100')
            } transition-colors`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.name}
          >
            <span className="flex-shrink-0">{tab.icon}</span>
            <span className="hidden md:block ml-3">{tab.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;