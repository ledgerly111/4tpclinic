import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Users,
    FileText,
    TrendingUp,
    Shield,
    Clock,
    ArrowRight,
    Menu,
    X,
    Stethoscope,
    BarChart3,
    Lock,
    Heart,
    Activity,
    Star,
    CheckCircle,
    Zap,
    Clipboard
} from 'lucide-react';
import { cn } from '../lib/utils';

/* ── Animation Variants ── */
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

const hoverCard = {
    hover: {
        y: -10,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
    }
};

export function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    const features = [
        { icon: Users, title: 'Patient CRM', desc: 'Complete patient profiles, visit history, and demographic tracking in one place.', theme: 'maroon', layout: 'full' },
        { icon: FileText, title: 'Unified Billing', desc: 'Create invoices instantly, track payments, and generate PDF receipts with a click.', theme: 'pink', layout: 'side' },
        { icon: Calendar, title: 'Appointments', desc: 'Schedule, reschedule, and manage appointments with real-time availability.', theme: 'cream', layout: 'side' },
        { icon: Activity, title: 'Smart Inventory', desc: 'Auto-track stock levels, purchase orders, and expiry alerts for consumables.', theme: 'white', layout: 'full' },
        { icon: Clipboard, title: 'Services Catalog', desc: 'Define and price your services with category-based organisation.', theme: 'white', layout: 'side' },
        { icon: BarChart3, title: 'Reports & Analytics', desc: 'Daily and weekly revenue, staff performance, and growth insights at a glance.', theme: 'cream', layout: 'full' },
        { icon: Star, title: 'Staff Management', desc: 'Role-based access, attendance logs, and commission tracking per employee.', theme: 'pink', layout: 'full' },
        { icon: Shield, title: 'Secure & Compliant', desc: 'Enterprise encryption and Admin/Staff roles.', theme: 'maroon', layout: 'side' },
    ];

    return (
        <div className="min-h-screen bg-[#fef9f3] overflow-x-hidden font-sans selection:bg-[#e8919a]/30">

            {/* NAVIGATION */}
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
                scrolled || mobileMenuOpen
                    ? "bg-white/80 backdrop-blur-2xl border-b border-gray-100 py-3 sm:py-4 shadow-sm"
                    : "bg-transparent py-5 sm:py-6"
            )}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <div className="w-10 h-10 shrink-0 group-hover:scale-110 transition-transform">
                                <img src="/clinic.svg" alt="4TP Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[#512c31] font-bold text-xl tracking-tight">4 The People</span>
                        </motion.div>

                        <div className="hidden md:flex items-center gap-10">
                            {['Features', 'Impact', 'Contact'].map((l) => (
                                <button key={l} onClick={() => scrollTo(l === 'Contact' ? 'footer' : l.toLowerCase())}
                                    className="relative text-[#512c31]/70 hover:text-[#512c31] transition-colors text-sm font-bold group">
                                    {l}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e8919a] transition-all group-hover:w-full" />
                                </button>
                            ))}
                        </div>

                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-4"
                        >
                            <button onClick={() => navigate('/login')} className="hidden sm:block text-[#512c31] font-bold text-sm hover:opacity-70">Login</button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2.5 bg-[#512c31] text-white rounded-xl font-bold text-sm shadow-xl shadow-[#512c31]/20 hover:bg-[#e8919a] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                Get Started <ArrowRight className="w-4 h-4" />
                            </button>
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#512c31]">
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 flex flex-col gap-4">
                                {['Features', 'Impact', 'Contact'].map((l) => (
                                    <button key={l} onClick={() => scrollTo(l === 'Contact' ? 'footer' : l.toLowerCase())}
                                        className="text-left py-2 text-[#512c31] font-bold text-lg">{l}</button>
                                ))}
                                <button onClick={() => navigate('/login')} className="w-full py-4 bg-[#512c31] text-white rounded-xl font-bold">
                                    Login / Get Started
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* BENTO GRID HERO */}
            <main id="hero" className="pt-24 lg:pt-36 pb-12 sm:pb-20 px-4 max-w-7xl mx-auto">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3 sm:gap-5"
                >

                    {/* 1 - Brand Banner */}
                    <motion.div
                        variants={fadeInUp}
                        className="col-span-2 md:col-span-4 lg:col-span-12 bg-[#512c31] rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-12 flex flex-row items-center gap-4 sm:gap-8 relative overflow-hidden group shadow-2xl shadow-[#512c31]/20"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#e8919a_0%,transparent_60%)] opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 relative z-10 animate-float">
                            <img src="/clinic.svg" alt="4TP Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-left relative z-10">
                            <h2 className="text-2xl sm:text-6xl font-black text-white tracking-tighter mb-0.5 sm:mb-2">4TP Clinic ERP</h2>
                            <p className="text-white/60 text-[10px] sm:text-lg font-medium">Healthcare operations, beautifully refined.</p>
                        </div>
                        <div className="hidden lg:flex ml-auto gap-4 relative z-10">
                            <span className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 text-sm font-bold uppercase tracking-widest">Enterprise</span>
                            <span className="px-6 py-3 bg-[#e8919a] rounded-2xl text-white text-sm font-bold uppercase tracking-widest">v2.0</span>
                        </div>
                    </motion.div>

                    {/* 2 - Reports & Insights */}
                    <motion.div
                        variants={{ ...fadeInUp, ...hoverCard }}
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                        className="col-span-2 md:col-span-2 lg:col-span-5 bg-[#f0cbc1] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-7 flex items-center gap-6 overflow-hidden relative group border-4 border-white/50"
                    >
                        <div className="flex-1 relative z-10">
                            <h3 className="text-xl sm:text-2xl font-black text-[#512c31] leading-[1.1] mb-4">
                                Decisions <span className="text-white italic">made simple</span>.
                            </h3>
                            <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-2 sm:px-6 sm:py-3 bg-[#512c31] text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-black uppercase tracking-wider group/btn">
                                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> Analyze <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-[#512c31]/5 rounded-full flex items-center justify-center shrink-0 blur-sm group-hover:blur-0 transition-all">
                            <TrendingUp className="w-10 h-10 sm:w-16 sm:h-16 text-[#512c31]/20" />
                        </div>
                    </motion.div>

                    {/* 3 - Hero Focal Card */}
                    <motion.div
                        variants={fadeInUp}
                        whileTap={{ scale: 0.98 }}
                        className="col-span-2 md:col-span-2 lg:col-span-7 bg-[#e8919a] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-9 flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-[#e8919a]/20 min-h-[300px] sm:min-h-[400px]"
                    >
                        <div className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-40 h-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

                        <div className="relative z-10">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#512c31] rounded-xl sm:rounded-2xl flex items-center justify-center text-[#e8919a] mb-6 sm:mb-8 shadow-xl">
                                <Stethoscope className="w-5 h-5 sm:w-7 sm:h-7" />
                            </div>
                            <h1 className="text-3xl sm:text-6xl font-black text-white leading-[0.85] tracking-tighter mb-4 sm:mb-6">
                                Total<br />Practice<br />Control
                            </h1>
                            <p className="text-white/80 text-sm sm:text-lg font-medium max-w-sm mb-6 sm:mb-8 leading-relaxed">
                                Unified dashboard for patients, billing, and inventory.
                            </p>
                        </div>

                        <div className="absolute bottom-[-10%] right-[-5%] w-[150px] sm:w-[350px] h-[150px] sm:h-[350px] pointer-events-none opacity-20 lg:opacity-30 group-hover:opacity-60 transition-opacity duration-700">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="relative w-full h-full flex items-center justify-center"
                            >
                                <div className="absolute w-full h-full border-2 border-dashed border-white/20 rounded-full" />
                                <div className="absolute w-[70%] h-[70%] border border-white/10 rounded-full" />

                                {/* Floating Icons */}
                                {[
                                    { Icon: BarChart3, x: "40%", y: "-30%", r: 15 },
                                    { Icon: Users, x: "-45%", y: "20%", r: -20 },
                                    { Icon: Calendar, x: "10%", y: "45%", r: 10 },
                                    { Icon: FileText, x: "-30%", y: "-40%", r: -15 },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        style={{ position: 'absolute', top: '50%', left: '50%', x: item.x, y: item.y }}
                                        animate={{
                                            y: [item.y, `calc(${item.y} + 20%)`],
                                            rotate: [item.r, item.r + 10]
                                        }}
                                        transition={{
                                            y: { duration: 3 + i, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
                                            rotate: { duration: 4 + i, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
                                        }}
                                        className="w-8 h-8 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl flex items-center justify-center text-white border border-white/20"
                                    >
                                        <item.Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* 4 - Accuracy */}
                    <motion.div
                        variants={{ ...fadeInUp, ...hoverCard }}
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                        className="col-span-1 md:col-span-1 lg:col-span-3 bg-[#512c31] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-xl"
                    >
                        <div className="w-20 h-20 sm:w-40 sm:h-40 border-4 sm:border-[10px] border-white/10 rounded-full flex flex-col items-center justify-center relative mb-4 sm:mb-6">
                            <div className="absolute inset-[-4px] sm:inset-[-10px] border-4 sm:border-[10px] border-[#e8919a] rounded-full border-t-transparent border-r-transparent animate-spin-slow" />
                            <span className="text-xl sm:text-4xl font-black text-white italic">100%</span>
                            <span className="text-[6px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest">Accuracy</span>
                        </div>
                        <h3 className="text-xs sm:text-xl font-bold text-white italic">Safe Practice</h3>
                    </motion.div>

                    {/* 5 - Clinic Ops */}
                    <motion.div
                        variants={{ ...fadeInUp, ...hoverCard }}
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                        className="col-span-2 md:col-span-3 lg:col-span-6 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 relative overflow-hidden group shadow-lg border border-gray-100"
                    >
                        <div className="flex-1 text-center sm:text-left">
                            <span className="text-[#e8919a] font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mb-2 sm:mb-4 block">Operations</span>
                            <h3 className="text-xl sm:text-3xl font-black text-[#512c31] leading-tight mb-2 sm:mb-4">Simplified <span className="text-[#e8919a]">workflows</span>.</h3>
                            <p className="text-[#512c31]/40 text-xs sm:text-sm font-medium">Auto-pilot for your medical practice.</p>
                        </div>
                        <div className="w-24 h-24 sm:w-48 sm:h-48 bg-[#fef9f3] rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-inner relative">
                            <Clipboard className="w-10 h-10 sm:w-20 sm:h-20 text-[#512c31]/5" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-16 h-16 sm:w-32 sm:h-32 border border-dashed border-[#e8919a]/30 rounded-full" />
                            </div>
                        </div>
                    </motion.div>

                    {/* 6 - Security */}
                    <motion.div
                        variants={{ ...fadeInUp, ...hoverCard }}
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                        className="col-span-1 md:col-span-1 lg:col-span-3 bg-[#f0cbc1] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col justify-between group shadow-xl relative overflow-hidden min-h-[150px] sm:min-h-0"
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <Lock className="w-5 h-5 sm:w-8 sm:h-8 text-[#512c31]" />
                        </div>
                        <div className="mt-4 sm:mt-12 relative z-10">
                            <h3 className="text-sm sm:text-2xl font-black text-[#512c31] leading-none mb-1 italic">Guarded</h3>
                            <p className="text-[#512c31]/50 text-[6px] sm:text-[10px] font-bold uppercase tracking-widest leading-relaxed">Admin · Staff Access</p>
                        </div>
                    </motion.div>

                    {/* 7 - Patient Care */}
                    <motion.div
                        variants={{ ...fadeInUp, ...hoverCard }}
                        whileHover="hover"
                        whileTap={{ scale: 0.98 }}
                        className="col-span-2 md:col-span-4 lg:col-span-12 bg-[#512c31] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 group shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250px_250px] animate-shimmer" />
                        <div className="relative z-10 max-w-xl text-center lg:text-left">
                            <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-2 sm:mb-4">Streamlined <span className="text-[#e8919a]">Care</span>.</h3>
                            <p className="text-white/40 text-sm sm:text-lg">Integrated booking and financial tracking for every interaction.</p>
                        </div>
                        <div className="relative z-10 flex gap-2 sm:gap-4">
                            {[Calendar, Users, Star].map((Icon, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-10 h-10 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center group/icon"
                                >
                                    <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white/40 group-hover/icon:text-[#e8919a] transition-colors" />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            {/* FEATURES DETAIL SECTION */}
            <section id="features" className="py-20 sm:py-32 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12 sm:mb-24"
                    >
                        <span className="text-[#e8919a] font-black uppercase tracking-[0.3em] text-xs">Platform Modules</span>
                        <h2 className="text-3xl sm:text-6xl font-black text-[#512c31] mt-4 tracking-tighter">Everything automated.</h2>
                    </motion.div>

                    {/* Mobile: Horizontal Scroll Gallery | Desktop: Grid */}
                    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 px-2 md:px-0 snap-x snap-mandatory no-scrollbar text-left items-stretch">
                        {features.map((f, i) => {
                            const isMaroon = f.theme === 'maroon';
                            const isPink = f.theme === 'pink';
                            const isCream = f.theme === 'cream';

                            return (
                                <motion.div
                                    key={f.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "min-w-[280px] sm:min-w-0 p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group min-h-[280px] flex flex-col snap-center",
                                        isMaroon ? "bg-[#512c31] border-white/5 shadow-2xl shadow-[#512c31]/20" :
                                            isPink ? "bg-[#e8919a] border-white/10 shadow-xl shadow-[#e8919a]/10" :
                                                isCream ? "bg-[#f0cbc1] border-white/20 shadow-lg" :
                                                    "bg-white border-gray-100 shadow-sm hover:shadow-xl"
                                    )}
                                >
                                    {/* Abstract background accents */}
                                    <div className={cn(
                                        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700",
                                        isMaroon ? "bg-[#e8919a]" : "bg-[#512c31]"
                                    )} />

                                    <div className={cn(
                                        "flex gap-6",
                                        f.layout === 'full' ? "flex-col" : "flex-row items-start"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:rotate-6",
                                            isMaroon ? "bg-[#e8919a] text-white" :
                                                isPink ? "bg-[#512c31] text-[#e8919a]" :
                                                    isCream ? "bg-white text-[#512c31]" :
                                                        "bg-[#fef9f3] text-[#512c31]"
                                        )}>
                                            <f.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>

                                        <div className="flex-1 text-left">
                                            <h4 className={cn(
                                                "text-lg sm:text-xl font-black mb-2 sm:mb-3 leading-tight tracking-tight",
                                                isMaroon || isPink ? "text-white" : "text-[#512c31]"
                                            )}>
                                                {f.title}
                                            </h4>
                                            <p className={cn(
                                                "text-xs sm:text-sm font-medium leading-relaxed mb-4",
                                                isMaroon || isPink ? "text-white/60" : "text-[#512c31]/60"
                                            )}>
                                                {f.desc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 sm:pt-6 border-t border-white/10 flex items-center justify-between">
                                        <span className={cn(
                                            "text-[8px] sm:text-[10px] font-black uppercase tracking-widest",
                                            isMaroon || isPink ? "text-white/30" : "text-[#512c31]/20"
                                        )}>Module Details</span>
                                        <ArrowRight className={cn(
                                            "w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1",
                                            isMaroon || isPink ? "text-[#e8919a]" : "text-[#512c31]"
                                        )} />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* IMPACT SECTION */}
            < section id="impact" className="py-32 bg-[#512c31] relative" >
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-5xl sm:text-7xl font-black text-white tracking-tighter mb-20"
                    >
                        Master your <span className="text-[#e8919a] italic">data.</span>
                    </motion.h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { val: '40%', label: 'Time Saved', icon: Clock },
                            { val: '100%', label: 'Accuracy', icon: CheckCircle },
                            { val: '0%', label: 'Data Loss', icon: Shield },
                            { val: '24/7', label: 'Availability', icon: Zap },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group"
                            >
                                <div className="text-6xl font-black text-[#e8919a] mb-2 group-hover:scale-110 transition-transform tracking-tighter">{stat.val}</div>
                                <div className="text-white/40 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* CTA SECTION */}
            < section className="py-32 bg-[#fef9f3] relative overflow-hidden" >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto px-4 text-center"
                >
                    <div className="w-20 h-20 bg-[#e8919a] rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl scale-110">
                        <Heart className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-5xl sm:text-7xl font-black text-[#512c31] tracking-tighter mb-10">Transform your<br />clinic today.</h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="px-12 py-5 bg-[#512c31] text-white rounded-2xl font-black text-lg shadow-2xl shadow-[#512c31]/20 flex items-center gap-3 mx-auto"
                    >
                        Start Free Trial <ArrowRight />
                    </motion.button>
                </motion.div>
            </section >

            {/* FOOTER */}
            < footer id="footer" className="bg-[#512c31] pt-32 pb-16 border-t border-white/5" >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
                        <div className="md:col-span-2 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 shrink-0">
                                    <img src="/clinic.svg" alt="4TP Logo" className="w-full h-full object-contain" />
                                </div>
                                <h4 className="text-xl font-black text-[#fef9f3]">4 The People</h4>
                            </div>
                            <p className="text-white/30 text-lg font-medium max-w-sm italic">Making healthcare operations accessible, data-driven, and beautiful.</p>
                        </div>
                        <div className="space-y-6">
                            <h5 className="text-white/20 font-black uppercase tracking-widest text-xs">Modules</h5>
                            <ul className="space-y-4 text-white/50 font-bold hover:cursor-pointer">
                                {['Billing', 'Patients', 'Inventory', 'Appointments'].map(m => <li key={m} className="hover:text-[#e8919a] transition-colors">{m}</li>)}
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h5 className="text-white/20 font-black uppercase tracking-widest text-xs">Legals</h5>
                            <ul className="space-y-4 text-white/50 font-bold hover:cursor-pointer">
                                {['Privacy', 'Terms', 'Security', 'Contact'].map(m => <li key={m} className="hover:text-[#e8919a] transition-colors">{m}</li>)}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-32 pt-16 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8 text-[#white]/20 text-xs font-black uppercase tracking-widest">
                        <span>&copy; 2025 4TP ERP Clinic</span>
                        <div className="flex gap-8">
                            <span>Twitter</span>
                            <span>LinkedIn</span>
                            <span>Github</span>
                        </div>
                    </div>
                </div>
            </footer >

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 5s ease-in-out infinite;
                }
                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: 200px 0; }
                }
                .animate-shimmer {
                    animation: shimmer 15s linear infinite;
                }
                @keyframes spin-slow {
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
                html { scroll-behavior: smooth; }
            `}</style>
        </div >
    );
}
