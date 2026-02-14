import { useState } from 'react';
import { User, Bell, Shield, CreditCard, Mail, Smartphone, Moon, Globe, Save } from 'lucide-react';

const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
];

export function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [darkMode, setDarkMode] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-400">Manage your clinic preferences</p>
            </div>

            <div className="flex gap-6">
                {/* Sidebar Tabs */}
                <div className="w-64 space-y-2">
                    {settingsTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                                activeTab === tab.id
                                    ? 'bg-[#ff7a6b] text-white'
                                    : 'bg-[#1e1e1e] text-gray-400 hover:bg-[#252525] hover:text-white'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#1e1e1e] rounded-2xl p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                            
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">DR</span>
                                </div>
                                <div>
                                    <button className="px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-[#252525] transition-colors text-sm">
                                        Change Avatar
                                    </button>
                                    <p className="text-gray-400 text-xs mt-2">JPG, PNG or GIF. Max size 2MB</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Dr. Smith"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        defaultValue="dr.smith@clinic.com"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        defaultValue="555-0100"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Specialization</label>
                                    <input
                                        type="text"
                                        defaultValue="General Physician"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4 border-t border-gray-800">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-white font-medium">Language</p>
                                        <p className="text-gray-400 text-sm">Select your preferred language</p>
                                    </div>
                                </div>
                                <select className="bg-[#0f0f0f] text-white px-4 py-2 rounded-xl outline-none border border-gray-800">
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between py-4 border-t border-gray-800">
                                <div className="flex items-center gap-3">
                                    <Moon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-white font-medium">Dark Mode</p>
                                        <p className="text-gray-400 text-sm">Toggle dark mode theme</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${
                                        darkMode ? 'bg-[#ff7a6b]' : 'bg-gray-600'
                                    }`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                        darkMode ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-white font-medium">Email Notifications</p>
                                            <p className="text-gray-400 text-sm">Receive updates via email</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setEmailNotifications(!emailNotifications)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${
                                            emailNotifications ? 'bg-[#ff7a6b]' : 'bg-gray-600'
                                        }`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                            emailNotifications ? 'translate-x-7' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-white font-medium">SMS Notifications</p>
                                            <p className="text-gray-400 text-sm">Receive updates via text message</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSmsNotifications(!smsNotifications)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${
                                            smsNotifications ? 'bg-[#ff7a6b]' : 'bg-gray-600'
                                        }`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                            smsNotifications ? 'translate-x-7' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-white font-medium">Notification Types</h3>
                                {['New appointments', 'Appointment reminders', 'Patient cancellations', 'Low inventory alerts', 'System updates'].map((type) => (
                                    <label key={type} className="flex items-center gap-3 py-2">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-600 bg-[#0f0f0f] text-[#ff7a6b] focus:ring-[#ff7a6b]" />
                                        <span className="text-gray-300">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Security Settings</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800">
                                <h3 className="text-white font-medium mb-4">Two-Factor Authentication</h3>
                                <div className="flex items-center justify-between bg-[#0f0f0f] rounded-xl p-4">
                                    <div>
                                        <p className="text-white font-medium">Enable 2FA</p>
                                        <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                                    </div>
                                    <button className="px-4 py-2 bg-[#ff7a6b]/20 text-[#ff7a6b] rounded-xl hover:bg-[#ff7a6b]/30 transition-colors text-sm font-medium">
                                        Enable
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Billing Settings</h2>
                            
                            <div className="space-y-4">
                                <h3 className="text-white font-medium">Payment Methods</h3>
                                <div className="bg-[#0f0f0f] rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">VISA</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">•••• •••• •••• 4242</p>
                                            <p className="text-gray-400 text-sm">Expires 12/25</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Default</span>
                                </div>
                                <button className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-[#ff7a6b] hover:text-[#ff7a6b] transition-colors">
                                    + Add Payment Method
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-800">
                                <h3 className="text-white font-medium mb-4">Billing Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Clinic Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Main Clinic"
                                            className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Tax ID</label>
                                        <input
                                            type="text"
                                            defaultValue="12-3456789"
                                            className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 outline-none focus:border-[#ff7a6b] text-white transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="pt-6 border-t border-gray-800 flex justify-end">
                        <button className="px-6 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 transition-colors">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
