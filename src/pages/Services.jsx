import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Stethoscope, Clock, DollarSign, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { createService, deleteService, fetchServices } from '../lib/clinicApi';

export function Services() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [newService, setNewService] = useState({
        name: '',
        price: '',
        duration: '',
    });

    const loadServices = async () => {
        setLoading(true);
        try {
            const result = await fetchServices();
            setServices(result.services || []);
        } catch (err) {
            setError(err.message || 'Failed to load services.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const filteredServices = useMemo(() => (
        services.filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [services, searchTerm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createService({
                ...newService,
                price: parseFloat(newService.price),
                duration: parseInt(newService.duration, 10),
            });
            setIsModalOpen(false);
            setNewService({ name: '', price: '', duration: '' });
            await loadServices();
        } catch (err) {
            setError(err.message || 'Failed to create service.');
        }
    };

    const handleDelete = async (serviceId) => {
        setError('');
        try {
            await deleteService(serviceId);
            setServices((prev) => prev.filter((item) => item.id !== serviceId));
        } catch (err) {
            setError(err.message || 'Failed to delete service.');
        }
    };

    const totalServices = services.length;
    const avgPrice = totalServices > 0
        ? Math.round(services.reduce((sum, s) => sum + Number(s.price || 0), 0) / totalServices)
        : 0;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 dashboard-reveal">
                <div>
                    <h1 className={cn("text-2xl sm:text-4xl font-black tracking-tight", isDark ? 'text-white' : 'text-[#512c31]')}>Services</h1>
                    <p className={cn("text-sm sm:text-base font-bold uppercase tracking-widest mt-1", isDark ? 'text-white/40' : 'text-[#512c31]/60')}>Manage clinic services and pricing</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-[#512c31] text-white px-4 py-3 sm:px-6 sm:py-3 rounded-2xl sm:rounded-[1.5rem] font-bold tracking-wide shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-[#e8919a] flex items-center justify-center gap-2 transition-all">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Add Service</span>
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 dashboard-reveal reveal-delay-2">
                <div className={cn('relative rounded-[2rem] p-6 transition-all border-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl group', isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                    <div className="flex items-center gap-4 mb-4"><div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner pt-0.5 transition-transform group-hover:scale-110", isDark ? "bg-[#0f0f0f]" : "bg-[#fef9f3]")}><Stethoscope className="w-6 h-6 text-[#e8919a] dark:text-blue-400" /></div></div>
                    <span className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 block', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Total Services</span>
                    {loading ? <div className="skeleton-shimmer h-8 w-16 mt-1" /> : <p className={cn('text-3xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>{totalServices}</p>}
                </div>
                <div className={cn('relative rounded-[2rem] p-6 transition-all border-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl group', isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                    <div className="flex items-center gap-4 mb-4"><div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner pt-0.5 transition-transform group-hover:scale-110", isDark ? "bg-[#0f0f0f]" : "bg-[#fef9f3]")}><DollarSign className="w-6 h-6 text-emerald-500 dark:text-green-400" /></div></div>
                    <span className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 block', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Avg. Price</span>
                    {loading ? <div className="skeleton-shimmer h-8 w-20 mt-1" /> : <p className={cn('text-3xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>Rs{avgPrice}</p>}
                </div>
                <div className={cn('relative rounded-[2rem] p-6 transition-all border-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl group', isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                    <div className="flex items-center gap-4 mb-4"><div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner pt-0.5 transition-transform group-hover:scale-110", isDark ? "bg-[#0f0f0f]" : "bg-[#fef9f3]")}><Clock className="w-6 h-6 text-violet-500 dark:text-purple-400" /></div></div>
                    <span className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 block', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Avg. Duration</span>
                    {loading ? <div className="skeleton-shimmer h-8 w-20 mt-1" /> : <p className={cn('text-3xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>{Math.round(services.reduce((sum, s) => sum + Number(s.duration || 0), 0) / Math.max(services.length, 1))} min</p>}
                </div>
            </div>

            <div className={cn('rounded-2xl sm:rounded-[1.5rem] flex items-center gap-3 px-5 sm:px-6 transition-colors border-4 shadow-lg dashboard-reveal reveal-delay-3', isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                <Search className={cn("w-5 h-5", isDark ? "text-gray-400" : "text-[#512c31]/60")} />
                <input type="text" placeholder="Search services..." className={cn('flex-1 py-4 sm:py-5 outline-none placeholder:font-bold placeholder:uppercase placeholder:tracking-widest bg-transparent text-sm font-bold', isDark ? 'text-white placeholder-gray-500' : 'text-[#512c31] placeholder-[#512c31]/40')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className={cn('rounded-[2.5rem] overflow-hidden border-4 shadow-2xl dashboard-reveal reveal-delay-4', isDark ? 'bg-[#1e1e1e] border-white/5 shadow-black/50' : 'bg-white border-white/50 shadow-[#512c31]/5')}>
                {loading ? (
                    <div>
                        <div className={cn('px-4 py-3 border-b', isDark ? 'bg-[#0f0f0f] border-gray-800' : 'bg-gray-50 border-gray-200')}>
                            <div className="grid grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => <div key={i} className="skeleton-shimmer h-4" />)}
                            </div>
                        </div>
                        <div className="divide-y divide-gray-800/40">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="px-4 py-4 grid grid-cols-4 gap-4 items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="skeleton-shimmer w-10 h-10 rounded-xl flex-shrink-0" />
                                        <div className="skeleton-shimmer h-4 flex-1" />
                                    </div>
                                    <div className="skeleton-shimmer h-4" />
                                    <div className="skeleton-shimmer h-4" />
                                    <div className="skeleton-shimmer h-8 w-8 rounded-lg ml-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className={cn("font-black uppercase tracking-widest text-[10px] sm:text-xs", isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}>
                            <tr><th className="px-5 sm:px-6 py-5">Service Name</th><th className="px-5 sm:px-6 py-5">Duration</th><th className="px-5 sm:px-6 py-5">Price</th><th className="px-5 sm:px-6 py-5 text-right">Actions</th></tr>
                        </thead>
                        <tbody className={cn('divide-y', isDark ? 'divide-gray-800' : 'divide-gray-50')}>
                            {filteredServices.map((service) => (
                                <tr key={service.id} className={cn('transition-all duration-300 group', isDark ? 'hover:bg-[#252525]' : 'hover:bg-[#fef9f3]')}>
                                    <td className="px-5 sm:px-6 py-5"><div className="flex items-center gap-3"><div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform', isDark ? 'bg-[#0f0f0f]' : 'bg-white')}><Stethoscope className={cn("w-5 h-5", isDark ? "text-[#e8919a]" : "text-[#512c31]")} /></div><span className={cn('font-black text-sm', isDark ? 'text-white' : 'text-[#512c31]')}>{service.name}</span></div></td>
                                    <td className={cn('px-5 sm:px-6 py-5 text-xs font-bold uppercase tracking-widest', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>{service.duration} min</td>
                                    <td className={cn('px-5 sm:px-6 py-5 font-black text-sm', isDark ? 'text-white' : 'text-[#512c31]')}>Rs{service.price}</td>
                                    <td className="px-5 sm:px-6 py-5 text-right"><button onClick={() => handleDelete(service.id)} className={cn('p-2 rounded-xl transition-colors shadow-sm', isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300' : 'bg-red-50 text-red-500 hover:bg-red-100')}><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-[2.5rem] p-8 w-full max-w-md border-4 shadow-2xl transition-all",
                        isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-white/50"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Add New Service</h2>
                            <button onClick={() => setIsModalOpen(false)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-[#fef9f3] text-[#512c31] hover:bg-[#e8919a] hover:text-white")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Service Name</label>
                                <input required type="text" className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="e.g. Consultation" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Price (Rs)</label>
                                    <input required type="number" className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} placeholder="0.00" />
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Duration (min)</label>
                                    <input required type="number" className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} placeholder="30" />
                                </div>
                            </div>
                            <button type="submit" className="w-full rounded-2xl bg-[#512c31] py-4 text-white font-bold tracking-widest uppercase text-sm hover:bg-[#e8919a] hover:scale-[1.02] transition-all shadow-xl hover:shadow-2xl mt-4">Add Service</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
