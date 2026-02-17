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
    ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const features = [
    { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered booking', color: '#ff7a6b' },
    { icon: Users, title: 'Patient Care', desc: '360° management', color: '#8b5cf6' },
    { icon: FileText, title: 'Digital Records', desc: 'Paperless & secure', color: '#60a5fa' },
    { icon: TrendingUp, title: 'Analytics', desc: 'Real-time insights', color: '#34d399' },
];

const floatingTags = ['Monitoring', 'CDS', 'Patient Education', 'Electronic Records'];

const stats = [
    { value: '50%', label: 'Time Saved', icon: Clock },
    { value: '40%', label: 'No-Shows ↓', icon: Calendar },
    { value: '99.9%', label: 'Uptime', icon: Activity },
    { value: '10K+', label: 'Clinics', icon: Heart },
];

const impactStats = [
    { value: '3x', label: 'Faster Processing', icon: BarChart3, color: '#ff7a6b' },
    { value: '98%', label: 'Satisfaction', icon: Activity, color: '#8b5cf6' },
    { value: '50%', label: 'Time Saved', icon: Clock, color: '#60a5fa' },
    { value: '10K+', label: 'Lives Improved', icon: Heart, color: '#34d399' },
];

const capabilities = [Database, Lock, Bell, PieChart, Cpu, Shield, Activity, CheckCircle2];

export function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-rotate features on mobile
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] overflow-x-hidden font-sans">
            {/* Navigation - Mobile Optimized */}
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled 
                    ? "bg-[#0f0f0f]/95 backdrop-blur-xl border-b border-white/5 py-2 sm:py-3" 
                    : "bg-transparent py-3 sm:py-5"
            )}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div 
                            className="flex items-center gap-2 sm:gap-3 cursor-pointer" 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#e8919a] flex items-center justify-center shadow-lg shadow-[#e8919a]/30">
                                <span className="text-[#fef9f3] font-black text-base sm:text-xl tracking-tighter">4TP</span>
                            </div>
                            <span className="hidden sm:block text-white font-bold text-lg">4 The People</span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors text-sm">Features</button>
                            <button onClick={() => scrollToSection('impact')} className="text-gray-400 hover:text-white transition-colors text-sm">Impact</button>
                            <button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-white transition-colors text-sm">About</button>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/login')}
                                className="hidden sm:flex px-5 sm:px-6 py-2 sm:py-2.5 bg-[#e8919a] text-[#fef9f3] rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-[#e8919a]/30 transition-all hover:scale-105 active:scale-95"
                            >
                                Login
                            </button>
                            
                            {/* Mobile Menu Button */}
                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={cn(
                    "md:hidden absolute top-full left-0 right-0 bg-[#0f0f0f]/98 backdrop-blur-xl border-b border-white/5 transition-all duration-300 overflow-hidden",
                    mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                    <div className="px-4 py-4 space-y-2">
                        <button 
                            onClick={() => scrollToSection('features')} 
                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 text-white text-left active:bg-white/10 transition-colors"
                        >
                            <span>Features</span>
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                        <button 
                            onClick={() => scrollToSection('impact')} 
                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 text-white text-left active:bg-white/10 transition-colors"
                        >
                            <span>Impact</span>
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                        <button 
                            onClick={() => scrollToSection('about')} 
                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 text-white text-left active:bg-white/10 transition-colors"
                        >
                            <span>About</span>
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full mt-2 px-4 py-3 bg-[#e8919a] text-[#fef9f3] rounded-2xl font-semibold text-center active:scale-95 transition-transform"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Mobile First Bento Grid */}
            <section className="relative pt-20 sm:pt-24 lg:pt-28 pb-8 sm:pb-12 lg:pb-16 px-3 sm:px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                        
                        {/* Main Hero Card */}
                        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-5 sm:p-8 lg:p-12 min-h-[320px] sm:min-h-[400px]">
                            <div className="absolute inset-0 opacity-30">
                                <div className="absolute -top-10 -right-10 w-40 h-40 sm:w-48 sm:h-48 bg-[#e8919a] rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-48 h-48 sm:w-56 sm:h-56 bg-[#8b5cf6] rounded-full blur-3xl" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6">
                                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e8919a]" />
                                    <span className="text-gray-300 text-xs sm:text-sm">Healthcare For The People</span>
                                </div>
                                
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                                    Precision Guidance
                                    <span className="block text-[#e8919a]">For Providers</span>
                                </h1>
                                
                                <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-lg">
                                    Streamline your clinic operations with intelligent tools designed for modern healthcare.
                                </p>
                                
                                {/* Tags - Horizontal scroll on mobile */}
                                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide mb-6 sm:mb-8">
                                    {floatingTags.map((tag, i) => (
                                        <span 
                                            key={i} 
                                            className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#e8919a]/10 border border-[#e8919a]/30 text-[#e8919a] text-xs sm:text-sm font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#e8919a] text-[#fef9f3] rounded-full font-semibold text-sm sm:text-base hover:shadow-xl hover:shadow-[#e8919a]/30 transition-all hover:scale-105 active:scale-95"
                                >
                                    Get Started
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Stats Grid - 2x2 on all screens */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-2 sm:gap-4">
                            {stats.map((stat, index) => (
                                <div 
                                    key={index}
                                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#1e1e1e] border border-white/5 p-4 sm:p-6 flex flex-col justify-center hover:border-[#e8919a]/30 transition-all active:scale-95"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-[#e8919a]/10 rounded-full blur-2xl" />
                                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#e8919a] mb-2 sm:mb-3" />
                                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                                    <p className="text-gray-500 text-xs sm:text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Mobile Optimized Bento */}
            <section id="features" className="py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <span className="text-[#e8919a] font-semibold text-xs sm:text-sm uppercase tracking-wider">Features</span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2">
                            Making Sense of Healthcare's<br className="hidden sm:block" /> Complexities
                        </h2>
                    </div>

                    {/* Mobile: Horizontal scroll for features */}
                    <div className="lg:hidden mb-4">
                        <div className="flex gap-3 overflow-x-auto pb-4 -mx-3 px-3 scrollbar-hide snap-x snap-mandatory">
                            {features.map((feature, index) => (
                                <div 
                                    key={index}
                                    className={cn(
                                        "flex-shrink-0 w-[280px] snap-center relative overflow-hidden rounded-2xl bg-[#1e1e1e] border p-5 transition-all",
                                        activeFeature === index ? "border-[#e8919a]/50" : "border-white/5"
                                    )}
                                >
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: `${feature.color}20` }}
                                    >
                                        <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                        {/* Feature indicators */}
                        <div className="flex justify-center gap-2 mt-2">
                            {features.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveFeature(i)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        activeFeature === i ? "bg-[#e8919a] w-6" : "bg-white/20"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Full Bento Grid */}
                    <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Large Feature Card */}
                        <div className="md:col-span-2 lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e8919a]/20 to-[#1a1a2e] p-8 border border-[#e8919a]/20">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {['Diagnostic', 'Treatment', 'Reminders', 'Assessment'].map((tag, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-[#e8919a] text-[#fef9f3] text-xs font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Complete Clinical Decision Support</h3>
                                    <p className="text-gray-400">Advanced algorithms guide every step of patient care, from diagnosis to treatment planning.</p>
                                </div>
                                <div className="w-full lg:w-48 h-48 rounded-2xl bg-[#e8919a]/10 flex items-center justify-center">
                                    <Stethoscope className="w-20 h-20 text-[#e8919a]" />
                                </div>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="relative overflow-hidden rounded-3xl bg-[#1e1e1e] border border-white/5 p-6 hover:border-[#e8919a]/30 transition-all group"
                            >
                                <div 
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: `${feature.color}20` }}
                                >
                                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.desc}</p>
                            </div>
                        ))}

                        {/* Progress Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e8919a] to-[#d67a83] p-8">
                            <div className="relative z-10">
                                <div className="text-5xl font-bold text-[#fef9f3] mb-2">60/100%</div>
                                <p className="text-[#fef9f3]/80 mb-6">Daily Decision Goal</p>
                                <div className="w-full bg-[#fef9f3]/20 rounded-full h-3 mb-6">
                                    <div className="w-[60%] bg-[#fef9f3] h-3 rounded-full" />
                                </div>
                                <button className="flex items-center gap-2 text-[#fef9f3] font-medium hover:gap-3 transition-all">
                                    Complete All <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Icon Grid Card */}
                        <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-[#1e1e1e] border border-white/5 p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Informed Healing & Exceptional Patient Care</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {capabilities.map((Icon, i) => (
                                    <div key={i} className="aspect-square rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#e8919a]/10 transition-colors">
                                        <Icon className="w-6 h-6 text-[#e8919a]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Additional Cards */}
                    <div className="lg:hidden mt-4 space-y-3">
                        {/* Progress Card Mobile */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8919a] to-[#d67a83] p-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl sm:text-4xl font-bold text-[#fef9f3] mb-1">60/100%</div>
                                    <p className="text-[#fef9f3]/80 text-sm">Daily Decision Goal</p>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-[#fef9f3]/30 flex items-center justify-center">
                                    <span className="text-[#fef9f3] font-bold">60%</span>
                                </div>
                            </div>
                        </div>

                        {/* Capabilities Grid Mobile */}
                        <div className="rounded-2xl bg-[#1e1e1e] border border-white/5 p-5">
                            <h3 className="text-base font-bold text-white mb-4">Complete Care Suite</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {capabilities.map((Icon, i) => (
                                    <div key={i} className="aspect-square rounded-xl bg-white/5 flex items-center justify-center active:bg-[#e8919a]/10 transition-colors">
                                        <Icon className="w-5 h-5 text-[#e8919a]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Section - Mobile Optimized */}
            <section id="impact" className="py-8 sm:py-12 lg:py-16 px-3 sm:px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#e8919a]/5 via-[#8b5cf6]/5 to-[#e8919a]/5" />
                
                <div className="relative max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div>
                            <span className="text-[#e8919a] font-semibold text-xs sm:text-sm uppercase tracking-wider">Impact</span>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2 mb-4 sm:mb-6">
                                Efficiency That
                                <span className="text-[#e8919a]"> Transforms</span>
                            </h2>
                            <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
                                Built on the principle that healthcare should be accessible, efficient, and patient-centered. With 4TP, you're not just getting software - you're getting a partner in delivering better care.
                            </p>

                            <div className="space-y-3 sm:space-y-4">
                                {[
                                    'AI-powered scheduling optimization',
                                    'Real-time analytics and reporting',
                                    'Secure HIPAA-compliant infrastructure',
                                    '24/7 dedicated support team'
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[#e8919a]/20 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#e8919a]" />
                                        </div>
                                        <span className="text-gray-300 text-sm sm:text-base">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats Grid - Mobile: 2x2, Desktop: Offset */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {impactStats.map((stat, index) => (
                                <div 
                                    key={index} 
                                    className={cn(
                                        "p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all active:scale-95 lg:odd:mt-0 lg:even:mt-8",
                                    )}
                                    style={{ 
                                        backgroundColor: `${stat.color}10`,
                                        borderColor: `${stat.color}30`,
                                    }}
                                >
                                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" style={{ color: stat.color }} />
                                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                                    <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Mobile Optimized */}
            <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#e8919a]/20 to-[#8b5cf6]/20" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                
                <div className="relative max-w-4xl mx-auto text-center px-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e8919a]" />
                        <span className="text-gray-300 text-xs sm:text-sm">Start your journey today</span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
                        Ready to Transform
                        <span className="block text-[#e8919a]">Your Clinic?</span>
                    </h2>
                    
                    <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-8 sm:mb-10 max-w-xl mx-auto">
                        Join thousands of healthcare providers who trust 4TP to power their practice.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        <button 
                            onClick={() => navigate('/login')}
                            className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#e8919a] text-[#fef9f3] rounded-full font-semibold text-sm sm:text-base hover:shadow-2xl hover:shadow-[#e8919a]/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3"
                        >
                            Get Started Now
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/20 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-white/10 transition-all active:scale-95">
                            Schedule Demo
                        </button>
                    </div>
                    
                    <p className="mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm">No credit card required • Free 14-day trial</p>
                </div>
            </section>

            {/* Footer - Mobile Optimized */}
            <footer className="py-8 sm:py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-6 sm:gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#e8919a] flex items-center justify-center">
                                <span className="text-[#fef9f3] font-black text-sm">4TP</span>
                            </div>
                            <span className="text-white font-semibold text-lg">4 The People</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-gray-500 text-sm">
                            <a href="#" className="hover:text-[#e8919a] transition-colors">Privacy</a>
                            <a href="#" className="hover:text-[#e8919a] transition-colors">Terms</a>
                            <a href="#" className="hover:text-[#e8919a] transition-colors">Support</a>
                            <a href="#" className="hover:text-[#e8919a] transition-colors">Contact</a>
                        </div>
                        
                        <p className="text-gray-600 text-xs sm:text-sm text-center">
                            © 2024 4TP Healthcare. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* CSS */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
