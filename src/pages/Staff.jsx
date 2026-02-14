import { useState } from 'react';
import { Plus, Search, User, Phone, Mail, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const staffList = [
    { id: '1', name: 'Dr. Sarah Smith', role: 'General Physician', email: 'sarah.smith@clinic.com', phone: '555-0101', status: 'on-duty', schedule: 'Mon-Fri 9AM-5PM' },
    { id: '2', name: 'Dr. Michael Lee', role: 'Dentist', email: 'michael.lee@clinic.com', phone: '555-0102', status: 'on-duty', schedule: 'Mon-Wed 10AM-6PM' },
    { id: '3', name: 'Dr. Priya Patel', role: 'Cardiologist', email: 'priya.patel@clinic.com', phone: '555-0103', status: 'off-duty', schedule: 'Tue-Thu 9AM-4PM' },
    { id: '4', name: 'Nurse Johnson', role: 'Head Nurse', email: 'johnson@clinic.com', phone: '555-0104', status: 'on-duty', schedule: 'Mon-Fri 8AM-4PM' },
    { id: '5', name: 'Lisa Chen', role: 'Receptionist', email: 'lisa.chen@clinic.com', phone: '555-0105', status: 'on-duty', schedule: 'Mon-Sat 8AM-6PM' },
];

export function Staff() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onDutyCount = staffList.filter(s => s.status === 'on-duty').length;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                    <h1 className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Staff Management</h1>
                    <p className={cn("text-sm sm:text-base", isDark ? 'text-gray-400' : 'text-gray-600')}>Manage clinic staff and schedules</p>
                </div>
                <button className="w-full sm:w-auto bg-[#ff7a6b] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add Staff</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                        </div>
                        <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Total Staff</span>
                    </div>
                    <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>{staffList.length}</p>
                </div>
                <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        </div>
                        <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>On Duty</span>
                    </div>
                    <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>{onDutyCount}</p>
                </div>
                <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        </div>
                        <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Doctors</span>
                    </div>
                    <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>{staffList.filter(s => s.role.includes('Dr.')).length}</p>
                </div>
            </div>

            {/* Search */}
            <div className={cn("rounded-xl flex items-center gap-3 px-4", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <Search className="w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search staff members..."
                    className={cn("flex-1 py-3 outline-none placeholder-gray-500 bg-transparent text-sm", isDark ? 'text-white' : 'text-gray-900')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {filteredStaff.map((staff) => (
                    <div key={staff.id} className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-colors", isDark ? 'bg-[#1e1e1e] hover:bg-[#252525]' : 'bg-white border border-gray-200 hover:bg-gray-50')}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-base sm:text-lg font-bold">
                                        {staff.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className={cn("font-semibold text-sm sm:text-base truncate", isDark ? 'text-white' : 'text-gray-900')}>{staff.name}</h3>
                                    <p className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>{staff.role}</p>
                                </div>
                            </div>
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                staff.status === 'on-duty' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-gray-500/20 text-gray-400'
                            }`}>
                                {staff.status}
                            </span>
                        </div>

                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className={cn("flex items-center gap-2", isDark ? 'text-gray-400' : 'text-gray-600')}>
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{staff.email}</span>
                            </div>
                            <div className={cn("flex items-center gap-2", isDark ? 'text-gray-400' : 'text-gray-600')}>
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>{staff.phone}</span>
                            </div>
                            <div className={cn("flex items-center gap-2", isDark ? 'text-gray-400' : 'text-gray-600')}>
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{staff.schedule}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button className={cn("flex-1 py-2 rounded-lg transition-colors text-xs sm:text-sm", isDark ? 'bg-[#0f0f0f] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                                Edit
                            </button>
                            <button className={cn("flex-1 py-2 rounded-lg transition-colors text-xs sm:text-sm", isDark ? 'bg-[#0f0f0f] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
                                Schedule
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
