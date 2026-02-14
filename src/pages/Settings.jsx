import { useState } from 'react';
import { User, Bell, Shield, CreditCard, Mail, Smartphone, Moon, Sun, Globe, Save, X, ChevronLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
];

export function Settings() {
    const { theme, toggleTheme } = useStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isDark = theme === 'dark';

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xl sm:text-2xl font-bold">DR</span>
                            </div>
                            <div className="flex-1">
                                <button className={cn("w-full sm:w-auto px-4 py-2 rounded-xl transition-colors text-sm", 
                                    isDark ? 'bg-[#0f0f0f] text-white hover:bg-[#252525]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                )}>
                                    Change Avatar
                                </button>
                                <p className={cn("text-xs mt-2", isDark ? 'text-gray-400' : 'text-gray-500')}>JPG, PNG or GIF. Max size 2MB</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Full Name</label>
                                <input
                                    type="text"
                                    defaultValue="Dr. Smith"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors text-sm", 
                                        isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                    )}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Email</label>
                                <input
                                    type="email"
                                    defaultValue="dr.smith@clinic.com"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors text-sm", 
                                        isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                    )}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Phone</label>
                                <input
                                    type="tel"
                                    defaultValue="555-0100"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors text-sm", 
                                        isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                    )}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Specialization</label>
                                <input
                                    type="text"
                                    defaultValue="General Physician"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors text-sm", 
                                        isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                    )}
                                />
                            </div>
                        </div>

                        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between py-4 border-t gap-4", isDark ? 'border-gray-800' : 'border-gray-200')}>
                            <div className="flex items-center gap-3">
                                <Globe className={cn("w-5 h-5 flex-shrink-0", isDark ? 'text-gray-400' : 'text-gray-500')} />
                                <div>
                                    <p className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-gray-900')}>Language</p>
                                    <p className={cn("text-xs", isDark ? 'text-gray-400' : 'text-gray-500')}>Select your preferred language</p>
                                </div>
                            </div>
                            <select className={cn("w-full sm:w-auto px-4 py-2 rounded-xl outline-none border text-sm",
                                isDark ? 'bg-[#0f0f0f] text-white border-gray-800' : 'bg-gray-50 text-gray-900 border-gray-300'
                            )}>
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>

                        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between py-4 border-t gap-4", isDark ? 'border-gray-800' : 'border-gray-200')}>
                            <div className="flex items-center gap-3">
                                {isDark ? <Moon className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <Sun className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                                <div>
                                    <p className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-gray-900')}>
                                        {isDark ? 'Dark Mode' : 'Light Mode'}
                                    </p>
                                    <p className={cn("text-xs", isDark ? 'text-gray-400' : 'text-gray-500')}>
                                        Toggle between light and dark theme
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={cn("w-12 h-6 rounded-full transition-colors relative self-start sm:self-auto",
                                    isDark ? 'bg-[#ff7a6b]' : 'bg-gray-400'
                                )}
                            >
                                <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                    isDark ? 'translate-x-7' : 'translate-x-1'
                                )} />
                            </button>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b gap-4", isDark ? 'border-gray-800' : 'border-gray-200')}>
                                <div className="flex items-center gap-3">
                                    <Mail className={cn("w-5 h-5 flex-shrink-0", isDark ? 'text-gray-400' : 'text-gray-500')} />
                                    <div>
                                        <p className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-gray-900')}>Email Notifications</p>
                                        <p className={cn("text-xs", isDark ? 'text-gray-400' : 'text-gray-500')}>Receive updates via email</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEmailNotifications(!emailNotifications)}
                                    className={cn("w-12 h-6 rounded-full transition-colors relative self-start sm:self-auto",
                                        emailNotifications ? 'bg-[#ff7a6b]' : 'bg-gray-600'
                                    )}
                                >
                                    <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                        emailNotifications ? 'translate-x-7' : 'translate-x-1'
                                    )} />
                                </button>
                            </div>

                            <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b gap-4", isDark ? 'border-gray-800' : 'border-gray-200')}>
                                <div className="flex items-center gap-3">
                                    <Smartphone className={cn("w-5 h-5 flex-shrink-0", isDark ? 'text-gray-400' : 'text-gray-500')} />
                                    <div>
                                        <p className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-gray-900')}>SMS Notifications</p>
                                        <p className={cn("text-xs", isDark ? 'text-gray-400' : 'text-gray-500')}>Receive updates via text message</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSmsNotifications(!smsNotifications)}
                                    className={cn("w-12 h-6 rounded-full transition-colors relative self-start sm:self-auto",
                                        smsNotifications ? 'bg-[#ff7a6b]' : 'bg-gray-600'
                                    )}
                                >
                                    <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                        smsNotifications ? 'translate-x-7' : 'translate-x-1'
                                    )} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-gray-900')}>Notification Types</h3>
                            {['New appointments', 'Appointment reminders', 'Patient cancellations', 'Low inventory alerts', 'System updates'].map((type) => (
                                <label key={type} className="flex items-center gap-3 py-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        defaultChecked 
                                        className={cn("w-4 h-4 sm:w-5 sm:h-5 rounded focus:ring-[#ff7a6b]",
                                            isDark ? 'border-gray-600 bg-[#0f0f0f] text-[#ff7a6b]' : 'border-gray-300 bg-white text-[#ff7a6b]'
                                        )} 
                                    />
                                    <span className={cn("text-sm", isDark ? 'text-gray-300' : 'text-gray-700')}>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Current Password</label>
                                <input
                                    type="password"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors text-sm",
                                        isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                    )}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>New Password</label>
                                <input
                                    type="password"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors text-sm",
                                        isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                    )}
                                />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Confirm New Password</label>
                                <input
                                    type="password"
                                    className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors text-sm",
                                        isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                    )}
                                />
                            </div>
                        </div>

                        <div className={cn("pt-4 border-t", isDark ? 'border-gray-800' : 'border-gray-200')}>
                            <h3 className={cn("font-medium mb-4 text-sm", isDark ? 'text-white' : 'text-gray-900')}>Two-Factor Authentication</h3>
                            <div className={cn("rounded-xl p-4", isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50 border border-gray-200')}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <p className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-gray-900')}>Enable 2FA</p>
                                        <p className={cn("text-xs", isDark ? 'text-gray-400' : 'text-gray-500')}>Add an extra layer of security</p>
                                    </div>
                                    <button className="w-full sm:w-auto px-4 py-2 bg-[#ff7a6b]/20 text-[#ff7a6b] rounded-xl hover:bg-[#ff7a6b]/30 transition-colors text-sm font-medium">
                                        Enable
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'billing':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-gray-900')}>Payment Methods</h3>
                            <div className={cn("rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4", isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50 border border-gray-200')}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">VISA</span>
                                    </div>
                                    <div>
                                        <p className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-gray-900')}>•••• •••• •••• 4242</p>
                                        <p className={cn("text-xs", isDark ? 'text-gray-400' : 'text-gray-500')}>Expires 12/25</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium w-fit">Default</span>
                            </div>
                            <button className={cn("w-full py-3 border-2 border-dashed rounded-xl transition-colors text-sm",
                                isDark ? 'border-gray-700 text-gray-400 hover:border-[#ff7a6b] hover:text-[#ff7a6b]' : 'border-gray-300 text-gray-500 hover:border-[#ff7a6b] hover:text-[#ff7a6b]'
                            )}>
                                + Add Payment Method
                            </button>
                        </div>

                        <div className={cn("pt-4 border-t", isDark ? 'border-gray-800' : 'border-gray-200')}>
                            <h3 className={cn("font-medium mb-4 text-sm", isDark ? 'text-white' : 'text-gray-900')}>Billing Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Clinic Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Main Clinic"
                                        className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors text-sm",
                                            isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-gray-400' : 'text-gray-600')}>Tax ID</label>
                                    <input
                                        type="text"
                                        defaultValue="12-3456789"
                                        className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors text-sm",
                                            isDark ? 'bg-[#0f0f0f] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className={cn("text-xl sm:text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Settings</h1>
                <p className={cn("text-sm sm:text-base", isDark ? 'text-gray-400' : 'text-gray-600')}>Manage your clinic preferences</p>
            </div>

            {/* Mobile Tab Selector */}
            <div className="sm:hidden">
                <div className={cn("rounded-xl p-1 flex overflow-x-auto", isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100')}>
                    {settingsTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn("flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs whitespace-nowrap",
                                activeTab === tab.id
                                    ? 'bg-[#ff7a6b] text-white'
                                    : isDark
                                        ? 'text-gray-400 hover:text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Desktop Sidebar Tabs */}
                <div className="hidden sm:block w-64 space-y-2">
                    {settingsTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
                                activeTab === tab.id
                                    ? 'bg-[#ff7a6b] text-white'
                                    : isDark
                                        ? 'bg-[#1e1e1e] text-gray-400 hover:bg-[#252525] hover:text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                            )}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className={cn("flex-1 rounded-xl sm:rounded-2xl p-4 sm:p-6", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <h2 className={cn("text-lg sm:text-xl font-bold mb-4 sm:mb-6", isDark ? 'text-white' : 'text-gray-900')}>
                        {settingsTabs.find(t => t.id === activeTab)?.label} Settings
                    </h2>
                    
                    {renderTabContent()}

                    {/* Save Button */}
                    <div className={cn("pt-6 border-t mt-6 flex justify-end", isDark ? 'border-gray-800' : 'border-gray-200')}>
                        <button className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors">
                            <Save className="w-4 h-4" />
                            <span className="text-sm sm:text-base">Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
