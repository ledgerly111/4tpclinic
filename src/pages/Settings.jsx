import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, Download, Smartphone, Monitor, Apple, X, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

// ── Install instructions per platform ─────────────────────────────────────
const PLATFORMS = [
    {
        id: 'android',
        label: 'Android',
        icon: Smartphone,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        steps: [
            'Open this app in Chrome on your Android device.',
            'Tap the ⋮ menu (three dots) in the top-right corner.',
            'Select "Add to Home screen" or "Install app".',
            'Tap "Add" / "Install" in the confirmation dialog.',
            'The 4TP Clinic icon will appear on your home screen.',
        ],
    },
    {
        id: 'ios',
        label: 'iPhone / iPad',
        icon: Apple,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        steps: [
            'Open this app in Safari on your iPhone or iPad.',
            'Tap the Share button (□↑) at the bottom of the screen.',
            'Scroll down and tap "Add to Home Screen".',
            'Tap "Add" in the top-right corner.',
            'The 4TP Clinic icon will appear on your home screen.',
        ],
    },
    {
        id: 'desktop',
        label: 'Desktop (PC / Mac)',
        icon: Monitor,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        steps: [
            'Open this app in Chrome or Edge on your computer.',
            'Look for the install icon (⊕) in the address bar on the right.',
            'Click it and select "Install" in the popup.',
            'Alternatively, open the browser menu (⋮) → "Install 4TP Clinic…".',
            'The app will open as a standalone window, like a native app.',
        ],
    },
];

