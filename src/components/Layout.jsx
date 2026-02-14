import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../lib/utils';

export function Layout() {
    const location = useLocation();
    const isDashboard = location.pathname === '/';
    const scrollRef = useRef(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="flex bg-[#0f0f0f] min-h-screen">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 lg:ml-20 transition-all duration-300 overflow-hidden w-full">
                {isDashboard ? (
                    <div className="h-screen flex flex-col">
                        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                        <div
                            ref={scrollRef}
                            className="flex-1 px-4 pb-4 md:px-6 md:pb-6 overflow-y-auto"
                        >
                            <Outlet />
                        </div>
                    </div>
                ) : (
                    <div className="min-h-screen flex flex-col">
                        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                        <div className="flex-1 p-4 md:p-6">
                            <Outlet />
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
