import { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, TrendingDown, Box } from 'lucide-react';
import { useStore } from '../context/StoreContext';

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
    const { inventoryAlerts } = useStore();

    const filteredItems = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockCount = inventoryItems.filter(i => i.status === 'low' || i.status === 'critical').length;
    const totalItems = inventoryItems.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Inventory</h1>
                    <p className="text-gray-400">Track and manage medical supplies</p>
                </div>
                <button className="bg-[#ff7a6b] text-white px-4 py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            {/* Alert Banner */}
            {lowStockCount > 0 && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-medium">Low Stock Alert</p>
                        <p className="text-gray-400 text-sm">{lowStockCount} items are below minimum threshold and need restocking</p>
                    </div>
                    <button className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition-colors text-sm font-medium">
                        View Alerts
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#1e1e1e] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Box className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Items</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{totalItems}</p>
                </div>
                <div className="bg-[#1e1e1e] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-gray-400 text-sm">In Stock</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{totalItems - lowStockCount}</p>
                </div>
                <div className="bg-[#1e1e1e] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Low Stock</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{lowStockCount}</p>
                </div>
                <div className="bg-[#1e1e1e] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Critical</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {inventoryItems.filter(i => i.status === 'critical').length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-[#1e1e1e] rounded-xl flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search inventory items..."
                    className="flex-1 bg-transparent py-3 outline-none text-white placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Inventory Table */}
            <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#0f0f0f] text-gray-400">
                        <tr>
                            <th className="p-4">Item</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Current Stock</th>
                            <th className="p-4">Threshold</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-[#252525] transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#0f0f0f] flex items-center justify-center">
                                            <Package className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <span className="text-white font-medium">{item.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400">{item.category}</td>
                                <td className="p-4 text-white">
                                    {item.stock} <span className="text-gray-500">{item.unit}</span>
                                </td>
                                <td className="p-4 text-gray-400">{item.threshold}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        item.status === 'good' ? 'bg-green-500/20 text-green-400' :
                                        item.status === 'low' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
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
