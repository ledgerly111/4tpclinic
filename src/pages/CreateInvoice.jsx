import { useState, useMemo } from 'react';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    PDFViewer
} from '@react-pdf/renderer';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { createInvoice } from '../lib/accountingApi';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
        color: '#1a1a1a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottom: '1px solid #e5e5e5',
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#ff9a8b',
    },
    meta: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    metaItem: {
        fontSize: 10,
        marginBottom: 4,
        color: '#666',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
        paddingVertical: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottom: '1px solid #e5e5e5',
        paddingVertical: 8,
        backgroundColor: '#f9fafb',
    },
    col1: { width: '40%', fontSize: 10 },
    col2: { width: '20%', fontSize: 10, textAlign: 'right' },
    col3: { width: '20%', fontSize: 10, textAlign: 'right' },
    col4: { width: '20%', fontSize: 10, textAlign: 'right' },
    headerCol: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#666',
        textTransform: 'uppercase',
    },
    totalSection: {
        marginTop: 20,
        alignItems: 'flex-end',
        borderTop: '1px solid #e5e5e5',
        paddingTop: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 4,
        width: '100%',
    },
    totalLabel: {
        fontSize: 10,
        color: '#666',
        width: 100,
        textAlign: 'right',
        paddingRight: 10,
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        width: 80,
        textAlign: 'right',
    },
});

