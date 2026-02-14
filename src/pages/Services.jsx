import { useState } from 'react';
import { Plus, Search, Stethoscope, Clock, DollarSign, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function Services() {
    const { services, addService, deleteService } = useStore();
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
                    <h1 className="text-2xl font-bold text-white">Services</h1>
                    <p className="text-gray-400">Manage clinic services and pricing</p>
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
                <div className="bg-[#1e1e1e] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Services</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{totalServices}</p>
                </div>
                <div className="bg-[#1e1e1e] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Avg. Price</span>
                    </div>
                    <p className="text-2xl font-bold text-white">${avgPrice}</p>
                </div>
                <div className="bg-[#1e1e1e] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Avg. Duration</span>
                    </div>
                    <p className="text-2xl font-bold text-white">35 min</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-[#1e1e1e] rounded-xl flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search services..."
                    className="flex-1 bg-transparent py-3 outline-none text-white placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Services List */}
            <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#0f0f0f] text-gray-400">
                        <tr>
                            <th className="p-4">Service Name</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4">Price</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredServices.map((service) => (
                            <tr key={service.id} className="hover:bg-[#252525] transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#0f0f0f] flex items-center justify-center">
                                            <Stethoscope className="w-5 h-5 text-[#ff7a6b]" />
                                        </div>
                                        <span className="text-white font-medium">{service.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400">{service.duration} min</td>
                                <td className="p-4 text-white font-medium">${service.price}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => deleteService(service.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
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
                    <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-6">Add New Service</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Service Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    value={newService.name}
                                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Price ($)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                        value={newService.price}
                                        onChange={e => setNewService({ ...newService, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Duration (min)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                        value={newService.duration}
                                        onChange={e => setNewService({ ...newService, duration: e.target.value })}
                                    />
                                </div>
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
