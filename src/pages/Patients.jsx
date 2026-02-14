import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { Search, Plus, Trash2, User, Phone, Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { mockTenantData } from '../lib/mockDataWithTenancy';

export function Patients() {
  const { session } = useAuth();
  const { selectedClinicId, selectedOrganization } = useTenant();
  const isDark = true;
  
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    medicalHistory: '',
  });

  // Load patients with tenant filtering
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const filteredPatients = mockTenantData.getPatients(session, selectedClinicId);
      setPatients(filteredPatients);
      setIsLoading(false);
    }, 300);
  }, [session, selectedClinicId]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact.includes(searchTerm)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create patient with tenant context
    const createdPatient = mockTenantData.createPatient(
      {
        ...newPatient,
        medicalHistory: newPatient.medicalHistory.split(',').map(item => item.trim()),
        lastVisit: new Date().toISOString().split('T')[0],
      },
      session,
      selectedClinicId
    );
    
    // Refresh list
    setPatients(mockTenantData.getPatients(session, selectedClinicId));
    setIsModalOpen(false);
    setNewPatient({ name: '', age: '', gender: 'Male', contact: '', medicalHistory: '' });
  };

  const handleDelete = (patientId) => {
    // In a real app, this would call an API
    // For now, we'll filter out the deleted patient from local state
    setPatients(patients.filter(p => p.id !== patientId));
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Patients</h1>
          <p className={cn("text-sm sm:text-base", isDark ? 'text-gray-400' : 'text-gray-600')}>
            Manage patient records 
            {selectedClinicId && (
              <span className="ml-1 text-[#ff7a6b]">
                - {selectedOrganization?.name}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#ff7a6b] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">Add Patient</span>
        </button>
      </div>

      {/* Clinic Info Banner */}
      {selectedClinicId && (
        <div className="bg-[#ff7a6b]/10 border border-[#ff7a6b]/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ff7a6b]/20 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-[#ff7a6b]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              Viewing patients for: {selectedOrganization?.name}
            </p>
            <p className="text-gray-400 text-xs">
              Clinic ID: {selectedClinicId}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[#ff7a6b] text-lg font-bold">{patients.length}</p>
            <p className="text-gray-500 text-xs">Patients</p>
          </div>
        </div>
      )}

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

      {/* Loading State */}
      {isLoading && (
        <div className={cn("rounded-xl p-8 text-center", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
          <p className={cn("mt-4 text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Loading patients...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPatients.length === 0 && (
        <div className={cn("rounded-xl p-8 text-center", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
          <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm ? 'No patients found matching your search.' : 'No patients found for this clinic.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 text-[#ff7a6b] hover:underline text-sm"
            >
              Add your first patient
            </button>
          )}
        </div>
      )}

      {/* Patient List - Mobile Cards */}
      {!isLoading && filteredPatients.length > 0 && (
        <>
          <div className="sm:hidden space-y-3">
            {filteredPatients.map((patient) => (
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
                    onClick={() => handleDelete(patient.id)}
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
            ))}
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
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className={cn("transition-colors", isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50')}>
                    <td className={cn("p-4 font-medium flex items-center gap-3", isDark ? 'text-white' : 'text-gray-900')}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      {patient.name}
                    </td>
                    <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{patient.age} / {patient.gender}</td>
                    <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{patient.contact}</td>
                    <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{patient.lastVisit || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(patient.medicalHistory) && patient.medicalHistory.map((item, idx) => (
                          item && <span key={idx} className={cn("px-2 py-1 rounded-full text-xs", isDark ? 'bg-[#0f0f0f] text-gray-300' : 'bg-gray-100 text-gray-700')}>{item}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Patient</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Clinic Context Info */}
            <div className="mb-4 p-3 bg-[#0f0f0f] rounded-xl">
              <p className="text-gray-400 text-sm">Adding to:</p>
              <p className="text-white font-medium">{selectedOrganization?.name}</p>
              <p className="text-gray-500 text-xs">Clinic: {selectedClinicId}</p>
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
