import { useEffect, useMemo, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { ArrowLeft, Eye, Plus, Save, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { cn, getLocalDateString } from '../lib/utils';
import { createInvoice } from '../lib/accountingApi';
import { fetchInventory, fetchPatients, fetchServices } from '../lib/clinicApi';
import { InvoicePdfDocument } from '../components/invoice/InvoicePdfDocument';
import { useTenant } from '../context/TenantContext';

export function CreateInvoice() {
    const navigate = useNavigate();
    const { theme, refreshDashboard } = useStore();
    const { selectedClinic } = useTenant();
    const isDark = theme === 'dark';

    const [patients, setPatients] = useState([]);
    const [services, setServices] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [itemQuery, setItemQuery] = useState('');
    const [showItemPicker, setShowItemPicker] = useState(false);

    const [formState, setFormState] = useState({
        patientId: '',
        invoiceNumber: `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: getLocalDateString(),
        items: [],
        discount: 0,
        taxPercent: 0,
    });
    const [invoiceStatus, setInvoiceStatus] = useState('pending');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const loadFormData = async () => {
        try {
            const [patientsResult, servicesResult, inventoryResult] = await Promise.all([
                fetchPatients(),
                fetchServices(),
                fetchInventory(),
            ]);
            setPatients(patientsResult.patients || []);
            setServices(servicesResult.services || []);
            setInventoryItems(inventoryResult.items || []);
        } catch (error) {
            setSubmitError(error.message || 'Failed to load invoice form data.');
        }
    };

    useEffect(() => {
        loadFormData();
    }, []);

    const selectedPatient = patients.find((p) => p.id === formState.patientId) || {};

    const calculatedTotals = useMemo(() => {
        const subtotal = formState.items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        const taxAmount = subtotal * (Number(formState.taxPercent) / 100);
        const total = Math.max(0, subtotal + taxAmount - Number(formState.discount || 0));
        return { subtotal, taxAmount, total };
    }, [formState.items, formState.discount, formState.taxPercent]);

    const handleAddItem = (kind, id) => {
        if (kind === 'service') {
            const service = services.find((s) => s.id === id);
            if (service) {
                setFormState((prev) => ({
                    ...prev,
                    items: [...prev.items, { id: crypto.randomUUID(), name: service.name, price: Number(service.price), quantity: 1, itemType: 'service', inventoryItemId: null }],
                }));
            }
        }

        if (kind === 'inventory') {
            const item = inventoryItems.find((inv) => inv.id === id);
            if (item) {
                setFormState((prev) => ({
                    ...prev,
                    items: [...prev.items, { id: crypto.randomUUID(), name: item.name, price: Number(item.sellPrice), quantity: 1, itemType: 'inventory', inventoryItemId: item.id, maxStock: item.stock, unit: item.unit }],
                }));
            }
        }
        setItemQuery('');
        setShowItemPicker(false);
    };

    const availableItems = useMemo(() => {
        const q = itemQuery.trim().toLowerCase();
        const merged = [
            ...services.map((s) => ({
                kind: 'service',
                id: s.id,
                name: s.name,
                subtitle: 'Service',
                price: Number(s.price || 0),
            })),
            ...inventoryItems.map((i) => ({
                kind: 'inventory',
                id: i.id,
                name: i.name,
                subtitle: `Inventory • ${i.stock} ${i.unit}`,
                price: Number(i.sellPrice || 0),
            })),
        ];

        if (!q) return merged;
        return merged.filter((item) =>
            item.name.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
        );
    }, [services, inventoryItems, itemQuery]);

    const updateItemQuantity = (index, qty) => {
        const newItems = [...formState.items];
        const value = Math.max(1, parseInt(qty, 10) || 1);
        const maxStock = newItems[index].itemType === 'inventory' ? Number(newItems[index].maxStock || value) : value;
        newItems[index].quantity = newItems[index].itemType === 'inventory' ? Math.min(value, maxStock) : value;
        setFormState((prev) => ({ ...prev, items: newItems }));
    };

    const removeItem = (index) => {
        setFormState((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleSaveInvoice = async () => {
        setSubmitError('');

        if (!formState.patientId) {
            setSubmitError('Please select a patient before saving.');
            return;
        }
        if (formState.items.length === 0) {
            setSubmitError('Add at least one item to create an invoice.');
            return;
        }

        setSubmitting(true);
        try {
            await createInvoice({
                invoiceNumber: formState.invoiceNumber,
                patientId: selectedPatient.id || null,
                patientName: selectedPatient.name || '',
                patientContact: selectedPatient.contact || '',
                date: formState.date,
                status: invoiceStatus,
                items: formState.items.map((item) => ({
                    name: item.name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                    itemType: item.itemType,
                    inventoryItemId: item.inventoryItemId,
                })),
                subtotal: calculatedTotals.subtotal,
                tax: calculatedTotals.taxAmount,
                discount: Number(formState.discount || 0),
                total: calculatedTotals.total,
            });
            await refreshDashboard();
            // In a real app, this would be an API call
            navigate('/app/billing');
        } catch (err) {
            setSubmitError(err.message || 'Failed to save invoice.');
        } finally {
            setSubmitting(false);
        }
    };

    const previewData = {
        invoiceNumber: formState.invoiceNumber,
        date: formState.date,
        status: invoiceStatus,
        clinicName: selectedClinic?.name || '',
        patientName: selectedPatient.name || '',
        patientContact: selectedPatient.contact || '',
        items: formState.items,
        subtotal: calculatedTotals.subtotal,
        tax: calculatedTotals.taxAmount,
        discount: Number(formState.discount || 0),
        total: calculatedTotals.total,
    };

    return (
        <div className="space-y-6 p-4">
            <div className={cn('w-full rounded-[2.5rem] p-6 sm:p-8 border-4 shadow-2xl dashboard-reveal transition-all', isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-white/50 shadow-[#512c31]/5')}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <button onClick={() => navigate(-1)} className={cn('w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:scale-105', isDark ? 'bg-[#0f0f0f] text-gray-400 hover:text-white' : 'bg-[#fef9f3] text-[#512c31] hover:bg-[#e8919a] hover:text-white')}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className={cn('text-2xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>Create Invoice</h1>
                            <p className={cn('text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>New Billing Record</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPreview(true)}
                        className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-[#512c31] text-white hover:bg-[#e8919a] hover:scale-105 transition-all flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl"
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-5">
                        <div>
                            <label className={cn('block text-xs font-bold uppercase tracking-widest mb-2.5', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Select Patient</label>
                            <select value={formState.patientId} onChange={(e) => setFormState({ ...formState, patientId: e.target.value })} className={cn('w-full p-4 rounded-2xl outline-none border-2 transition-all font-bold text-sm focus:border-[#512c31]', isDark ? 'bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20' : 'bg-[#fef9f3] border-transparent text-[#512c31]')}>
                                <option value="">Select a patient...</option>
                                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className={cn('block text-xs font-bold uppercase tracking-widest mb-2.5', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Add Service / Medicine</label>
                            <div className="relative">
                                <Plus className={cn('absolute left-4 top-4 w-5 h-5', isDark ? 'text-gray-500' : 'text-[#512c31]/40')} />
                                <input
                                    type="text"
                                    value={itemQuery}
                                    onChange={(e) => {
                                        setItemQuery(e.target.value);
                                        setShowItemPicker(true);
                                    }}
                                    onFocus={() => setShowItemPicker(true)}
                                    placeholder="Search service or medicine..."
                                    className={cn('w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border-2 transition-all placeholder:font-bold placeholder:uppercase placeholder:tracking-widest focus:border-[#512c31]', isDark ? 'bg-[#0f0f0f] border-gray-800 text-white placeholder-gray-500 focus:border-white/20' : 'bg-[#fef9f3] border-transparent text-[#512c31] placeholder-[#512c31]/40')}
                                />
                                {showItemPicker && (
                                    <div className={cn('absolute z-20 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border-4 shadow-2xl p-2 space-y-1', isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-50')}>
                                        {availableItems.length === 0 ? (
                                            <div className={cn('px-4 py-3 text-sm font-bold', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>
                                                No matching items
                                            </div>
                                        ) : (
                                            availableItems.map((item) => (
                                                <button
                                                    key={`${item.kind}-${item.id}`}
                                                    type="button"
                                                    onClick={() => handleAddItem(item.kind, item.id)}
                                                    className={cn('w-full px-4 py-3 rounded-xl text-left transition-all', isDark ? 'hover:bg-[#0f0f0f]' : 'hover:bg-[#fef9f3]')}
                                                >
                                                    <div className={cn('text-sm font-black', isDark ? 'text-white' : 'text-[#512c31]')}>{item.name}</div>
                                                    <div className={cn('text-[10px] font-bold uppercase tracking-widest mt-1', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>{item.subtitle} • Rs {item.price}</div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className={cn('p-6 sm:p-8 rounded-[2rem] space-y-4 border-4 shadow-xl', isDark ? 'bg-[#0f0f0f] border-white/5' : 'bg-[#fef9f3] border-gray-50')}>
                            <div className="flex justify-between items-center"><span className={cn("text-xs font-bold uppercase tracking-widest", isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Subtotal</span><span className={cn('font-black text-lg', isDark ? 'text-white' : 'text-[#512c31]')}>Rs{calculatedTotals.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center gap-4"><span className={cn("text-xs font-bold uppercase tracking-widest", isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Tax (%)</span><input type="number" value={formState.taxPercent} onChange={(e) => setFormState({ ...formState, taxPercent: parseFloat(e.target.value) || 0 })} className={cn('w-24 p-2 rounded-xl text-right outline-none font-black text-sm transition-all border-2 focus:border-[#512c31]', isDark ? 'bg-[#1e1e1e] border-gray-800 text-white focus:border-white/20' : 'bg-white border-transparent text-[#512c31]')} /></div>
                            <div className="flex justify-between items-center gap-4"><span className={cn("text-xs font-bold uppercase tracking-widest", isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Discount (Rs)</span><input type="number" value={formState.discount} onChange={(e) => setFormState({ ...formState, discount: parseFloat(e.target.value) || 0 })} className={cn('w-24 p-2 rounded-xl text-right outline-none font-black text-sm transition-all border-2 focus:border-[#512c31]', isDark ? 'bg-[#1e1e1e] border-gray-800 text-white focus:border-white/20' : 'bg-white border-transparent text-[#512c31]')} /></div>
                            <div className={cn("pt-4 border-t-2 flex justify-between items-center", isDark ? "border-gray-800" : "border-gray-200")}><span className={cn("font-black text-xl tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Total</span><span className={cn('font-black text-3xl tracking-tight text-[#e8919a]')}>Rs{calculatedTotals.total.toFixed(2)}</span></div>
                        </div>

                        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border-2 dark:border-gray-800">
                            <label className={cn('text-xs font-bold uppercase tracking-widest', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Invoice Status</label>
                            <select value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value)} className={cn('px-4 py-2 rounded-xl text-sm font-bold outline-none border-2 transition-all cursor-pointer', isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-[#fef9f3] border-transparent text-[#512c31]')}>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-8">
                    {formState.items.map((item, index) => (
                        <div key={item.id} className={cn('flex items-center gap-4 p-4 rounded-[1.5rem] border-2 shadow-sm transition-all hover:shadow-md group', isDark ? 'bg-[#0f0f0f] border-gray-800' : 'bg-white border-gray-100 hover:border-gray-200')}>
                            <div className="flex-1 min-w-0">
                                <p className={cn('text-base font-black truncate', isDark ? 'text-white' : 'text-[#512c31]')}>{item.name}</p>
                                <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-0.5', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>Rs{item.price} • {item.itemType === 'inventory' ? `Inventory` : `Service`}</p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemQuantity(index, e.target.value)} className={cn('w-16 sm:w-20 p-2 rounded-xl text-sm font-black text-center outline-none border-2 transition-all', isDark ? 'bg-[#1e1e1e] border-gray-800 text-white focus:border-white/20' : 'bg-[#fef9f3] border-transparent text-[#512c31] focus:border-[#512c31]')} />
                                <button onClick={() => removeItem(index)} className={cn("p-2 sm:p-3 rounded-xl transition-all shadow-sm hover:scale-110", isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100")}><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                            </div>
                        </div>
                    ))}
                    {formState.items.length === 0 && (
                        <div className={cn('text-center py-12 rounded-[2rem] border-4 border-dashed', isDark ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-[#512c31]/40 font-bold uppercase tracking-widest text-xs')}>No items added yet</div>
                    )}
                </div>

                {submitError && (
                    <div className={cn('mt-4 rounded-xl border px-3 py-2 text-sm', isDark ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-700')}>
                        {submitError}
                    </div>
                )}

                <button onClick={handleSaveInvoice} disabled={submitting} className="mt-6 w-full bg-[#512c31] text-white py-4 sm:py-5 rounded-2xl hover:bg-[#e8919a] transition-all flex items-center justify-center gap-2 text-sm sm:text-base font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed">
                    <Save className="w-5 h-5" />
                    {submitting ? 'Saving...' : 'Save Invoice'}
                </button>
            </div>

            {showPreview && (
                <div className="fixed inset-0 bg-black/80 z-50 p-4">
                    <div className="h-full w-full max-w-6xl mx-auto bg-[#111] rounded-2xl overflow-hidden border border-gray-800">
                        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-800 text-white">
                            <span>Invoice Preview</span>
                            <button onClick={() => setShowPreview(false)} className="text-gray-300 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <PDFViewer width="100%" height="calc(100% - 48px)" className="w-full h-[calc(100%-48px)] border-none">
                            <InvoicePdfDocument data={previewData} />
                        </PDFViewer>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateInvoice;
