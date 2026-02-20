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
        navigate('/app/inventory');
    };

    return (
        <div className={cn(
            "rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 h-full flex flex-col transition-all duration-300 shadow-xl border-4 border-white/50 group",
            isDark ? 'bg-[#1e1e1e]' : 'bg-[#fef9f3] hover:shadow-2xl hover:-translate-y-1'
        )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 z-10">
                <h2 className={cn(
                    "text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2",
                    isDark ? 'text-white' : 'text-[#512c31]'
                )}>
                    Insta-Sell
                </h2>
                <button
                    onClick={handleSellClick}
                    className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all bg-white shadow-sm border border-gray-100 group-hover:bg-[#512c31] group-hover:text-white group-hover:rotate-12",
                        isDark ? 'bg-white/10 text-white' : 'text-[#512c31]'
                    )}
                >
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-center z-10">
                <p className={cn(
                    "text-xs sm:text-sm font-bold uppercase tracking-widest leading-relaxed mb-4 sm:mb-6",
                    isDark ? 'text-gray-400' : 'text-[#512c31]/60'
                )}>
                    Directly sell products and supplies.
                </p>

                <button
                    onClick={handleSellClick}
                    className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[#512c31] text-white font-black shadow-xl hover:bg-[#e8919a] hover:scale-105 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base border border-transparent hover:border-white/20"
                >
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                    New Sale
                </button>
            </div>

            {/* Decorative Background Elements */}
            <div className={cn(
                "absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none transition-transform duration-700 group-hover:scale-150",
                isDark ? 'bg-emerald-500' : 'bg-[#e8919a]'
            )} />
        </div>
    );
}
