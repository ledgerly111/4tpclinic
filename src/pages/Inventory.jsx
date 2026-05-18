import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, TrendingDown, Box, X, Clock3, Pencil, Trash2, Layers3 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { createInventoryItem, deleteInventoryBatch, deleteInventoryItem, fetchInventory, restockInventoryItem, updateInventoryBatch, updateInventoryItem } from '../lib/clinicApi';
import { useAuth } from '../context/AuthContext';
import { hasEditAccess } from '../lib/permissions';
import { useTenant } from '../context/TenantContext';

const PAGE_SIZE = 25;
const INVENTORY_CATEGORIES = ['Skin Care', 'Hair Care', 'General Medicine'];

function normalizePercent(value) {
    const parsed = Number(value || 0);
    if (!Number.isFinite(parsed)) return 0;
    return Number(Math.min(100, Math.max(0, parsed)).toFixed(2));
}

function calculateRateFromMrpAndGst(mrp, gstPercent) {
    const mrpValue = Number(mrp || 0);
    const gstValue = normalizePercent(gstPercent);
    if (mrpValue <= 0) return 0;
    return Number((mrpValue - (mrpValue * (gstValue / 100))).toFixed(2));
}

function calculateInventoryPricing(form) {
    const unitRate = calculateRateFromMrpAndGst(form.costPrice, form.gstPercent);
    if (form.packageType === 'single') {
        return {
            unitRate,
            stripRate: unitRate,
            individualRate: unitRate,
            gstPercent: normalizePercent(form.gstPercent),
        };
    }
    const stripsPerUnit = Math.max(1, Number(form.stripsPerUnit || 1));
    const tabletsPerStrip = Math.max(1, Number(form.tabletsPerStrip || 1));
    const stripRate = Number((unitRate / stripsPerUnit).toFixed(2));
    const individualRate = Number((stripRate / tabletsPerStrip).toFixed(2));
    return {
        unitRate,
        stripRate,
        individualRate,
        gstPercent: normalizePercent(form.gstPercent),
    };
}

