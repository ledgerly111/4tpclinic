import { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, TrendingDown, Box } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const inventoryItems = [
    { id: '1', name: 'Surgical Masks', category: 'PPE', stock: 45, threshold: 50, unit: 'boxes', status: 'low' },
    { id: '2', name: 'Hand Sanitizer', category: 'PPE', stock: 12, threshold: 20, unit: 'bottles', status: 'critical' },
    { id: '3', name: 'Syringes (10ml)', category: 'Equipment', stock: 200, threshold: 100, unit: 'pcs', status: 'good' },
    { id: '4', name: 'Bandages', category: 'Supplies', stock: 85, threshold: 50, unit: 'rolls', status: 'good' },
    { id: '5', name: 'Gloves (Latex)', category: 'PPE', stock: 30, threshold: 40, unit: 'boxes', status: 'low' },
    { id: '6', name: 'Thermometers', category: 'Equipment', stock: 8, threshold: 10, unit: 'pcs', status: 'low' },
];

export function Inventory() {
    const [searchTerm, setSearchTerm] = useState('');
    const { inventoryAlerts, theme } = useStore();
    const isDark = theme === 'dark';

    const filteredItems = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockCount = inventoryItems.filter(i => i.status === 'low' || i.status === 'critical').length;
    const totalItems = inventoryItems.length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'bg-green-500/20 text-green-400';
            case 'low': return 'bg-yellow-500/20 text-yellow-400';
            case 'critical': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                    <h1 className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Inventory</h1>
                    <p className={cn("text-sm sm:text-base", isDark ? 'text-gray-400' : 'text-gray-600')}>Track and manage medical supplies</p>
                </div>
                <button className="w-full sm:w-auto bg-[#ff7a6b] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add Item</span>
                </button>
            </div>

            {/* Alert Banner */}
            {lowStockCount > 0 && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <p className={cn("font-medium text-sm sm:text-base", isDark ? 'text-white' : 'text-gray-900')}>Low Stock Alert</p>
                        <p className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>{lowStockCount} items are below minimum threshold and need restocking</p>
                    </div>
                    <button className="w-full sm:w-auto px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition-colors text-sm font-medium">
                        View Alerts
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Box className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                        </div>
                        <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Total Items</span>
                    </div>
                    <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>{totalItems}</p>
                </div>
                <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        </div>
                        <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>In Stock</span>
                    </div>
                    <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>{totalItems - lowStockCount}</p>
                </div>
                <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                        </div>
                        <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Low Stock</span>
                    </div>
                    <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>{lowStockCount}</p>
                </div>
                <div className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        </div>
                        <span className={cn("text-xs sm:text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Critical</span>
                    </div>
                    <p className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>
                        {inventoryItems.filter(i => i.status === 'critical').length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className={cn("rounded-xl flex items-center gap-3 px-4", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <Search className="w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search inventory items..."
                    className={cn("flex-1 py-3 outline-none placeholder-gray-500 bg-transparent text-sm", isDark ? 'text-white' : 'text-gray-900')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Mobile Inventory Cards */}
            <div className="sm:hidden space-y-3">
                {filteredItems.map((item) => (
                    <div key={item.id} className={cn("p-4 rounded-xl", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", isDark ? 'bg-[#0f0f0f]' : 'bg-gray-100')}>
                                    <Package className={cn("w-5 h-5", isDark ? 'text-gray-400' : 'text-gray-600')} />
                                </div>
                                <div>
                                    <p className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-gray-900')}>{item.name}</p>
                                    <p className={cn("text-xs", isDark ? 'text-gray-400' : 'text-gray-600')}>{item.category}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div>
                                <p className={cn("text-xs", isDark ? 'text-gray-500' : 'text-gray-500')}>Stock</p>
                                <p className={cn(isDark ? 'text-white' : 'text-gray-900')}>{item.stock} <span className="text-gray-500">{item.unit}</span></p>
                            </div>
                            <div>
                                <p className={cn("text-xs", isDark ? 'text-gray-500' : 'text-gray-500')}>Threshold</p>
                                <p className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>{item.threshold}</p>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-[#ff7a6b]/20 text-[#ff7a6b] rounded-lg hover:bg-[#ff7a6b]/30 transition-colors text-sm">
                            Restock
                        </button>
                    </div>
                ))}
            </div>

            {/* Desktop Inventory Table */}
            <div className={cn("hidden sm:block rounded-2xl overflow-hidden", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <table className="w-full text-left text-sm">
                    <thead className={cn(isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-gray-50 text-gray-600')}>
                        <tr>
                            <th className="p-4">Item</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Current Stock</th>
                            <th className="p-4">Threshold</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={cn("divide-y", isDark ? 'divide-gray-800' : 'divide-gray-200')}>
                        {filteredItems.map((item) => (
                            <tr key={item.id} className={cn("transition-colors", isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-50')}>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? 'bg-[#0f0f0f]' : 'bg-gray-100')}>
                                            <Package className={cn("w-5 h-5", isDark ? 'text-gray-400' : 'text-gray-600')} />
                                        </div>
                                        <span className={cn("font-medium", isDark ? 'text-white' : 'text-gray-900')}>{item.name}</span>
                                    </div>
                                </td>
                                <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{item.category}</td>
                                <td className={cn("p-4", isDark ? 'text-white' : 'text-gray-900')}>
                                    {item.stock} <span className="text-gray-500">{item.unit}</span>
                                </td>
                                <td className={cn("p-4", isDark ? 'text-gray-400' : 'text-gray-600')}>{item.threshold}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="px-3 py-1.5 bg-[#ff7a6b]/20 text-[#ff7a6b] rounded-lg hover:bg-[#ff7a6b]/30 transition-colors text-sm">
                                        Restock
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
