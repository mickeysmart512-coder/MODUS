"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Package, Settings, Database, Activity, Lock, LogOut, LayoutDashboard, Search, ChevronRight, Megaphone, CalendarDays, Zap, Plus, Save, Trash2, Calendar, Pencil, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase, Activity as SupabaseActivity, User, DailyMission } from "@/lib/supabase";
import toast from "react-hot-toast";

import ItemsManager from "./ItemsManager";
import AnnouncementsManager from "./AnnouncementsManager";
import SeasonsManager from "./SeasonsManager";
import SystemSettingsManager from "./SystemSettingsManager";
import { generateSeasonMissions, CHRONOS_TRILOGY } from "@/lib/chronos_script";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

const SIDEBAR_ITEMS = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'items', label: 'Items & Generation', icon: Package },
    { id: 'chronos', label: 'Chronos Breach', icon: Zap },
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

    // Chronos Breach Mission State
    const [missions, setMissions] = useState<DailyMission[]>([]);
    const [editingMission, setEditingMission] = useState<DailyMission | null>(null);

    // Create Mission Form State
    const [activeDate, setActiveDate] = useState("");
    const [title, setTitle] = useState("");
    const [fragmentName, setFragmentName] = useState("");
    const [briefing, setBriefing] = useState("");
    const [success, setSuccess] = useState("");
    const [failure, setFailure] = useState("");

    // Season Seeder State
    const [seedSeasonId, setSeedSeasonId] = useState(1);
    const [seedStartDate, setSeedStartDate] = useState(new Date().toISOString().split('T')[0]);

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

    // Fetch Missions if 'chronos' tab is selected
    useEffect(() => {
        if (!isAdmin || activeTab !== 'chronos') return;
        fetchMissions();
    }, [isAdmin, activeTab]);

    const fetchMissions = async () => {
        const { data } = await supabase.from('daily_missions').select('*').order('active_date', { ascending: false });
        if (data) setMissions(data);
    };

    const handleCreateMission = async () => {
        if (!activeDate || !title || !fragmentName) {
            toast.error("Please fill all required fields");
            return;
        }

        const newMission = {
            active_date: activeDate,
            title,
            fragment_name: fragmentName,
            briefing_dialogue: briefing.split('\n').filter(s => s.trim() !== ''),
            success_dialogue: success.split('\n').filter(s => s.trim() !== ''),
            failure_dialogue: failure.split('\n').filter(s => s.trim() !== '')
        };

        const { error } = await supabase.from('daily_missions').insert([newMission]);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Mission Scheduled!");
            fetchMissions();
            setActiveDate(''); setTitle(''); setFragmentName(''); setBriefing(''); setSuccess(''); setFailure('');
        }
    };

    const handleDeleteMission = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const { error } = await supabase.from('daily_missions').delete().eq('id', id);
        if (!error) {
            toast.success("Mission Deleted");
            fetchMissions();
        }
    };

    const handleUpdateMission = async () => {
        if (!editingMission) return;

        const updatedMission = {
            title: editingMission.title,
            fragment_name: editingMission.fragment_name,
            briefing_dialogue: Array.isArray(editingMission.briefing_dialogue) ? editingMission.briefing_dialogue : String(editingMission.briefing_dialogue).split('\n').filter(s => s.trim() !== ''),
            success_dialogue: Array.isArray(editingMission.success_dialogue) ? editingMission.success_dialogue : String(editingMission.success_dialogue).split('\n').filter(s => s.trim() !== ''),
            failure_dialogue: Array.isArray(editingMission.failure_dialogue) ? editingMission.failure_dialogue : String(editingMission.failure_dialogue).split('\n').filter(s => s.trim() !== '')
        };

        const { error } = await supabase.from('daily_missions').update(updatedMission).eq('id', editingMission.id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Mission Updated!");
            setEditingMission(null);
            fetchMissions();
        }
    };

    const seedCampaign = async () => {
        const confirmSeed = confirm(`INITIALIZE CHRONOS TRILOGY? This will launch Season ${seedSeasonId} (${CHRONOS_TRILOGY[seedSeasonId].name}) starting from ${seedStartDate}. (50 Daily Directives). Proceed?`);
        if (!confirmSeed) return;

        const missionsWithDates = generateSeasonMissions(seedSeasonId, new Date(seedStartDate));

        // Use a single transaction for efficiency
        const { error } = await supabase.from('daily_missions').upsert(missionsWithDates, { onConflict: 'active_date' });
        
        if (error) {
            console.error("Seeding Error:", error);
            toast.error(error.message);
        } else {
            toast.success(`Season ${seedSeasonId} Strategic Directives Launched!`);
            fetchMissions();
        }
    };

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

    const renderChronosBreach = () => (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-white tracking-tight text-glow">The Chronos Trilogy</h1>
                    <p className="text-foreground/60 text-sm">Strategic Campaign Deployment & Logic Overrides.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase text-brand-primary font-bold mb-1 ml-1">Target Season</label>
                        <select 
                            value={seedSeasonId} 
                            onChange={e => setSeedSeasonId(Number(e.target.value))}
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-brand-primary"
                        >
                            <option value={1}>Season 1: Aegis Protocol</option>
                            <option value={2}>Season 2: Shadow Nexus</option>
                            <option value={3}>Season 3: Eradication</option>
                        </select>
                    </div>
                    <div className="flex flex-col text-white">
                        <label className="text-[10px] uppercase text-brand-primary font-bold mb-1 ml-1">Launch Date</label>
                        <input 
                            type="date" 
                            value={seedStartDate} 
                            onChange={e => setSeedStartDate(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-brand-primary"
                        />
                    </div>
                    <button
                        onClick={seedCampaign}
                        className="mt-4 px-6 py-2 bg-brand-primary text-black rounded-full font-bold text-xs hover:bg-brand-primary/80 transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Launch Strategic Campaign</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Form Editor */}
                <div className="glass-panel p-6 space-y-6 bg-black/40 border-white/5 relative overflow-hidden">
                    <h2 className="text-lg font-bold text-white flex items-center mb-4 border-b border-brand-primary/20 pb-4 tracking-widest uppercase">
                        <Plus className="w-5 h-5 text-brand-primary mr-2" />
                        Draft New Directive
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-brand-primary/80 font-bold mb-2 font-mono">Launch Date</label>
                                <input type="date" value={activeDate} onChange={e => setActiveDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-brand-primary/80 font-bold mb-2 font-mono">Fragment</label>
                                <input type="text" placeholder="e.g. Nexus Core" value={fragmentName} onChange={e => setFragmentName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-brand-primary/80 font-bold mb-2 font-mono">Protocol Title</label>
                            <input type="text" placeholder="Operation Awakening" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary text-sm" />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-brand-primary/80 font-bold mb-2 font-mono">Briefing (Newline = Next Slide)</label>
                            <textarea rows={3} value={briefing} onChange={e => setBriefing(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary text-xs font-mono" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-green-400 font-bold mb-2">Success Outcomes</label>
                                <textarea rows={2} value={success} onChange={e => setSuccess(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-xs" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-red-400 font-bold mb-2">Failure Outcomes</label>
                                <textarea rows={2} value={failure} onChange={e => setFailure(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-xs" />
                            </div>
                        </div>

                        <button onClick={handleCreateMission} className="w-full glass-button bg-brand-primary text-black border-brand-primary font-black py-3 uppercase tracking-tighter flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(196,155,97,0.2)]">
                            <Save className="w-4 h-4" />
                            <span>Initialize Protocol</span>
                        </button>
                    </div>
                </div>

                {/* List View */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center mb-4 tracking-widest uppercase pl-2 font-mono">
                        <Calendar className="w-5 h-5 text-brand-secondary mr-2" />
                        Active Protocol Stream
                    </h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {missions.length === 0 ? <p className="text-white/30 italic px-2">No directives in orbit.</p> : null}
                        {missions.map(m => (
                            <div key={m.id} className="glass-panel p-4 flex items-center justify-between group bg-black/30 hover:bg-white/5 transition-all">
                                <div>
                                    <span className="text-[10px] font-mono text-brand-primary font-bold tracking-widest block mb-1">{m.active_date}</span>
                                    <h3 className="font-bold text-white uppercase text-sm tracking-tight">{m.title}</h3>
                                    <div className="mt-1 text-[10px] text-white/50">{m.fragment_name}</div>
                                </div>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingMission(m)} className="p-2 bg-white/5 hover:bg-brand-primary/20 text-white hover:text-brand-primary rounded-lg transition-all border border-white/5 hover:border-brand-primary/30">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteMission(m.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-lg transition-all border border-white/5 hover:border-red-500/30">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Drawer Overlay */}
            <AnimatePresence>
                {editingMission && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex justify-end"
                        onClick={() => setEditingMission(null)}
                    >
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-md h-full bg-[#0a0604] border-l border-white/10 shadow-2xl p-8 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-primary/20">
                                <h3 className="text-xl font-bold font-heading text-white">Modify Directive</h3>
                                <button onClick={() => setEditingMission(null)} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar text-white">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-brand-primary font-bold mb-2">Directive Title</label>
                                    <input type="text" value={editingMission.title} onChange={e => setEditingMission({ ...editingMission, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-brand-primary" />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-brand-primary font-bold mb-2">Target Fragment</label>
                                    <input type="text" value={editingMission.fragment_name} onChange={e => setEditingMission({ ...editingMission, fragment_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-brand-primary" />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-brand-primary font-bold mb-2">Briefing Sequence (Newline = Next Slide)</label>
                                    <textarea rows={6} value={Array.isArray(editingMission.briefing_dialogue) ? editingMission.briefing_dialogue.join('\n') : editingMission.briefing_dialogue} onChange={e => setEditingMission({ ...editingMission, briefing_dialogue: e.target.value.split('\n') })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs font-mono outline-none focus:border-brand-primary resize-none" />
                                </div>

                                <div className="grid grid-cols-1 gap-4 text-white">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider text-green-400 font-bold mb-2">Success Outcome</label>
                                        <textarea rows={2} value={Array.isArray(editingMission.success_dialogue) ? editingMission.success_dialogue.join('\n') : editingMission.success_dialogue} onChange={e => setEditingMission({ ...editingMission, success_dialogue: e.target.value.split('\n') })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider text-red-400 font-bold mb-2">Failure Outcome</label>
                                        <textarea rows={2} value={Array.isArray(editingMission.failure_dialogue) ? editingMission.failure_dialogue.join('\n') : editingMission.failure_dialogue} onChange={e => setEditingMission({ ...editingMission, failure_dialogue: e.target.value.split('\n') })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-xs" />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleUpdateMission} className="w-full bg-brand-primary text-black font-black py-4 uppercase tracking-tighter mt-8 shadow-[0_0_30px_rgba(196,155,97,0.3)] hover:scale-[1.02] transition-transform">
                                Commit Modifications
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
                    {activeTab === 'chronos' && renderChronosBreach()}
                    {activeTab === 'items' && <ItemsManager />}
                    {activeTab === 'announcements' && <AnnouncementsManager />}
                    {activeTab === 'seasons' && <SeasonsManager />}
                    {activeTab === 'settings' && <SystemSettingsManager />}
                </div>
            </main>
        </div>
    );
}
