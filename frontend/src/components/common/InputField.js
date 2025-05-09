import React, { useState } from 'react';

const InputField = ({ 
  label, 
  value, 
  onChange, 
  prefix, 
  suffix, 
  darkMode,
  type = 'text',
  min,
  max,
  step
}) => {
  const [focused, setFocused] = useState(false);
  
  // Format numbers for display if not in focus
  const formatValue = (val) => {
    if (type === 'number' || !isNaN(val)) {
      return focused 
        ? val.toString() 
        : new Intl.NumberFormat().format(val);
    }
    return val;
  };
  
  // Parse formatted input when user is done editing
  const parseValue = (formattedValue) => {
    if (type === 'number' || !isNaN(formattedValue)) {
      return parseFloat(formattedValue.replace(/[^\d.-]/g, ''));
    }
    return formattedValue;
  };
  
  const handleChange = (e) => {
    let newValue;
    
    if (type === 'number') {
      newValue = parseFloat(e.target.value);
    } else if (!isNaN(e.target.value.replace(/[^\d.-]/g, ''))) {
      // For text inputs that should be treated as numbers
      newValue = parseValue(e.target.value);
    } else {
      newValue = e.target.value;
    }
    
    // Only call onChange with valid values
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };
  
  const handleBlur = () => {
    setFocused(false);
  };
  
  const handleFocus = () => {
    setFocused(true);
  };
  
  return (
    <div>
      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className={`absolute left-3 top-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
            {prefix}
          </span>
        )}
        <input
          type={focused ? type : 'text'}
          value={formatValue(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          className={`w-full p-2 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''} rounded focus:outline-none focus:ring-2 focus:ring-purple-600 ${
            darkMode 
              ? 'bg-[#0D1015] border border-[#2A2E39] text-white' 
              : 'bg-white border border-gray-300 text-gray-800'
          }`}
        />
        {suffix && (
          <span className={`absolute right-3 top-2 ${darkMode ? 'text-[#D1D4DC]' : 'text-gray-500'}`}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputField;