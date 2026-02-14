import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Send, Mic, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

export function AIAssistantCard() {
    const { aiInsights, stats, theme } = useStore();
    const isDark = theme === 'dark';
    const [messages, setMessages] = useState([
        {
            id: '1',
            type: 'ai',
            content: `Hi, Dr. Smith,

The clinic shows strong revenue, but two flags need attention: AOV is dipping and Labor Cost is 28%. Let's initiate the optimization strategy.`,
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const responses = [
                "I'll analyze that for you. Based on current data, I recommend focusing on follow-up appointments to increase AOV.",
                "Good question! Peak times are Tue/Thu afternoons. Consider extending hours those days.",
                "Inventory check: Order Hand Sanitizer, Masks, and Syringes within 48 hours.",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: randomResponse,
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const quickActions = [
        { label: '🔍 Show labor cost', color: isDark ? 'bg-[#60a5fa]/20 text-[#60a5fa]' : 'bg-blue-100 text-blue-600' },
        { label: '📅 Initiate strategy planning', color: isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600' },
    ];

    return (
        <div className={cn(
            "rounded-3xl p-5 h-full flex flex-col transition-colors duration-300",
            isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200'
        )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h2 className={cn(
                    "text-lg font-bold tracking-wide",
                    isDark ? 'text-white' : 'text-gray-900'
                )}>AI OPERATIONS LEAD</h2>
                <button className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    isDark 
                        ? 'bg-white/10 text-white hover:bg-white/20' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}>
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        {message.type === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[10px] font-bold">AI</span>
                            </div>
                        )}
                        <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                                message.type === 'user'
                                    ? 'bg-[#ff7a6b] text-white'
                                    : isDark 
                                        ? 'bg-white/10 text-gray-200' 
                                        : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            <p className="text-xs whitespace-pre-line leading-relaxed">{message.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">AI</span>
                        </div>
                        <div className={cn(
                            "rounded-2xl px-3 py-2",
                            isDark ? 'bg-white/10' : 'bg-gray-100'
                        )}>
                            <div className="flex gap-1">
                                <span className={cn("w-1.5 h-1.5 rounded-full animate-bounce", isDark ? 'bg-gray-400' : 'bg-gray-500')} style={{ animationDelay: '0ms' }} />
                                <span className={cn("w-1.5 h-1.5 rounded-full animate-bounce", isDark ? 'bg-gray-400' : 'bg-gray-500')} style={{ animationDelay: '150ms' }} />
                                <span className={cn("w-1.5 h-1.5 rounded-full animate-bounce", isDark ? 'bg-gray-400' : 'bg-gray-500')} style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-3 flex-wrap">
                {quickActions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => {
                            setInputValue(action.label.replace('🔍 ', '').replace('📅 ', ''));
                            handleSend();
                        }}
                        className={`px-3 py-1.5 rounded-full text-[11px] transition-colors ${action.color}`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-full bg-[#ff7a6b] flex items-center justify-center text-white hover:bg-[#ff6b5b] transition-colors flex-shrink-0">
                    <span className="text-lg leading-none">+</span>
                </button>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask something or choose to start"
                        className={cn(
                            "w-full rounded-full px-3 py-2 text-xs outline-none transition-colors",
                            isDark 
                                ? 'bg-white/5 text-white placeholder-gray-500 focus:bg-white/10' 
                                : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
                        )}
                    />
                </div>
                <button className={cn(
                    "transition-colors",
                    isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                )}>
                    <Mic className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
