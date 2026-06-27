import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check for saved theme in localStorage
        const savedTheme = localStorage.getItem('app-theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        // Apply theme to html data-theme and data-bs-theme attributes
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const toggleTheme = (e) => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';

        const updateThemeImmediate = () => {
            setTheme(nextTheme);
            document.documentElement.setAttribute('data-theme', nextTheme);
            document.documentElement.setAttribute('data-bs-theme', nextTheme);
            localStorage.setItem('app-theme', nextTheme);
        };

        // If the API isn't supported or no event is provided
        if (!e || e.clientX === undefined || !document.startViewTransition) {
            updateThemeImmediate();
            return;
        }

        const x = e.clientX;
        const y = e.clientY;

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                updateThemeImmediate();
            });
        });

        transition.ready.then(() => {
            const radius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${radius}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 500,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-new(root)",
                }
            );
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
