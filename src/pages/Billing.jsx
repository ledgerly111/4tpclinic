import { useState } from 'react';
import { Plus, Search, FileText, Download, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const mockInvoices = [
    { id: 'INV001', patient: 'John Doe', date: '2024-01-15', amount: 150, status: 'paid', service: 'General Consultation' },
    { id: 'INV002', patient: 'Jane Smith', date: '2024-01-14', amount: 300, status: 'pending', service: 'Dental Cleaning' },
    { id: 'INV003', patient: 'Michael Johnson', date: '2024-01-13', amount: 450, status: 'paid', service: 'X-Ray & Consultation' },
    { id: 'INV004', patient: 'Sarah Williams', date: '2024-01-12', amount: 75, status: 'overdue', service: 'Blood Test' },
];

export function Billing() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const filteredInvoices = mockInvoices.filter(inv => {
        const matchesSearch = inv.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inv.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || inv.status === filter;
        return matchesSearch && matchesFilter;
    });

    const totalRevenue = mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const pendingAmount = mockInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
    const overdueAmount = mockInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Billing</h1>
                    <p className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Manage invoices and payments</p>
                </div>
                <button className="bg-[#ff7a6b] text-white px-4 py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Total Revenue</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>${totalRevenue.toLocaleString()}</p>
                </div>
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Pending</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>${pendingAmount.toLocaleString()}</p>
                </div>
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Overdue</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>${overdueAmount.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex gap-4">
                <div className={cn("flex-1 rounded-xl flex items-center gap-3 px-4", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className={cn("flex-1 py-3 outline-none placeholder-gray-500 bg-transparent", isDark ? 'text-white' : 'text-gray-900')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={cn("px-4 py-3 rounded-xl outline-none border", isDark ? 'bg-[#1e1e1e] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200')}
                >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            {/* Invoices Table */}
            <div className={cn("rounded-2xl overflow-hidden", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <table className="w-full text-left text-sm">
                    <thead className={cn(isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-gray-50 text-gray-600')}>
                        <tr>
                            <th className="p-4">Invoice ID</th>
                            <th className="p-4">Patient</th>
                            <th className="p-4">Service</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={cn("divide-y", isDark ? 'divide-gray-800' : 'divide-gray-200')}>
                        {filteredInvoices.map((invoice) => (
                            <tr key={invoice.id} className={cn("transition-colors", isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50')}>
                                <td className={cn("p-4 font-medium", isDark ? 'text-white' : 'text-gray-900')}>#{invoice.id}</td>
                                <td className={cn("p-4", isDark ? 'text-gray-300' : 'text-gray-700')}>{invoice.patient}</td>
                                <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{invoice.service}</td>
                                <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{invoice.date}</td>
                                <td className={cn("p-4 font-medium", isDark ? 'text-white' : 'text-gray-900')}>${invoice.amount}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                        invoice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className={cn("p-2 rounded-lg transition-colors", isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900')}>
                                        <Download className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
