import { createContext, useContext, useEffect, useState } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const THEME_KEY = 'clinic-theme';

export function StoreProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

    useEffect(() => {
        localStorage.setItem(THEME_KEY, theme);
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
        } else {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
        }
    }, [theme]);

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.add('dark-mode');
        }
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        appointments: [],
        weeklyRevenue: [],
        roomCapacity: [],
        staffMembers: [],
        inventoryAlerts: [],
        aiInsights: [],
        stats: {
            totalRevenue: 0,
            avgRevenue: 0,
            totalPatients: 0,
            todayPatientCount: 0,
            occupancyRate: 0,
        },
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}
