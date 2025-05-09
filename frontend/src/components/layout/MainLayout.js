import React, { useContext } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { AppContext } from '../../contexts/AppContext';

const MainLayout = ({ children, activeTab, setActiveTab }) => {
  const { darkMode } = useContext(AppContext);

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-[#0D1015] text-white' : 'bg-white text-gray-800'}`}>
      {/* Top navigation bar */}
      <Navbar />
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;