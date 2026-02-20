import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    Eye,
    CreditCard,
    DollarSign,
    CheckCircle2,
    X,
    Download,
    Share2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import {
    fetchAccountingSummary,
    fetchInvoiceById,
    fetchInvoices,
    markInvoicePaid,
} from '../lib/accountingApi';
import { PDFViewer, PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { InvoicePdfDocument } from '../components/invoice/InvoicePdfDocument';

const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
});

function formatCurrency(amount = 0) {
    return currency.format(amount);
}

function formatDate(dateString) {
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return dateString;
    return parsed.toLocaleDateString('en-US');
}

function getStatusColor(status) {
    switch (status) {
        case 'paid':
            return 'bg-green-500/20 text-green-400';
        case 'pending':
            return 'bg-yellow-500/20 text-yellow-400';
        case 'overdue':
            return 'bg-red-500/20 text-red-400';
        default:
            return 'bg-gray-500/20 text-gray-400';
    }
}

export function Billing() {
    const navigate = useNavigate();
    const { theme, refreshDashboard } = useStore();
    const isDark = theme === 'dark';

    const [invoices, setInvoices] = useState([]);
    const [summary, setSummary] = useState({
        cashReceived: 0,
        pendingAmount: 0,
        overdueAmount: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionInvoiceId, setActionInvoiceId] = useState('');
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const loadBillingData = async () => {
        setLoading(true);
        setError('');
        try {
            const [invoiceResult, summaryResult] = await Promise.all([
                fetchInvoices(),
                fetchAccountingSummary(),
            ]);
            setInvoices(invoiceResult.invoices || []);
            setSummary({
                cashReceived: summaryResult.cashReceived || 0,
                pendingAmount: summaryResult.pendingAmount || 0,
                overdueAmount: summaryResult.overdueAmount || 0,
            });
        } catch (err) {
            setError(err.message || 'Failed to load billing data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBillingData();
    }, []);

    const filteredInvoices = useMemo(() => (
        invoices.filter((invoice) => {
            const matchesSearch =
                invoice.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || invoice.status === filter;
            return matchesSearch && matchesFilter;
        })
    ), [invoices, searchTerm, filter]);

    const handleMarkPaid = async (invoiceId) => {
        setActionInvoiceId(invoiceId);
        setError('');
        try {
            await markInvoicePaid(invoiceId);
            await refreshDashboard();
            await loadBillingData();
        } catch (err) {
            setError(err.message || 'Failed to update invoice status.');
        } finally {
            setActionInvoiceId('');
        }
    };

    const handlePreview = async (invoiceId) => {
        setPreviewLoading(true);
        setError('');
        try {
            const result = await fetchInvoiceById(invoiceId);
            setPreviewInvoice(result.invoice || null);
        } catch (err) {
            setError(err.message || 'Failed to load invoice preview.');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleShare = async () => {
        if (!previewInvoice) return;
        try {
            const blob = await pdf(
                <InvoicePdfDocument
                    data={{
                        invoiceNumber: previewInvoice.invoiceNumber,
                        date: previewInvoice.date,
                        status: previewInvoice.status,
                        clinicName: previewInvoice.clinicName,
                        patientName: previewInvoice.patientName,
                        patientContact: previewInvoice.patientContact,
                        items: previewInvoice.items || [],
                        subtotal: previewInvoice.subtotal,
                        tax: previewInvoice.tax,
                        discount: previewInvoice.discount,
                        total: previewInvoice.total,
                    }}
                />
            ).toBlob();

            const file = new File([blob], `Invoice-${previewInvoice.invoiceNumber}.pdf`, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Invoice #${previewInvoice.invoiceNumber}`,
                    text: `Invoice from ${previewInvoice.clinicName}`,
                });
            } else {
                // Fallback for browsers that don't support file sharing
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Sharing failed:', error);
            setError('Could not share the invoice.');
        }
    };

    return (
        <>
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 dashboard-reveal">
                    <div>
                        <h1 className={cn("text-2xl sm:text-4xl font-black tracking-tight", isDark ? 'text-white' : 'text-[#512c31]')}>Billing</h1>
                        <p className={cn("text-sm sm:text-base font-bold uppercase tracking-widest mt-1", isDark ? 'text-white/40' : 'text-[#512c31]/60')}>Manage invoices and payments</p>
                    </div>
                    <button
                        onClick={() => navigate('/app/invoices/new')}
                        className="w-full sm:w-auto bg-[#512c31] text-white px-4 py-3 sm:px-6 sm:py-3 rounded-2xl sm:rounded-[1.5rem] font-bold tracking-wide hover:bg-[#e8919a] hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Create Invoice</span>
                    </button>
                </div>

                {error && (
                    <div className={cn(
                        "rounded-xl border px-4 py-3 text-sm",
                        isDark ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-700"
                    )}>
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 dashboard-reveal reveal-delay-1">
                    <div className={cn("rounded-3xl p-6 sm:p-8 transition-all border-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl", isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-green-50 flex items-center justify-center shadow-inner pt-0.5">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Cash Received</span>
                        </div>
                        {loading
                            ? <div className="skeleton-shimmer h-8 w-32 mt-1" />
                            : <p className={cn("text-2xl sm:text-4xl font-black tracking-tight", isDark ? 'text-white' : 'text-[#512c31]')}>{formatCurrency(summary.cashReceived)}</p>
                        }
                    </div>
                    <div className={cn("rounded-3xl p-6 sm:p-8 transition-all border-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl", isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-yellow-50 flex items-center justify-center shadow-inner pt-0.5">
                                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Pending</span>
                        </div>
                        {loading
                            ? <div className="skeleton-shimmer h-8 w-32 mt-1" />
                            : <p className={cn("text-2xl sm:text-4xl font-black tracking-tight", isDark ? 'text-white' : 'text-[#512c31]')}>{formatCurrency(summary.pendingAmount)}</p>
                        }
                    </div>
                    <div className={cn("rounded-3xl p-6 sm:p-8 transition-all border-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl", isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-50 flex items-center justify-center shadow-inner pt-0.5">
                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Overdue</span>
                        </div>
                        {loading
                            ? <div className="skeleton-shimmer h-8 w-32 mt-1" />
                            : <p className={cn("text-2xl sm:text-4xl font-black tracking-tight", isDark ? 'text-white' : 'text-[#512c31]')}>{formatCurrency(summary.overdueAmount)}</p>
                        }
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 dashboard-reveal reveal-delay-2">
                    <div className={cn("flex-1 rounded-3xl flex items-center gap-3 px-5 sm:px-6 transition-all border-4 shadow-lg", isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className={cn("flex-1 py-4 outline-none placeholder-gray-400 bg-transparent text-sm sm:text-base font-medium", isDark ? 'text-white' : 'text-[#512c31]')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={cn("w-full sm:w-auto px-5 py-4 rounded-3xl outline-none border-4 font-bold text-sm shadow-lg tracking-wide transition-all cursor-pointer focus:border-[#e8919a]", isDark ? 'bg-[#1e1e1e] text-white border-gray-800' : 'bg-white text-[#512c31] border-gray-50 focus:bg-white')}
                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>

                {loading && (
                    <div className={cn('rounded-2xl overflow-hidden', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                        <div className={cn('px-4 py-3 border-b', isDark ? 'bg-[#0f0f0f] border-gray-800' : 'bg-gray-50 border-gray-200')}>
                            <div className="grid grid-cols-7 gap-4">
                                {[...Array(7)].map((_, i) => <div key={i} className="skeleton-shimmer h-4" />)}
                            </div>
                        </div>
                        <div className="divide-y divide-gray-800/40">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="px-4 py-4 grid grid-cols-7 gap-4 items-center">
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
                )}

                {!loading && filteredInvoices.length === 0 && (
                    <div className={cn("rounded-3xl p-12 text-center border-4 border-dashed", isDark ? 'bg-[#1e1e1e]/50 border-white/5 text-gray-400' : 'bg-[#fef9f3]/50 border-[#512c31]/10 text-[#512c31]')}>
                        <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4', isDark ? 'bg-white/5' : 'bg-white shadow-xl')}>
                            <FileText className={cn('w-8 h-8', isDark ? 'text-gray-600' : 'text-[#e8919a]')} />
                        </div>
                        <p className={cn("font-bold text-lg", isDark ? 'text-white' : 'text-[#512c31]')}>No invoices found</p>
                        <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-2", isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>Create your first invoice to start tracking payments.</p>
                    </div>
                )}

                {!loading && filteredInvoices.length > 0 && (
                    <>
                        <div className="sm:hidden space-y-4">
                            {filteredInvoices.map((invoice) => (
                                <div key={invoice.id} className={cn("p-5 rounded-3xl border-2 shadow-lg", isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-transparent')}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className={cn("font-black text-lg", isDark ? 'text-white' : 'text-[#512c31]')}>#{invoice.invoiceNumber}</p>
                                            <p className={cn("text-sm font-bold mt-1", isDark ? 'text-gray-300' : 'text-[#512c31]')}>{invoice.patient}</p>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1 mt-2">
                                        <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>{invoice.service || 'No Service'}</p>
                                        <p className={cn("text-xs font-bold uppercase tracking-widest", isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>{formatDate(invoice.date)}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-800">
                                        <p className={cn("font-black text-xl", isDark ? 'text-white' : 'text-[#512c31]')}>{formatCurrency(invoice.amount)}</p>
                                        <div className="flex items-center gap-2">
                                            {invoice.status !== 'paid' && (
                                                <button
                                                    onClick={() => handleMarkPaid(invoice.id)}
                                                    disabled={actionInvoiceId === invoice.id}
                                                    className="text-emerald-500 hover:text-white p-3 bg-emerald-50 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
                                                    title="Mark as paid"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button onClick={() => handlePreview(invoice.id)} className="text-[#ff7a6b] hover:text-white p-3 bg-red-50 hover:bg-[#ff7a6b] rounded-xl transition-all shadow-sm">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={cn("hidden sm:block rounded-[2.5rem] overflow-hidden dashboard-reveal reveal-delay-3 border-4 shadow-2xl overflow-x-auto", isDark ? 'bg-[#1e1e1e] border-white/5 shadow-black/50' : 'bg-white border-white/50 shadow-[#512c31]/5')}>
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className={cn("font-black uppercase tracking-widest text-[10px] sm:text-xs", isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}>
                                    <tr>
                                        <th className="p-5 sm:p-6">Invoice ID</th>
                                        <th className="p-5 sm:p-6">Patient</th>
                                        <th className="p-5 sm:p-6">Service</th>
                                        <th className="p-5 sm:p-6">Date</th>
                                        <th className="p-5 sm:p-6">Amount</th>
                                        <th className="p-5 sm:p-6">Status</th>
                                        <th className="p-5 sm:p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={cn("divide-y", isDark ? 'divide-gray-800' : 'divide-gray-50')}>
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className={cn("transition-all duration-300 group", isDark ? 'hover:bg-[#252525]' : 'hover:bg-[#fef9f3]')}>
                                            <td className={cn("p-5 sm:p-6 font-bold", isDark ? 'text-white' : 'text-[#512c31]')}>#{invoice.invoiceNumber}</td>
                                            <td className={cn("p-5 sm:p-6 font-bold", isDark ? 'text-gray-300' : 'text-[#512c31]')}>{invoice.patient}</td>
                                            <td className={cn("p-5 sm:p-6 font-medium", isDark ? 'text-gray-400' : 'text-[#512c31]/80')}>{invoice.service || '-'}</td>
                                            <td className={cn("p-5 sm:p-6 font-medium", isDark ? 'text-gray-400' : 'text-[#512c31]/80')}>{formatDate(invoice.date)}</td>
                                            <td className={cn("p-5 sm:p-6 font-black", isDark ? 'text-white' : 'text-[#512c31]')}>{formatCurrency(invoice.amount)}</td>
                                            <td className="p-5 sm:p-6">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="p-5 sm:p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {invoice.status !== 'paid' && (
                                                        <button
                                                            onClick={() => handleMarkPaid(invoice.id)}
                                                            disabled={actionInvoiceId === invoice.id}
                                                            className="text-emerald-500 hover:text-white p-2 sm:p-3 bg-emerald-50 hover:bg-emerald-500 rounded-xl transition-all shadow-sm group-hover:scale-105"
                                                            title="Mark as paid"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handlePreview(invoice.id)} className="text-[#ff7a6b] hover:text-white p-2 sm:p-3 bg-red-50 hover:bg-[#ff7a6b] rounded-xl transition-all shadow-sm group-hover:scale-105">
                                                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
            {previewLoading && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center text-white">Loading preview...</div>
            )}
            {previewInvoice && (
                <div className="fixed inset-0 bg-black/70 z-50 p-0 sm:p-4 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center">
                    <div className={cn(
                        "h-[95dvh] w-full max-w-6xl rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden border-4 shadow-2xl transition-all flex flex-col",
                        isDark ? "bg-[#1e1e1e] border-white/5" : "bg-[#fef9f3] border-white/50"
                    )}>
                        <div className={cn(
                            "h-16 sm:h-20 px-6 sm:px-8 flex items-center justify-between border-b shrink-0",
                            isDark ? "border-white/5" : "border-[#512c31]/5 bg-white/50"
                        )}>
                            <div className="flex flex-col">
                                <span className={cn("font-black text-lg", isDark ? 'text-white' : 'text-[#512c31]')}>Invoice Preview</span>
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest mt-0.5", isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>#{previewInvoice.invoiceNumber}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <PDFDownloadLink
                                    document={
                                        <InvoicePdfDocument
                                            data={{
                                                invoiceNumber: previewInvoice.invoiceNumber,
                                                date: previewInvoice.date,
                                                status: previewInvoice.status,
                                                clinicName: previewInvoice.clinicName,
                                                patientName: previewInvoice.patientName,
                                                patientContact: previewInvoice.patientContact,
                                                items: previewInvoice.items || [],
                                                subtotal: previewInvoice.subtotal,
                                                tax: previewInvoice.tax,
                                                discount: previewInvoice.discount,
                                                total: previewInvoice.total,
                                            }}
                                        />
                                    }
                                    fileName={`Invoice-${previewInvoice.invoiceNumber}.pdf`}
                                    className={cn(
                                        "px-4 py-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-bold text-xs tracking-wider uppercase",
                                        isDark ? "bg-[#512c31] text-white hover:bg-[#e8919a]" : "bg-[#512c31] hover:bg-[#e8919a] text-white shadow-lg"
                                    )}
                                >
                                    {({ loading }) => (
                                        <>
                                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="hidden sm:inline pt-0.5">{loading ? '...' : 'Download'}</span>
                                        </>
                                    )}
                                </PDFDownloadLink>

                                <button
                                    onClick={handleShare}
                                    className={cn(
                                        "px-4 py-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-bold text-xs tracking-wider uppercase",
                                        isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white hover:bg-[#ffe3e0] text-[#512c31] shadow-lg border-2 border-transparent"
                                    )}
                                >
                                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline pt-0.5">Share</span>
                                </button>

                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-800 mx-2" />

                                <button onClick={() => setPreviewInvoice(null)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-white hover:bg-[#e8919a] hover:text-white text-[#512c31] shadow-md")}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-gray-900 overflow-hidden relative">
                            <PDFViewer width="100%" height="100%" className="w-full h-full border-none">
                                <InvoicePdfDocument
                                    data={{
                                        invoiceNumber: previewInvoice.invoiceNumber,
                                        date: previewInvoice.date,
                                        status: previewInvoice.status,
                                        clinicName: previewInvoice.clinicName,
                                        patientName: previewInvoice.patientName,
                                        patientContact: previewInvoice.patientContact,
                                        items: previewInvoice.items || [],
                                        subtotal: previewInvoice.subtotal,
                                        tax: previewInvoice.tax,
                                        discount: previewInvoice.discount,
                                        total: previewInvoice.total,
                                    }}
                                />
                            </PDFViewer>

                            {/* Mobile Info Overlay - helper if PDFViewer is tricky on some devices */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden pointer-events-none">
                                <span className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white/70 text-[10px] whitespace-nowrap">
                                    Pinch to zoom • Use buttons above to save
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
