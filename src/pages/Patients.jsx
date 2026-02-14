import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Plus, Trash2, User, Phone, Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Patients() {
    const { patients, addPatient, deletePatient } = useStore();
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
        <div className='space-y-6'>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Patients</h1>
                    <p className="text-gray-400">Manage patient records and history</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#ff7a6b] text-white px-4 py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Patient
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-[#1e1e1e] p-4 rounded-2xl flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search patients by name or phone..."
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Patient List */}
            <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#0f0f0f] text-gray-400 font-medium">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Age/Gender</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Last Visit</th>
                            <th className="p-4">Medical History</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-[#252525] transition-colors">
                                    <td className="p-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        {patient.name}
                                    </td>
                                    <td className="p-4 text-gray-400">{patient.age} / {patient.gender}</td>
                                    <td className="p-4 text-gray-400 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        {patient.contact}
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        {patient.lastVisit || 'N/A'}
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(patient.medicalHistory) && patient.medicalHistory.map((item, idx) => (
                                                item && <span key={idx} className="bg-[#0f0f0f] text-gray-300 px-3 py-1 rounded-full text-xs">{item}</span>
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
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Add New Patient</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    value={newPatient.name}
                                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                        value={newPatient.age}
                                        onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                                    <select
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
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
                                <label className="block text-sm font-medium text-gray-400 mb-2">Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    value={newPatient.contact}
                                    onChange={e => setNewPatient({ ...newPatient, contact: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Medical History (comma separated)</label>
                                <textarea
                                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors resize-none"
                                    rows="3"
                                    placeholder="e.g. Diabetes, Asthma"
                                    value={newPatient.medicalHistory}
                                    onChange={e => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] transition-colors"
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
