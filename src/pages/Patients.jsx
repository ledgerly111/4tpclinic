import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Plus, Trash2, User, Phone, Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Patients() {
    const { patients, addPatient, deletePatient, theme } = useStore();
    const isDark = theme === 'dark';
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '',
        age: '',
        gender: 'Male',
        contact: '',
        medicalHistory: '',
    });

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact.includes(searchTerm)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        addPatient({
            ...newPatient,
            medicalHistory: newPatient.medicalHistory.split(',').map(item => item.trim()),
        });
        setIsModalOpen(false);
        setNewPatient({ name: '', age: '', gender: 'Male', contact: '', medicalHistory: '' });
    };

    return (
        <div className='space-y-4 sm:space-y-6'>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                    <h1 className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Patients</h1>
                    <p className={cn("text-sm sm:text-base", isDark ? 'text-gray-400' : 'text-gray-600')}>Manage patient records and history</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-[#ff7a6b] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add Patient</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className={cn("p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <Search className="w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search patients by name or phone..."
                    className={cn("flex-1 bg-transparent outline-none text-sm placeholder-gray-500", isDark ? 'text-white' : 'text-gray-900')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Patient List - Mobile Cards */}
            <div className="sm:hidden space-y-3">
                {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                        <div key={patient.id} className={cn("p-4 rounded-xl", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className={cn("font-medium", isDark ? 'text-white' : 'text-gray-900')}>{patient.name}</p>
                                        <p className={cn("text-xs", isDark ? 'text-gray-400' : 'text-gray-600')}>{patient.age} / {patient.gender}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deletePatient(patient.id)}
                                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className={cn("flex items-center gap-2", isDark ? 'text-gray-400' : 'text-gray-600')}>
                                    <Phone className="w-4 h-4" />
                                    {patient.contact}
                                </div>
                                <div className={cn("flex items-center gap-2", isDark ? 'text-gray-400' : 'text-gray-600')}>
                                    <Calendar className="w-4 h-4" />
                                    Last visit: {patient.lastVisit || 'N/A'}
                                </div>
                            </div>
                            {Array.isArray(patient.medicalHistory) && patient.medicalHistory.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {patient.medicalHistory.map((item, idx) => (
                                        item && <span key={idx} className={cn("px-2 py-1 rounded-full text-xs", isDark ? 'bg-[#0f0f0f] text-gray-300' : 'bg-gray-100 text-gray-700')}>{item}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className={cn("p-6 text-center rounded-xl", isDark ? 'bg-[#1e1e1e] text-gray-400' : 'bg-white border border-gray-200 text-gray-500')}>
                        No patients found matching your search.
                    </div>
                )}
            </div>

            {/* Patient List - Desktop Table */}
            <div className={cn("hidden sm:block rounded-2xl overflow-hidden", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <table className="w-full text-left text-sm">
                    <thead className={cn("font-medium", isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-gray-50 text-gray-600')}>
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Age/Gender</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Last Visit</th>
                            <th className="p-4">Medical History</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={cn("divide-y", isDark ? 'divide-gray-800' : 'divide-gray-200')}>
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className={cn("transition-colors", isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50')}>
                                    <td className={cn("p-4 font-medium flex items-center gap-3", isDark ? 'text-white' : 'text-gray-900')}>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        {patient.name}
                                    </td>
                                    <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{patient.age} / {patient.gender}</td>
                                    <td className={cn("p-4 flex items-center gap-2", isDark ? 'text-gray-400' : 'text-gray-600')}>
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        {patient.contact}
                                    </td>
                                    <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>
                                        {patient.lastVisit || 'N/A'}
                                    </td>
                                    <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(patient.medicalHistory) && patient.medicalHistory.map((item, idx) => (
                                                item && <span key={idx} className={cn("px-3 py-1 rounded-full text-xs", isDark ? 'bg-[#0f0f0f] text-gray-300' : 'bg-gray-100 text-gray-700')}>{item}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => deletePatient(patient.id)}
                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No patients found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Patient Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl border max-h-[90vh] overflow-y-auto", isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200')}>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className={cn("text-lg sm:text-xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Add New Patient</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={cn("p-2 rounded-lg transition-colors", isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900')}
                                    value={newPatient.name}
                                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Age</label>
                                    <input
                                        required
                                        type="number"
                                        className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900')}
                                        value={newPatient.age}
                                        onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Gender</label>
                                    <select
                                        className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900')}
                                        value={newPatient.gender}
                                        onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900')}
                                    value={newPatient.contact}
                                    onChange={e => setNewPatient({ ...newPatient, contact: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Medical History (comma separated)</label>
                                <textarea
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors resize-none", isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900')}
                                    rows="3"
                                    placeholder="e.g. Diabetes, Asthma"
                                    value={newPatient.medicalHistory}
                                    onChange={e => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className={cn("w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl transition-colors", isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] transition-colors"
                                >
                                    Save Patient
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
