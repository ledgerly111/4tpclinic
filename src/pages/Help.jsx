import { HelpCircle, MessageCircle, Book, Video, Mail } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const helpCategories = [
    { icon: Book, title: 'Documentation', description: 'Browse our comprehensive guides', color: 'from-blue-500 to-blue-600' },
    { icon: Video, title: 'Video Tutorials', description: 'Learn with step-by-step videos', color: 'from-purple-500 to-purple-600' },
    { icon: MessageCircle, title: 'Live Chat', description: 'Chat with our support team', color: 'from-green-500 to-green-600' },
    { icon: Mail, title: 'Email Support', description: 'Get help via email', color: 'from-orange-500 to-orange-600' },
];

export function Help() {
    const { theme } = useStore();
    const isDark = theme === 'dark';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center py-8">
                <h1 className={cn("text-3xl font-bold mb-2", isDark ? 'text-white' : 'text-gray-900')}>How can we help?</h1>
                <p className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Find answers to your questions</p>
            </div>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
                <div className={cn("rounded-2xl flex items-center gap-3 px-6 py-4", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <HelpCircle className="w-6 h-6 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search for help..."
                        className={cn("flex-1 bg-transparent outline-none placeholder-gray-500 text-lg", isDark ? 'text-white' : 'text-gray-900')}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto mt-8">
                {helpCategories.map((category) => (
                    <button
                        key={category.title}
                        className={cn("rounded-2xl p-6 text-left transition-colors group", isDark ? 'bg-[#1e1e1e] hover:bg-[#252525]' : 'bg-white border border-gray-200 hover:bg-gray-50')}
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <category.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className={cn("font-semibold text-lg", isDark ? 'text-white' : 'text-gray-900')}>{category.title}</h3>
                        <p className={cn("text-sm mt-1", isDark ? 'text-gray-400' : 'text-gray-600')}>{category.description}</p>
                    </button>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto mt-12">
                <h2 className={cn("text-xl font-bold mb-6", isDark ? 'text-white' : 'text-gray-900')}>Frequently Asked Questions</h2>
                <div className="space-y-3">
                    {[
                        'How do I add a new patient?',
                        'How do I schedule an appointment?',
                        'How do I generate a report?',
                        'How do I manage inventory?',
                    ].map((question, idx) => (
                        <div key={idx} className={cn("rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer", isDark ? 'bg-[#1e1e1e] hover:bg-[#252525]' : 'bg-white border border-gray-200 hover:bg-gray-50')}>
                            <span className={cn(isDark ? 'text-gray-300' : 'text-gray-700')}>{question}</span>
                            <span className="text-gray-500">→</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
