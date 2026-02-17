import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';

export function Layout() {
    const location = useLocation();
    const isDashboard = location.pathname === '/app' || location.pathname === '/app/dashboard';
    const scrollRef = useRef(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme } = useStore();

    const isDark = theme === 'dark';

    useEffect(() => {
        // Scroll to top on route change.
        window.scrollTo(0, 0);
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-[100dvh] transition-colors duration-300 bg-[var(--bg)]">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            <main className="flex-1 lg:ml-20 transition-all duration-300 w-full">
                {isDashboard ? (
                    <div className="min-h-[100dvh] flex flex-col">
                        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto transition-colors duration-300 px-3 pb-4 pt-2 md:px-4 lg:px-6 lg:pb-6 lg:pt-0 bg-[var(--bg)]"
                        >
                            <Outlet />
                        </div>
                    </div>
                ) : (
                    <div className="min-h-[100dvh] flex flex-col">
                        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                        <div className="flex-1 transition-colors duration-300 px-4 pb-4 pt-4 md:px-5 lg:px-6 lg:pb-6 lg:pt-4 bg-[var(--bg)]">
                            <Outlet />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
