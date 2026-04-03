"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet, Copy, LogOut, Menu, X, Zap, Trophy, Users, CheckCircle,
    Flame, Gift, User, Home, Crosshair, Sparkles, Gamepad2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- COMPONENTS INLINE ---

// 1. Top Navbar
function TopNavbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#111111] z-50 px-4 md:px-8 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#00ffcc] to-[#ff00aa] flex items-center justify-center font-bold text-[#0a0a0a]">
                        M
                    </div>
                    <span className="text-xl font-bold tracking-widest text-[#00ffcc]">MODUS</span>
                </div>

                {/* Center: Connected X */}
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111] border border-[#00ffcc]/20">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">@CyberPunk_Mod</span>
                </div>

                {/* Right: Wallet & Controls */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-[#ff00aa]/20 hover:border-[#ff00aa]/60 transition-colors cursor-pointer group">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195]" />
                        <span className="text-sm font-medium text-white/90 group-hover:text-white">5wBu...e1ee</span>
                        <Copy className="w-3 h-3 text-white/40 group-hover:text-[#00ffcc]" />
                    </div>
                    <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <LogOut className="w-4 h-4 text-[#ff00aa]" />
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <button className="md:hidden p-2 text-[#00ffcc]" onClick={() => setMenuOpen(true)}>
                    <Menu className="w-6 h-6" />
                </button>
            </nav>

            {/* Mobile Bottom Sheet Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#00ffcc]/30 rounded-t-3xl z-[70] p-6 pb-24 md:hidden"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                <span className="text-white font-bold text-lg">Menu</span>
                                <button onClick={() => setMenuOpen(false)}><X className="w-6 h-6 text-white/50" /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-500" />
                                        <span className="text-sm text-white">@CyberPunk_Mod</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#ff00aa]/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195]" />
                                        <span className="text-sm text-white">5wBu...e1ee</span>
                                    </div>
                                    <Copy className="w-4 h-4 text-[#00ffcc]" />
                                </div>
                                <button className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-[#ff00aa] font-bold bg-[#ff00aa]/10 border border-[#ff00aa]/30">
                                    <LogOut className="w-4 h-4" /> Disconnect
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

// 2. Hero Character Section
function HeroCharacter() {
    return (
        <div className="relative w-full rounded-3xl mt-20 mb-8 overflow-hidden bg-[#111111] border border-[#00ffcc]/20 shadow-[0_0_50px_rgba(0,255,204,0.05)] pt-8 pb-10 flex flex-col items-center group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00ffcc]/5 to-transparent pointer-events-none" />

            {/* 3D Character Placeholder */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-b from-[#111111] to-[#0a0a0a] border-4 border-[#ff00aa]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,0,170,0.3)] z-10"
            >
                <img
                    src="https://api.dicebear.com/9.x/bottts-neutral/svg?seed=modus-cyber&backgroundColor=transparent"
                    alt="Cyber Character"
                    className="w-3/4 h-3/4 drop-shadow-[0_0_15px_rgba(0,255,204,0.5)]"
                />
                <div className="absolute -bottom-4 bg-[#111111] px-4 py-1.5 rounded-full border border-[#ccff00] text-xs font-bold text-[#ccff00] uppercase tracking-widest shadow-[0_0_15px_rgba(204,255,0,0.4)]">
                    Stage 3 • Neon Evolution
                </div>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                Cyber Ronin
                <span className="text-sm px-2.5 py-1 rounded bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/50">
                    LVL 12
                </span>
            </h1>

            {/* Progress Bar */}
            <div className="w-full max-w-md px-6 mt-6 relative z-10">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="text-[#00ffcc]">XP Progress</span>
                    <span className="text-white">4,820 / 6,000</span>
                </div>
                <div className="h-3 w-full bg-[#0a0a0a] rounded-full border border-[#111111] overflow-hidden relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "80%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00ffcc] to-[#ff00aa] shadow-[0_0_10px_#ff00aa]"
                    />
                </div>
            </div>
        </div>
    );
}

// 3. Tap-To-Earn Core Zone
function TapZone() {
    const [taps, setTaps] = useState(0);
    const [energy, setEnergy] = useState(87);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, x: number, y: number }[]>([]);

    // Regenerate energy slowly
    useEffect(() => {
        const interval = setInterval(() => {
            setEnergy(prev => Math.min(100, prev + 1));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleTap = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (energy <= 0) return;

        // Vibrate on mobile
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }

        setTaps(prev => prev + 1);
        setEnergy(prev => Math.max(0, prev - 1));

        // Create floating text at random position inside the button
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2 + (Math.random() * 40 - 20);
        const y = e.clientY - rect.top - rect.height / 2 + (Math.random() * 20 - 10);

        const id = Date.now();
        setFloatingTexts(prev => [...prev, { id, x, y }]);
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== id));
        }, 1000);
    };

    return (
        <div className="w-full flex flex-col items-center py-6 mb-12 relative">
            <div className="text-sm font-bold text-[#ccff00] mb-4 tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4" /> Energy {energy}/100
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTap}
                disabled={energy <= 0}
                className={cn(
                    "relative w-56 h-56 rounded-full flex items-center justify-center transition-opacity",
                    energy > 0 ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"
                )}
            >
                {/* Pulsing neon background */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00ffcc] to-[#ff00aa] opacity-20 blur-2xl animate-pulse" />

                {/* The Button */}
                <div className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-4 border-[#ff00aa] shadow-[0_0_50px_rgba(255,0,170,0.4)] flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <Sparkles className="w-8 h-8 text-[#00ffcc] mb-2" />
                    <span className="text-2xl font-black text-white tracking-widest uppercase">Tap To<br />Earn</span>
                </div>

                {/* Floating texts */}
                <AnimatePresence>
                    {floatingTexts.map(anim => (
                        <motion.div
                            key={anim.id}
                            initial={{ opacity: 1, y: anim.y, x: anim.x, scale: 0.5 }}
                            animate={{ opacity: 0, y: anim.y - 100, scale: 1.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute z-50 text-2xl font-black text-[#ccff00] drop-shadow-[0_0_10px_rgba(204,255,0,0.8)] pointer-events-none"
                        >
                            +420
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.button>

            <motion.div
                key={taps}
                initial={{ y: 5, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-black text-[#00ffcc] mt-8 tracking-tighter drop-shadow-[0_0_10px_rgba(0,255,204,0.5)]"
            >
                {(taps * 420).toLocaleString()} <span className="text-xl text-white">MODUS</span>
            </motion.div>

            <p className="text-xs text-[#ff00aa] font-bold mt-3 tracking-wider bg-[#ff00aa]/10 px-4 py-1.5 rounded-full border border-[#ff00aa]/30">
                1 TAP = 420 MODUS • MULTIPLIER ×2.4
            </p>
        </div>
    );
}

// 4. Quick Stats Row
function QuickStats() {
    const stats = [
        { label: "Today's Earnings", value: "+14.2K", icon: <Zap className="w-4 h-4 text-[#00ffcc]" />, color: "border-[#00ffcc]/30" },
        { label: "Total Taps", value: "8,942", icon: <Crosshair className="w-4 h-4 text-[#ff00aa]" />, color: "border-[#ff00aa]/30" },
        { label: "Referral Rewards", value: "2.8K", icon: <Users className="w-4 h-4 text-[#ccff00]" />, color: "border-[#ccff00]/30" },
        { label: "Current Streak", value: "14 Days", icon: <Flame className="w-4 h-4 text-orange-500" />, color: "border-orange-500/30" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-12">
            {stats.map((stat, i) => (
                <div key={i} className={cn("bg-[#111111] p-4 rounded-2xl border flex flex-col items-start gap-2 relative overflow-hidden group", stat.color)}>
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
                        {stat.icon}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
                        {stat.icon} {stat.label}
                    </div>
                    <div className="text-xl md:text-2xl font-black text-white mt-1">
                        {stat.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

// 5. Daily Tasks
function DailyTasks() {
    const tasks = [
        { id: 1, title: "Follow @ModusOnSolana", reward: "5,000", done: false },
        { id: 2, title: "Invite 3 Friends", reward: "15,000", done: false },
        { id: 3, title: "Join Discord", reward: "2,500", done: true },
        { id: 4, title: "Share Character", reward: "1,000", done: false },
    ];

    return (
        <div className="w-full mb-12">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    Daily Missions <span className="px-2 py-0.5 rounded text-[10px] bg-[#ff00aa]/20 text-[#ff00aa] border border-[#ff00aa]/50">RESET IN 14H</span>
                </h2>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 snap-x hide-scrollbar">
                {tasks.map(task => (
                    <div key={task.id} className="min-w-[240px] md:min-w-0 snap-start bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col gap-4 relative">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-white/5">
                                <Trophy className="w-4 h-4 text-[#00ffcc]" />
                            </div>
                            <div className="flex items-center gap-1 font-black text-[#00ffcc] bg-[#00ffcc]/10 px-2.5 py-1 rounded-full text-xs">
                                +{task.reward} MODUS
                            </div>
                        </div>
                        <h3 className="font-bold text-white text-sm">{task.title}</h3>

                        <button
                            disabled={task.done}
                            className={cn(
                                "w-full py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-colors mt-auto",
                                task.done ? "bg-white/5 text-white/30 border border-white/5" : "bg-gradient-to-r from-[#00ffcc] to-[#33ffaa] text-[#0a0a0a] shadow-[0_0_15px_rgba(0,255,204,0.4)]"
                            )}
                        >
                            {task.done ? "Claimed" : "Claim"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 6. Referral Hub
function ReferralHub() {
    return (
        <div className="w-full bg-[#111111] rounded-3xl border border-[#ff00aa]/30 p-6 md:p-8 relative overflow-hidden mb-12">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#ff00aa]/10 blur-[100px] pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-white mb-2">Build Your Cartel</h2>
                    <p className="text-white/60 text-sm mb-6 max-w-md leading-relaxed">
                        Invite friends to join the neon underground. You'll permanently receive <span className="text-[#00ffcc] font-bold">20% of their lifetime tap earnings</span>.
                    </p>

                    <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#ff00aa]/20 rounded-xl p-2 max-w-sm w-full">
                        <div className="flex-1 px-3 text-sm font-medium text-white/50 truncate">
                            modus.app/ref/CyberPunk
                        </div>
                        <button className="px-4 py-2 bg-[#ff00aa] hover:bg-[#ff00aa]/80 transition-colors text-white text-sm font-bold rounded-lg shadow-[0_0_10px_rgba(255,0,170,0.5)]">
                            Copy
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 md:gap-6 w-full md:w-auto">
                    <div className="flex-1 md:flex-none flex flex-col items-center bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl min-w-[120px]">
                        <span className="text-3xl font-black text-[#ccff00]">12</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 mt-1 mt-2">Friends Recruited</span>
                    </div>
                    <div className="flex-1 md:flex-none flex flex-col items-center bg-[#0a0a0a] border border-[#00ffcc]/20 p-4 rounded-2xl min-w-[120px]">
                        <span className="text-2xl font-black text-[#00ffcc] mt-1">2.8K</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#00ffcc]/70 mt-2 text-center">$MODUS Earned</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 7. Recent Activity
function ActivityFeed() {
    const acts = [
        { text: "You tapped 87 times", yield: "+174 MODUS", time: "2m ago" },
        { text: "Referral @CryptoDegen joined", yield: "+500 MODUS", time: "1h ago" },
        { text: "Evolved trait 'Laser Eyes'", yield: "Level Up", time: "4h ago" },
        { text: "Claimed Daily Mission", yield: "+5,000 MODUS", time: "1d ago" },
    ];

    return (
        <div className="w-full mb-24 md:mb-12">
            <h2 className="text-xl font-bold text-white tracking-tight mb-4 px-1">Network Logs</h2>
            <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
                {acts.map((act, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                        <div>
                            <p className="text-sm font-medium text-white/90">{act.text}</p>
                            <p className="text-xs text-white/40 mt-1">{act.time}</p>
                        </div>
                        <div className="text-sm font-bold text-[#00ffcc] bg-[#00ffcc]/10 px-3 py-1 rounded-full border border-[#00ffcc]/20">
                            {act.yield}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 8. Footer Mobile Navbar
function MobileBottomNav() {
    const tabs = [
        { icon: <Home />, label: "Grid", active: true },
        { icon: <Gamepad2 />, label: "Play", active: false },
        { icon: <Users />, label: "Cartel", active: false },
        { icon: <Trophy />, label: "Ranks", active: false },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-full h-16 px-6 flex justify-between items-center z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            {tabs.map((tab, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-1 cursor-pointer">
                    <div className={cn(
                        "p-1.5 rounded-full transition-colors",
                        tab.active ? "text-[#ff00aa] bg-[#ff00aa]/10" : "text-white/40 hover:text-white/80"
                    )}>
                        {React.cloneElement(tab.icon as React.ReactElement, { className: "w-5 h-5" })}
                    </div>
                    {tab.active && <div className="w-1 h-1 rounded-full bg-[#ff00aa] shadow-[0_0_5px_#ff00aa]" />}
                </div>
            ))}
        </div>
    );
}

// --- MAIN PAGE ASSEMBLY ---

export default function CyberDashboardWrapper() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ff00aa] selection:text-white font-sans overflow-x-hidden">
            {/* Global abstract background effects */}
            <div className="fixed inset-0 bg-[#0a0a0a] -z-20" />
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#00ffcc]/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff00aa]/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

            <TopNavbar />

            <main className="max-w-4xl mx-auto px-4 md:px-8 pb-32">
                <HeroCharacter />
                <TapZone />
                <QuickStats />
                <DailyTasks />
                <ReferralHub />
                <ActivityFeed />
            </main>

            <MobileBottomNav />

            <style dangerouslySetInnerHTML={{
                __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
        </div>
    );
}
