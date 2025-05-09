import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const Loader = () => {
  const { darkMode } = useContext(AppContext);
  
  return (
    <div className="flex items-center justify-center">
      <div className={`h-12 w-12 animate-spin rounded-full border-4 border-t-transparent ${
        darkMode ? 'border-[#BF9FFB]' : 'border-purple-600'
      }`}></div>
    </div>
  );
};

export default Loader;