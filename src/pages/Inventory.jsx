import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, TrendingDown, Box, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { createInventoryItem, fetchInventory, restockInventoryItem } from '../lib/clinicApi';

export function Inventory() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [addForm, setAddForm] = useState({ name: '', category: 'General', unit: 'pcs', stock: '', threshold: '', costPrice: '', sellPrice: '' });
    const [restockForm, setRestockForm] = useState({ quantity: '', costPrice: '' });

    const loadInventory = async () => {
        try {
            const result = await fetchInventory();
            setItems(result.items || []);
        } catch (err) {
            setError(err.message || 'Failed to load inventory.');
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

    const lowStockCount = items.filter((i) => i.status === 'low' || i.status === 'critical').length;
    const totalItems = items.length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'bg-green-500/20 text-green-400';
            case 'low': return 'bg-yellow-500/20 text-yellow-400';
            case 'critical': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
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
            });
            setShowAddModal(false);
            setAddForm({ name: '', category: 'General', unit: 'pcs', stock: '', threshold: '', costPrice: '', sellPrice: '' });
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
            });
            setShowRestockModal(false);
            setSelectedItem(null);
            setRestockForm({ quantity: '', costPrice: '' });
            await loadInventory();
        } catch (err) {
            setError(err.message || 'Failed to restock item.');
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}><div className="flex items-center gap-2 sm:gap-3 mb-2"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Box className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" /></div><span className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Total Items</span></div><p className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>{totalItems}</p></div>
                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}><div className="flex items-center gap-2 sm:gap-3 mb-2"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /></div><span className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>In Stock</span></div><p className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>{totalItems - lowStockCount}</p></div>
                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}><div className="flex items-center gap-2 sm:gap-3 mb-2"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center"><TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /></div><span className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Low Stock</span></div><p className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>{lowStockCount}</p></div>
                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}><div className="flex items-center gap-2 sm:gap-3 mb-2"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/20 flex items-center justify-center"><AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /></div><span className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Critical</span></div><p className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>{items.filter((i) => i.status === 'critical').length}</p></div>
            </div>

            <div className={cn('rounded-xl flex items-center gap-3 px-4', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <Search className="w-5 h-5 text-gray-500" />
                <input type="text" placeholder="Search inventory items..." className={cn('flex-1 py-3 outline-none placeholder-gray-500 bg-transparent text-sm', isDark ? 'text-white' : 'text-gray-900')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className={cn('rounded-2xl overflow-hidden', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <table className="w-full text-left text-sm">
                    <thead className={cn(isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-gray-50 text-gray-600')}><tr><th className="p-4">Item</th><th className="p-4">Category</th><th className="p-4">Current Stock</th><th className="p-4">Threshold</th><th className="p-4">Sell Price</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
                    <tbody className={cn('divide-y', isDark ? 'divide-gray-800' : 'divide-gray-200')}>
                        {filteredItems.map((item) => (
                            <tr key={item.id} className={cn('transition-colors', isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50')}>
                                <td className="p-4"><div className="flex items-center gap-3"><div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', isDark ? 'bg-[#0f0f0f]' : 'bg-gray-100')}><Package className={cn('w-5 h-5', isDark ? 'text-gray-400' : 'text-gray-600')} /></div><span className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>{item.name}</span></div></td>
                                <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>{item.category}</td>
                                <td className={cn('p-4', isDark ? 'text-white' : 'text-gray-900')}>{item.stock} <span className="text-gray-500">{item.unit}</span></td>
                                <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>{item.threshold}</td>
                                <td className={cn('p-4', isDark ? 'text-gray-400' : 'text-gray-600')}>${item.sellPrice}</td>
                                <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</span></td>
                                <td className="p-4 text-right"><button onClick={() => { setSelectedItem(item); setRestockForm({ quantity: '', costPrice: String(item.costPrice || '') }); setShowRestockModal(true); }} className="px-3 py-1.5 bg-[#ff7a6b]/20 text-[#ff7a6b] rounded-lg hover:bg-[#ff7a6b]/30 transition-colors text-sm">Restock</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md border border-gray-800">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-white text-lg font-semibold">Add Inventory Item</h2><button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleAddItem} className="space-y-3">
                            <input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" placeholder="Item Name" />
                            <div className="grid grid-cols-2 gap-3">
                                <input required value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} className="rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" placeholder="Category" />
                                <input required value={addForm.unit} onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })} className="rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" placeholder="Unit" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input required type="number" value={addForm.stock} onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} className="rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" placeholder="Initial Stock" />
                                <input required type="number" value={addForm.threshold} onChange={(e) => setAddForm({ ...addForm, threshold: e.target.value })} className="rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" placeholder="Threshold" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input required type="number" step="0.01" value={addForm.costPrice} onChange={(e) => setAddForm({ ...addForm, costPrice: e.target.value })} className="rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" placeholder="Cost Price" />
                                <input required type="number" step="0.01" value={addForm.sellPrice} onChange={(e) => setAddForm({ ...addForm, sellPrice: e.target.value })} className="rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white" placeholder="Sell Price" />
                            </div>
                            <button className="w-full rounded-xl bg-[#ff7a6b] py-2.5 text-white hover:bg-[#ff6b5b]">Add Item</button>
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
                            <button className="w-full rounded-xl bg-[#ff7a6b] py-2.5 text-white hover:bg-[#ff6b5b]">Update Stock</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