export function Inventory() {
    const { theme } = useStore();
    const { session } = useAuth();
    const { selectedClinicId } = useTenant();
    const isDark = theme === 'dark';
    const canEditInventory = hasEditAccess(session, 'edit_inventory');
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const initialAddForm = { name: '', category: 'General Medicine', packageType: 'box', unit: 'box', stock: '', stripsPerUnit: '', tabletsPerStrip: '', threshold: '', costPrice: '', sellPrice: '', stripSellPrice: '', individualSellPrice: '', gstPercent: '', batchNumber: '', expiryDate: '' };
    const [addForm, setAddForm] = useState(initialAddForm);
    const [restockForm, setRestockForm] = useState({ quantity: '', costPrice: '', gstPercent: '', batchNumber: '', expiryDate: '' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [showBatchEditModal, setShowBatchEditModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [batchEditForm, setBatchEditForm] = useState({ quantity: '', costPrice: '', gstPercent: '', batchNumber: '', expiryDate: '' });

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
    }, [selectedClinicId]);

    const filteredItems = useMemo(() => (
        items.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ), [items, searchTerm]);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [searchTerm]);

    const visibleItems = useMemo(() => (
        filteredItems.slice(0, visibleCount)
    ), [filteredItems, visibleCount]);

    const lowStockCount = items.filter((i) => i.stockStatus === 'low' || i.stockStatus === 'critical').length;
    const expiredCount = items.filter((i) => i.expiryStatus === 'expired' || i.batches?.some((batch) => batch.expiryStatus === 'expired')).length;
    const expiringSoonCount = items.filter((i) => i.expiryStatus === 'expiring_soon' || i.batches?.some((batch) => batch.expiryStatus === 'expiring_soon')).length;
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

    const getBatchExpiryLabel = (batch) => {
        if (!batch?.expiryDate) return 'No expiry';
        if (batch.expiryStatus === 'expired') return `Expired ${Math.abs(Number(batch.daysToExpiry || 0))}d ago`;
        if (batch.expiryStatus === 'expiring_soon') return `${batch.daysToExpiry}d left`;
        return batch.expiryDate;
    };

    const getPricingLabel = (item) => {
        if (item.packageType === 'single') return `MRP Rs${item.costPrice} / Single Rate Rs${item.sellPrice}`;
        return `MRP Rs${item.costPrice} / Box Rate Rs${item.sellPrice} / Strip Rate Rs${item.stripSellPrice || item.sellPrice} / Tablet Rate Rs${item.individualSellPrice || item.stripSellPrice || item.sellPrice}`;
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        setError('');
        if (!canEditInventory) {
            setError('You do not have permission to edit inventory.');
            return;
        }
        try {
            const pricing = calculateInventoryPricing(addForm);
            await createInventoryItem({
                ...addForm,
                packageType: addForm.packageType,
                unit: addForm.packageType === 'single' ? 'single' : 'box',
                stock: Number(addForm.stock),
                threshold: Number(addForm.threshold),
                costPrice: Number(addForm.costPrice),
                sellPrice: pricing.unitRate,
                stripsPerUnit: addForm.packageType === 'single' ? 1 : Number(addForm.stripsPerUnit || 1),
                tabletsPerStrip: addForm.packageType === 'single' ? 1 : Number(addForm.tabletsPerStrip || 1),
                stripSellPrice: pricing.stripRate,
                individualSellPrice: pricing.individualRate,
                gstPercent: pricing.gstPercent,
                batchNumber: addForm.batchNumber || 'OPENING',
                expiryDate: addForm.expiryDate || null,
            });
            setShowAddModal(false);
            setAddForm(initialAddForm);
            await loadInventory();
        } catch (err) {
            setError(err.message || 'Failed to add inventory item.');
        }
    };

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;
        setError('');
        if (!canEditInventory) {
            setError('You do not have permission to edit inventory.');
            return;
        }
        try {
            await restockInventoryItem(selectedItem.id, {
                quantity: Number(restockForm.quantity),
                costPrice: Number(restockForm.costPrice || selectedItem.costPrice),
                gstPercent: Number(restockForm.gstPercent || selectedItem.gstPercent || 0),
                batchNumber: restockForm.batchNumber || 'RESTOCK',
                expiryDate: restockForm.expiryDate || null,
            });
            setShowRestockModal(false);
            setSelectedItem(null);
            setRestockForm({ quantity: '', costPrice: '', gstPercent: '', batchNumber: '', expiryDate: '' });
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
            packageType: item.packageType || 'box',
            unit: item.unit,
            stripsPerUnit: String(item.stripsPerUnit || 1),
            tabletsPerStrip: String(item.tabletsPerStrip || 1),
            threshold: String(item.threshold || ''),
            costPrice: String(item.costPrice || ''),
            sellPrice: String(item.sellPrice || ''),
            stripSellPrice: String(item.stripSellPrice || item.sellPrice || ''),
            individualSellPrice: String(item.individualSellPrice || item.stripSellPrice || item.sellPrice || ''),
            gstPercent: String(item.gstPercent || ''),
            expiryDate: item.expiryDate || '',
        });
        setShowEditModal(true);
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        setError('');
        if (!canEditInventory) {
            setError('You do not have permission to edit inventory.');
            return;
        }
        try {
            const pricing = calculateInventoryPricing(editForm);
            await updateInventoryItem(editForm.id, {
                name: editForm.name,
                category: editForm.category,
                packageType: editForm.packageType,
                unit: editForm.packageType === 'single' ? 'single' : 'box',
                threshold: Number(editForm.threshold),
                costPrice: Number(editForm.costPrice),
                sellPrice: pricing.unitRate,
                stripsPerUnit: editForm.packageType === 'single' ? 1 : Number(editForm.stripsPerUnit || 1),
                tabletsPerStrip: editForm.packageType === 'single' ? 1 : Number(editForm.tabletsPerStrip || 1),
                stripSellPrice: pricing.stripRate,
                individualSellPrice: pricing.individualRate,
                gstPercent: pricing.gstPercent,
                expiryDate: editForm.expiryDate || null,
            });
            setShowEditModal(false);
            setEditForm(null);
            await loadInventory();
        } catch (err) {
            setError(err.message || 'Failed to update inventory item.');
        }
    };

    const handleDeleteItem = async (item) => {
        if (!canEditInventory) {
            setError('You do not have permission to edit inventory.');
            return;
        }
        const ok = window.confirm(`Delete ${item.name} and all its batches? This cannot be undone.`);
        if (!ok) return;
        setError('');
        try {
            await deleteInventoryItem(item.id);
            await loadInventory();
        } catch (err) {
            setError(err.message || 'Failed to delete inventory item.');
        }
    };

    const openBatchEditModal = (item, batch) => {
        setSelectedItem(item);
        setSelectedBatch(batch);
        setBatchEditForm({
            quantity: String(item.packageType === 'single' ? batch.stripStock || 0 : batch.stock || 0),
            costPrice: String(batch.costPrice || item.costPrice || ''),
            gstPercent: String(batch.gstPercent ?? item.gstPercent ?? ''),
            batchNumber: batch.batchNumber || '',
            expiryDate: batch.expiryDate || '',
        });
        setShowBatchEditModal(true);
    };

    const handleEditBatch = async (e) => {
        e.preventDefault();
        if (!selectedItem || !selectedBatch) return;
        setError('');
        if (!canEditInventory) {
            setError('You do not have permission to edit inventory.');
            return;
        }
        try {
            await updateInventoryBatch(selectedItem.id, selectedBatch.id, {
                quantity: Number(batchEditForm.quantity),
                costPrice: Number(batchEditForm.costPrice || selectedBatch.costPrice || 0),
                gstPercent: Number(batchEditForm.gstPercent || 0),
                batchNumber: batchEditForm.batchNumber || 'BATCH',
                expiryDate: batchEditForm.expiryDate || null,
            });
            setShowBatchEditModal(false);
            setSelectedBatch(null);
            setBatchEditForm({ quantity: '', costPrice: '', gstPercent: '', batchNumber: '', expiryDate: '' });
            await loadInventory();
        } catch (err) {
            setError(err.message || 'Failed to update batch.');
        }
    };

    const handleDeleteBatch = async (item, batch) => {
        if (!canEditInventory) {
            setError('You do not have permission to edit inventory.');
            return;
        }
        const ok = window.confirm(`Delete batch ${batch.batchNumber} from ${item.name}? This cannot be undone.`);
        if (!ok) return;
        setError('');
        try {
            await deleteInventoryBatch(item.id, batch.id);
            await loadInventory();
        } catch (err) {
            setError(err.message || 'Failed to delete batch.');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 dashboard-reveal">
                <div>
                    <h1 className={cn("text-2xl sm:text-4xl font-black tracking-tight", isDark ? 'text-white' : 'text-[#512c31]')}>Inventory</h1>
                    <p className={cn("text-sm sm:text-base font-bold uppercase tracking-widest mt-1", isDark ? 'text-white/40' : 'text-[#512c31]/60')}>Track and manage medical supplies</p>
                </div>
                {canEditInventory && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full sm:w-auto bg-[#512c31] text-white px-4 py-3 sm:px-6 sm:py-3 rounded-2xl sm:rounded-[1.5rem] font-bold tracking-wide hover:bg-[#e8919a] hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Add Item</span>
                    </button>
                )}
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            {lowStockCount > 0 && (
                <div className="bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-200 dark:border-orange-500/30 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm dashboard-reveal">
                    <div className="w-12 h-12 rounded-2xl bg-orange-200 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" /></div>
                    <div className="flex-1"><p className={cn('font-black text-lg', isDark ? 'text-orange-400' : 'text-orange-800')}>Low Stock Alert</p><p className={cn('text-xs font-bold uppercase tracking-widest mt-1', isDark ? 'text-orange-400/70' : 'text-orange-800/70')}>{lowStockCount} items are below minimum threshold and need restocking</p></div>
                </div>
            )}

            {(expiredCount > 0 || expiringSoonCount > 0) && (
                <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm dashboard-reveal">
                    <div className="w-12 h-12 rounded-2xl bg-red-200 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0"><Clock3 className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
                    <div className="flex-1">
                        <p className={cn('font-black text-lg', isDark ? 'text-red-400' : 'text-red-800')}>Expiry Alert</p>
                        <p className={cn('text-xs font-bold uppercase tracking-widest mt-1', isDark ? 'text-red-400/70' : 'text-red-800/70')}>
                            {expiredCount} expired, {expiringSoonCount} expiring soon (within 30 days).
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 dashboard-reveal reveal-delay-1">
                {[{ renderIcon: (className) => <Box className={className} />, color: 'blue', label: 'Total Items', value: totalItems },
                { renderIcon: (className) => <CheckCircle className={className} />, color: 'green', label: 'In Stock', value: items.filter((i) => i.stockStatus === 'good').length },
                { renderIcon: (className) => <TrendingDown className={className} />, color: 'yellow', label: 'Low Stock', value: lowStockCount },
                { renderIcon: (className) => <AlertTriangle className={className} />, color: 'red', label: 'Expired', value: expiredCount },
                ].map(({ renderIcon, color, label, value }) => (
                    <div key={label} className={cn('rounded-3xl p-4 sm:p-5 transition-all border-2 shadow-xl hover:-translate-y-1 hover:shadow-2xl', isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                        <div className="flex items-center gap-3 sm:gap-4 mb-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center shadow-inner pt-0.5`}>
                                {renderIcon(`w-5 h-5 sm:w-6 sm:h-6 text-${color}-500`)}
                            </div>
                            <span className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>{label}</span>
                        </div>
                        {loading
                            ? <div className="skeleton-shimmer h-8 w-16 mt-1" />
                            : <p className={cn('text-2xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>{value}</p>
                        }
                    </div>
                ))}
            </div>

            <div className={cn('rounded-3xl flex items-center gap-3 px-5 sm:px-6 transition-all dashboard-reveal reveal-delay-2 border-4 shadow-lg', isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                <Search className="w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search inventory items..." className={cn('flex-1 py-4 outline-none placeholder-gray-400 bg-transparent text-sm sm:text-base font-medium', isDark ? 'text-white' : 'text-[#512c31]')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className={cn('rounded-[2rem] overflow-x-auto dashboard-reveal reveal-delay-3 border-2 shadow-2xl', isDark ? 'bg-[#1e1e1e] border-white/5 shadow-black/50' : 'bg-white border-white/50 shadow-[#512c31]/5')}>
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
                    <table className="w-full min-w-[1180px] table-fixed text-left text-xs">
                        <thead className={cn("font-black uppercase tracking-widest text-[9px] sm:text-[10px]", isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}><tr><th className="w-[16%] p-3">Item</th><th className="w-[7%] p-3">Category</th><th className="w-[8%] p-3">Stock</th><th className="w-[25%] p-3">Batches</th><th className="w-[5%] p-3">Limit</th><th className="w-[8%] p-3">Expiry</th><th className="w-[10%] p-3">MRP/Tax</th><th className="w-[7%] p-3">Status</th><th className="w-[14%] p-3 text-right">Actions</th></tr></thead>
                        <tbody className={cn('divide-y', isDark ? 'divide-gray-800' : 'divide-gray-50')}>
                            {visibleItems.map((item) => (
                                <tr key={item.id} className={cn('transition-all duration-300 group', isDark ? 'hover:bg-[#252525]' : 'hover:bg-[#fef9f3]')}>
                                    <td className="p-3"><div className="flex items-center gap-2 min-w-0"><div className={cn('w-9 h-9 rounded-xl flex items-center justify-center dashboard-card shadow-sm flex-shrink-0', isDark ? 'bg-[#0f0f0f] border border-gray-800' : 'bg-white border border-[#512c31]/5')}><Package className={cn('w-4 h-4', isDark ? 'text-gray-400' : 'text-[#e8919a]')} /></div><span className={cn('font-black text-sm leading-snug whitespace-normal break-words', isDark ? 'text-white' : 'text-[#512c31]')}>{item.name}</span></div></td>
                                    <td className={cn('p-3 font-bold truncate', isDark ? 'text-gray-400' : 'text-[#512c31]/80')}>{item.category}</td>
                                    <td className={cn('p-3 font-black', isDark ? 'text-white' : 'text-[#512c31]')}>
                                        {item.packageType === 'single' ? item.stripStock : item.stock} <span className="text-gray-500 font-bold ml-1 text-sm">{item.packageType === 'single' ? 'single' : 'box'}</span>
                                        {item.packageType !== 'single' && <span className="block text-[10px] uppercase tracking-widest text-gray-500">{item.stripStock || 0} strips total</span>}
                                    </td>
                                    <td className={cn('p-3 font-bold', isDark ? 'text-gray-300' : 'text-[#512c31]/80')}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Layers3 className="w-4 h-4 text-[#e8919a]" />
                                            <span className="text-xs uppercase tracking-widest">{item.batchCount || 0} active batches</span>
                                        </div>
                                        <div className="space-y-2">
                                            {(item.batches || []).map((batch, batchIndex) => (
                                                <div key={batch.id} className={cn('rounded-2xl px-3 py-3 border text-[11px]', isDark ? 'border-white/10 bg-[#121212]' : 'border-[#512c31]/10 bg-[#fef9f3]')}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <span className={cn('block font-black', isDark ? 'text-white/90' : 'text-[#512c31]')}>{batch.batchNumber || `Batch ${batchIndex + 1}`}</span>
                                                            <span className={cn('mt-1 block font-bold uppercase tracking-widest', batch.expiryStatus === 'expired' ? 'text-red-400' : batch.expiryStatus === 'expiring_soon' ? 'text-orange-300' : 'text-gray-500')}>
                                                                {getBatchExpiryLabel(batch)}
                                                            </span>
                                                        </div>
                                                        <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest whitespace-nowrap', isDark ? 'bg-white/10 text-white' : 'bg-white text-[#512c31]')}>
                                                            {item.packageType === 'single' ? batch.stripStock : batch.stock} {item.packageType === 'single' ? 'single' : 'box'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest">
                                                        <span className={cn('rounded-xl px-2 py-1.5', isDark ? 'bg-black/30 text-gray-300' : 'bg-white text-[#512c31]/70')}>MRP Rs{batch.costPrice}</span>
                                                        <span className={cn('rounded-xl px-2 py-1.5', isDark ? 'bg-black/30 text-emerald-400' : 'bg-white text-emerald-600')}>Rate Rs{batch.sellPrice}</span>
                                                        <span className={cn('rounded-xl px-2 py-1.5', isDark ? 'bg-black/30 text-sky-300' : 'bg-white text-sky-700')}>{Number(batch.gstPercent || 0)}% GST</span>
                                                        {canEditInventory && (
                                                            <span className="flex items-center justify-end gap-1">
                                                                <button type="button" onClick={() => openBatchEditModal(item, batch)} className="rounded-lg bg-blue-500/15 p-1.5 text-blue-300 hover:bg-blue-500 hover:text-white transition-all" title="Edit batch">
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button type="button" onClick={() => handleDeleteBatch(item, batch)} className="rounded-lg bg-red-500/15 p-1.5 text-red-300 hover:bg-red-500 hover:text-white transition-all" title="Delete batch">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {(item.batches || []).length === 0 && <div className="text-[10px] uppercase tracking-widest text-gray-500">No active batches</div>}
                                        </div>
                                    </td>
                                    <td className={cn('p-3 font-bold', isDark ? 'text-gray-400' : 'text-[#512c31]/80')}>{item.threshold}</td>
                                    <td className={cn('p-3 font-bold whitespace-normal', isDark ? 'text-gray-400' : 'text-[#512c31]/80')}>{getExpiryLabel(item)}</td>
                                    <td className={cn('p-3 font-black whitespace-normal', isDark ? 'text-gray-400' : 'text-[#512c31]')}>
                                        <span className="block leading-tight">{getPricingLabel(item)}</span>
                                        <span className="block text-[10px] uppercase tracking-widest text-emerald-500">{Number(item.gstPercent || 0)}% tax auto</span>
                                        <span className="block text-[10px] uppercase tracking-widest text-gray-500">{item.packageType === 'single' ? 'Single pricing' : `${item.stripsPerUnit || 1} strips per box`}</span>
                                    </td>
                                    <td className="p-3 align-top"><span className={`inline-flex whitespace-nowrap px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border ${getStatusColor(item.status)}`}>{item.status}</span></td>
                                    <td className="p-3 text-right">
                                        {canEditInventory && (
                                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="shrink-0 p-2 text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-500 rounded-xl transition-all shadow-sm group-hover:scale-105"
                                                    title="Edit item"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setSelectedItem(item); setRestockForm({ quantity: '', costPrice: String(item.costPrice || ''), gstPercent: String(item.gstPercent || ''), batchNumber: '', expiryDate: '' }); setShowRestockModal(true); }} className="shrink-0 px-2.5 py-2 bg-[#512c31]/10 text-[#512c31] hover:bg-[#512c31] hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm group-hover:scale-105">Restock</button>
                                                <button
                                                    onClick={() => handleDeleteItem(item)}
                                                    className="shrink-0 p-2 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 dark:bg-red-500/10 dark:hover:bg-red-500 rounded-xl transition-all shadow-sm group-hover:scale-105"
                                                    title="Delete item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && visibleCount < filteredItems.length && (
                    <div className={cn('p-5 border-t text-center', isDark ? 'border-gray-800' : 'border-gray-50')}>
                        <button
                            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                            className="px-6 py-3 rounded-2xl bg-[#512c31] text-white font-black text-xs uppercase tracking-widest hover:bg-[#e8919a] transition-all shadow-lg"
                        >
                            Load more inventory
                        </button>
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 shadow-2xl transition-all",
                        isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-white/50"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Add Item</h2>
                            <button onClick={() => setShowAddModal(false)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-[#fef9f3] text-[#512c31] hover:bg-[#e8919a] hover:text-white")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddItem} className="space-y-5">
                            <div>
                                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Item Name</label>
                                <input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="e.g. Surgical Masks" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Category</label>
                                    <select required value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")}>
                                        {INVENTORY_CATEGORIES.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Pricing Type</label>
                                    <div className={cn("grid grid-cols-2 rounded-2xl border-2 p-1", isDark ? "bg-[#0f0f0f] border-gray-800" : "bg-[#fef9f3] border-transparent")}>
                                        {['box', 'single'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setAddForm({ ...addForm, packageType: type, unit: type === 'single' ? 'single' : 'box', stripsPerUnit: type === 'single' ? '1' : addForm.stripsPerUnit, tabletsPerStrip: type === 'single' ? '1' : addForm.tabletsPerStrip })}
                                                className={cn("rounded-xl px-3 py-3 text-xs font-black uppercase tracking-widest transition-all", addForm.packageType === type ? "bg-[#512c31] text-white shadow-lg" : isDark ? "text-gray-400 hover:text-white" : "text-[#512c31]/60 hover:text-[#512c31]")}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>{addForm.packageType === 'single' ? 'Single Stock' : 'Box Stock'}</label>
                                    <input required type="number" value={addForm.stock} onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="0" />
                                </div>
                                {addForm.packageType === 'box' && <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Box Unit</label>
                                    <input required type="number" min="1" value={addForm.stripsPerUnit} onChange={(e) => setAddForm({ ...addForm, stripsPerUnit: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="10" />
                                </div>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {addForm.packageType === 'box' && <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Sub Units Per Unit</label>
                                    <input required type="number" min="1" value={addForm.tabletsPerStrip} onChange={(e) => setAddForm({ ...addForm, tabletsPerStrip: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="10" />
                                </div>}
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Threshold</label>
                                    <input required type="number" value={addForm.threshold} onChange={(e) => setAddForm({ ...addForm, threshold: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="10" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>MRP (Rs)</label>
                                    <input required type="number" step="0.01" value={addForm.costPrice} onChange={(e) => setAddForm({ ...addForm, costPrice: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="0.00" />
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>GST (%)</label>
                                    <input required type="number" min="0" max="100" step="0.01" value={addForm.gstPercent} onChange={(e) => setAddForm({ ...addForm, gstPercent: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="18" />
                                </div>
                            </div>
                            <div className={cn("rounded-2xl border-2 p-4", isDark ? "bg-[#0f0f0f] border-gray-800" : "bg-[#fef9f3] border-transparent")}>
                                <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Auto Rate</p>
                                <p className={cn("mt-2 text-2xl font-black", isDark ? "text-white" : "text-[#512c31]")}>Rs {calculateInventoryPricing(addForm).unitRate.toFixed(2)}</p>
                                {addForm.packageType === 'box' && (
                                    <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/50")}>
                                        Strip Rs {calculateInventoryPricing(addForm).stripRate.toFixed(2)} / Tablet Rs {calculateInventoryPricing(addForm).individualRate.toFixed(2)}
                                    </p>
                                )}
                                <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/50")}>Invoice uses this rate with the entered GST</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Batch Number</label>
                                    <input value={addForm.batchNumber} onChange={(e) => setAddForm({ ...addForm, batchNumber: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="BATCH-001" />
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Expiry Date</label>
                                    <input type="date" value={addForm.expiryDate} onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>
                            </div>
                            <button className="w-full rounded-2xl bg-[#512c31] py-4 text-white font-bold tracking-widest uppercase text-sm hover:bg-[#e8919a] hover:scale-[1.02] transition-all shadow-xl hover:shadow-2xl mt-4">
                                Add Item
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showRestockModal && selectedItem && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 shadow-2xl transition-all",
                        isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-white/50"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Add Batch</h2>
                            <button onClick={() => setShowRestockModal(false)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-[#fef9f3] text-[#512c31] hover:bg-[#e8919a] hover:text-white")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRestock} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>{selectedItem.packageType === 'single' ? 'Single Quantity' : 'Box Quantity'}</label>
                                    <input required type="number" value={restockForm.quantity} onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="Quantity" />
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Batch Number</label>
                                    <input value={restockForm.batchNumber} onChange={(e) => setRestockForm({ ...restockForm, batchNumber: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="BATCH-002" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>MRP (Rs)</label>
                                    <input required type="number" step="0.01" value={restockForm.costPrice} onChange={(e) => setRestockForm({ ...restockForm, costPrice: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="MRP" />
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>GST (%)</label>
                                    <input required type="number" min="0" max="100" step="0.01" value={restockForm.gstPercent} onChange={(e) => setRestockForm({ ...restockForm, gstPercent: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} placeholder="18" />
                                </div>
                            </div>
                            <div className={cn("rounded-2xl border-2 p-4", isDark ? "bg-[#0f0f0f] border-gray-800" : "bg-[#fef9f3] border-transparent")}>
                                <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Batch Auto Rate</p>
                                <p className={cn("mt-2 text-2xl font-black", isDark ? "text-white" : "text-[#512c31]")}>Rs {calculateInventoryPricing({ ...selectedItem, costPrice: restockForm.costPrice, gstPercent: restockForm.gstPercent }).unitRate.toFixed(2)}</p>
                                {selectedItem.packageType === 'box' && (
                                    <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/50")}>
                                        Strip Rs {calculateInventoryPricing({ ...selectedItem, costPrice: restockForm.costPrice, gstPercent: restockForm.gstPercent }).stripRate.toFixed(2)} / Tablet Rs {calculateInventoryPricing({ ...selectedItem, costPrice: restockForm.costPrice, gstPercent: restockForm.gstPercent }).individualRate.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Expiry Date (optional)</label>
                                <input type="date" value={restockForm.expiryDate} onChange={(e) => setRestockForm({ ...restockForm, expiryDate: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                            </div>
                            <button className="w-full rounded-2xl bg-[#512c31] py-4 text-white font-bold tracking-widest uppercase text-sm hover:bg-[#e8919a] hover:scale-[1.02] transition-all shadow-xl hover:shadow-2xl mt-4">
                                Add Batch
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Inventory Modal ── */}
            {showBatchEditModal && selectedItem && selectedBatch && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 shadow-2xl transition-all",
                        isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-white/50"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Edit Batch</h2>
                                <p className={cn("mt-1 text-xs font-bold uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/50")}>{selectedItem.name}</p>
                            </div>
                            <button onClick={() => setShowBatchEditModal(false)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-[#fef9f3] text-[#512c31] hover:bg-[#e8919a] hover:text-white")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditBatch} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>{selectedItem.packageType === 'single' ? 'Single Quantity' : 'Box Quantity'}</label>
                                    <input required type="number" min="0" value={batchEditForm.quantity} onChange={(e) => setBatchEditForm({ ...batchEditForm, quantity: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Batch Number</label>
                                    <input value={batchEditForm.batchNumber} onChange={(e) => setBatchEditForm({ ...batchEditForm, batchNumber: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>MRP (Rs)</label>
                                    <input required type="number" step="0.01" value={batchEditForm.costPrice} onChange={(e) => setBatchEditForm({ ...batchEditForm, costPrice: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>GST (%)</label>
                                    <input required type="number" min="0" max="100" step="0.01" value={batchEditForm.gstPercent} onChange={(e) => setBatchEditForm({ ...batchEditForm, gstPercent: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>
                            </div>
                            <div className={cn("rounded-2xl border-2 p-4", isDark ? "bg-[#0f0f0f] border-gray-800" : "bg-[#fef9f3] border-transparent")}>
                                <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Updated Batch Rate</p>
                                <p className={cn("mt-2 text-2xl font-black", isDark ? "text-white" : "text-[#512c31]")}>Rs {calculateInventoryPricing({ ...selectedItem, costPrice: batchEditForm.costPrice, gstPercent: batchEditForm.gstPercent }).unitRate.toFixed(2)}</p>
                                {selectedItem.packageType === 'box' && (
                                    <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/50")}>
                                        Strip Rs {calculateInventoryPricing({ ...selectedItem, costPrice: batchEditForm.costPrice, gstPercent: batchEditForm.gstPercent }).stripRate.toFixed(2)} / Tablet Rs {calculateInventoryPricing({ ...selectedItem, costPrice: batchEditForm.costPrice, gstPercent: batchEditForm.gstPercent }).individualRate.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Expiry Date</label>
                                <input type="date" value={batchEditForm.expiryDate} onChange={(e) => setBatchEditForm({ ...batchEditForm, expiryDate: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                            </div>
                            <button type="submit" className="w-full rounded-2xl bg-[#512c31] py-4 text-white font-bold tracking-widest uppercase text-sm hover:bg-[#e8919a] hover:scale-[1.02] transition-all shadow-xl hover:shadow-2xl mt-4">
                                Save Batch
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && editForm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 shadow-2xl transition-all",
                        isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-white/50"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Edit Item</h2>
                            <button onClick={() => setShowEditModal(false)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-[#fef9f3] text-[#512c31] hover:bg-[#e8919a] hover:text-white")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditItem} className="space-y-5">
                            <div>
                                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Item Name</label>
                                <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Category</label>
                                    <select required value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")}>
                                        {INVENTORY_CATEGORIES.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Pricing Type</label>
                                    <div className={cn("grid grid-cols-2 rounded-2xl border-2 p-1", isDark ? "bg-[#0f0f0f] border-gray-800" : "bg-[#fef9f3] border-transparent")}>
                                        {['box', 'single'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, packageType: type, unit: type === 'single' ? 'single' : 'box', stripsPerUnit: type === 'single' ? '1' : editForm.stripsPerUnit, tabletsPerStrip: type === 'single' ? '1' : editForm.tabletsPerStrip })}
                                                className={cn("rounded-xl px-3 py-3 text-xs font-black uppercase tracking-widest transition-all", editForm.packageType === type ? "bg-[#512c31] text-white shadow-lg" : isDark ? "text-gray-400 hover:text-white" : "text-[#512c31]/60 hover:text-[#512c31]")}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {editForm.packageType === 'box' && <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Box Unit</label>
                                    <input type="number" min="1" value={editForm.stripsPerUnit} onChange={(e) => setEditForm({ ...editForm, stripsPerUnit: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>}
                                {editForm.packageType === 'box' && <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Sub Units Per Unit</label>
                                    <input type="number" min="1" value={editForm.tabletsPerStrip} onChange={(e) => setEditForm({ ...editForm, tabletsPerStrip: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>MRP (Rs)</label>
                                    <input type="number" step="0.01" value={editForm.costPrice} onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>GST (%)</label>
                                    <input type="number" min="0" max="100" step="0.01" value={editForm.gstPercent} onChange={(e) => setEditForm({ ...editForm, gstPercent: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>
                            </div>
                            <div className={cn("rounded-2xl border-2 p-4", isDark ? "bg-[#0f0f0f] border-gray-800" : "bg-[#fef9f3] border-transparent")}>
                                <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Auto Rate</p>
                                <p className={cn("mt-2 text-2xl font-black", isDark ? "text-white" : "text-[#512c31]")}>Rs {calculateInventoryPricing(editForm).unitRate.toFixed(2)}</p>
                                {editForm.packageType === 'box' && (
                                    <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/50")}>
                                        Strip Rs {calculateInventoryPricing(editForm).stripRate.toFixed(2)} / Tablet Rs {calculateInventoryPricing(editForm).individualRate.toFixed(2)}
                                    </p>
                                )}
                                <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/50")}>Invoice uses this rate with the entered GST</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Low Stock Threshold</label>
                                    <input type="number" value={editForm.threshold} onChange={(e) => setEditForm({ ...editForm, threshold: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>
                                <div>
                                    <label className={cn("block text-xs font-bold uppercase tracking-widest mb-2", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Expiry Date</label>
                                    <input type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} className={cn("w-full rounded-2xl border-2 p-4 text-sm font-bold outline-none transition-all focus:border-[#512c31]", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20" : "bg-[#fef9f3] border-transparent text-[#512c31]")} />
                                </div>
                            </div>
                            <button type="submit" className="w-full rounded-2xl bg-[#512c31] py-4 text-white font-bold tracking-widest uppercase text-sm hover:bg-[#e8919a] hover:scale-[1.02] transition-all shadow-xl hover:shadow-2xl mt-4">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
