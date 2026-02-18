import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, TrendingDown, Box, X, Clock3, Pencil } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { createInventoryItem, fetchInventory, restockInventoryItem, updateInventoryItem } from '../lib/clinicApi';

export function Inventory() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [addForm, setAddForm] = useState({ name: '', category: 'General', unit: 'pcs', stock: '', threshold: '', costPrice: '', sellPrice: '', expiryDate: '' });
    const [restockForm, setRestockForm] = useState({ quantity: '', costPrice: '', expiryDate: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState(null);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const result = await fetchInventory();
            setItems(result.items || []);
        } catch (err) {
            setError(err.message || 'Failed to load inventory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const filteredItems = useMemo(() => (
        items.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ), [items, searchTerm]);

    const lowStockCount = items.filter((i) => i.stockStatus === 'low' || i.stockStatus === 'critical').length;
    const expiredCount = items.filter((i) => i.expiryStatus === 'expired').length;
    const expiringSoonCount = items.filter((i) => i.expiryStatus === 'expiring_soon').length;
    const totalItems = items.length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'bg-green-500/20 text-green-400';
            case 'low': return 'bg-yellow-500/20 text-yellow-400';
            case 'critical': return 'bg-red-500/20 text-red-400';
            case 'expired': return 'bg-red-600/25 text-red-300';
            case 'expiring_soon': return 'bg-orange-500/20 text-orange-300';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getExpiryLabel = (item) => {
        if (!item.expiryDate) return '-';
        if (item.expiryStatus === 'expired') {
            const days = Math.abs(Number(item.daysToExpiry || 0));
            return `Expired ${days}d ago`;
        }
        if (item.expiryStatus === 'expiring_soon') {
            return `${item.daysToExpiry}d left`;
        }
        return item.expiryDate;
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createInventoryItem({
                ...addForm,
                stock: Number(addForm.stock),
                threshold: Number(addForm.threshold),
                costPrice: Number(addForm.costPrice),
                sellPrice: Number(addForm.sellPrice),
                expiryDate: addForm.expiryDate || null,
            });
            setShowAddModal(false);
            setAddForm({ name: '', category: 'General', unit: 'pcs', stock: '', threshold: '', costPrice: '', sellPrice: '', expiryDate: '' });
            await loadInventory();
        } catch (err) {
            setError(err.message || 'Failed to add inventory item.');
        }
    };

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;
        setError('');
        try {
            await restockInventoryItem(selectedItem.id, {
                quantity: Number(restockForm.quantity),
                costPrice: Number(restockForm.costPrice || selectedItem.costPrice),
                expiryDate: restockForm.expiryDate || null,
            });
            setShowRestockModal(false);
            setSelectedItem(null);
            setRestockForm({ quantity: '', costPrice: '', expiryDate: '' });
            await loadInventory();
        } catch (err) {
            setError(err.message || 'Failed to restock item.');
        }
    };

    const openEditModal = (item) => {
        setEditForm({
            id: item.id,
            name: item.name,
            category: item.category,
            unit: item.unit,
            threshold: String(item.threshold || ''),
            costPrice: String(item.costPrice || ''),
            sellPrice: String(item.sellPrice || ''),
            expiryDate: item.expiryDate || '',
        });
        setShowEditModal(true);
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await updateInventoryItem(editForm.id, {
                name: editForm.name,
                category: editForm.category,
                unit: editForm.unit,
                threshold: Number(editForm.threshold),
                costPrice: Number(editForm.costPrice),
                sellPrice: Number(editForm.sellPrice),
                expiryDate: editForm.expiryDate || null,
            });
            setShowEditModal(false);
            setEditForm(null);
            await loadInventory();
        } catch (err) {
            setError(err.message || 'Failed to update inventory item.');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                    <h1 className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>Inventory</h1>
                    <p className={cn('text-sm sm:text-base', isDark ? 'text-gray-400' : 'text-gray-600')}>Track and manage medical supplies</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto bg-[#ff7a6b] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /><span className="text-sm sm:text-base">Add Item</span>
                </button>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            {lowStockCount > 0 && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-yellow-400" /></div>
                    <div className="flex-1"><p className={cn('font-medium text-sm sm:text-base', isDark ? 'text-white' : 'text-gray-900')}>Low Stock Alert</p><p className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{lowStockCount} items are below minimum threshold and need restocking</p></div>
                </div>
            )}

            {(expiredCount > 0 || expiringSoonCount > 0) && (
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0"><Clock3 className="w-5 h-5 text-red-300" /></div>
                    <div className="flex-1">
                        <p className={cn('font-medium text-sm sm:text-base', isDark ? 'text-white' : 'text-gray-900')}>Expiry Alert</p>
                        <p className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                            {expiredCount} expired, {expiringSoonCount} expiring soon (within 30 days).
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[{ icon: Box, color: 'blue', label: 'Total Items', value: totalItems },
                { icon: CheckCircle, color: 'green', label: 'In Stock', value: items.filter((i) => i.stockStatus === 'good').length },
                { icon: TrendingDown, color: 'yellow', label: 'Low Stock', value: lowStockCount },
                { icon: AlertTriangle, color: 'red', label: 'Expired', value: expiredCount },
                ].map(({ icon: Icon, color, label, value }) => (
                    <div key={label} className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-colors', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200 shadow-sm')}>
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${color}-400`} />
                            </div>
                            <span className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{label}</span>
                        </div>
                        {loading
                            ? <div className="skeleton-shimmer h-8 w-16 mt-1" />
                            : <p className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>{value}</p>
                        }
                    </div>
                ))}
            </div>

            <div className={cn('rounded-xl flex items-center gap-3 px-4 transition-colors dashboard-reveal reveal-delay-2', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200 shadow-sm')}>
                <Search className="w-5 h-5 text-gray-500" />
                <input type="text" placeholder="Search inventory items..." className={cn('flex-1 py-3 outline-none placeholder-gray-500 bg-transparent text-sm', isDark ? 'text-white' : 'text-gray-900')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className={cn('rounded-2xl overflow-hidden overflow-x-auto dashboard-reveal reveal-delay-3', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                {loading ? (
                    <div>
                        <div className={cn('px-4 py-3 border-b', isDark ? 'bg-[#0f0f0f] border-gray-800' : 'bg-gray-50 border-gray-200')}>
                            <div className="grid grid-cols-8 gap-4">
                                {[...Array(8)].map((_, i) => <div key={i} className="skeleton-shimmer h-4" />)}
                            </div>
                        </div>
                        <div className="divide-y divide-gray-800/40">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="px-4 py-4 grid grid-cols-8 gap-4 items-center">
                                    <div className="flex items-center gap-3 col-span-1">
                                        <div className="skeleton-shimmer w-10 h-10 rounded-xl flex-shrink-0" />
                                        <div className="skeleton-shimmer h-4 flex-1" />
                                    </div>
                                    <div className="skeleton-shimmer h-4" />
                                    <div className="skeleton-shimmer h-4" />
                                    <div className="skeleton-shimmer h-4" />
                                    <div className="skeleton-shimmer h-4" />
                                    <div className="skeleton-shimmer h-4" />
                                    <div className="skeleton-shimmer h-6 w-16 rounded-full" />
                                    <div className="skeleton-shimmer h-8 w-16 rounded-lg ml-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className={cn(isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-gray-50 text-gray-600')}><tr><th className="p-4">Item</th><th className="p-4">Category</th><th className="p-4">Current Stock</th><th className="p-4">Threshold</th><th className="p-4">Expiry</th><th className="p-4">Sell Price</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
                        <tbody className={cn('divide-y', isDark ? 'divide-gray-800' : 'divide-gray-200')}>
                            {filteredItems.map((item) => (
                                <tr key={item.id} className={cn('transition-colors', isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50')}>
                                    <td className="p-4"><div className="flex items-center gap-3"><div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', isDark ? 'bg-[#0f0f0f]' : 'bg-gray-100')}><Package className={cn('w-5 h-5', isDark ? 'text-gray-400' : 'text-gray-600')} /></div><span className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>{item.name}</span></div></td>
                                    <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>{item.category}</td>
                                    <td className={cn('p-4', isDark ? 'text-white' : 'text-gray-900')}>{item.stock} <span className="text-gray-500">{item.unit}</span></td>
                                    <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>{item.threshold}</td>
                                    <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>{getExpiryLabel(item)}</td>
                                    <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>Rs{item.sellPrice}</td>
                                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</span></td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Edit item"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { setSelectedItem(item); setRestockForm({ quantity: '', costPrice: String(item.costPrice || ''), expiryDate: item.expiryDate || '' }); setShowRestockModal(true); }} className="px-3 py-1.5 bg-[#ff7a6b]/20 text-[#ff7a6b] rounded-lg hover:bg-[#ff7a6b]/30 transition-colors text-sm">Restock</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-2xl p-6 w-full max-w-md border shadow-2xl transition-colors",
                        isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Add Inventory Item</h2>
                            <button onClick={() => setShowAddModal(false)} className={cn("transition-colors", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Item Name</label>
                                <input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="e.g. Surgical Masks" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Category</label>
                                    <input required value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="General" />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Unit</label>
                                    <input required value={addForm.unit} onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="pcs" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Initial Stock</label>
                                    <input required type="number" value={addForm.stock} onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="0" />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Threshold</label>
                                    <input required type="number" value={addForm.threshold} onChange={(e) => setAddForm({ ...addForm, threshold: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="10" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Cost Price</label>
                                    <input required type="number" step="0.01" value={addForm.costPrice} onChange={(e) => setAddForm({ ...addForm, costPrice: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="0.00" />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Sell Price (Rs)</label>
                                    <input required type="number" step="0.01" value={addForm.sellPrice} onChange={(e) => setAddForm({ ...addForm, sellPrice: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Expiry Date (optional)</label>
                                <input type="date" value={addForm.expiryDate} onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} />
                            </div>
                            <button className="w-full rounded-xl bg-[#ff7a6b] py-3 text-white font-bold hover:bg-[#ff6b5b] transition-all active:scale-[0.98] shadow-lg shadow-[#ff7a6b]/20 mt-2">
                                Add Item
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showRestockModal && selectedItem && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-sm border border-gray-800">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-white text-lg font-semibold">Restock {selectedItem.name}</h2><button onClick={() => setShowRestockModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleRestock} className="space-y-3">
                            <input required type="number" value={restockForm.quantity} onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })} className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" placeholder="Quantity" />
                            <input required type="number" step="0.01" value={restockForm.costPrice} onChange={(e) => setRestockForm({ ...restockForm, costPrice: e.target.value })} className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" placeholder="Unit Cost" />
                            <input type="date" value={restockForm.expiryDate} onChange={(e) => setRestockForm({ ...restockForm, expiryDate: e.target.value })} className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" />
                            <button className="w-full rounded-xl bg-[#ff7a6b] py-2.5 text-white hover:bg-[#ff6b5b]">Update Stock</button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Inventory Modal ── */}
            {showEditModal && editForm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-2xl p-6 w-full max-w-md border shadow-2xl transition-colors",
                        isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Edit Item</h2>
                            <button onClick={() => setShowEditModal(false)} className={cn("transition-colors", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditItem} className="space-y-4">
                            <div>
                                <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Item Name</label>
                                <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Category</label>
                                    <input required value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Unit</label>
                                    <input required value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Cost Price</label>
                                    <input type="number" step="0.01" value={editForm.costPrice} onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Sell Price (Rs)</label>
                                    <input type="number" step="0.01" value={editForm.sellPrice} onChange={(e) => setEditForm({ ...editForm, sellPrice: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Low Stock Threshold</label>
                                    <input type="number" value={editForm.threshold} onChange={(e) => setEditForm({ ...editForm, threshold: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Expiry Date</label>
                                    <input type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} />
                                </div>
                            </div>
                            <button type="submit" className="w-full rounded-xl bg-[#ff7a6b] py-3 text-white font-bold hover:bg-[#ff6b5b] transition-all active:scale-[0.98] shadow-lg shadow-[#ff7a6b]/20 mt-2">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
