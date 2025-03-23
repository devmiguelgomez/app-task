import React, { useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import './themeToggle.css';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    // Aplicar tema inicial a toda la página, no solo al body
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    // Aplicar tema al documento entero Y al body
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    document.body.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
    >
      {isDarkMode ? <FaSun className="theme-icon sun" /> : <FaMoon className="theme-icon moon" />}
    </button>
  );
};

export default ThemeToggle;