import { useState } from 'react';
import { Plus, Search, Stethoscope, Clock, DollarSign, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

export function Services() {
    const { services, addService, deleteService, theme } = useStore();
    const isDark = theme === 'dark';
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newService, setNewService] = useState({
        name: '',
        price: '',
        duration: '',
    });

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        addService({
            ...newService,
            price: parseFloat(newService.price),
            duration: parseInt(newService.duration),
        });
        setIsModalOpen(false);
        setNewService({ name: '', price: '', duration: '' });
    };

    const totalServices = services.length;
    const avgPrice = Math.round(services.reduce((sum, s) => sum + s.price, 0) / totalServices);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Services</h1>
                    <p className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Manage clinic services and pricing</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#ff7a6b] text-white px-4 py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Service
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Total Services</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>{totalServices}</p>
                </div>
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Avg. Price</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>${avgPrice}</p>
                </div>
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Avg. Duration</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>35 min</p>
                </div>
            </div>

            {/* Search */}
            <div className={cn("rounded-xl flex items-center gap-3 px-4", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <Search className="w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search services..."
                    className={cn("flex-1 py-3 outline-none placeholder-gray-500 bg-transparent", isDark ? 'text-white' : 'text-gray-900')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Services List */}
            <div className={cn("rounded-2xl overflow-hidden", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <table className="w-full text-left text-sm">
                    <thead className={cn(isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-gray-50 text-gray-600')}>
                        <tr>
                            <th className="p-4">Service Name</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4">Price</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={cn("divide-y", isDark ? 'divide-gray-800' : 'divide-gray-200')}>
                        {filteredServices.map((service) => (
                            <tr key={service.id} className={cn("transition-colors", isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50')}>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? 'bg-[#0f0f0f]' : 'bg-gray-100')}>
                                            <Stethoscope className="w-5 h-5 text-[#ff7a6b]" />
                                        </div>
                                        <span className={cn("font-medium", isDark ? 'text-white' : 'text-gray-900')}>{service.name}</span>
                                    </div>
                                </td>
                                <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{service.duration} min</td>
                                <td className={cn("p-4 font-medium", isDark ? 'text-white' : 'text-gray-900')}>${service.price}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className={cn("p-2 rounded-lg transition-colors", isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900')}>
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => deleteService(service.id)}
                                            className={cn("p-2 rounded-lg transition-colors", isDark ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-600 hover:text-red-500')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Service Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className={cn("rounded-2xl p-6 w-full max-w-md shadow-2xl border", isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200')}>
                        <h2 className={cn("text-xl font-bold mb-6", isDark ? 'text-white' : 'text-gray-900')}>Add New Service</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Service Name</label>
                                <input
                                    required
                                    type="text"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900')}
                                    value={newService.name}
                                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Price ($)</label>
                                    <input
                                        required
                                        type="number"
                                        className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900')}
                                        value={newService.price}
                                        onChange={e => setNewService({ ...newService, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Duration (min)</label>
                                    <input
                                        required
                                        type="number"
                                        className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900')}
                                        value={newService.duration}
                                        onChange={e => setNewService({ ...newService, duration: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className={cn("px-4 py-2 rounded-xl transition-colors", isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] transition-colors"
                                >
                                    Add Service
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
