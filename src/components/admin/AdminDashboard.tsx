"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Package, Settings, Database, Activity, Lock, LogOut, LayoutDashboard, Search, ChevronRight, Megaphone, CalendarDays } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase, Activity as SupabaseActivity, User } from "@/lib/supabase";

import ItemsManager from "./ItemsManager";
import AnnouncementsManager from "./AnnouncementsManager";
import SeasonsManager from "./SeasonsManager";
import SystemSettingsManager from "./SystemSettingsManager";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

const SIDEBAR_ITEMS = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'items', label: 'Items & Generation', icon: Package },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'seasons', label: 'Seasons & Epochs', icon: CalendarDays },
    { id: 'settings', label: 'System Settings', icon: Settings },
];

export default function AdminDashboard() {
    const router = useRouter();
    const { isAdmin, setIsAdmin, walletAddress } = useAuthStore();
    const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Navigation state
    const [activeTab, setActiveTab] = useState('overview');

    // Admin metrics state
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [recentGlobalActivities, setRecentGlobalActivities] = useState<SupabaseActivity[]>([]);

    // User Directory states
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Loading state
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        const verifyAdminWallet = async () => {
            setIsCheckingAuth(true);
            try {
                // Fetch the central admin wallet address from system_settings
                const { data } = await supabase
                    .from('system_settings')
                    .select('admin_wallet_address')
                    .eq('id', 1)
                    .single();

                if (data && walletAddress) {
                    // Check if the connected wallet matches the admin wallet
                    setIsAuthorizedAdmin(walletAddress === data.admin_wallet_address);
                } else {
                    setIsAuthorizedAdmin(false);
                    // MOCK FALLBACK for local testing if no admin wallet is set
                    // Remove this in production once the DB is properly configured
                    if (!data?.admin_wallet_address && walletAddress) {
                        setIsAuthorizedAdmin(true);
                    }
                }
            } catch (err) {
                console.error("Error verifying admin wallet:", err);
                setIsAuthorizedAdmin(false);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        verifyAdminWallet();
    }, [walletAddress]);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchMetrics = async () => {
            setIsLoadingMetrics(true);
            try {
                // 1. Get User Count
                const { count: userCount } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true });
                setTotalUsers(userCount || 0);

                // 2. Get Total Unique Items Owned
                const { count: itemCount } = await supabase
                    .from('inventory')
                    .select('*', { count: 'exact', head: true });
                setTotalItems(itemCount || 0);

                // 3. Global Activity Feed
                const { data: actData } = await supabase
                    .from('activities')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (actData) setRecentGlobalActivities(actData);

            } catch (error) {
                console.error("Failed to load admin metrics:", error);
            } finally {
                setIsLoadingMetrics(false);
            }
        };

        fetchMetrics();
    }, [isAdmin]);

    // Fetch users if 'users' tab is selected
    useEffect(() => {
        if (!isAdmin || activeTab !== 'users') return;

        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (data) setAllUsers(data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        if (allUsers.length === 0) {
            fetchUsers();
        }
    }, [isAdmin, activeTab, allUsers.length]);

    const handleLogout = async () => {
        setIsAdmin(false);
        router.push('/');
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center justify-center bg-black/40">
                <div className="w-8 h-8 rounded-full border-4 border-brand-primary border-t-transparent animate-spin mb-4" />
                <p className="text-white/50">Verifying admin credentials...</p>
            </div>
        );
    }

    if (!isAuthorizedAdmin) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center justify-center bg-black/40">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-12 max-w-md w-full text-center flex flex-col items-center border border-brand-primary/20"
                >
                    <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mb-6 border border-brand-primary/30">
                        <Lock className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-white mb-2">Admin Portal</h1>
                    <p className="text-foreground/70 mb-8 text-sm">
                        Restricted access. Please connect an authorized wallet.
                    </p>

                    <div className="w-full flex justify-center scale-110 mb-4 h-[48px] overflow-hidden rounded-xl">
                        <WalletMultiButton style={{
                            backgroundColor: 'var(--color-brand-primary)',
                            borderRadius: '12px',
                            padding: '0 24px',
                            height: '48px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 700,
                            width: '100%',
                            justifyContent: 'center'
                        }} />
                    </div>

                    <p className="text-xs text-brand-secondary/70 mt-4">
                        Wallet connection requires whitelisting.
                        <br />Contact system administrator for access.
                    </p>

                    <button
                        onClick={() => router.push('/')}
                        className="mt-8 text-foreground/50 hover:text-white text-sm transition-colors border-t border-white/5 pt-4 w-full"
                    >
                        Return to Homepage
                    </button>
                </motion.div>
            </div>
        );
    }

    const renderOverview = () => (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-white">Dashboard Overview</h1>
                    <p className="text-foreground/60 text-sm mt-1">Platform analytics and database health</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-colors border border-white/10 flex items-center space-x-2">
                        <Database className="w-4 h-4" />
                        <span>Export Data</span>
                    </button>
                    <button className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-sm transition-colors flex items-center space-x-2 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                        <Activity className="w-4 h-4" />
                        <span>Live Sync</span>
                    </button>
                </div>
            </div>

            {/* Sub Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: "Total Users", icon: Users, desc: "Active players", status: `${totalUsers}` },
                    { title: "Minted Items", icon: Package, desc: "Assets distributed", status: `${totalItems}` },
                    { title: "Economy", icon: Activity, desc: "Credit flow rate", status: "Stable" },
                    { title: "Database", icon: Database, desc: "Supabase connection", status: "Online" }
                ].map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="glass-panel p-6 cursor-pointer hover:border-brand-primary/50 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all">
                            <card.icon className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                        <p className="text-sm text-foreground/60 mb-4">{card.desc}</p>
                        <span className="text-xs font-medium text-brand-accent px-2 py-1 bg-brand-accent/10 rounded-md">
                            {card.status}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Working Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Quick View */}
                <div className="lg:col-span-2 glass-panel p-6 sm:p-8">
                    <h3 className="text-xl font-bold font-heading text-white mb-6">Global User Activity</h3>
                    <div className="space-y-4">
                        {isLoadingMetrics ? (
                            <div className="text-white/50 text-center py-4">Loading matrix...</div>
                        ) : recentGlobalActivities.length === 0 ? (
                            <div className="text-white/50 text-center py-4">No global events yet.</div>
                        ) : (
                            recentGlobalActivities.map((row) => (
                                <div key={row.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="font-semibold text-white font-mono text-sm">
                                            {row.user_wallet.slice(0, 4)}...{row.user_wallet.slice(-4)}
                                        </p>
                                        <p className="text-sm text-foreground/60">{row.description}</p>
                                    </div>
                                    <span className={`text-sm font-medium px-2 py-1 rounded-md ${row.action_type === 'spend' ? 'bg-brand-accent/20 text-brand-accent' :
                                        row.action_type === 'earn' ? 'bg-brand-primary/20 text-brand-primary' :
                                            'bg-white/10 text-white'
                                        }`}>
                                        {row.value}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Database Alerts */}
                <div className="glass-panel p-6 sm:p-8">
                    <h3 className="text-xl font-bold font-heading text-white mb-6">System Status</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex gap-3">
                            <Database className="w-5 h-5 text-brand-primary shrink-0" />
                            <div>
                                <h4 className="text-sm font-bold text-white">Supabase Data Link</h4>
                                <p className="text-xs text-foreground/70 mt-1">Live data feed active. Read/Write access granted.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUserDirectory = () => {
        const filteredUsers = allUsers.filter(u =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col pb-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-white">User Directory</h1>
                        <p className="text-foreground/60 text-sm mt-1">Manage {allUsers.length} registered players across the platform</p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                        <input
                            type="text"
                            placeholder="Search by username or wallet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel overflow-hidden flex-1 flex flex-col min-h-[500px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">User / X Account</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Wallet Address</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Credits</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">MOD Tokens</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Lvl / Pwr</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Joined Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoadingUsers ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-white/50">Loading users...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-white/50">No users found.</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xs border border-brand-primary/30">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                                                            {user.username}
                                                        </div>
                                                        <div className="text-xs text-brand-secondary">@X_Linked</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-white/70">
                                                {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-md text-sm font-semibold">
                                                    {user.credits} CR
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-md text-sm font-semibold">
                                                    {user.mod_tokens} MOD
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm">Lvl {user.account_level}</span>
                                                    <span className="text-brand-accent/70 text-xs">{user.power_level} Pwr</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white/50">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] mt-16 overflow-hidden bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-black/40 flex flex-col hidden lg:flex shrink-0">
                <div className="p-6">
                    <div className="flex flex-col space-y-2 mb-2">
                        <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 bg-brand-accent/20 text-brand-accent rounded-full text-xs font-bold uppercase tracking-wider border border-brand-accent/30">
                                Global Admin
                            </span>
                        </div>
                    </div>
                    <div className="text-xl font-bold font-heading tracking-wide mt-4">
                        MODUS <span className="text-brand-primary">BASE</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-brand-primary/20 text-white border border-brand-primary/30'
                                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-primary' : 'opacity-70'}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Bottom Sidebar */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-brand-accent rounded-xl transition-colors border border-white/10"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Close Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 relative bg-black/20">
                {/* Mobile Menu indicator (optional) */}
                <div className="lg:hidden flex items-center space-x-2 mb-6 text-white/50">
                    <span>Admin</span> <ChevronRight className="w-4 h-4" /> <span className="text-white capitalize">{activeTab}</span>
                </div>

                <div className="max-w-7xl mx-auto h-full">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'users' && renderUserDirectory()}
                    {activeTab === 'items' && <ItemsManager />}
                    {activeTab === 'announcements' && <AnnouncementsManager />}
                    {activeTab === 'seasons' && <SeasonsManager />}
                    {activeTab === 'settings' && <SystemSettingsManager />}
                </div>
            </main>
        </div>
    );
}
