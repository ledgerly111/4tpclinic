import { useEffect, useMemo, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { ArrowLeft, Eye, Plus, Save, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { createInvoice } from '../lib/accountingApi';
import { fetchInventory, fetchPatients, fetchServices } from '../lib/clinicApi';
import { InvoicePdfDocument } from '../components/invoice/InvoicePdfDocument';
import { useTenant } from '../context/TenantContext';

export function CreateInvoice() {
    const navigate = useNavigate();
    const { theme } = useStore();
    const { selectedClinic } = useTenant();
    const isDark = theme === 'dark';

    const [patients, setPatients] = useState([]);
    const [services, setServices] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const [formState, setFormState] = useState({
        patientId: '',
        invoiceNumber: `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
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

    const handleAddItem = (e) => {
        const raw = e.target.value;
        if (!raw) return;

        const [kind, id] = raw.split(':');
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
    };

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
            navigate('/billing');
        } catch (error) {
            setSubmitError(error.message || 'Failed to save invoice.');
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
            <div className={cn('w-full rounded-3xl p-6', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className={cn('p-2 rounded-full transition-colors', isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500')}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>Create Invoice</h1>
                    </div>
                    <button
                        onClick={() => setShowPreview(true)}
                        className="px-4 py-2 rounded-xl bg-[#2a2a2a] text-white hover:bg-[#333] border border-gray-700 flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className={cn('text-sm font-medium', isDark ? 'text-gray-300' : 'text-gray-700')}>Select Patient</label>
                        <select value={formState.patientId} onChange={(e) => setFormState({ ...formState, patientId: e.target.value })} className={cn('w-full p-3 rounded-xl outline-none border', isDark ? 'bg-[#2a2a2a] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900')}>
                            <option value="">Select a patient...</option>
                            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>

                        <div className="space-y-2">
                            <label className={cn('text-sm font-medium', isDark ? 'text-gray-300' : 'text-gray-700')}>Add Service / Medicine</label>
                            <div className="relative">
                                <Plus className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', isDark ? 'text-gray-400' : 'text-gray-500')} />
                                <select onChange={handleAddItem} value="" className={cn('w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none border cursor-pointer', isDark ? 'bg-[#2a2a2a] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900')}>
                                    <option value="">Add Item...</option>
                                    <optgroup label="Services">
                                        {services.map((s) => <option key={`s-${s.id}`} value={`service:${s.id}`}>{s.name} - Rs{s.price}</option>)}
                                    </optgroup>
                                    <optgroup label="Inventory Medicines">
                                        {inventoryItems.map((i) => <option key={`i-${i.id}`} value={`inventory:${i.id}`}>{i.name} ({i.stock} {i.unit}) - Rs{i.sellPrice}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={cn('p-4 rounded-xl space-y-3', isDark ? 'bg-[#252525]' : 'bg-gray-50')}>
                            <div className="flex justify-between items-center"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span><span className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>Rs{calculatedTotals.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center gap-4"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tax (%)</span><input type="number" value={formState.taxPercent} onChange={(e) => setFormState({ ...formState, taxPercent: parseFloat(e.target.value) || 0 })} className={cn('w-20 p-1 rounded text-right outline-none bg-transparent border-b', isDark ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-900')} /></div>
                            <div className="flex justify-between items-center gap-4"><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Discount (Rs)</span><input type="number" value={formState.discount} onChange={(e) => setFormState({ ...formState, discount: parseFloat(e.target.value) || 0 })} className={cn('w-20 p-1 rounded text-right outline-none bg-transparent border-b', isDark ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-900')} /></div>
                            <div className="pt-3 border-t border-gray-700 flex justify-between items-center"><span className="font-bold text-lg text-[#ff9a8b]">Total</span><span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-gray-900')}>Rs{calculatedTotals.total.toFixed(2)}</span></div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className={cn('text-sm font-medium', isDark ? 'text-gray-300' : 'text-gray-700')}>Invoice Status</label>
                            <select value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value)} className={cn('px-3 py-2 rounded-lg text-sm outline-none border', isDark ? 'bg-[#2a2a2a] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900')}>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-6">
                    {formState.items.map((item, index) => (
                        <div key={item.id} className={cn('flex items-center gap-3 p-3 rounded-xl border', isDark ? 'bg-[#252525] border-gray-700' : 'bg-gray-50 border-gray-200')}>
                            <div className="flex-1">
                                <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-gray-900')}>{item.name}</p>
                                <p className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>Rs{item.price} {item.itemType === 'inventory' ? `(inventory)` : `(service)`}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemQuantity(index, e.target.value)} className={cn('w-16 p-1.5 rounded-lg text-sm text-center outline-none border', isDark ? 'bg-[#1e1e1e] border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900')} />
                                <button onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                    {formState.items.length === 0 && (
                        <div className={cn('text-center py-8 rounded-xl border border-dashed', isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400')}>No items added yet</div>
                    )}
                </div>

                {submitError && (
                    <div className={cn('mt-4 rounded-xl border px-3 py-2 text-sm', isDark ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-700')}>
                        {submitError}
                    </div>
                )}

                <button onClick={handleSaveInvoice} disabled={submitting} className="mt-4 w-full bg-[#ff7a6b] text-white py-3 rounded-xl hover:bg-[#ff6b5b] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                    <Save className="w-4 h-4" />
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
