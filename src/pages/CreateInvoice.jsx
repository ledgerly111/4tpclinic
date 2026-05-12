import { useEffect, useMemo, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { AlertTriangle, ArrowLeft, Calculator, Clock3, Eye, Percent, Plus, ReceiptText, Save, Search, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { cn, getLocalDateString } from '../lib/utils';
import { createInvoice, fetchBillingSettings } from '../lib/accountingApi';
import { fetchInventory, fetchPatients, fetchServices } from '../lib/clinicApi';
import { InvoicePdfDocument } from '../components/invoice/InvoicePdfDocument';
import { useTenant } from '../context/TenantContext';

const PAGE_SIZE = 25;

export function CreateInvoice() {
    const navigate = useNavigate();
    const { theme, refreshDashboard } = useStore();
    const { selectedClinic } = useTenant();
    const isDark = theme === 'dark';

    const [patients, setPatients] = useState([]);
    const [services, setServices] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [billingSettings, setBillingSettings] = useState({ gstEnabled: false, gstNumber: '' });
    const [showPreview, setShowPreview] = useState(false);
    const [patientQuery, setPatientQuery] = useState('');
    const [showPatientPicker, setShowPatientPicker] = useState(false);
    const [visiblePatientCount, setVisiblePatientCount] = useState(PAGE_SIZE);
    const [itemQuery, setItemQuery] = useState('');
    const [showItemPicker, setShowItemPicker] = useState(false);
    const [visibleItemCount, setVisibleItemCount] = useState(PAGE_SIZE);

    const [formState, setFormState] = useState({
        patientId: '',
        invoiceNumber: `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: getLocalDateString(),
        items: [],
    });
    const [invoiceStatus, setInvoiceStatus] = useState('pending');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const loadFormData = async () => {
        try {
            const [patientsResult, servicesResult, inventoryResult, billingSettingsResult] = await Promise.all([
                fetchPatients(),
                fetchServices(),
                fetchInventory(),
                fetchBillingSettings(),
            ]);
            setPatients(patientsResult.patients || []);
            setServices(servicesResult.services || []);
            setInventoryItems(inventoryResult.items || []);
            setBillingSettings({
                gstEnabled: Boolean(billingSettingsResult.settings?.gstEnabled),
                gstNumber: billingSettingsResult.settings?.gstNumber || '',
            });
        } catch (error) {
            setSubmitError(error.message || 'Failed to load invoice form data.');
        }
    };

    useEffect(() => {
        loadFormData();
    }, []);

    const selectedPatient = patients.find((p) => p.id === formState.patientId) || {};

    useEffect(() => {
        setVisiblePatientCount(PAGE_SIZE);
    }, [patientQuery]);

    useEffect(() => {
        setVisibleItemCount(PAGE_SIZE);
    }, [itemQuery]);

    const getLineTotals = (item) => {
        const gross = Number(item.price || 0) * Number(item.quantity || 0);
        const discountPercent = Math.min(100, Math.max(0, Number(item.discountPercent || 0)));
        const discountAmount = Number((gross * (discountPercent / 100)).toFixed(2));
        const taxableAmount = Math.max(0, gross - discountAmount);
        const gstPercent = Math.min(100, Math.max(0, Number(item.gstPercent || 0)));
        const gstAmount = Number((taxableAmount * (gstPercent / 100)).toFixed(2));
        const stateTaxAmount = Number((gstAmount / 2).toFixed(2));
        const centralTaxAmount = Number((gstAmount - stateTaxAmount).toFixed(2));
        const lineTotal = Math.max(0, taxableAmount + gstAmount);
        return { gross, discountPercent, discountAmount, taxableAmount, gstPercent, gstAmount, stateTaxAmount, centralTaxAmount, lineTotal };
    };

    const calculatedTotals = useMemo(() => {
        const lineItems = formState.items.map((item) => ({ ...item, ...getLineTotals(item) }));
        const subtotal = lineItems.reduce((sum, item) => sum + item.gross, 0);
        const discount = lineItems.reduce((sum, item) => sum + item.discountAmount, 0);
        const taxAmount = Number(lineItems.reduce((sum, item) => sum + item.gstAmount, 0).toFixed(2));
        const stateTaxAmount = Number(lineItems.reduce((sum, item) => sum + item.stateTaxAmount, 0).toFixed(2));
        const centralTaxAmount = Number((taxAmount - stateTaxAmount).toFixed(2));
        const total = Math.max(0, subtotal - discount + taxAmount);
        return { subtotal, discount, taxAmount, stateTaxAmount, centralTaxAmount, total, lineItems };
    }, [formState.items]);

    const getInventoryWarning = (item) => {
        if (!item || item.itemType === 'service') return null;
        const batches = Array.isArray(item.batches) ? item.batches : [];
        const expired = batches.filter((batch) => batch.expiryStatus === 'expired');
        const expiringSoon = batches.filter((batch) => batch.expiryStatus === 'expiring_soon');
        if (expired.length > 0) {
            return {
                level: 'danger',
                message: `${expired.length} batch${expired.length > 1 ? 'es are' : ' is'} expired. Expired stock will not be sold.`,
            };
        }
        if (expiringSoon.length > 0 || item.expiryStatus === 'expiring_soon') {
            const soonest = expiringSoon[0] || item;
            return {
                level: 'warning',
                message: `Expiry alert: batch ${soonest.batchNumber || 'stock'} expires in ${soonest.daysToExpiry ?? '?'} days. Use FEFO stock carefully.`,
            };
        }
        return null;
    };

    const handleAddItem = (kind, id) => {
        if (kind === 'service') {
            const service = services.find((s) => s.id === id);
            if (service) {
                setFormState((prev) => ({
                    ...prev,
                    items: [...prev.items, { id: crypto.randomUUID(), name: service.name, price: Number(service.price), quantity: 1, discountPercent: 0, gstPercent: 0, itemType: 'service', inventoryItemId: null }],
                }));
            }
        }

        if (kind === 'inventory') {
            const item = inventoryItems.find((inv) => inv.id === id);
            if (item) {
                setFormState((prev) => ({
                    ...prev,
                    items: [...prev.items, {
                        id: crypto.randomUUID(),
                        name: item.name,
                        price: Number(item.sellPrice),
                        quantity: 1,
                        discountPercent: 0,
                        gstPercent: Number(item.gstPercent || 0),
                        itemType: 'inventory',
                        inventoryItemId: item.id,
                        packageType: item.packageType || 'box',
                        maxStock: item.packageType === 'single' ? Number(item.stripStock || 0) : item.stock,
                        stripStock: Number(item.stripStock || item.stock || 0),
                        individualStock: Number(item.individualStock || item.stripStock || item.stock || 0),
                        unit: item.unit,
                        saleUnit: 'unit',
                        unitPrice: Number(item.sellPrice || 0),
                        stripPrice: Number(item.stripSellPrice || item.sellPrice || 0),
                        individualPrice: Number(item.individualSellPrice || item.stripSellPrice || item.sellPrice || 0),
                        stripsPerUnit: Number(item.stripsPerUnit || 1),
                        tabletsPerStrip: Number(item.tabletsPerStrip || 1),
                        batches: item.batches || [],
                        expiryStatus: item.expiryStatus,
                        daysToExpiry: item.daysToExpiry,
                        expiryDate: item.expiryDate,
                    }],
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
                subtitle: i.packageType === 'single'
                    ? `Inventory - ${i.stripStock || 0} single stock`
                    : `Inventory - ${i.stock} box / ${i.stripStock || 0} strips`,
                price: Number(i.sellPrice || 0),
                stripPrice: Number(i.stripSellPrice || i.sellPrice || 0),
                individualPrice: Number(i.individualSellPrice || i.stripSellPrice || i.sellPrice || 0),
                gstPercent: Number(i.gstPercent || 0),
                packageType: i.packageType || 'box',
                warning: getInventoryWarning({ ...i, itemType: 'inventory' }),
            })),
        ];

        if (!q) return [];
        return merged.filter((item) =>
            item.name.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
        );
    }, [services, inventoryItems, itemQuery]);

    const visibleItems = useMemo(() => (
        availableItems.slice(0, visibleItemCount)
    ), [availableItems, visibleItemCount]);

    const patientResults = useMemo(() => {
        const q = patientQuery.trim().toLowerCase();
        if (!q) return [];
        return patients.filter((patient) =>
            patient.name.toLowerCase().includes(q) ||
            String(patient.contact || '').toLowerCase().includes(q)
        );
    }, [patients, patientQuery]);

    const visiblePatients = useMemo(() => (
        patientResults.slice(0, visiblePatientCount)
    ), [patientResults, visiblePatientCount]);

    const handleSelectPatient = (patient) => {
        setFormState((prev) => ({ ...prev, patientId: patient.id }));
        setPatientQuery(patient.name);
        setShowPatientPicker(false);
    };

    const updateItemQuantity = (index, qty) => {
        const newItems = [...formState.items];
        const value = Math.max(1, parseInt(qty, 10) || 1);
        const maxStock = newItems[index].itemType === 'inventory'
            ? Number((newItems[index].saleUnit === 'individual' ? newItems[index].individualStock : newItems[index].saleUnit === 'strip' ? newItems[index].stripStock : newItems[index].maxStock) || value)
            : value;
        newItems[index].quantity = newItems[index].itemType === 'inventory' ? Math.min(value, maxStock) : value;
        setFormState((prev) => ({ ...prev, items: newItems }));
    };

    const updateItemPrice = (index, price) => {
        const newItems = [...formState.items];
        const value = Math.max(0, Number(price) || 0);
        newItems[index] = {
            ...newItems[index],
            price: value,
        };
        if (newItems[index].itemType === 'inventory') {
            if (newItems[index].saleUnit === 'strip') {
                newItems[index].stripPrice = value;
            } else if (newItems[index].saleUnit === 'individual') {
                newItems[index].individualPrice = value;
            } else {
                newItems[index].unitPrice = value;
            }
        }
        setFormState((prev) => ({ ...prev, items: newItems }));
    };

    const updateItemPercent = (index, key, value) => {
        const newItems = [...formState.items];
        const percent = Math.min(100, Math.max(0, Number(value) || 0));
        newItems[index] = {
            ...newItems[index],
            [key]: percent,
        };
        setFormState((prev) => ({ ...prev, items: newItems }));
    };

    const updateInventorySaleUnit = (index, saleUnit) => {
        const newItems = [...formState.items];
        const item = newItems[index];
        if (!item || item.itemType !== 'inventory') return;
        const nextSaleUnit = item.packageType !== 'single' && ['strip', 'individual'].includes(saleUnit) ? saleUnit : 'unit';
        const nextMaxStock = nextSaleUnit === 'individual' ? Number(item.individualStock || item.stripStock || 0) : nextSaleUnit === 'strip' ? Number(item.stripStock || 0) : Number(item.maxStock || 0);
        newItems[index] = {
            ...item,
            saleUnit: nextSaleUnit,
            price: nextSaleUnit === 'individual' ? Number(item.individualPrice || item.price || 0) : nextSaleUnit === 'strip' ? Number(item.stripPrice || item.price || 0) : Number(item.unitPrice || item.price || 0),
            quantity: Math.max(1, Math.min(Number(item.quantity || 1), nextMaxStock || 1)),
        };
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
                paymentMethod,
                items: formState.items.map((item) => ({
                    name: item.name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                    discountPercent: Number(item.discountPercent || 0),
                    gstPercent: Number(item.gstPercent || 0),
                    itemType: item.itemType,
                    inventoryItemId: item.inventoryItemId,
                    saleUnit: item.saleUnit || 'unit',
                })),
                subtotal: calculatedTotals.subtotal,
                tax: calculatedTotals.taxAmount,
                discount: calculatedTotals.discount,
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
        gstEnabled: billingSettings.gstEnabled,
        gstNumber: billingSettings.gstNumber,
        patientName: selectedPatient.name || '',
        patientContact: selectedPatient.contact || '',
        items: calculatedTotals.lineItems,
        subtotal: calculatedTotals.subtotal,
        tax: calculatedTotals.taxAmount,
        stateTax: calculatedTotals.stateTaxAmount,
        centralTax: calculatedTotals.centralTaxAmount,
        discount: calculatedTotals.discount,
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
                        <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-[#512c31] text-white items-center justify-center shadow-xl">
                            <ReceiptText className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className={cn('text-2xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>Invoice Workbench</h1>
                            <p className={cn('text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Line discounts, tax split, stock, and billing controls</p>
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
                            <div className="relative">
                                <Search className={cn('absolute left-4 top-4 w-5 h-5', isDark ? 'text-gray-500' : 'text-[#512c31]/40')} />
                                <input
                                    type="text"
                                    value={patientQuery}
                                    onChange={(e) => {
                                        setPatientQuery(e.target.value);
                                        setFormState((prev) => ({ ...prev, patientId: '' }));
                                        setShowPatientPicker(true);
                                    }}
                                    onFocus={() => setShowPatientPicker(true)}
                                    placeholder="Search patient name or phone..."
                                    className={cn('w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border-2 transition-all placeholder:font-bold placeholder:uppercase placeholder:tracking-widest focus:border-[#512c31]', isDark ? 'bg-[#0f0f0f] border-gray-800 text-white placeholder-gray-500 focus:border-white/20' : 'bg-[#fef9f3] border-transparent text-[#512c31] placeholder-[#512c31]/40')}
                                />
                                {showPatientPicker && patientQuery.trim() && (
                                    <div className={cn('absolute z-30 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border-4 shadow-2xl p-2 space-y-1', isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-50')}>
                                        {visiblePatients.length === 0 ? (
                                            <div className={cn('px-4 py-3 text-sm font-bold', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>No matching patients</div>
                                        ) : (
                                            <>
                                                {visiblePatients.map((patient) => (
                                                    <button
                                                        key={patient.id}
                                                        type="button"
                                                        onClick={() => handleSelectPatient(patient)}
                                                        className={cn('w-full px-4 py-3 rounded-xl text-left transition-all', isDark ? 'hover:bg-[#0f0f0f]' : 'hover:bg-[#fef9f3]')}
                                                    >
                                                        <div className={cn('text-sm font-black', isDark ? 'text-white' : 'text-[#512c31]')}>{patient.name}</div>
                                                        <div className={cn('text-[10px] font-bold uppercase tracking-widest mt-1', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>{patient.contact || 'No phone'}</div>
                                                    </button>
                                                ))}
                                                {visiblePatientCount < patientResults.length && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setVisiblePatientCount((count) => count + PAGE_SIZE)}
                                                        className={cn('w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all', isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-[#fef9f3] hover:bg-[#ffe3e0] text-[#512c31]')}
                                                    >
                                                        Load more patients
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
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
                                        {!itemQuery.trim() ? (
                                            <div className={cn('px-4 py-3 text-sm font-bold', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>
                                                Type to search services or medicines
                                            </div>
                                        ) : availableItems.length === 0 ? (
                                            <div className={cn('px-4 py-3 text-sm font-bold', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>
                                                No matching items
                                            </div>
                                        ) : (
                                            <>
                                                {visibleItems.map((item) => (
                                                    <button
                                                        key={`${item.kind}-${item.id}`}
                                                        type="button"
                                                        onClick={() => handleAddItem(item.kind, item.id)}
                                                        className={cn('w-full px-4 py-3 rounded-xl text-left transition-all', isDark ? 'hover:bg-[#0f0f0f]' : 'hover:bg-[#fef9f3]')}
                                                    >
                                                        <div className={cn('text-sm font-black', isDark ? 'text-white' : 'text-[#512c31]')}>{item.name}</div>
                                                        <div className={cn('text-[10px] font-bold uppercase tracking-widest mt-1', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>
                                                            {item.subtitle} - {item.kind === 'inventory' && item.packageType === 'single' ? `Single Rate Rs ${item.price}` : `Box Rate Rs ${item.price}${item.kind === 'inventory' ? ` - Strip Rate Rs ${item.stripPrice} - Tablet Rate Rs ${item.individualPrice}` : ''}`} {item.kind === 'inventory' ? `- Tax ${item.gstPercent || 0}% auto` : ''}
                                                        </div>
                                                        {item.warning && (
                                                            <div className={cn('mt-2 flex items-center gap-2 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest', item.warning.level === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-300')}>
                                                                {item.warning.level === 'danger' ? <AlertTriangle className="w-3 h-3" /> : <Clock3 className="w-3 h-3" />}
                                                                {item.warning.message}
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                                {visibleItemCount < availableItems.length && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setVisibleItemCount((count) => count + PAGE_SIZE)}
                                                        className={cn('w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all', isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-[#fef9f3] hover:bg-[#ffe3e0] text-[#512c31]')}
                                                    >
                                                        Load more items
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className={cn('p-6 sm:p-8 rounded-[2rem] space-y-4 border-4 shadow-xl', isDark ? 'bg-[#0f0f0f] border-white/5' : 'bg-[#fef9f3] border-gray-50')}>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                    <Calculator className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className={cn("font-black text-lg", isDark ? "text-white" : "text-[#512c31]")}>Invoice Meter</p>
                                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/50")}>{billingSettings.gstEnabled ? `GST ${billingSettings.gstNumber || 'enabled'}` : 'GST header disabled'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn('rounded-2xl p-4', isDark ? 'bg-[#1e1e1e]' : 'bg-white')}>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subtotal</p>
                                    <p className={cn('mt-2 font-black text-lg', isDark ? 'text-white' : 'text-[#512c31]')}>Rs{calculatedTotals.subtotal.toFixed(2)}</p>
                                </div>
                                <div className={cn('rounded-2xl p-4', isDark ? 'bg-[#1e1e1e]' : 'bg-white')}>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discount</p>
                                    <p className="mt-2 font-black text-lg text-red-400">- Rs{calculatedTotals.discount.toFixed(2)}</p>
                                </div>
                                <div className={cn('rounded-2xl p-4', isDark ? 'bg-[#1e1e1e]' : 'bg-white')}>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">State Tax</p>
                                    <p className="mt-2 font-black text-lg text-emerald-400">+ Rs{calculatedTotals.stateTaxAmount.toFixed(2)}</p>
                                </div>
                                <div className={cn('rounded-2xl p-4', isDark ? 'bg-[#1e1e1e]' : 'bg-white')}>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Central Tax</p>
                                    <p className="mt-2 font-black text-lg text-sky-400">+ Rs{calculatedTotals.centralTaxAmount.toFixed(2)}</p>
                                </div>
                            </div>
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

                        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border-2 dark:border-gray-800">
                            <label className={cn('text-xs font-bold uppercase tracking-widest', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Payment Method</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={cn('px-4 py-2 rounded-xl text-sm font-bold outline-none border-2 transition-all cursor-pointer', isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-[#fef9f3] border-transparent text-[#512c31]')}>
                                <option value="cash">Cash</option>
                                <option value="gpay">GPay</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mt-8">
                    {formState.items.length > 0 && (
                        <div className={cn('hidden xl:grid grid-cols-[minmax(180px,1.2fr)_720px] gap-4 px-4 text-[10px] font-black uppercase tracking-widest', isDark ? 'text-gray-500' : 'text-[#512c31]/50')}>
                            <span>Line item</span>
                            <div className="grid grid-cols-6 gap-2 text-center">
                                <span>Unit</span>
                                <span>Rate</span>
                                <span>Qty</span>
                                <span>Disc %</span>
                                <span>Tax Split</span>
                                <span>Action</span>
                            </div>
                        </div>
                    )}
                    {formState.items.map((item, index) => {
                        const line = getLineTotals(item);
                        return (
                        <div key={item.id} className={cn('grid grid-cols-1 xl:grid-cols-[minmax(180px,1.2fr)_auto] gap-4 p-4 rounded-[1.5rem] border-2 shadow-sm transition-all hover:shadow-md group', isDark ? 'bg-[#0f0f0f] border-gray-800' : 'bg-white border-gray-100 hover:border-gray-200')}>
                            <div className="min-w-0">
                                <p className={cn('text-base font-black truncate', isDark ? 'text-white' : 'text-[#512c31]')}>{item.name}</p>
                                <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-0.5', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>
                                    Rs{item.price} - {item.itemType === 'inventory' ? `${item.packageType === 'single' ? 'Single' : item.saleUnit === 'individual' ? 'Tablet' : item.saleUnit === 'strip' ? 'Strip' : 'Box'} sale` : 'Service'}
                                </p>
                                {getInventoryWarning(item) && (
                                    <div className={cn('mt-2 inline-flex max-w-full items-center gap-2 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest', getInventoryWarning(item).level === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-300')}>
                                        {getInventoryWarning(item).level === 'danger' ? <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> : <Clock3 className="w-3.5 h-3.5 flex-shrink-0" />}
                                        <span className="truncate">{getInventoryWarning(item).message}</span>
                                    </div>
                                )}
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-black uppercase tracking-widest">
                                    <span className={cn('rounded-xl px-3 py-2', isDark ? 'bg-white/5 text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}>Discount Rs{line.discountAmount.toFixed(2)}</span>
                                    <span className={cn('rounded-xl px-3 py-2', isDark ? 'bg-white/5 text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}>SGST Rs{line.stateTaxAmount.toFixed(2)}</span>
                                    <span className={cn('rounded-xl px-3 py-2', isDark ? 'bg-white/5 text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}>CGST Rs{line.centralTaxAmount.toFixed(2)}</span>
                                    <span className={cn('rounded-xl px-3 py-2', isDark ? 'bg-white/5 text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}>Line Rs{line.lineTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 xl:w-[720px]">
                                {item.itemType === 'inventory' && item.packageType !== 'single' ? (
                                    <select
                                        value={item.saleUnit || 'unit'}
                                        onChange={(e) => updateInventorySaleUnit(index, e.target.value)}
                                        className={cn('w-full p-2 rounded-xl text-xs font-black outline-none border-2 transition-all', isDark ? 'bg-[#1e1e1e] border-gray-800 text-white focus:border-white/20' : 'bg-[#fef9f3] border-transparent text-[#512c31] focus:border-[#512c31]')}
                                    >
                                        <option value="unit">{item.unit || 'Unit'}</option>
                                        <option value="strip">Strip</option>
                                        <option value="individual">Tablet</option>
                                    </select>
                                ) : (
                                    <span className={cn('w-full p-2 rounded-xl text-xs font-black text-center border-2', isDark ? 'bg-[#1e1e1e] border-gray-800 text-gray-400' : 'bg-[#fef9f3] border-transparent text-[#512c31]/60')}>
                                        {item.itemType === 'inventory' ? 'Single' : 'Service'}
                                    </span>
                                )}
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => updateItemPrice(index, e.target.value)}
                                    className={cn('w-full p-2 rounded-xl text-sm font-black text-center outline-none border-2 transition-all', isDark ? 'bg-[#1e1e1e] border-gray-800 text-white focus:border-white/20' : 'bg-[#fef9f3] border-transparent text-[#512c31] focus:border-[#512c31]')}
                                    aria-label="Line price"
                                />
                                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemQuantity(index, e.target.value)} className={cn('w-full p-2 rounded-xl text-sm font-black text-center outline-none border-2 transition-all', isDark ? 'bg-[#1e1e1e] border-gray-800 text-white focus:border-white/20' : 'bg-[#fef9f3] border-transparent text-[#512c31] focus:border-[#512c31]')} aria-label="Quantity" />
                                <div className="relative">
                                    <Percent className="absolute left-2 top-2.5 w-3.5 h-3.5 text-red-400" />
                                    <input type="number" min="0" max="100" step="0.01" value={item.discountPercent || 0} onChange={(e) => updateItemPercent(index, 'discountPercent', e.target.value)} className={cn('w-full pl-7 pr-2 py-2 rounded-xl text-sm font-black text-center outline-none border-2 transition-all', isDark ? 'bg-[#1e1e1e] border-gray-800 text-white focus:border-white/20' : 'bg-[#fef9f3] border-transparent text-[#512c31] focus:border-[#512c31]')} aria-label="Discount percent" />
                                </div>
                                <div className={cn('rounded-xl border-2 px-2 py-1 text-center', isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-[#fef9f3] border-transparent')}>
                                    <p className={cn('text-[9px] font-black uppercase tracking-widest', isDark ? 'text-gray-500' : 'text-[#512c31]/50')}>{Number(item.gstPercent || 0).toFixed(2)}% tax</p>
                                    <p className="text-[10px] font-black text-emerald-400">S Rs{line.stateTaxAmount.toFixed(2)}</p>
                                    <p className="text-[10px] font-black text-sky-400">C Rs{line.centralTaxAmount.toFixed(2)}</p>
                                </div>
                                <button onClick={() => removeItem(index)} className={cn("p-2 sm:p-3 rounded-xl transition-all shadow-sm hover:scale-110", isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100")}><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                            </div>
                        </div>
                        );
                    })}
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
