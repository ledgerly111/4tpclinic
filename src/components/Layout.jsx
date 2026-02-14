import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Header } from './Header';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';

export function Layout() {
    const location = useLocation();
    const isDashboard = location.pathname === '/';
    const scrollRef = useRef(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme } = useStore();

    const isDark = theme === 'dark';

    useEffect(() => {
        // Scroll window to top (for non-dashboard pages)
        window.scrollTo(0, 0);

        // Scroll dashboard container to top
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }

        // Close mobile menu on route change
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className={cn(
            "flex min-h-screen transition-colors duration-300",
            isDark ? 'bg-[#0f0f0f]' : 'bg-gray-100'
        )}>
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            <main className="flex-1 lg:ml-20 transition-all duration-300 w-full">
                {isDashboard ? (
                    <div className="h-screen flex flex-col">
                        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                        <div
                            ref={scrollRef}
                            className={cn(
                                "flex-1 overflow-y-auto transition-colors duration-300",
                                "px-3 pb-4 pt-2 md:px-4 lg:px-6 lg:pb-6 lg:pt-0",
                                isDark ? 'bg-[#0f0f0f]' : 'bg-gray-100'
                            )}
                        >
                            <Outlet />
                        </div>
                    </div>
                ) : (
                    <div className="min-h-screen flex flex-col">
                        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                        <div className={cn(
                            "flex-1 transition-colors duration-300",
                            "px-3 pb-4 pt-2 md:px-4 lg:px-6 lg:pb-6 lg:pt-4",
                            isDark ? 'bg-[#0f0f0f]' : 'bg-gray-100'
                        )}>
                            <Outlet />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
