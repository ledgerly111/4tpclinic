import { ArrowUpRight, ShoppingCart, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

export function InventorySellCard() {
    const { theme } = useStore();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const handleSellClick = () => {
        // Navigate to inventory with a query param or state to trigger a "Sell" mode if implemented later
        // For now, just going to inventory is a good start
        navigate('/inventory');
    };

    return (
        <div className={cn(
            "rounded-3xl p-5 h-full flex flex-col transition-colors duration-300 relative overflow-hidden group",
            isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200'
        )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-10">
                <h2 className={cn(
                    "text-lg font-bold tracking-wide flex items-center gap-2",
                    isDark ? 'text-white' : 'text-gray-900'
                )}>
                    <ShoppingCart className="w-5 h-5 text-emerald-500" />
                    SELL INVENTORY
                </h2>
                <button
                    onClick={handleSellClick}
                    className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        isDark
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                >
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center z-10">
                <p className={cn(
                    "text-sm mb-6 leading-relaxed",
                    isDark ? 'text-gray-400' : 'text-gray-600'
                )}>
                    Directly sell products and supplies from your clinic's inventory. Track sales and update stock levels instantly.
                </p>

                <button
                    onClick={handleSellClick}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Tag className="w-4 h-4" />
                    New Sale
                </button>
            </div>

            {/* Decorative Background Elements */}
            <div className={cn(
                "absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors",
                isDark ? 'bg-emerald-500' : 'bg-emerald-400'
            )} />
        </div>
    );
}