export function Settings() {
    const { theme, toggleTheme } = useStore();
    const { logout, session } = useAuth();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const [showInstallModal, setShowInstallModal] = useState(false);
    const [activePlatform, setActivePlatform] = useState('android');
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [canInstall, setCanInstall] = useState(false);

    // Capture the browser's native install prompt if available
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setCanInstall(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleNativeInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setCanInstall(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const platform = PLATFORMS.find((p) => p.id === activePlatform);

    // Card base styles
    const card = cn(
        'rounded-[2rem] border-4 p-6 sm:p-8 transition-all hover:-translate-y-1 shadow-xl hover:shadow-2xl dashboard-reveal reveal-delay-2',
        isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50'
    );

    return (
        <div className="space-y-6 max-w-xl">
            {/* Header */}
            <div className="dashboard-reveal">
                <h1 className={cn('text-2xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>Settings</h1>
                <p className={cn('text-sm sm:text-base font-bold uppercase tracking-widest mt-1', isDark ? 'text-white/40' : 'text-[#512c31]/60')}>
                    {session?.fullName ? `Signed in as ${session.fullName}` : 'Manage your preferences'}
                </p>
            </div>

            {/* ── Theme Toggle ── */}
            <div className={card}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', isDark ? 'bg-amber-500/10' : 'bg-amber-50')}>
                            {isDark
                                ? <Moon className="w-5 h-5 text-amber-400" />
                                : <Sun className="w-5 h-5 text-amber-500" />
                            }
                        </div>
                        <div>
                            <p className={cn('font-black text-sm sm:text-base', isDark ? 'text-white' : 'text-[#512c31]')}>
                                {isDark ? 'Dark Mode' : 'Light Mode'}
                            </p>
                            <p className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mt-1', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>
                                Toggle between light and dark theme
                            </p>
                        </div>
                    </div>
                    {/* Toggle switch */}
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            'w-14 h-7 rounded-full transition-all relative flex-shrink-0 shadow-inner',
                            isDark ? 'bg-[#e8919a]' : 'bg-gray-200'
                        )}
                        aria-label="Toggle theme"
                    >
                        <span className={cn(
                            'absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform',
                            isDark ? 'translate-x-8' : 'translate-x-1'
                        )} />
                    </button>
                </div>
            </div>

            {/* ── Install App ── */}
            <div className={card}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#ff7a6b]/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-[#ff7a6b]" />
                    </div>
                    <div>
                        <p className={cn('font-black text-sm sm:text-base', isDark ? 'text-white' : 'text-[#512c31]')}>Install App</p>
                        <p className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mt-1', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>
                            Add 4TP Clinic to your device for quick access
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Native install button (shows when browser supports it) */}
                    {canInstall && (
                        <button
                            onClick={handleNativeInstall}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#512c31] text-white rounded-2xl hover:bg-[#e8919a] hover:scale-[1.02] transition-all text-xs font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl"
                        >
                            <Download className="w-4 h-4" />
                            Install Now
                        </button>
                    )}
                    <button
                        onClick={() => setShowInstallModal(true)}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all text-xs font-bold uppercase tracking-widest hover:scale-[1.02] shadow-sm hover:shadow-md',
                            isDark
                                ? 'border-gray-700 text-gray-300 hover:border-white hover:text-white'
                                : 'border-gray-100 text-[#512c31] hover:border-[#512c31] hover:text-[#512c31]'
                        )}
                    >
                        <Smartphone className="w-4 h-4" />
                        View Instructions
                    </button>
                </div>
            </div>

            {/* ── Sign Out ── */}
            <div className={card}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className={cn('font-black text-sm sm:text-base', isDark ? 'text-white' : 'text-[#512c31]')}>Sign Out</p>
                            <p className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mt-1', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>
                                Sign out of your account
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:scale-105"
                    >
                        Sign Out
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Install Instructions Modal ── */}
            {showInstallModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className={cn(
                        'w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] border-4 shadow-2xl flex flex-col max-h-[92dvh] transition-all',
                        isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-white/50'
                    )}>
                        {/* Modal header */}
                        <div className={cn('flex items-center justify-between px-6 pt-8 pb-4 border-b-2 flex-shrink-0', isDark ? 'border-white/5' : 'border-gray-50')}>
                            <div className="flex items-center gap-3">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", isDark ? "bg-[#0f0f0f]" : "bg-[#fef9f3]")}>
                                    <img src="/clinic.svg" alt="4TP Clinic" className="w-7 h-7 object-contain" />
                                </div>
                                <div>
                                    <h2 className={cn('font-black text-xl tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>Install 4TP Clinic</h2>
                                    <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-0.5', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>Choose your platform</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowInstallModal(false)}
                                className={cn('w-10 h-10 rounded-full flex items-center justify-center transition-all', isDark ? 'text-white bg-white/5 hover:bg-white/10' : 'bg-[#fef9f3] text-[#512c31] hover:bg-[#e8919a] hover:text-white')}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Platform tabs */}
                        <div className={cn('flex gap-2 px-6 py-3 border-b flex-shrink-0', isDark ? 'border-gray-800' : 'border-gray-100')}>
                            {PLATFORMS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setActivePlatform(p.id)}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all',
                                        activePlatform === p.id
                                            ? `${p.bg} ${p.border} ${p.color}`
                                            : isDark ? 'border-gray-800 text-gray-500 hover:border-gray-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                    )}
                                >
                                    <p.icon className="w-3.5 h-3.5" />
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Steps */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            <div className="space-y-3">
                                {platform?.steps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={cn(
                                            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5',
                                            platform.bg, platform.color
                                        )}>
                                            {i + 1}
                                        </div>
                                        <p className={cn('text-sm leading-relaxed', isDark ? 'text-gray-300' : 'text-gray-700')}>{step}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tip box */}
                            <div className={cn('mt-5 rounded-xl p-4 border', isDark ? 'bg-[#ff7a6b]/5 border-[#ff7a6b]/20' : 'bg-[#ff7a6b]/5 border-[#ff7a6b]/20')}>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-[#ff7a6b] flex-shrink-0 mt-0.5" />
                                    <p className={cn('text-xs leading-relaxed', isDark ? 'text-gray-400' : 'text-gray-500')}>
                                        Once installed, 4TP Clinic works like a native app — no browser UI, fast launch, and works offline for cached pages.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={cn('px-6 pb-6 pt-3 border-t flex-shrink-0', isDark ? 'border-gray-800' : 'border-gray-100')}>
                            {canInstall ? (
                                <button
                                    onClick={() => { handleNativeInstall(); setShowInstallModal(false); }}
                                    className="w-full py-3 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] transition-all font-semibold text-sm shadow-lg shadow-[#ff7a6b]/20 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Install Now (Browser Detected)
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowInstallModal(false)}
                                    className={cn('w-full py-3 rounded-xl border text-sm font-medium transition-colors', isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}
                                >
                                    Got it, close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
