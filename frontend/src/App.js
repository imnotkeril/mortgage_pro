import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { calculateMortgage } from './api';
import MainLayout from './components/layout/MainLayout';

// Components
import Calculator from './components/calculator/Calculator';
import Forecast from './components/forecast/Forecast';
import RentVsBuy from './components/comparison/RentVsBuy';
import CurrencyAnalysis from './components/currency/CurrencyAnalysis';
import Scenarios from './components/scenarios/Scenarios';

// Contexts
import { AppProvider } from './contexts/AppContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <Calculator />;
      case 'forecast':
        return <Forecast />;
      case 'comparison':
        return <RentVsBuy />;
      case 'currency':
        return <CurrencyAnalysis />;
      case 'scenarios':
        return <Scenarios />;
      default:
        return <Calculator />;
    }
  };

  return (
    <AppProvider>
      <CurrencyProvider>
        <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderContent()}
        </MainLayout>
      </CurrencyProvider>
    </AppProvider>
  );
}

export default App;