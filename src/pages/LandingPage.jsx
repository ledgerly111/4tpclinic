import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Users,
    FileText,
    TrendingUp,
    Shield,
    Clock,
    ChevronRight,
    Activity,
    Heart,
    Zap,
    ArrowRight,
    Menu,
    X,
    Sparkles,
    Stethoscope,
    BarChart3,
    CheckCircle2,
    Database,
    Lock,
    Bell,
    PieChart,
    Cpu,
    ChevronDown,
    ArrowUpRight,
    Smile,
    Frown,
    AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#fef9f3] overflow-x-hidden font-sans selection:bg-[#e8919a]/30">
            {/* Navigation */}
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled || mobileMenuOpen
                    ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 py-3 sm:py-4"
                    : "bg-transparent py-5 sm:py-6"
            )}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#e8919a] flex items-center justify-center shadow-lg shadow-[#e8919a]/30 group-hover:scale-110 transition-transform">
                                <span className="text-[#fef9f3] font-black text-sm sm:text-xl tracking-tighter">4TP</span>
                            </div>
                            <span className="text-[#512c31] font-bold text-base sm:text-xl tracking-tight">4 The People</span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <button onClick={() => scrollToSection('hero')} className="text-[#512c31]/70 hover:text-[#e8919a] transition-colors text-sm font-semibold">Platform</button>
                            <button onClick={() => scrollToSection('impact')} className="text-[#512c31]/70 hover:text-[#e8919a] transition-colors text-sm font-semibold">Impact</button>
                            <button onClick={() => scrollToSection('footer')} className="text-[#512c31]/70 hover:text-[#e8919a] transition-colors text-sm font-semibold">Contact</button>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <button onClick={() => navigate('/login')} className="hidden sm:block text-[#512c31] font-bold text-sm hover:text-[#e8919a] transition-colors">Login</button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#512c31] text-white rounded-full font-bold text-xs sm:text-sm shadow-xl shadow-[#512c31]/20 hover:bg-[#e8919a] transition-all"
                            >
                                Get Started
                            </button>

                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-[#512c31] hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={cn(
                    "md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-gray-100 transition-all duration-300 overflow-hidden",
                    mobileMenuOpen ? "max-h-[300px] py-6 opacity-100" : "max-h-0 py-0 opacity-0"
                )}>
                    <div className="flex flex-col items-center gap-6 px-4 font-bold text-lg text-[#512c31]">
                        <button onClick={() => scrollToSection('hero')} className="w-full text-center py-2 hover:text-[#e8919a]">Platform</button>
                        <button onClick={() => scrollToSection('impact')} className="w-full text-center py-2 hover:text-[#e8919a]">Impact</button>
                        <button onClick={() => scrollToSection('footer')} className="w-full text-center py-2 hover:text-[#e8919a]">Contact</button>
                        <button onClick={() => navigate('/login')} className="w-full text-center py-3 bg-[#f0cbc1] rounded-2xl text-[#512c31]">Login</button>
                    </div>
                </div>
            </nav>

            {/* Bento Grid Hero */}
            <main id="hero" className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-20 px-3 sm:px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:grid-rows-6 h-auto lg:h-[1200px]">

                    {/* Top Left: Logo Card */}
                    <div className="lg:col-span-12 lg:row-span-1 bg-[#512c31] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 flex items-center gap-4 sm:gap-6 group overflow-hidden relative order-1">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#e8919a] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                            <div className="grid grid-cols-2 gap-1 px-1">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#fef9f3] rounded-sm" />
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-transparent border-2 border-[#fef9f3] rounded-sm" />
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-transparent border-2 border-[#fef9f3] rounded-sm" />
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#fef9f3] rounded-sm" />
                            </div>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#fef9f3] tracking-tighter">4TP Support</h2>
                    </div>

                    {/* Top Right: Decisions Card */}
                    <div className="lg:col-span-5 lg:row-span-1 bg-[#f0cbc1] rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-6 flex items-center gap-4 sm:gap-6 overflow-hidden border-2 sm:border-4 border-[#512c31]/5 order-2">
                        <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#512c31] leading-tight flex flex-wrap gap-1">
                                Decisions <span className="text-[#e8919a]">made easy</span> with <span className="opacity-80">instant support.</span>
                            </h3>
                            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
                                <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#512c31] flex items-center justify-center text-white hover:bg-[#e8919a] transition-all shadow-md">
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </button>
                                <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-[#512c31] rounded-full text-[10px] sm:text-xs font-black border border-[#e8919a]/20 uppercase">
                                    Get In Touch
                                </span>
                            </div>
                        </div>
                        <div className="hidden xs:block w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#512c31]/10 flex-shrink-0 relative overflow-hidden">
                            <Users className="w-8 h-8 sm:w-12 sm:h-12 text-[#512c31]/40" />
                        </div>
                    </div>

                    {/* Middle Left: Precision Guidance Card */}
                    <div className="sm:col-span-1 lg:col-span-7 lg:row-span-3 bg-[#e8919a] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden group min-h-[350px] sm:min-h-0 order-3">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#512c31]/10 rounded-full -mr-20 -mt-20 blur-3xl" />

                        <div className="space-y-4 sm:space-y-6 relative z-10">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#512c31] rounded-xl flex items-center justify-center text-[#e8919a]">
                                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#fef9f3] leading-[0.9] tracking-tighter">
                                Precision<br />Guidance<br />For<br />Providers
                            </h1>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 sm:pt-4">
                                {['Monitoring', 'CDS', 'Education', 'Records'].map(tag => (
                                    <span key={tag} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#fef9f3] text-[#512c31] rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 -mb-10 -mr-10 opacity-60 sm:opacity-80 group-hover:scale-105 transition-transform duration-700 pointer-events-none">
                            <img
                                src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600"
                                alt="Focal Provider"
                                className="w-full h-full object-contain drop-shadow-2xl grayscale"
                            />
                        </div>
                    </div>

                    {/* Middle Center: Healthcare Complexities Card */}
                    <div className="sm:col-span-1 lg:col-span-4 lg:row-span-3 bg-white border-2 border-[#512c31]/5 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[350px] sm:min-h-0 order-4">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#e8919a]/5 to-transparent" />

                        <div className="relative z-10 space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-2 gap-2 w-40 sm:w-48 mx-auto translate-y-2">
                                <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-[#512c31] text-[#fef9f3] rounded-lg text-[10px] sm:text-xs font-black rotate-[-12deg] shadow-lg uppercase">DIAGNOSTIC</span>
                                <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-[#e8919a] text-[#fef9f3] rounded-lg text-[10px] sm:text-xs font-black rotate-[8deg] shadow-lg uppercase">TREATMENT</span>
                                <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-[#512c31] text-[#fef9f3] rounded-lg text-[10px] sm:text-xs font-black rotate-[-4deg] shadow-lg uppercase">REMINDERS</span>
                                <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-[#e8919a] text-[#fef9f3] rounded-lg text-[10px] sm:text-xs font-black rotate-[15deg] shadow-lg uppercase">ASSESSMENT</span>
                            </div>

                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#f0cbc1] rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-xl relative">
                                <Activity className="w-12 h-12 sm:w-20 sm:h-20 text-[#512c31]/20" />
                            </div>

                            <div className="space-y-1 sm:space-y-2">
                                <h3 className="text-2xl sm:text-3xl font-black text-[#512c31] leading-none">Making Sense of</h3>
                                <div className="inline-block px-3 py-1 bg-[#e8919a] text-[#fef9f3] rounded-lg text-xl sm:text-2xl font-black">Healthcare's</div>
                                <h3 className="text-2xl sm:text-3xl font-black text-[#512c31] leading-none">Complexities</h3>
                            </div>
                        </div>
                    </div>

                    {/* Middle Right: Goal Card */}
                    <div className="lg:col-span-3 lg:row-span-2 bg-[#e8919a] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-center items-center relative overflow-hidden shadow-xl shadow-[#e8919a]/20 order-5">
                        <div className="w-32 h-32 sm:w-48 sm:h-48 border-[8px] sm:border-[12px] border-white/20 rounded-full flex flex-col items-center justify-center relative">
                            <div className="absolute top-0 right-0 w-full h-full border-[8px] sm:border-[12px] border-white rounded-full border-t-transparent border-r-transparent -rotate-45" />
                            <span className="text-3xl sm:text-5xl font-black text-white">60<span className="text-xl opacity-60">/100%</span></span>
                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1">Daily Goal</span>
                        </div>
                        <button className="mt-6 sm:mt-8 w-full bg-[#512c31] text-[#fef9f3] py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-black transition-all">
                            Lets Complete All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Bottom Right: Excellence Card */}
                    <div className="lg:col-span-3 lg:row-span-3 bg-white border-2 border-[#512c31]/5 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between overflow-hidden group order-7">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-[#512c31]/30 uppercase tracking-[0.2em]">Excellence</h4>
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-[#e8919a] flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 my-6 sm:my-0">
                            <h3 className="text-2xl sm:text-3xl font-black text-[#512c31] leading-tight text-center sm:text-left">Expert Decision Support</h3>
                            <p className="text-[#512c31]/50 text-xs font-bold text-center sm:text-left">Data-driven precision care.</p>
                        </div>

                        <div className="mt-4 flex justify-center">
                            <div className="w-full aspect-[16/9] sm:aspect-[4/3] bg-[#f0cbc1] rounded-2xl sm:rounded-3xl relative overflow-hidden group-hover:rotate-1 transition-transform flex items-center justify-center">
                                <Shield className="w-12 h-12 sm:w-20 sm:h-20 text-[#512c31]/10" />
                                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-[#512c31]/80 to-transparent">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#e8919a] animate-pulse" />
                                        <span className="text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none">Live System Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Left: Logo/Icon Card */}
                    <div className="lg:col-span-4 lg:row-span-2 bg-[#f0cbc1] rounded-3xl sm:rounded-[2.5rem] p-8 flex items-center justify-center relative group order-6">
                        <div className="w-24 h-24 sm:w-40 sm:h-40 bg-white rounded-3xl sm:rounded-[2.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-[#e8919a] rounded-xl sm:rounded-2xl flex items-center justify-center rotate-45 group-hover:rotate-[225deg] transition-transform duration-700">
                                <div className="grid grid-cols-2 gap-1 px-1 -rotate-45">
                                    <div className="w-2 h-2 bg-[#fef9f3] rounded-sm" />
                                    <div className="w-2 h-2 bg-transparent border border-[#fef9f3] rounded-sm" />
                                    <div className="w-2 h-2 bg-transparent border border-[#fef9f3] rounded-sm" />
                                    <div className="w-2 h-2 bg-[#fef9f3] rounded-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Center: Exceptional Patient Care Card */}
                    <div className="lg:col-span-5 lg:row-span-2 bg-[#512c31] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between group overflow-hidden order-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#fef9f3] leading-tight max-w-[90%] text-center sm:text-left">Informed Healing and Exceptional Patient Care 😊</h3>

                        <div className="flex justify-center sm:justify-start gap-4 mt-6">
                            {[Frown, Smile, AlertCircle].map((Icon, i) => (
                                <div key={i} className={cn(
                                    "w-12 h-12 sm:w-16 rounded-xl flex items-center justify-center transition-all cursor-pointer",
                                    i === 1 ? "bg-[#e8919a] text-black" : "bg-white/5 text-white hover:bg-white/10"
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            {/* Platform Impact Section */}
            <section id="impact" className="py-16 sm:py-24 bg-[#512c31] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12 sm:mb-20">
                        <span className="text-[#e8919a] font-black uppercase tracking-[0.2em] text-xs sm:text-sm">Our Impact</span>
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#fef9f3] mt-4 mb-8 tracking-tighter leading-tight">Focus on what<br className="hidden sm:block" /> matters most.</h2>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mt-12 sm:mt-16">
                            {[
                                { val: '99%', label: 'ACCURACY' },
                                { val: '24/7', label: 'SUPPORT' },
                                { val: '10K+', label: 'PROVIDERS' },
                                { val: '1M+', label: 'PATIENTS' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center group">
                                    <div className="text-4xl sm:text-6xl font-black text-[#e8919a] mb-2 group-hover:scale-110 transition-transform">{stat.val}</div>
                                    <div className="text-[#fef9f3]/40 font-bold tracking-widest text-[8px] sm:text-xs uppercase">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="footer" className="bg-white py-12 sm:py-20 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#e8919a] flex items-center justify-center shadow-lg shadow-[#e8919a]/30">
                                <span className="text-white font-black text-xl tracking-tighter">4TP</span>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-[#512c31]">4 The People</h4>
                                <p className="text-[#512c31]/40 font-bold text-[10px] uppercase tracking-widest">Precision Healthcare Intelligence</p>
                            </div>
                        </div>

                        <div className="flex gap-12 sm:gap-16">
                            <div className="space-y-4">
                                <h5 className="font-black text-[#512c31] uppercase tracking-[0.2em] text-[10px]">Resources</h5>
                                <ul className="space-y-2 text-[#512c31]/50 font-bold text-xs uppercase cursor-pointer">
                                    <li className="hover:text-[#e8919a]">Platform</li>
                                    <li className="hover:text-[#e8919a]">Impact</li>
                                    <li className="hover:text-[#e8919a]">Docs</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h5 className="font-black text-[#512c31] uppercase tracking-[0.2em] text-[10px]">Legal</h5>
                                <ul className="space-y-2 text-[#512c31]/50 font-bold text-xs uppercase cursor-pointer">
                                    <li className="hover:text-[#e8919a]">Privacy</li>
                                    <li className="hover:text-[#e8919a]">Terms</li>
                                    <li className="hover:text-[#e8919a]">Contact</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 pt-8 border-t border-gray-50 text-center text-[#512c31]/20 text-[8px] font-black tracking-[0.2em] uppercase">
                        © 2024 4 The People Healthcare • Precision Care Intelligence
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s infinite ease-in-out;
                }
                html {
                    scroll-padding-top: 80px;
                }
                @media (max-width: 480px) {
                   .xs\\:block { display: block !important; }
                   .xs\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}
