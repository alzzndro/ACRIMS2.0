import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext.js';

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first, then system preference
        const savedTheme = localStorage.getItem('acrims-theme');
        if (savedTheme) {
            return savedTheme;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    });

    useEffect(() => {
        // Save theme to localStorage
        localStorage.setItem('acrims-theme', theme);

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);

        // Update CSS custom properties
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--bg-primary', '#07070A');
            root.style.setProperty('--bg-secondary', '#1a1a1a');
            root.style.setProperty('--bg-tertiary', '#2a2a2a');
            root.style.setProperty('--text-primary', '#f1f5f9');
            root.style.setProperty('--text-secondary', '#94a3b8');
            root.style.setProperty('--text-muted', '#64748b');
            root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.05)');
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f8fafc');
            root.style.setProperty('--bg-tertiary', '#e2e8f0');
            root.style.setProperty('--text-primary', '#1e293b');
            root.style.setProperty('--text-secondary', '#475569');
            root.style.setProperty('--text-muted', '#64748b');
            root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');

    const value = {
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
