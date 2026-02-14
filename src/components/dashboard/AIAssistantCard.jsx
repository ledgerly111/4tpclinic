import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Send, Mic, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function AIAssistantCard() {
    const { aiInsights, stats } = useStore();
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
        { label: '🔍 Show labor cost', color: 'bg-[#60a5fa]/20 text-[#60a5fa]' },
        { label: '📅 Initiate strategy planning', color: 'bg-white/10 text-gray-300' },
    ];

    return (
        <div className="bg-[#1e1e1e] rounded-3xl p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white tracking-wide">AI OPERATIONS LEAD</h2>
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
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
                                    : 'bg-white/10 text-gray-200'
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
                        <div className="bg-white/10 rounded-2xl px-3 py-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                        className="w-full bg-white/5 rounded-full px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:bg-white/10 transition-colors"
                    />
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                    <Mic className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
