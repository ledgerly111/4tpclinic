import { HelpCircle, MessageCircle, Book, Video, Mail, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const helpCategories = [
    { icon: Book, title: 'Documentation', description: 'Browse our comprehensive guides', color: 'from-blue-500 to-blue-600' },
    { icon: Video, title: 'Video Tutorials', description: 'Learn with step-by-step videos', color: 'from-purple-500 to-purple-600' },
    { icon: MessageCircle, title: 'Live Chat', description: 'Chat with our support team', color: 'from-green-500 to-green-600' },
    { icon: Mail, title: 'Email Support', description: 'Get help via email', color: 'from-orange-500 to-orange-600' },
];

const faqItems = [
    'How do I add a new patient?',
    'How do I schedule an appointment?',
    'How do I generate a report?',
    'How do I manage inventory?',
];

export function Help() {
    const { theme } = useStore();
    const isDark = theme === 'dark';

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center py-8 sm:py-12 dashboard-reveal">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] bg-[#512c31] text-white shadow-xl shadow-[#512c31]/20 mb-6">
                    <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h1 className={cn("text-3xl sm:text-5xl font-black tracking-tight mb-3", isDark ? 'text-white' : 'text-[#512c31]')}>How can we help?</h1>
                <p className={cn("text-xs sm:text-sm font-bold uppercase tracking-widest", isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Find answers to your questions</p>
            </div>

            {/* Search */}
            <div className="max-w-2xl mx-auto px-4 sm:px-0 dashboard-reveal reveal-delay-1">
                <div className={cn("rounded-[2rem] flex items-center gap-4 px-6 sm:px-8 py-4 sm:py-5 border-4 shadow-xl transition-all focus-within:ring-4 focus-within:ring-[#e8919a]/20", isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-white/50 shadow-[#512c31]/5')}>
                    <Search className={cn("w-6 h-6", isDark ? "text-gray-500" : "text-[#e8919a]")} />
                    <input
                        type="text"
                        placeholder="Search for help..."
                        className={cn("flex-1 bg-transparent outline-none placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-xs text-sm sm:text-base font-black tracking-wide", isDark ? 'text-white placeholder-gray-600' : 'text-[#512c31] placeholder-[#512c31]/40')}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mt-8 sm:mt-12 px-4 sm:px-0 dashboard-reveal reveal-delay-2">
                {helpCategories.map((category) => (
                    <button
                        key={category.title}
                        className={cn("rounded-[2.5rem] p-6 sm:p-8 text-left transition-all group border-4 shadow-lg hover:shadow-2xl hover:-translate-y-1", isDark ? 'bg-[#1e1e1e] border-white/5 hover:border-white/10' : 'bg-[#fef9f3] border-transparent hover:border-white')}
                    >
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] bg-gradient-to-br ${category.color} flex items-center justify-center mb-5 sm:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                            <category.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
                        </div>
                        <h3 className={cn("font-black tracking-tight text-lg sm:text-xl mb-1", isDark ? 'text-white' : 'text-[#512c31]')}>{category.title}</h3>
                        <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>{category.description}</p>
                    </button>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto mt-12 sm:mt-16 px-4 sm:px-0 dashboard-reveal reveal-delay-3">
                <h2 className={cn("text-xl sm:text-2xl font-black tracking-tight mb-6 sm:mb-8 text-center", isDark ? 'text-white' : 'text-[#512c31]')}>Frequently Asked Questions</h2>
                <div className="space-y-3 sm:space-y-4">
                    {faqItems.map((question, idx) => (
                        <div key={idx} className={cn("rounded-3xl p-5 sm:p-6 flex items-center justify-between transition-all cursor-pointer border-2 shadow-sm hover:shadow-md hover:scale-[1.01] group", isDark ? 'bg-[#0f0f0f] border-gray-800 hover:border-gray-700' : 'bg-white border-transparent hover:border-white shadow-[#512c31]/5')}>
                            <span className={cn("text-sm sm:text-base font-bold", isDark ? 'text-gray-300 group-hover:text-white' : 'text-[#512c31]/80 group-hover:text-[#512c31]')}>{question}</span>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-sm", isDark ? "bg-white/5 group-hover:bg-white/10 text-gray-400" : "bg-[#fef9f3] text-[#512c31] group-hover:bg-[#e8919a] group-hover:text-white")}>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