// PDF Document Component
const InvoiceDocument = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>INVOICE</Text>
                    <Text style={{ fontSize: 10, marginTop: 4, color: '#666' }}>#{data.invoiceNumber}</Text>
                </View>
                <View style={styles.meta}>
                    <Text style={[styles.metaItem, { fontWeight: 'bold', fontSize: 12, color: '#000' }]}>Clinic Name</Text>
                    <Text style={styles.metaItem}>123 Medical Center Dr</Text>
                    <Text style={styles.metaItem}>New York, NY 10001</Text>
                    <Text style={styles.metaItem}>Date: {data.date}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bill To</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{data.patientName || 'Select Customer'}</Text>
                <Text style={{ fontSize: 10, marginTop: 4, color: '#666' }}>{data.patientContact}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.headerRow}>
                    <Text style={[styles.col1, styles.headerCol, { paddingLeft: 8 }]}>Service / Item</Text>
                    <Text style={[styles.col2, styles.headerCol]}>Rate</Text>
                    <Text style={[styles.col3, styles.headerCol]}>Qty</Text>
                    <Text style={[styles.col4, styles.headerCol, { paddingRight: 8 }]}>Amount</Text>
                </View>
                {data.items.map((item, index) => (
                    <View key={index} style={styles.row}>
                        <Text style={[styles.col1, { paddingLeft: 8 }]}>{item.name}</Text>
                        <Text style={styles.col2}>${item.price}</Text>
                        <Text style={styles.col3}>{item.quantity}</Text>
                        <Text style={[styles.col4, { paddingRight: 8 }]}>${(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>${data.subtotal.toFixed(2)}</Text>
                </View>
                {data.discount > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Discount</Text>
                        <Text style={[styles.totalValue, { color: '#ff6b6b' }]}>- ${data.discount.toFixed(2)}</Text>
                    </View>
                )}
                {data.tax > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tax</Text>
                        <Text style={styles.totalValue}>+ ${data.tax.toFixed(2)}</Text>
                    </View>
                )}
                <View style={[styles.totalRow, { marginTop: 8, borderTop: '1px solid #000', paddingTop: 8 }]}>
                    <Text style={[styles.totalLabel, { fontSize: 12, fontWeight: 'bold', color: '#000' }]}>Total</Text>
                    <Text style={[styles.totalValue, { fontSize: 12, color: '#ff9a8b' }]}>${data.total.toFixed(2)}</Text>
                </View>
            </View>

            <View style={{ position: 'absolute', bottom: 40, left: 40, right: 40, borderTop: '1px solid #e5e5e5', paddingTop: 20 }}>
                <Text style={{ fontSize: 10, color: '#999', textAlign: 'center' }}>
                    Thank you for your business. Please ensure payment within 30 days.
                </Text>
            </View>
        </Page>
    </Document>
);

export function CreateInvoice() {
    const navigate = useNavigate();
    const { patients, services, theme } = useStore();
    const isDark = theme === 'dark';

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

    // Computed data for PDF
    const selectedPatient = patients.find(p => p.id === formState.patientId) || {};

    const calculatedTotals = useMemo(() => {
        const subtotal = formState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxAmount = subtotal * (formState.taxPercent / 100);
        const total = Math.max(0, subtotal + taxAmount - formState.discount);
        return { subtotal, taxAmount, total };
    }, [formState.items, formState.discount, formState.taxPercent]);

    const handleAddItem = (e) => {
        const serviceId = e.target.value;
        if (!serviceId) return;

        const service = services.find(s => s.id === serviceId);
        if (service) {
            setFormState(prev => ({
                ...prev,
                items: [...prev.items, { ...service, quantity: 1 }]
            }));
        }
    };

    const updateItemQuantity = (index, qty) => {
        const newItems = [...formState.items];
        newItems[index].quantity = Math.max(1, parseInt(qty) || 0);
        setFormState(prev => ({ ...prev, items: newItems }));
    };

    const removeItem = (index) => {
        const newItems = formState.items.filter((_, i) => i !== index);
        setFormState(prev => ({ ...prev, items: newItems }));
    };

    const handleSaveInvoice = async () => {
        setSubmitError('');

        if (!formState.patientId) {
            setSubmitError('Please select a customer before saving.');
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
                })),
                subtotal: calculatedTotals.subtotal,
                tax: calculatedTotals.taxAmount,
                discount: formState.discount,
                total: calculatedTotals.total,
            });
            navigate('/billing');
        } catch (error) {
            setSubmitError(error.message || 'Failed to save invoice.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row gap-6 p-4">
            {/* Left Panel - Editor */}
            <div className={cn(
                "w-full md:w-1/2 flex flex-col rounded-3xl p-6 overflow-y-auto",
                isDark ? "bg-[#1e1e1e]" : "bg-white border border-gray-200"
            )}>
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className={cn(
                            "p-2 rounded-full transition-colors",
                            isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                        )}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className={cn(
                        "text-2xl font-bold",
                        isDark ? "text-white" : "text-gray-900"
                    )}>Create Invoice</h1>
                </div>

                <div className="space-y-6">
                    {/* Patient Selection */}
                    <div className="space-y-2">
                        <label className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                            Select Customer
                        </label>
                        <select
                            value={formState.patientId}
                            onChange={(e) => setFormState({ ...formState, patientId: e.target.value })}
                            className={cn(
                                "w-full p-3 rounded-xl outline-none border transition-colors",
                                isDark
                                    ? "bg-[#2a2a2a] border-gray-700 text-white focus:border-[#ff9a8b]"
                                    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-[#ff9a8b]"
                            )}
                        >
                            <option value="">Select a customer...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Services/Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                                Items
                            </label>
                            <div className="relative">
                                <Plus className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-gray-400" : "text-gray-500")} />
                                <select
                                    onChange={handleAddItem}
                                    value=""
                                    className={cn(
                                        "pl-9 pr-4 py-2 rounded-lg text-sm outline-none border cursor-pointer",
                                        isDark
                                            ? "bg-[#2a2a2a] border-gray-700 text-white hover:border-[#ff9a8b]"
                                            : "bg-gray-50 border-gray-200 text-gray-900 hover:border-[#ff9a8b]"
                                    )}
                                >
                                    <option value="">Add Item...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {formState.items.map((item, index) => (
                                <div key={index} className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border",
                                    isDark ? "bg-[#252525] border-gray-700" : "bg-gray-50 border-gray-200"
                                )}>
                                    <div className="flex-1">
                                        <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                                            {item.name}
                                        </p>
                                        <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                                            ${item.price}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItemQuantity(index, e.target.value)}
                                            className={cn(
                                                "w-16 p-1.5 rounded-lg text-sm text-center outline-none border",
                                                isDark ? "bg-[#1e1e1e] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                                            )}
                                        />
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {formState.items.length === 0 && (
                                <div className={cn(
                                    "text-center py-8 rounded-xl border border-dashed",
                                    isDark ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-400"
                                )}>
                                    No items added yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Totals & Adjustments */}
                    <div className={cn(
                        "p-4 rounded-xl space-y-3",
                        isDark ? "bg-[#252525]" : "bg-gray-50"
                    )}>
                        <div className="flex justify-between items-center">
                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Subtotal</span>
                            <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                                ${calculatedTotals.subtotal.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center gap-4">
                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Tax (%)</span>
                            <input
                                type="number"
                                value={formState.taxPercent}
                                onChange={(e) => setFormState({ ...formState, taxPercent: parseFloat(e.target.value) || 0 })}
                                className={cn(
                                    "w-20 p-1 rounded text-right outline-none bg-transparent border-b focus:border-[#ff9a8b]",
                                    isDark ? "border-gray-600 text-white" : "border-gray-300 text-gray-900"
                                )}
                            />
                        </div>

                        <div className="flex justify-between items-center gap-4">
                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Discount ($)</span>
                            <input
                                type="number"
                                value={formState.discount}
                                onChange={(e) => setFormState({ ...formState, discount: parseFloat(e.target.value) || 0 })}
                                className={cn(
                                    "w-20 p-1 rounded text-right outline-none bg-transparent border-b focus:border-[#ff9a8b]",
                                    isDark ? "border-gray-600 text-white" : "border-gray-300 text-gray-900"
                                )}
                            />
                        </div>

                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <span className="font-bold text-lg text-[#ff9a8b]">Total</span>
                            <span className={cn("font-bold text-lg", isDark ? "text-white" : "text-gray-900")}>
                                ${calculatedTotals.total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <label className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
                                Invoice Status
                            </label>
                            <select
                                value={invoiceStatus}
                                onChange={(e) => setInvoiceStatus(e.target.value)}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-sm outline-none border",
                                    isDark
                                        ? "bg-[#2a2a2a] border-gray-700 text-white"
                                        : "bg-gray-50 border-gray-200 text-gray-900"
                                )}
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>

                        {submitError && (
                            <div className={cn(
                                "rounded-xl border px-3 py-2 text-sm",
                                isDark ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-700"
                            )}>
                                {submitError}
                            </div>
                        )}

                        <button
                            onClick={handleSaveInvoice}
                            disabled={submitting}
                            className="w-full bg-[#ff7a6b] text-white py-3 rounded-xl hover:bg-[#ff6b5b] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? 'Saving...' : 'Save Invoice'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel - PDF Preview */}
            <div className="w-full md:w-1/2 h-full rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
                <PDFViewer width="100%" height="100%" className="w-full h-full border-none">
                    <InvoiceDocument
                        data={{
                            invoiceNumber: formState.invoiceNumber,
                            date: formState.date,
                            patientName: selectedPatient.name || '',
                            patientContact: selectedPatient.contact || '',
                            items: formState.items,
                            subtotal: calculatedTotals.subtotal,
                            tax: calculatedTotals.taxAmount,
                            discount: formState.discount,
                            total: calculatedTotals.total
                        }}
                    />
                </PDFViewer>
            </div>
        </div>
    );
}

export default CreateInvoice;
