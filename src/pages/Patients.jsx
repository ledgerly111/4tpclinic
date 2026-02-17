import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Trash2, User, Phone, Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { createPatient, deletePatient, fetchPatients } from '../lib/clinicApi';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';

export function Patients() {
  const { theme } = useStore();
  const { session } = useAuth();
  const { selectedOrganizationId, selectedClinicId } = useTenant();
  const isDark = theme === 'dark';
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    medicalHistory: '',
  });

  const loadPatients = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await fetchPatients();
      setPatients(result.patients || []);
    } catch (err) {
      setError(err.message || 'Failed to load patients.');
    } finally {
      setIsLoading(false);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadPatients();

    // Check for 'new' action in URL
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
      // Clean up URL without reloading
      setSearchParams({}, { replace: true });
    }
  }, []);

  const filteredPatients = useMemo(() => (
    patients.filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(patient.contact || '').includes(searchTerm)
    )
  ), [patients, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedClinicId) {
      setError('Please select a clinic before creating a patient.');
      return;
    }

    try {
      await createPatient({
        ...newPatient,
        clinicId: selectedClinicId,
        organizationId: session?.role === 'super_admin' ? selectedOrganizationId : undefined,
        medicalHistory: newPatient.medicalHistory
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        lastVisit: new Date().toISOString().split('T')[0],
      });
      setIsModalOpen(false);
      setNewPatient({ name: '', age: '', gender: 'Male', contact: '', medicalHistory: '' });
      await loadPatients();
    } catch (err) {
      setError(err.message || 'Failed to add patient.');
    }
  };

  const handleDelete = async (patientId) => {
    setError('');
    try {
      await deletePatient(patientId);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    } catch (err) {
      setError(err.message || 'Failed to delete patient.');
    }
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 dashboard-reveal">
        <div>
          <h1 className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>Patients</h1>
          <p className={cn('text-sm sm:text-base', isDark ? 'text-gray-400' : 'text-gray-600')}>Manage patient records</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#ff7a6b] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">Add Patient</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className={cn('p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 dashboard-reveal reveal-delay-1', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search patients by name or phone..."
          className={cn('flex-1 bg-transparent outline-none text-sm placeholder-gray-500', isDark ? 'text-white' : 'text-gray-900')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className={cn('rounded-xl p-8 text-center', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
          <p className={cn('mt-1 text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Loading patients...</p>
        </div>
      )}

      {!isLoading && filteredPatients.length === 0 && (
        <div className={cn('rounded-xl p-8 text-center', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
          <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
          </p>
        </div>
      )}

      {!isLoading && filteredPatients.length > 0 && (
        <div className={cn('rounded-2xl overflow-hidden overflow-x-auto dashboard-reveal reveal-delay-2', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
          <table className="w-full text-left text-sm">
            <thead className={cn('font-medium', isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-gray-50 text-gray-600')}>
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Age/Gender</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Last Visit</th>
                <th className="p-4">Medical History</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', isDark ? 'divide-gray-800' : 'divide-gray-200')}>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className={cn('transition-colors', isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50')}>
                  <td className={cn('p-4 font-medium flex items-center gap-3', isDark ? 'text-white' : 'text-gray-900')}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    {patient.name}
                  </td>
                  <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>{patient.age || '-'} / {patient.gender || '-'}</td>
                  <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    <span className="inline-flex items-center gap-2"><Phone className="w-3 h-3" />{patient.contact || '-'}</span>
                  </td>
                  <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    <span className="inline-flex items-center gap-2"><Calendar className="w-3 h-3" />{patient.lastVisit || '-'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(patient.medicalHistory || []).map((item, idx) => (
                        <span key={`${patient.id}-mh-${idx}`} className={cn('px-2 py-1 rounded-full text-xs', isDark ? 'bg-[#0f0f0f] text-gray-300' : 'bg-gray-100 text-gray-700')}>
                          {item}
                        </span>
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
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={cn(
            "rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border shadow-xl",
            isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>Add New Patient</h2>
              <button onClick={() => setIsModalOpen(false)} className={cn("transition-colors", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-400" : "text-gray-700")}>Full Name</label>
                <input required type="text" className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-400" : "text-gray-700")}>Age</label>
                  <input required type="number" className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} />
                </div>
                <div>
                  <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-400" : "text-gray-700")}>Gender</label>
                  <select className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-400" : "text-gray-700")}>Contact Number</label>
                <input required type="tel" className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} value={newPatient.contact} onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })} />
              </div>
              <div>
                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-400" : "text-gray-700")}>Medical History (comma separated)</label>
                <textarea className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] resize-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} rows="3" placeholder="e.g. Diabetes, Asthma" value={newPatient.medicalHistory} onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className={cn("px-4 py-2 rounded-xl transition-colors", isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] transition-colors">Save Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
