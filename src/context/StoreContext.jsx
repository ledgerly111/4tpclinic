import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

// Theme constants
const THEME_KEY = 'clinic-theme';
const STORE_VERSION_KEY = 'clinic-store-version';
const STORE_VERSION = '2';

const initialPatients = [];

// Revenue data for chart
const weeklyRevenue = [];

// Room capacity data
const roomCapacity = [];

// Today's appointments
const todayAppointments = [];

// Staff data
const staffMembers = [];

// Inventory alerts
const inventoryAlerts = [];

// AI Insights
const aiInsights = [];

export function StoreProvider({ children }) {
    const ensureStoreVersion = () => {
        const currentVersion = localStorage.getItem(STORE_VERSION_KEY);
        if (currentVersion !== STORE_VERSION) {
            localStorage.removeItem('patients');
            localStorage.setItem(STORE_VERSION_KEY, STORE_VERSION);
        }
    };

    // Load patients from localStorage if available, else use initial
    const [patients, setPatients] = useState(() => {
        ensureStoreVersion();
        const saved = localStorage.getItem('patients');
        return saved ? JSON.parse(saved) : initialPatients;
    });

    // Theme state - load from localStorage or default to dark
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        return savedTheme || 'dark';
    });

    // Persist theme to localStorage
    useEffect(() => {
        localStorage.setItem(THEME_KEY, theme);
        // Apply theme class to document body for CSS variable switching
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
        } else {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
        }
    }, [theme]);

    // Initialize theme on mount
    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.add('dark-mode');
        }
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Services state
    const [services, setServices] = useState([]);

    // Appointments state
    const [appointments, setAppointments] = useState(todayAppointments);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('patients', JSON.stringify(patients));
    }, [patients]);

    const addPatient = (patient) => {
        const newPatient = { ...patient, id: crypto.randomUUID(), lastVisit: new Date().toISOString().split('T')[0] };
        setPatients(prev => [newPatient, ...prev]);
    };

    const deletePatient = (id) => {
        setPatients(prev => prev.filter(p => p.id !== id));
    };

    const addService = (service) => {
        const newService = { ...service, id: crypto.randomUUID() };
        setServices(prev => [newService, ...prev]);
    };

    const deleteService = (id) => {
        setServices(prev => prev.filter(s => s.id !== id));
    };

    const addAppointment = (appointment) => {
        const newAppointment = { ...appointment, id: crypto.randomUUID() };
        setAppointments(prev => [...prev, newAppointment]);
    };

    const updateAppointmentStatus = (id, status) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    // Calculate stats
    const totalRevenue = weeklyRevenue.reduce((sum, day) => sum + day.amount, 0);
    const avgRevenue = weeklyRevenue.length > 0 ? Math.round(totalRevenue / weeklyRevenue.length) : 0;
    const totalPatients = patients.length;
    const todayPatientCount = todayAppointments.length;
    const occupancyRate = roomCapacity.length > 0
        ? Math.round(roomCapacity.reduce((sum, day) => sum + day.occupancy, 0) / roomCapacity.length)
        : 0;

    const value = {
        patients,
        addPatient,
        deletePatient,
        services,
        addService,
        deleteService,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        weeklyRevenue,
        roomCapacity,
        staffMembers,
        inventoryAlerts,
        aiInsights,
        stats: {
            totalRevenue,
            avgRevenue,
            totalPatients,
            todayPatientCount,
            occupancyRate,
        },
        theme,
        setTheme,
        toggleTheme,
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}
