import { useEffect, useMemo, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { AlertTriangle, ArrowLeft, Calculator, CalendarDays, Clock3, Eye, Percent, Plus, ReceiptText, Save, Search, Trash2, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { cn, getLocalDateString } from '../lib/utils';
import { createInvoice, fetchBillingSettings, fetchInvoiceById, updateInvoice } from '../lib/accountingApi';
import { fetchInventory, fetchPatients, fetchServices } from '../lib/clinicApi';
import { InvoicePdfDocument } from '../components/invoice/InvoicePdfDocument';
import { useTenant } from '../context/TenantContext';

const PAGE_SIZE = 25;
const INVOICE_DRAFT_PREFIX = 'clinic_invoice_draft_v1';

function createEmptyInvoiceForm() {
    return {
        patientId: '',
        invoiceNumber: `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: getLocalDateString(),
        items: [],
    };
}

function normalizeInvoiceDate(value) {
    return value || getLocalDateString();
}

export function CreateInvoice() {
    const navigate = useNavigate();
    const { invoiceId } = useParams();
    const { theme, refreshDashboard } = useStore();
    const { selectedClinic, selectedClinicId } = useTenant();
    const isDark = theme === 'dark';

    const [patients, setPatients] = useState([]);
    const [services, setServices] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [billingSettings, setBillingSettings] = useState({ gstEnabled: false, gstNumber: '' });
    const [formDataLoaded, setFormDataLoaded] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [patientQuery, setPatientQuery] = useState('');
    const [showPatientPicker, setShowPatientPicker] = useState(false);
    const [visiblePatientCount, setVisiblePatientCount] = useState(PAGE_SIZE);
    const [itemQuery, setItemQuery] = useState('');
    const [showItemPicker, setShowItemPicker] = useState(false);
    const [visibleItemCount, setVisibleItemCount] = useState(PAGE_SIZE);

    const [formState, setFormState] = useState(() => createEmptyInvoiceForm());
    const [invoiceStatus, setInvoiceStatus] = useState('pending');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [splitPayments, setSplitPayments] = useState({ cash: '', gpay: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [hydratedDraftKey, setHydratedDraftKey] = useState('');
    const [editLoading, setEditLoading] = useState(Boolean(invoiceId));
    const isEditing = Boolean(invoiceId);

    const loadFormData = async () => {
        try {
            setFormDataLoaded(false);
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
        } finally {
            setFormDataLoaded(true);
        }
    };

    useEffect(() => {
        loadFormData();
    }, [selectedClinicId]);

    const draftKey = useMemo(() => (
        !isEditing && selectedClinicId ? `${INVOICE_DRAFT_PREFIX}:${selectedClinicId}` : ''
    ), [isEditing, selectedClinicId]);

    useEffect(() => {
        setHydratedDraftKey('');
        if (!draftKey) {
            return;
        }

        let nextFormState = createEmptyInvoiceForm();
        let nextInvoiceStatus = 'pending';
        let nextPaymentMethod = 'cash';
        let nextSplitPayments = { cash: '', gpay: '' };
        let nextPatientQuery = '';

        try {
            const raw = localStorage.getItem(draftKey);
            if (raw) {
                const draft = JSON.parse(raw);
                nextFormState = draft.formState || nextFormState;
                const draftDate = getLocalDateString(draft.updatedAt);
                if (draftDate && draftDate !== getLocalDateString()) {
                    nextFormState = {
                        ...nextFormState,
                        date: getLocalDateString(),
                    };
                }
                nextInvoiceStatus = draft.invoiceStatus || nextInvoiceStatus;
                nextPaymentMethod = draft.paymentMethod || nextPaymentMethod;
                nextSplitPayments = draft.splitPayments || nextSplitPayments;
                nextPatientQuery = draft.patientQuery || nextPatientQuery;
            }
        } catch {
            nextFormState = createEmptyInvoiceForm();
            nextInvoiceStatus = 'pending';
            nextPaymentMethod = 'cash';
            nextSplitPayments = { cash: '', gpay: '' };
            nextPatientQuery = '';
        }

        setFormState(nextFormState);
        setInvoiceStatus(nextInvoiceStatus);
        setPaymentMethod(nextPaymentMethod);
        setSplitPayments(nextSplitPayments);
        setPatientQuery(nextPatientQuery);
        setHydratedDraftKey(draftKey);
    }, [draftKey]);

    const selectedPatient = patients.find((p) => p.id === formState.patientId) || {
        id: formState.patientId,
        name: patientQuery,
        contact: '',
    };

    useEffect(() => {
        if (selectedPatient.name) {
            setPatientQuery(selectedPatient.name);
        }
    }, [selectedPatient.name]);

    useEffect(() => {
        if (!draftKey || hydratedDraftKey !== draftKey) return;
        try {
            localStorage.setItem(draftKey, JSON.stringify({
                formState,
                invoiceStatus,
                paymentMethod,
                splitPayments,
                patientQuery,
                updatedAt: new Date().toISOString(),
            }));
        } catch {
            // Draft persistence is best-effort and should never block billing.
        }
    }, [draftKey, hydratedDraftKey, formState, invoiceStatus, paymentMethod, splitPayments, patientQuery]);

    useEffect(() => {
        setVisiblePatientCount(PAGE_SIZE);
    }, [patientQuery]);

    useEffect(() => {
        setVisibleItemCount(PAGE_SIZE);
    }, [itemQuery]);

    const getLineTotals = (item) => {
        const gross = Number(item.price || 0) * Number(item.quantity || 0);
        const discountPercent = Math.min(100, Math.max(0, Number(item.discountPercent || 0)));
        const taxableAmount = Math.max(0, gross);
        const gstPercent = Math.min(100, Math.max(0, Number(item.gstPercent || 0)));
        const mrpPrice = Number(item.mrpPrice || 0);
        const mrpTotal = mrpPrice > 0 ? Number((mrpPrice * Number(item.quantity || 0)).toFixed(2)) : 0;
        const inventoryTaxAmount = item.itemType === 'inventory' && mrpTotal > 0 && mrpTotal >= taxableAmount
            ? mrpTotal - taxableAmount
            : null;
        const savedGstAmount = item.preserveSavedTotals && Number.isFinite(Number(item.gstAmount))
            ? Math.max(0, Number(item.gstAmount))
            : null;
        const gstAmount = Number((savedGstAmount ?? inventoryTaxAmount ?? (taxableAmount * (gstPercent / 100))).toFixed(2));
        const stateTaxAmount = Number((gstAmount / 2).toFixed(2));
        const centralTaxAmount = Number((gstAmount - stateTaxAmount).toFixed(2));
        const taxInclusiveTotal = Number((taxableAmount + gstAmount).toFixed(2));
        const savedDiscountAmount = item.preserveSavedTotals && Number.isFinite(Number(item.discountAmount))
            ? Math.min(taxInclusiveTotal, Math.max(0, Number(item.discountAmount)))
            : null;
        const discountAmount = Number((savedDiscountAmount ?? (taxInclusiveTotal * (discountPercent / 100))).toFixed(2));
        const lineTotal = Math.max(0, Number((taxInclusiveTotal - discountAmount).toFixed(2)));
        return { gross, discountPercent, discountAmount, taxableAmount, gstPercent, gstAmount, stateTaxAmount, centralTaxAmount, lineTotal };
    };

    const clearSavedLineTotals = (item) => {
        if (!item?.preserveSavedTotals) return item;
        const { preserveSavedTotals, discountAmount, gstAmount, ...nextItem } = item;
        return nextItem;
    };

    const calculatedTotals = useMemo(() => {
        const lineItems = formState.items.map((item) => ({ ...item, ...getLineTotals(item) }));
        const subtotal = lineItems.reduce((sum, item) => sum + item.gross, 0);
        const discount = lineItems.reduce((sum, item) => sum + item.discountAmount, 0);
        const taxAmount = Number(lineItems.reduce((sum, item) => sum + item.gstAmount, 0).toFixed(2));
        const stateTaxAmount = Number(lineItems.reduce((sum, item) => sum + item.stateTaxAmount, 0).toFixed(2));
        const centralTaxAmount = Number((taxAmount - stateTaxAmount).toFixed(2));
        const total = Math.max(0, Number((subtotal + taxAmount - discount).toFixed(2)));
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

    const getStockForSaleUnit = (item, saleUnit = item?.saleUnit || 'unit') => {
        if (!item) return 0;
        if (saleUnit === 'individual') return Number(item.individualStock || item.stripStock || 0);
        if (saleUnit === 'strip') return Number(item.stripStock || 0);
        return Number(item.maxStock || item.stock || item.stripStock || 0);
    };

    const getPriceForSaleUnit = (item, saleUnit = item?.saleUnit || 'unit') => {
        if (!item) return 0;
        if (saleUnit === 'individual') return Number(item.individualPrice || item.price || 0);
        if (saleUnit === 'strip') return Number(item.stripPrice || item.price || 0);
        return Number(item.unitPrice || item.price || 0);
    };

    const getMrpForSaleUnit = (item, saleUnit = item?.saleUnit || 'unit') => {
        if (!item) return 0;
        if (saleUnit === 'individual') return Number(item.individualMrp || item.mrpPrice || 0);
        if (saleUnit === 'strip') return Number(item.stripMrp || item.mrpPrice || 0);
        return Number(item.unitMrp || item.mrpPrice || 0);
    };

    const buildBatchLineFields = (item, batch) => {
        const source = batch || item || {};
        const packageType = item?.packageType || 'box';
        const stripsPerUnit = Math.max(1, Number(item?.stripsPerUnit || 1));
        const tabletsPerStrip = Math.max(1, Number(item?.tabletsPerStrip || 1));
        const unitMrp = Number(source.costPrice || item?.costPrice || 0);
        const stripMrp = packageType === 'single' ? unitMrp : Number((unitMrp / stripsPerUnit).toFixed(2));
        const individualMrp = packageType === 'single' ? unitMrp : Number((stripMrp / tabletsPerStrip).toFixed(2));
        return {
            batchId: batch?.id || '',
            batchNumber: batch?.batchNumber || '',
            unitPrice: Number(source.sellPrice || item?.sellPrice || 0),
            stripPrice: Number(source.stripSellPrice || source.sellPrice || item?.stripSellPrice || item?.sellPrice || 0),
            individualPrice: Number(source.individualSellPrice || source.stripSellPrice || source.sellPrice || item?.individualSellPrice || item?.stripSellPrice || item?.sellPrice || 0),
            unitMrp,
            stripMrp,
            individualMrp,
            maxStock: packageType === 'single' ? Number(source.stripStock || 0) : Number(source.stock || 0),
            stripStock: Number(source.stripStock || source.stock || 0),
            individualStock: Number(source.individualStock || source.stripStock || source.stock || 0),
            gstPercent: Number(source.gstPercent ?? item?.gstPercent ?? 0),
            expiryStatus: source.expiryStatus || item?.expiryStatus,
            daysToExpiry: source.daysToExpiry ?? item?.daysToExpiry,
            expiryDate: source.expiryDate || item?.expiryDate,
        };
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
                const activeBatches = Array.isArray(item.batches) ? item.batches.filter((batch) => Number(batch.individualStock || batch.stripStock || 0) > 0) : [];
                const selectedBatch = activeBatches[0] || null;
                const batchFields = buildBatchLineFields(item, selectedBatch);
                setFormState((prev) => ({
                    ...prev,
                    items: [...prev.items, {
                        id: crypto.randomUUID(),
                        name: item.name,
                        price: batchFields.unitPrice,
                        quantity: 1,
                        discountPercent: 0,
                        gstPercent: batchFields.gstPercent,
                        itemType: 'inventory',
                        inventoryItemId: item.id,
                        batchId: batchFields.batchId,
                        batchNumber: batchFields.batchNumber,
                        packageType: item.packageType || 'box',
                        maxStock: batchFields.maxStock,
                        stripStock: batchFields.stripStock,
                        individualStock: batchFields.individualStock,
                        mrpPrice: batchFields.unitMrp,
                        unitMrp: batchFields.unitMrp,
                        stripMrp: batchFields.stripMrp,
                        individualMrp: batchFields.individualMrp,
                        unit: item.unit,
                        saleUnit: 'unit',
                        unitPrice: batchFields.unitPrice,
                        stripPrice: batchFields.stripPrice,
                        individualPrice: batchFields.individualPrice,
                        stripsPerUnit: Number(item.stripsPerUnit || 1),
                        tabletsPerStrip: Number(item.tabletsPerStrip || 1),
                        batches: activeBatches,
                        expiryStatus: batchFields.expiryStatus,
                        daysToExpiry: batchFields.daysToExpiry,
                        expiryDate: batchFields.expiryDate,
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
                    ? `Inventory - ${i.batchCount || 0} batches / ${i.stripStock || 0} single stock`
                    : `Inventory - ${i.batchCount || 0} batches / ${i.stock} box`,
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

    const paymentEntries = useMemo(() => {
        if (invoiceStatus !== 'paid') return [];
        if (paymentMethod === 'split') {
            return [
                { method: 'cash', amount: Number(splitPayments.cash || 0) },
                { method: 'gpay', amount: Number(splitPayments.gpay || 0) },
            ].filter((payment) => payment.amount > 0);
        }
        return calculatedTotals.total > 0 ? [{ method: paymentMethod, amount: calculatedTotals.total }] : [];
    }, [invoiceStatus, paymentMethod, splitPayments, calculatedTotals.total]);

    const splitPaidTotal = paymentEntries.reduce((sum, payment) => sum + payment.amount, 0);

    const updateSplitPaymentAmount = (method, value) => {
        setSplitPayments((prev) => ({ ...prev, [method]: value }));
        if (paymentMethod === 'split' && invoiceStatus !== 'paid') {
            setInvoiceStatus('paid');
        }
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        if (method === 'split' && invoiceStatus !== 'paid') {
            setInvoiceStatus('paid');
        }
    };

    const hydrateInvoiceItemForEdit = (item) => {
        if (item.itemType !== 'inventory') {
            return {
                id: item.id || crypto.randomUUID(),
                name: item.name,
                price: Number(item.price || 0),
                quantity: Number(item.quantity || 1),
                discountPercent: Number(item.discountPercent || 0),
                gstPercent: Number(item.gstPercent || 0),
                gstAmount: Number(item.gstAmount || 0),
                discountAmount: Number(item.discountAmount || 0),
                preserveSavedTotals: true,
                itemType: 'service',
                inventoryItemId: null,
            };
        }

        const inventory = inventoryItems.find((entry) => entry.id === item.inventoryItemId) || {};
        const activeBatches = Array.isArray(inventory.batches) ? inventory.batches : [];
        const batch = activeBatches.find((entry) => entry.id === item.batchId) || null;
        const batchFields = buildBatchLineFields(inventory, batch);
        const saleUnit = item.saleUnit || 'unit';
        return {
            id: item.id || crypto.randomUUID(),
            name: item.name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            discountPercent: Number(item.discountPercent || 0),
            gstPercent: Number(item.gstPercent || batchFields.gstPercent || 0),
            gstAmount: Number(item.gstAmount || 0),
            discountAmount: Number(item.discountAmount || 0),
            preserveSavedTotals: true,
            itemType: 'inventory',
            inventoryItemId: item.inventoryItemId,
            batchId: item.batchId || batchFields.batchId,
            batchNumber: item.batchNumber || batchFields.batchNumber,
            packageType: inventory.packageType || 'box',
            maxStock: Number(batchFields.maxStock || item.quantity || 1) + Number(item.quantity || 0),
            stripStock: Number(batchFields.stripStock || item.quantity || 1) + Number(item.quantity || 0),
            individualStock: Number(batchFields.individualStock || item.quantity || 1) + Number(item.quantity || 0),
            mrpPrice: Number(item.taxableAmount || 0) > 0 && Number(item.gstAmount || 0) > 0 ? Number(item.price || 0) + (Number(item.gstAmount || 0) / Number(item.quantity || 1)) : Number(item.price || 0),
            unitMrp: batchFields.unitMrp,
            stripMrp: batchFields.stripMrp,
            individualMrp: batchFields.individualMrp,
            unit: inventory.unit,
            saleUnit,
            unitPrice: saleUnit === 'unit' ? Number(item.price || 0) : batchFields.unitPrice,
            stripPrice: saleUnit === 'strip' ? Number(item.price || 0) : batchFields.stripPrice,
            individualPrice: saleUnit === 'individual' ? Number(item.price || 0) : batchFields.individualPrice,
            stripsPerUnit: Number(inventory.stripsPerUnit || 1),
            tabletsPerStrip: Number(inventory.tabletsPerStrip || 1),
            batches: activeBatches,
            expiryStatus: batchFields.expiryStatus,
            daysToExpiry: batchFields.daysToExpiry,
            expiryDate: batchFields.expiryDate,
        };
    };

    useEffect(() => {
        if (!isEditing || !invoiceId || !formDataLoaded) return;
        let cancelled = false;
        const loadInvoiceForEdit = async () => {
            setEditLoading(true);
            setSubmitError('');
            try {
                const result = await fetchInvoiceById(invoiceId);
                if (cancelled) return;
                const invoice = result.invoice;
                if (!invoice) throw new Error('Invoice not found.');
                const cashAmount = (invoice.payments || [])
                    .filter((payment) => payment.method === 'cash')
                    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
                const gpayAmount = (invoice.payments || [])
                    .filter((payment) => payment.method === 'gpay')
                    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
                setFormState({
                    patientId: invoice.patientId || '',
                    invoiceNumber: invoice.invoiceNumber,
                    date: normalizeInvoiceDate(invoice.date),
                    items: (invoice.items || []).map(hydrateInvoiceItemForEdit),
                });
                setPatientQuery(invoice.patientName || '');
                setInvoiceStatus(invoice.status === 'partially_paid' ? 'pending' : invoice.status || 'pending');
                setPaymentMethod(cashAmount > 0 && gpayAmount > 0 ? 'split' : gpayAmount > 0 ? 'gpay' : 'cash');
                setSplitPayments({
                    cash: cashAmount > 0 ? cashAmount.toFixed(2) : '',
                    gpay: gpayAmount > 0 ? gpayAmount.toFixed(2) : '',
                });
            } catch (error) {
                if (!cancelled) setSubmitError(error.message || 'Failed to load invoice for editing.');
            } finally {
                if (!cancelled) setEditLoading(false);
            }
        };
        loadInvoiceForEdit();
        return () => {
            cancelled = true;
        };
    }, [isEditing, invoiceId, formDataLoaded]);

    const handleSelectPatient = (patient) => {
        setFormState((prev) => ({ ...prev, patientId: patient.id }));
        setPatientQuery(patient.name);
        setShowPatientPicker(false);
    };

    const updateItemQuantity = (index, qty) => {
        const newItems = [...formState.items];
        const value = Math.max(1, parseInt(qty, 10) || 1);
        const maxStock = newItems[index].itemType === 'inventory'
            ? Number(getStockForSaleUnit(newItems[index]) || value)
            : value;
        newItems[index] = clearSavedLineTotals({
            ...newItems[index],
            quantity: newItems[index].itemType === 'inventory' ? Math.min(value, maxStock) : value,
        });
        setFormState((prev) => ({ ...prev, items: newItems }));
    };

    const updateItemPrice = (index, price) => {
        const newItems = [...formState.items];
        const value = Math.max(0, Number(price) || 0);
        newItems[index] = clearSavedLineTotals({
            ...newItems[index],
            price: value,
        });
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
        newItems[index] = clearSavedLineTotals({
            ...newItems[index],
            [key]: percent,
        });
        setFormState((prev) => ({ ...prev, items: newItems }));
    };

    const updateInventorySaleUnit = (index, saleUnit) => {
        const newItems = [...formState.items];
        const item = newItems[index];
        if (!item || item.itemType !== 'inventory') return;
        const nextSaleUnit = item.packageType !== 'single' && ['strip', 'individual'].includes(saleUnit) ? saleUnit : 'unit';
        const nextMaxStock = getStockForSaleUnit(item, nextSaleUnit);
        newItems[index] = clearSavedLineTotals({
            ...item,
            saleUnit: nextSaleUnit,
            price: getPriceForSaleUnit(item, nextSaleUnit),
            mrpPrice: getMrpForSaleUnit(item, nextSaleUnit),
            quantity: Math.max(1, Math.min(Number(item.quantity || 1), nextMaxStock || 1)),
        });
        setFormState((prev) => ({ ...prev, items: newItems }));
    };

    const updateInventoryBatch = (index, batchId) => {
        const newItems = [...formState.items];
        const item = newItems[index];
        if (!item || item.itemType !== 'inventory') return;
        const batch = (item.batches || []).find((entry) => entry.id === batchId) || null;
        const batchFields = buildBatchLineFields(item, batch);
        const nextItem = {
            ...item,
            ...batchFields,
        };
        const nextMaxStock = getStockForSaleUnit(nextItem, nextItem.saleUnit);
        newItems[index] = clearSavedLineTotals({
            ...nextItem,
            price: getPriceForSaleUnit(nextItem, nextItem.saleUnit),
            mrpPrice: getMrpForSaleUnit(nextItem, nextItem.saleUnit),
            quantity: Math.max(1, Math.min(Number(item.quantity || 1), nextMaxStock || 1)),
        });
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
        if (!formState.date) {
            setSubmitError('Select an invoice date before saving.');
            return;
        }
        if (invoiceStatus === 'paid' && paymentMethod === 'split' && Math.abs(splitPaidTotal - calculatedTotals.total) > 0.01) {
            setSubmitError(`Split payments must equal the invoice total of Rs${calculatedTotals.total.toFixed(2)}.`);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                invoiceNumber: formState.invoiceNumber,
                patientId: selectedPatient.id || null,
                patientName: selectedPatient.name || '',
                patientContact: selectedPatient.contact || '',
                date: normalizeInvoiceDate(formState.date),
                status: invoiceStatus,
                paymentMethod,
                payments: paymentEntries,
                items: formState.items.map((item) => {
                    const line = getLineTotals(item);
                    return {
                        name: item.name,
                        price: Number(item.price),
                        quantity: Number(item.quantity),
                        discountPercent: Number(item.discountPercent || 0),
                        discountAmount: line.discountAmount,
                        gstPercent: Number(item.gstPercent || 0),
                        mrpPrice: Number(item.mrpPrice || 0),
                        itemType: item.itemType,
                        inventoryItemId: item.inventoryItemId,
                        batchId: item.batchId || null,
                        saleUnit: item.saleUnit || 'unit',
                    };
                }),
                subtotal: calculatedTotals.subtotal,
                tax: calculatedTotals.taxAmount,
                discount: calculatedTotals.discount,
                total: calculatedTotals.total,
            };
            if (isEditing) {
                await updateInvoice(invoiceId, payload);
            } else {
                await createInvoice(payload);
            }
            await refreshDashboard();
            if (draftKey) {
                localStorage.removeItem(draftKey);
            }
            navigate('/app/billing');
        } catch (err) {
            setSubmitError(err.message || `Failed to ${isEditing ? 'update' : 'save'} invoice.`);
        } finally {
            setSubmitting(false);
        }
    };

    const previewData = {
        invoiceNumber: formState.invoiceNumber,
        date: normalizeInvoiceDate(formState.date),
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
            {editLoading && (
                <div className={cn('rounded-2xl border px-4 py-3 text-sm font-bold', isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-[#fef9f3] border-[#512c31]/10 text-[#512c31]')}>
                    Loading invoice for editing...
                </div>
            )}
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
                            <h1 className={cn('text-2xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>{isEditing ? 'Edit Invoice' : 'Invoice Workbench'}</h1>
                            <p className={cn('text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>{isEditing ? 'Update billing lines, payment split, and invoice status' : 'Line discounts, tax split, stock, and billing controls'}</p>
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
                            <label className={cn('block text-xs font-bold uppercase tracking-widest mb-2.5', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Invoice Date</label>
                            <div className="relative">
                                <CalendarDays className={cn('absolute left-4 top-4 w-5 h-5 pointer-events-none', isDark ? 'text-gray-500' : 'text-[#512c31]/40')} />
                                <input
                                    type="date"
                                    value={normalizeInvoiceDate(formState.date)}
                                    onChange={(e) => setFormState((prev) => ({ ...prev, date: normalizeInvoiceDate(e.target.value) }))}
                                    className={cn('w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border-2 transition-all focus:border-[#512c31]', isDark ? 'bg-[#0f0f0f] border-gray-800 text-white focus:border-white/20 [color-scheme:dark]' : 'bg-[#fef9f3] border-transparent text-[#512c31]')}
                                />
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

                        <div className="space-y-3 p-4 rounded-2xl border-2 dark:border-gray-800">
                            <div className="flex items-center justify-between gap-3">
                                <label className={cn('text-xs font-bold uppercase tracking-widest', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Payment Method</label>
                                <select value={paymentMethod} onChange={(e) => handlePaymentMethodChange(e.target.value)} className={cn('px-4 py-2 rounded-xl text-sm font-bold outline-none border-2 transition-all cursor-pointer', isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-[#fef9f3] border-transparent text-[#512c31]')}>
                                    <option value="cash">Cash</option>
                                    <option value="gpay">GPay</option>
                                    <option value="split">Cash + GPay</option>
                                </select>
                            </div>
                            {paymentMethod === 'split' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">Cash Amount</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={splitPayments.cash}
                                            onChange={(e) => updateSplitPaymentAmount('cash', e.target.value)}
                                            className={cn('w-full px-3 py-3 rounded-xl text-sm font-black outline-none border-2 transition-all', isDark ? 'bg-[#0f0f0f] border-gray-800 text-white focus:border-emerald-400/40' : 'bg-[#fef9f3] border-transparent text-[#512c31] focus:border-[#512c31]')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">GPay Amount</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={splitPayments.gpay}
                                            onChange={(e) => updateSplitPaymentAmount('gpay', e.target.value)}
                                            className={cn('w-full px-3 py-3 rounded-xl text-sm font-black outline-none border-2 transition-all', isDark ? 'bg-[#0f0f0f] border-gray-800 text-white focus:border-sky-400/40' : 'bg-[#fef9f3] border-transparent text-[#512c31] focus:border-[#512c31]')}
                                        />
                                    </div>
                                    <p className={cn('sm:col-span-2 text-[10px] font-black uppercase tracking-widest', invoiceStatus !== 'paid' || Math.abs(splitPaidTotal - calculatedTotals.total) <= 0.01 ? 'text-emerald-400' : 'text-amber-400')}>
                                        Cash + GPay Rs{splitPaidTotal.toFixed(2)} / Invoice Rs{calculatedTotals.total.toFixed(2)}
                                    </p>
                                </div>
                            )}
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
                                {item.itemType === 'inventory' && (
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2">
                                        <select
                                            value={item.batchId || ''}
                                            onChange={(e) => updateInventoryBatch(index, e.target.value)}
                                            className={cn('w-full p-2.5 rounded-xl text-xs font-black outline-none border-2 transition-all', isDark ? 'bg-[#1e1e1e] border-gray-800 text-white focus:border-white/20' : 'bg-[#fef9f3] border-transparent text-[#512c31] focus:border-[#512c31]')}
                                            aria-label="Select inventory batch"
                                        >
                                            {(item.batches || []).length === 0 && <option value="">No active batch</option>}
                                            {(item.batches || []).map((batch) => (
                                                <option key={batch.id} value={batch.id}>
                                                    {batch.batchNumber} - {item.packageType === 'single' ? batch.stripStock : batch.stock} {item.packageType === 'single' ? 'single' : 'box'} - Exp {batch.expiryDate || 'none'}
                                                </option>
                                            ))}
                                        </select>
                                        <span className={cn('rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest', isDark ? 'bg-white/5 text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}>
                                            Batch {item.batchNumber || 'not selected'}
                                        </span>
                                    </div>
                                )}
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

                <button onClick={handleSaveInvoice} disabled={submitting || editLoading} className="mt-6 w-full bg-[#512c31] text-white py-4 sm:py-5 rounded-2xl hover:bg-[#e8919a] transition-all flex items-center justify-center gap-2 text-sm sm:text-base font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed">
                    <Save className="w-5 h-5" />
                    {submitting ? 'Saving...' : isEditing ? 'Update Invoice' : 'Save Invoice'}
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
