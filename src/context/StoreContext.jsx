import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

// Theme constants
const THEME_KEY = 'clinic-theme';

const initialPatients = [
    {
        id: '1',
        name: 'John Doe',
        age: 34,
        gender: 'Male',
        contact: '555-0123',
        lastVisit: '2023-10-15',
        medicalHistory: ['Hypertension'],
    },
    {
        id: '2',
        name: 'Jane Smith',
        age: 28,
        gender: 'Female',
        contact: '555-0124',
        lastVisit: '2023-10-20',
        medicalHistory: ['None'],
    },
    {
        id: '3',
        name: 'Michael Johnson',
        age: 45,
        gender: 'Male',
        contact: '555-0125',
        lastVisit: '2023-10-22',
        medicalHistory: ['Diabetes', 'Asthma'],
    },
    {
        id: '4',
        name: 'Sarah Williams',
        age: 52,
        gender: 'Female',
        contact: '555-0126',
        lastVisit: '2023-10-25',
        medicalHistory: ['Arthritis'],
    },
    {
        id: '5',
        name: 'David Brown',
        age: 29,
        gender: 'Male',
        contact: '555-0127',
        lastVisit: '2023-10-28',
        medicalHistory: ['None'],
    },
];

// Revenue data for chart
const weeklyRevenue = [
    { day: 'Mon', amount: 3200, patients: 12 },
    { day: 'Tue', amount: 4500, patients: 18 },
    { day: 'Wed', amount: 3800, patients: 15 },
    { day: 'Thu', amount: 5200, patients: 22 },
    { day: 'Fri', amount: 4800, patients: 20 },
    { day: 'Sat', amount: 2900, patients: 10 },
    { day: 'Sun', amount: 1500, patients: 5 },
];

// Room capacity data
const roomCapacity = [
    { day: 'Mon', occupancy: 78 },
    { day: 'Tue', occupancy: 82 },
    { day: 'Wed', occupancy: 91 },
    { day: 'Thu', occupancy: 88 },
    { day: 'Fri', occupancy: 95 },
    { day: 'Sat', occupancy: 63 },
    { day: 'Sun', occupancy: 45 },
];

// Today's appointments
const todayAppointments = [
    { id: '1', patient: 'John Doe', time: '09:00', type: 'General Checkup', status: 'completed', doctor: 'Dr. Smith' },
    { id: '2', patient: 'Jane Smith', time: '10:30', type: 'Dental Cleaning', status: 'in-progress', doctor: 'Dr. Lee' },
    { id: '3', patient: 'Michael Johnson', time: '14:00', type: 'Follow-up', status: 'scheduled', doctor: 'Dr. Smith' },
    { id: '4', patient: 'Sarah Williams', time: '15:30', type: 'Consultation', status: 'scheduled', doctor: 'Dr. Patel' },
    { id: '5', patient: 'David Brown', time: '16:45', type: 'Vaccination', status: 'scheduled', doctor: 'Dr. Lee' },
];

// Staff data
const staffMembers = [
    { id: '1', name: 'Dr. Smith', role: 'General Physician', status: 'on-duty', avatar: 'DS' },
    { id: '2', name: 'Dr. Lee', role: 'Dentist', status: 'on-duty', avatar: 'DL' },
    { id: '3', name: 'Dr. Patel', role: 'Cardiologist', status: 'off-duty', avatar: 'DP' },
    { id: '4', name: 'Nurse Johnson', role: 'Head Nurse', status: 'on-duty', avatar: 'NJ' },
];

// Inventory alerts
const inventoryAlerts = [
    { id: '1', item: 'Surgical Masks', stock: 45, threshold: 50, status: 'low' },
    { id: '2', item: 'Hand Sanitizer', stock: 12, threshold: 20, status: 'critical' },
    { id: '3', item: 'Syringes (10ml)', stock: 200, threshold: 100, status: 'good' },
];

// AI Insights
const aiInsights = [
    {
        id: '1',
        type: 'alert',
        title: 'Staffing Optimization',
        message: 'Tuesday afternoons show 40% higher patient volume. Consider adding one more nurse for 2PM-5PM shift.',
        priority: 'high',
    },
    {
        id: '2',
        type: 'suggestion',
        title: 'Inventory Restock',
        message: 'Based on usage patterns, you will run out of Hand Sanitizer in 3 days. Place order now.',
        priority: 'medium',
    },
];

export function StoreProvider({ children }) {
    // Load patients from localStorage if available, else use initial
    const [patients, setPatients] = useState(() => {
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
    const [services, setServices] = useState([
        { id: '1', name: 'General Consultation', price: 50, duration: 30 },
        { id: '2', name: 'Dental Cleaning', price: 100, duration: 60 },
        { id: '3', name: 'Blood Test', price: 75, duration: 15 },
        { id: '4', name: 'X-Ray', price: 150, duration: 30 },
        { id: '5', name: 'Vaccination', price: 40, duration: 20 },
    ]);

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
    const avgRevenue = Math.round(totalRevenue / 7);
    const totalPatients = patients.length;
    const todayPatientCount = todayAppointments.length;
    const occupancyRate = Math.round(roomCapacity.reduce((sum, day) => sum + day.occupancy, 0) / 7);

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
