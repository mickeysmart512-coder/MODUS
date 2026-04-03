"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/useAuthStore";
import SocialOnboardingModal from "./SocialOnboardingModal";
import { supabase } from "@/lib/supabase";

// Wallet button needs to be imported dynamically to prevent hydration errors 
// when SSR since it relies on browser APIs (window.solana)
const WalletMultiButton = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

export default function TopNav() {
    const pathname = usePathname();
    const { isXConnected, hasFollowedProject, setXConnected, setUsername, username, powerLevel, isSocialModalOpen, setSocialModalOpen } = useAuthStore();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setXConnected(true);
                const providerUsername = session.user.user_metadata?.preferred_username || session.user.user_metadata?.user_name;
                if (providerUsername) {
                    setUsername(`@${providerUsername}`);
                }
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setXConnected(true);
                const providerUsername = session.user.user_metadata?.preferred_username || session.user.user_metadata?.user_name;
                if (providerUsername) {
                    setUsername(`@${providerUsername}`);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [setXConnected, setUsername]);

    // Removed TopNav exclusion so the Wallet Button remains accessible

    const isSocialOnboardingComplete = isXConnected && hasFollowedProject;

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Forge", href: "/character-builder", icon: User },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 rounded-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-dynamic flex items-center justify-center">
                            <span className="text-white font-bold font-heading text-lg leading-none">M</span>
                        </div>
                        <span className="font-heading font-bold text-xl text-white hidden sm:block">MODUS</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1 bg-black/20 p-1 rounded-full border border-white/5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? "text-white" : "text-foreground/60 hover:text-white"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute inset-0 bg-white/10 rounded-full"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center space-x-2">
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Wallet Connect Button / Gated Social Login */}
                    <div className="flex items-center space-x-4">
                        <AnimatePresence mode="wait">
                            {!isSocialOnboardingComplete ? (
                                <motion.button
                                    key="social-gate"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => setSocialModalOpen(true)}
                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-[0_0_15px_rgba(139,92,246,0.5)] font-heading text-sm"
                                >
                                    Login with X
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="user-profile"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center"
                                >
                                    <div className="hidden sm:flex items-center space-x-3 bg-white/5 py-1 px-3 rounded-full border border-white/10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all ${powerLevel >= 20000 ? 'bg-brand-accent/20 text-brand-accent border-brand-accent shadow-[0_0_15px_rgba(20,241,149,0.8)]' : 'bg-brand-primary/20 text-brand-primary border-brand-primary/30'}`}>
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className={`text-sm font-medium pr-2 text-white ${powerLevel >= 20000 && 'drop-shadow-[0_0_5px_rgba(20,241,149,0.8)]'}`}>{username && username.startsWith('@') ? username : '@X_Linked'}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Wallet Button - Always visible, conditionally disabled */}
                        <div className="transition-all duration-300">
                            <WalletMultiButton style={{
                                backgroundColor: 'var(--color-brand-primary)',
                                borderRadius: '9999px',
                                padding: '0 20px',
                                height: '40px',
                                fontSize: '14px',
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 600,
                            }} />
                        </div>
                    </div>

                    {/* Mobile menu bottom tab bar */}
                    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-3 pb-safe flex md:hidden items-center justify-around z-50">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[64px] ${pathname === item.href ? "text-brand-primary" : "text-foreground/50 hover:text-white"
                                    }`}
                            >
                                <item.icon className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold tracking-wide uppercase">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Spacer for bottom nav on mobile */}
            <div className="block md:hidden pb-20" />

            <SocialOnboardingModal
                isOpen={isSocialModalOpen}
                onClose={() => setSocialModalOpen(false)}
            />
        </>
    );
}
