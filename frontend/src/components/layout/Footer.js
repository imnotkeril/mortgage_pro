import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const Footer = () => {
  const { darkMode } = useContext(AppContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`p-4 ${darkMode ? 'border-t border-[#2A2E39] text-[#D1D4DC]' : 'border-t border-gray-200 text-gray-600'} text-center text-sm`}>
      <p>Mortgage Calculator Pro &copy; {currentYear}. All rights reserved.</p>
      <p className="mt-1">Information is for reference only and does not constitute financial advice.</p>
    </footer>
  );
};

export default Footer;