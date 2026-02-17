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
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import {
    fetchAccountingSummary,
    fetchInvoiceById,
    fetchInvoices,
    markInvoicePaid,
} from '../lib/accountingApi';
import { PDFViewer } from '@react-pdf/renderer';
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
    const { theme } = useStore();
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

    return (
        <>
            <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <div>
                        <h1 className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Billing</h1>
                        <p className={cn("text-sm sm:text-base", isDark ? 'text-gray-400' : 'text-gray-600')}>Manage invoices and payments</p>
                    </div>
                    <button
                        onClick={() => navigate('/invoices/new')}
                        className="w-full sm:w-auto bg-[#ff7a6b] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-colors", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200 shadow-sm')}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                            </div>
                            <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Cash Received</span>
                        </div>
                        <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>
                            {formatCurrency(summary.cashReceived)}
                        </p>
                    </div>
                    <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-colors", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200 shadow-sm')}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                            </div>
                            <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Pending</span>
                        </div>
                        <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>
                            {formatCurrency(summary.pendingAmount)}
                        </p>
                    </div>
                    <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-colors", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200 shadow-sm')}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                            </div>
                            <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Overdue</span>
                        </div>
                        <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>
                            {formatCurrency(summary.overdueAmount)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className={cn("flex-1 rounded-xl flex items-center gap-3 px-4 transition-colors", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200 shadow-sm')}>
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className={cn("flex-1 py-3 outline-none placeholder-gray-500 bg-transparent text-sm", isDark ? 'text-white' : 'text-gray-900')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={cn("w-full sm:w-auto px-4 py-3 rounded-xl outline-none border text-sm", isDark ? 'bg-[#1e1e1e] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200')}
                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>

                {loading && (
                    <div className={cn("rounded-xl p-6 text-sm", isDark ? 'bg-[#1e1e1e] text-gray-400' : 'bg-white border border-gray-200 text-gray-600')}>
                        Loading billing data...
                    </div>
                )}

                {!loading && filteredInvoices.length === 0 && (
                    <div className={cn("rounded-xl p-6 text-sm", isDark ? 'bg-[#1e1e1e] text-gray-400' : 'bg-white border border-gray-200 text-gray-600')}>
                        No invoices found. Create your first invoice to start tracking payments.
                    </div>
                )}

                {!loading && filteredInvoices.length > 0 && (
                    <>
                        <div className="sm:hidden space-y-3">
                            {filteredInvoices.map((invoice) => (
                                <div key={invoice.id} className={cn("p-4 rounded-xl", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className={cn("font-medium", isDark ? 'text-white' : 'text-gray-900')}>#{invoice.invoiceNumber}</p>
                                            <p className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>{invoice.patient}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>{invoice.service || '-'}</p>
                                        <p className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>{formatDate(invoice.date)}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/30">
                                        <p className={cn("font-medium", isDark ? 'text-white' : 'text-gray-900')}>{formatCurrency(invoice.amount)}</p>
                                        <div className="flex items-center gap-2">
                                            {invoice.status !== 'paid' && (
                                                <button
                                                    onClick={() => handleMarkPaid(invoice.id)}
                                                    disabled={actionInvoiceId === invoice.id}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors",
                                                        isDark ? 'hover:bg-white/10 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600'
                                                    )}
                                                    title="Mark as paid"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => handlePreview(invoice.id)} className={cn("p-2 rounded-lg transition-colors", isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900')}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={cn("hidden sm:block rounded-2xl overflow-hidden", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                            <table className="w-full text-left text-sm">
                                <thead className={cn(isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-gray-50 text-gray-600')}>
                                    <tr>
                                        <th className="p-4">Invoice ID</th>
                                        <th className="p-4">Patient</th>
                                        <th className="p-4">Service</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={cn("divide-y", isDark ? 'divide-gray-800' : 'divide-gray-200')}>
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className={cn("transition-colors", isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50')}>
                                            <td className={cn("p-4 font-medium", isDark ? 'text-white' : 'text-gray-900')}>#{invoice.invoiceNumber}</td>
                                            <td className={cn("p-4", isDark ? 'text-gray-300' : 'text-gray-700')}>{invoice.patient}</td>
                                            <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{invoice.service || '-'}</td>
                                            <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{formatDate(invoice.date)}</td>
                                            <td className={cn("p-4 font-medium", isDark ? 'text-white' : 'text-gray-900')}>{formatCurrency(invoice.amount)}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    {invoice.status !== 'paid' && (
                                                        <button
                                                            onClick={() => handleMarkPaid(invoice.id)}
                                                            disabled={actionInvoiceId === invoice.id}
                                                            className={cn("p-2 rounded-lg transition-colors", isDark ? 'hover:bg-white/10 text-emerald-400' : 'hover:bg-gray-100 text-emerald-600')}
                                                            title="Mark as paid"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handlePreview(invoice.id)} className={cn("p-2 rounded-lg transition-colors", isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900')}>
                                                        <Eye className="w-4 h-4" />
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
                <div className="fixed inset-0 bg-black/80 z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "h-full w-full max-w-6xl mx-auto rounded-2xl overflow-hidden border shadow-2xl transition-colors",
                        isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"
                    )}>
                        <div className={cn(
                            "h-12 px-4 flex items-center justify-between border-b",
                            isDark ? "border-gray-800 text-white" : "border-gray-200 text-gray-900 bg-gray-50"
                        )}>
                            <span className="font-semibold text-sm">Invoice #{previewInvoice.invoiceNumber}</span>
                            <button onClick={() => setPreviewInvoice(null)} className={cn("transition-colors", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <PDFViewer width="100%" height="calc(100% - 48px)" className="w-full h-[calc(100%-48px)] border-none">
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
                    </div>
                </div>
            )}
        </>
    );
}
