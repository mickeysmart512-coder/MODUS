"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Coins, Users, ArrowUpRight, Zap, Loader2, Bell, Lock, Calendar, AlertTriangle, Sparkles } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase, User, Activity as SupabaseActivity, Announcement, SystemSettings } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
    const { publicKey } = useWallet();
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [activities, setActivities] = useState<SupabaseActivity[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isLoadingActivities, setIsLoadingActivities] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Global Settings and Announcements (public)
                const [{ data: settingsData }, { data: activeAnnouncements }] = await Promise.all([
                    supabase.from('system_settings').select('*').eq('id', 1).single(),
                    supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false })
                ]);

                if (settingsData) setSettings(settingsData);
                if (activeAnnouncements) setAnnouncements(activeAnnouncements);

                if (!publicKey) {
                    setProfile(null);
                    setActivities([]);
                    return;
                }

                // Fetch User Data
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('wallet_address', publicKey.toString())
                    .single();

                if (userData) setProfile(userData);

                // Fetch Activities
                setIsLoadingActivities(true);
                const { data: userActivities } = await supabase
                    .from('activities')
                    .select('*')
                    .eq('user_wallet', publicKey.toString())
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (userActivities) setActivities(userActivities);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
                setIsLoadingActivities(false);
            }
        };

        fetchDashboardData();

        // Realtime Subscription for Activities
        if (publicKey) {
            const subscription = supabase
                .channel('public:activities')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'activities',
                    filter: `user_wallet=eq.${publicKey.toString()}`
                }, (payload) => {
                    setActivities((current) => [payload.new as SupabaseActivity, ...current].slice(0, 20));
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [publicKey]);

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            </div>
        );
    }

    // --- MAINTENANCE MODE CHECK ---
    if (settings?.maintenance_mode) {
        return (
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-4xl font-bold font-heading text-white mb-4">Under Maintenance</h1>
                <p className="text-foreground/60 text-lg max-w-xl mx-auto">
                    The MODUS platform is currently undergoing scheduled maintenance and upgrades to improve your experience.
                    Please check back shortly.
                </p>
                <div className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-xl inline-flex items-center space-x-2 text-white/80">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium text-sm tracking-wide uppercase">All contracts temporarily paused</span>
                </div>
            </div>
        );
    }

    if (!publicKey || !profile) {
        return (
            <div className="w-full max-w-6xl mx-auto space-y-6">
                {/* Global Announcements still visible when logged out */}
                {announcements.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-primary/10 border border-brand-primary/30 rounded-2xl p-6 mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <Bell className="w-5 h-5 text-brand-primary" />
                            <h3 className="font-bold text-white uppercase tracking-wider">Global Announcements</h3>
                        </div>
                        <div className="space-y-4">
                            {announcements.map(ann => (
                                <div key={ann.id} className="bg-black/30 p-4 rounded-xl border border-white/5">
                                    <h4 className="font-bold text-brand-primary mb-1">{ann.title}</h4>
                                    <p className="text-foreground/80 text-sm whitespace-pre-wrap">{ann.content}</p>
                                    <p className="text-xs text-foreground/40 mt-2">{formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <div className="glass-panel p-12 text-center">
                    <h2 className="text-2xl font-bold font-heading text-white mb-4">Connect Your Wallet</h2>
                    <p className="text-foreground/60 max-w-lg mx-auto">
                        Please connect your Solana wallet from the top right menu to view your dashboard statistics, character level, and earnings.
                    </p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: "Credits Available", value: `${profile.credits.toLocaleString()} CR`, icon: Coins, color: "text-brand-accent" },
        { label: "Active Streaks", value: "14 Days", icon: Zap, color: "text-brand-accent" },
        { label: "Current Season", value: settings?.active_season || "Pre-Season", icon: Calendar, color: "text-brand-secondary" },
        { label: "Global Rank", value: "#4,291", icon: Activity, color: "text-white" },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">

            {/* Announcements */}
            <AnimatePresence>
                {announcements.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-brand-primary/10 border border-brand-primary/30 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
                        <div className="flex items-center space-x-3 mb-4">
                            <Bell className="w-5 h-5 text-brand-primary animate-pulse" />
                            <h3 className="font-bold text-white uppercase tracking-wider">Global Announcements</h3>
                        </div>
                        <div className="space-y-4">
                            {announcements.map(ann => (
                                <div key={ann.id} className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                    <h4 className="font-bold text-white mb-2">{ann.title}</h4>
                                    <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                                    <p className="text-xs text-brand-primary mt-3 font-medium">{formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Profile */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden"
            >
                {profile.power_level >= 20000 && (
                    <div className="absolute inset-0 border-2 border-brand-accent/50 rounded-2xl group-hover:border-brand-accent transition-colors shadow-[inset_0_0_50px_rgba(20,241,149,0.1)] pointer-events-none" />
                )}

                <div className="flex items-center space-x-6 relative z-10">
                    <div className={`w-20 h-20 rounded-2xl p-[2px] transition-all ${profile.power_level >= 20000 ? 'bg-gradient-to-br from-brand-accent to-brand-primary shadow-[0_0_20px_rgba(20,241,149,0.5)] scale-105' : 'bg-gradient-dynamic'}`}>
                        <div className="w-full h-full rounded-2xl bg-brand-background flex items-center justify-center overflow-hidden relative">
                            <span className={`text-2xl font-bold font-heading ${profile.power_level >= 20000 && 'text-brand-accent drop-shadow-[0_0_8px_rgba(20,241,149,0.8)]'}`}>
                                {profile.username.slice(-2).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading flex items-center gap-2">
                            {profile.username}
                            {profile.power_level >= 20000 && <Sparkles className="w-5 h-5 text-brand-accent" />}
                        </h2>
                        <div className="flex items-center space-x-2 mt-2 flex-wrap gap-y-2">
                            <span className="px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-medium border border-brand-primary/30">
                                Level {profile.account_level} Explorer
                            </span>
                            <span className="text-foreground/50 text-sm bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                {profile.power_level.toLocaleString()} PWR
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 sm:mt-0 flex flex-col items-center sm:items-end relative z-10">
                    <span className="text-foreground/60 text-sm mb-1">Accumulated MOD Tokens</span>
                    <div className="text-3xl sm:text-4xl font-bold text-white font-heading flex items-center tracking-tight">
                        {profile.mod_tokens.toLocaleString()}
                        <span className="text-brand-primary text-xl ml-2 font-medium">MOD</span>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 flex flex-col space-y-4"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-brand-primary/70" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white font-heading">{stat.value}</p>
                            <p className="text-foreground/60 text-sm">{stat.label}</p>
                        </div>
                        {stat.label === "Current Season" && settings?.season_countdown_end && (
                            <div className="w-full mt-2 pt-2 border-t border-white/5">
                                <span className="text-[10px] uppercase tracking-wider text-brand-primary font-bold">Ends: {new Date(settings.season_countdown_end).toLocaleDateString()}</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel p-6 sm:p-8"
            >
                <h3 className="text-xl font-bold text-white font-heading mb-6 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-brand-primary" />
                    <span>Recent Activity</span>
                </h3>
                {/* Activity Feed items mapped */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoadingActivities ? (
                        <div className="text-center text-white/50 py-12">Loading activity feed...</div>
                    ) : activities.length === 0 ? (
                        <div className="text-center text-white/50 py-12 bg-black/20 rounded-xl border border-white/5">
                            <p className="font-medium text-white/70">No activity yet.</p>
                            <p className="text-sm mt-2">Go to the Forge to equip your first item!</p>
                        </div>
                    ) : (
                        activities.map((activity, i) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * Math.min(i, 5) }}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group cursor-default"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-lg border border-white/5 group-hover:scale-110 transition-transform">
                                        {activity.action_type === 'spend' ? '💎' :
                                            activity.action_type === 'earn' ? '✨' :
                                                activity.action_type === 'equip' ? '🛡️' : '🔔'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white/90 group-hover:text-white transition-colors text-sm sm:text-base">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-foreground/50 mt-1" title={new Date(activity.created_at).toLocaleString()}>
                                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>

                                <span className={`font-semibold px-3 py-1 rounded-md text-xs sm:text-sm whitespace-nowrap ml-2 ${activity.action_type === 'earn' ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20' :
                                    activity.action_type === 'spend' ? 'text-brand-accent bg-brand-accent/10 border border-brand-accent/20' :
                                        'text-foreground/70 bg-white/5 border border-white/10'
                                    }`}>
                                    {activity.value}
                                </span>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
