import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Trash2, User, Phone, Calendar, X, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';
import { createPatient, deletePatient, fetchPatients, updatePatient } from '../lib/clinicApi';
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
  const [editPatient, setEditPatient] = useState(null); // holds patient being edited
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const openEditModal = (patient) => {
    setEditPatient({
      ...patient,
      medicalHistory: (patient.medicalHistory || []).join(', '),
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updatePatient(editPatient.id, {
        name: editPatient.name,
        age: editPatient.age,
        gender: editPatient.gender,
        contact: editPatient.contact,
        medicalHistory: editPatient.medicalHistory
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setIsEditModalOpen(false);
      setEditPatient(null);
      await loadPatients();
    } catch (err) {
      setError(err.message || 'Failed to update patient.');
    }
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 dashboard-reveal">
        <div>
          <h1 className={cn('text-2xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>Patients</h1>
          <p className={cn('text-sm sm:text-base font-bold uppercase tracking-widest mt-1', isDark ? 'text-white/40' : 'text-[#512c31]/60')}>Manage patient records</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-[#512c31] text-white px-4 py-3 sm:px-6 sm:py-3 rounded-2xl sm:rounded-[1.5rem] font-bold tracking-wide hover:bg-[#e8919a] hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Add Patient</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className={cn('p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] flex items-center gap-3 dashboard-reveal reveal-delay-1 shadow-lg border-4', isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients by name or phone..."
          className={cn('flex-1 bg-transparent outline-none text-sm sm:text-base font-medium placeholder-gray-400', isDark ? 'text-white' : 'text-[#512c31]')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className={cn('rounded-2xl overflow-hidden', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
          <div className={cn('px-4 py-3 border-b', isDark ? 'bg-[#0f0f0f] border-gray-800' : 'bg-gray-50 border-gray-200')}>
            <div className="grid grid-cols-6 gap-4">
              {['Name', 'Age/Gender', 'Contact', 'Last Visit', 'Medical History', 'Actions'].map((h) => (
                <div key={h} className="skeleton-shimmer h-4" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-800/40">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 py-4 grid grid-cols-6 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="skeleton-shimmer w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="skeleton-shimmer h-4 flex-1" />
                </div>
                <div className="skeleton-shimmer h-4" />
                <div className="skeleton-shimmer h-4" />
                <div className="skeleton-shimmer h-4" />
                <div className="skeleton-shimmer h-4 w-3/4" />
                <div className="skeleton-shimmer h-8 w-8 rounded-lg ml-auto" />
              </div>
            ))}
          </div>
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
        <div className={cn('rounded-3xl sm:rounded-[2.5rem] overflow-hidden overflow-x-auto dashboard-reveal reveal-delay-2 shadow-2xl border-4', isDark ? 'bg-[#1e1e1e] border-white/5 shadow-black/50' : 'bg-white border-white/50 shadow-[#512c31]/5')}>
          <table className="w-full text-left text-sm">
            <thead className={cn('font-black uppercase tracking-widest text-xs', isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}>
              <tr>
                <th className="p-4 sm:p-6">Name</th>
                <th className="p-4 sm:p-6">Age/Gender</th>
                <th className="p-4 sm:p-6">Contact</th>
                <th className="p-4 sm:p-6">Last Visit</th>
                <th className="p-4 sm:p-6">Medical History</th>
                <th className="p-4 sm:p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', isDark ? 'divide-gray-800' : 'divide-gray-50')}>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className={cn('transition-all duration-300 group', isDark ? 'hover:bg-[#252525]' : 'hover:bg-[#fef9f3]')}>
                  <td className={cn('p-4 sm:p-6 font-bold flex items-center gap-3 sm:gap-4', isDark ? 'text-white' : 'text-[#512c31]')}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#e8919a] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform group-hover:rotate-6">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    {patient.name}
                  </td>
                  <td className={cn('p-4 sm:p-6 font-medium', isDark ? 'text-gray-400' : 'text-[#512c31]/80')}>{patient.age || '-'} / {patient.gender || '-'}</td>
                  <td className={cn('p-4 sm:p-6 font-medium', isDark ? 'text-gray-400' : 'text-[#512c31]/80')}>
                    <span className="inline-flex items-center gap-2"><Phone className="w-3 h-3 sm:w-4 sm:h-4" />{patient.contact || '-'}</span>
                  </td>
                  <td className={cn('p-4 sm:p-6 font-medium', isDark ? 'text-gray-400' : 'text-[#512c31]/80')}>
                    <span className="inline-flex items-center gap-2"><Calendar className="w-3 h-3 sm:w-4 sm:h-4" />{patient.lastVisit || '-'}</span>
                  </td>
                  <td className="p-4 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                      {(patient.medicalHistory || []).map((item, idx) => (
                        <span key={`${patient.id}-mh-${idx}`} className={cn('px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm', isDark ? 'bg-[#0f0f0f] text-gray-300' : 'bg-white border border-gray-100 text-[#512c31]')}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 sm:p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(patient)}
                        className="text-blue-500 hover:text-white p-2 sm:p-3 bg-blue-50 hover:bg-blue-500 rounded-xl transition-all shadow-sm group-hover:scale-105"
                        title="Edit patient"
                      >
                        <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="text-red-500 hover:text-white p-2 sm:p-3 bg-red-50 hover:bg-red-500 rounded-xl transition-all shadow-sm group-hover:scale-105"
                        title="Delete patient"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
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
            "rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto border-4 shadow-2xl",
            isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-white/50"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Add New Patient</h2>
              <button onClick={() => setIsModalOpen(false)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-gray-50 hover:bg-[#e8919a] hover:text-white", isDark ? "text-gray-400" : "text-[#512c31]")}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Full Name</label>
                <input required type="text" className={cn("w-full border-2 rounded-2xl p-4 sm:p-5 outline-none font-medium focus:border-[#e8919a] transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Age</label>
                  <input required type="number" className={cn("w-full border-2 rounded-2xl p-4 outline-none font-medium focus:border-[#e8919a] transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} />
                </div>
                <div>
                  <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Gender</label>
                  <select className={cn("w-full border-2 rounded-2xl p-4 outline-none font-medium focus:border-[#e8919a] transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Contact Number</label>
                <input required type="tel" className={cn("w-full border-2 rounded-2xl p-4 sm:p-5 outline-none font-medium focus:border-[#e8919a] transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} value={newPatient.contact} onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })} />
              </div>
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Medical History (comma separated)</label>
                <textarea className={cn("w-full border-2 rounded-2xl p-4 sm:p-5 outline-none font-medium focus:border-[#e8919a] resize-none transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} rows="3" placeholder="e.g. Diabetes, Asthma" value={newPatient.medicalHistory} onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className={cn("px-6 py-3 rounded-2xl font-bold transition-all", isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-[#512c31]/60 hover:text-[#512c31] hover:bg-gray-100")}>Cancel</button>
                <button type="submit" className="px-8 py-3 bg-[#512c31] text-white rounded-2xl font-bold tracking-wide hover:bg-[#e8919a] hover:scale-105 shadow-xl transition-all">Save Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Patient Modal ── */}
      {isEditModalOpen && editPatient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={cn(
            "rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto border-4 shadow-2xl",
            isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-white/50"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Edit Patient</h2>
              <button onClick={() => setIsEditModalOpen(false)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-gray-50 hover:bg-[#e8919a] hover:text-white", isDark ? "text-gray-400" : "text-[#512c31]")}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Full Name</label>
                <input required type="text" className={cn("w-full border-2 rounded-2xl p-4 sm:p-5 outline-none font-medium focus:border-[#e8919a] transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} value={editPatient.name} onChange={(e) => setEditPatient({ ...editPatient, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Age</label>
                  <input type="number" className={cn("w-full border-2 rounded-2xl p-4 outline-none font-medium focus:border-[#e8919a] transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} value={editPatient.age} onChange={(e) => setEditPatient({ ...editPatient, age: e.target.value })} />
                </div>
                <div>
                  <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Gender</label>
                  <select className={cn("w-full border-2 rounded-2xl p-4 outline-none font-medium focus:border-[#e8919a] transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} value={editPatient.gender} onChange={(e) => setEditPatient({ ...editPatient, gender: e.target.value })}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Contact Number</label>
                <input type="tel" className={cn("w-full border-2 rounded-2xl p-4 sm:p-5 outline-none font-medium focus:border-[#e8919a] transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} value={editPatient.contact} onChange={(e) => setEditPatient({ ...editPatient, contact: e.target.value })} />
              </div>
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Medical History (comma separated)</label>
                <textarea className={cn("w-full border-2 rounded-2xl p-4 sm:p-5 outline-none font-medium focus:border-[#e8919a] resize-none transition-all", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-[#fef9f3] border-transparent focus:bg-white text-[#512c31]")} rows="3" value={editPatient.medicalHistory} onChange={(e) => setEditPatient({ ...editPatient, medicalHistory: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className={cn("px-6 py-3 rounded-2xl font-bold transition-all", isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-[#512c31]/60 hover:text-[#512c31] hover:bg-gray-100")}>Cancel</button>
                <button type="submit" className="px-8 py-3 bg-[#512c31] text-white rounded-2xl font-bold tracking-wide hover:bg-[#e8919a] hover:scale-105 shadow-xl transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
