"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Twitter, CheckCircle2, ArrowRight, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";

interface SocialOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SocialOnboardingModal({ isOpen, onClose }: SocialOnboardingModalProps) {
    const { isXConnected, hasFollowedProject, setXConnected, setHasFollowedProject } = useAuthStore();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    const handleConnectX = async () => {
        setIsConnecting(true);
        console.log("Starting X OAuth flow...");

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'twitter', // Supabase handles both v1 and v2 under 'twitter' but will use v2 if configured. 
                options: {
                    redirectTo: `${window.location.origin}`
                }
            });

            if (error) {
                console.error("Error connecting to X:", error);

                // If it's the unsupported provider error, let's offer a mock login for testing
                if (error.message.includes("Unsupported provider") || error.message.includes("provider is not enabled")) {
                    const useMock = window.confirm(
                        "Twitter OAuth is not enabled in your Supabase project.\n\n" +
                        "To fix for production: Go to Supabase > Authentication > Providers > Enable Twitter.\n\n" +
                        "Would you like to proceed with a MOCK login for testing purposes right now?"
                    );

                    if (useMock) {
                        setXConnected(true);
                        setTimeout(() => {
                            alert("Mock Login Successful! You are now 'connected' as @tester.");
                        }, 500);
                    }
                } else {
                    alert(`Error connecting to X: ${error.message}\nMake sure Twitter OAuth is enabled in Supabase!`);
                }

                setIsConnecting(false);
            }
        } catch (err) {
            console.error(err);
            setIsConnecting(false);
        }
    };

    const handleFollowProject = async () => {
        setIsFollowing(true);
        // Open X in a new tab to follow the project
        window.open("https://twitter.com/intent/follow?screen_name=ModusProject", "_blank");

        // Simulate user coming back and verifying
        await new Promise(resolve => setTimeout(resolve, 2000));
        setHasFollowedProject(true);
        setIsFollowing(false);

        // Auto close after successful onboarding
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md glass-panel p-8 overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 translate-y-1/2" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-foreground/50 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-dynamic p-[2px] mx-auto mb-6">
                                <div className="w-full h-full rounded-2xl bg-brand-background flex items-center justify-center">
                                    <span className="text-2xl font-bold font-heading text-white">M</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white font-heading mb-2">Join the Resistance</h2>
                            <p className="text-foreground/60 text-sm">
                                Complete social verification to unlock your Web3 wallet and start earning.
                            </p>
                        </div>

                        <div className="space-y-4 relative">
                            {/* Step Indicator Line */}
                            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-white/10 z-0" />

                            {/* Step 1: Connect X */}
                            <div className="relative z-10 flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 ${isXConnected ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-black/40 border-white/10 text-white'}`}>
                                    {isXConnected ? <CheckCircle2 className="w-6 h-6" /> : <Twitter className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-white font-bold leading-none mb-1">Connect X Account</h3>
                                    <p className="text-foreground/50 text-sm mb-3">Link your profile to verify your identity.</p>

                                    {!isXConnected && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleConnectX}
                                                disabled={isConnecting}
                                                className="glass-button flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 text-sm font-medium disabled:opacity-50"
                                            >
                                                {isConnecting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <span>Connect X</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>

                                            {/* Dev/Testing Fallback */}
                                            <button
                                                onClick={() => {
                                                    setXConnected(true);
                                                    alert("Mock Login Successful! You are now 'connected'.");
                                                }}
                                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-3 text-xs font-semibold transition-colors"
                                            >
                                                MOCK
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Follow Project */}
                            <div className={`relative z-10 flex items-start space-x-4 transition-opacity duration-500 ${!isXConnected ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 ${hasFollowedProject ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-black/40 border-white/10 text-white'}`}>
                                    {hasFollowedProject ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">2</span>}
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-white font-bold leading-none mb-1">Follow @ModusProject</h3>
                                    <p className="text-foreground/50 text-sm mb-3">Stay updated with the latest drops.</p>

                                    {!hasFollowedProject && (
                                        <button
                                            onClick={handleFollowProject}
                                            disabled={isFollowing || !isXConnected}
                                            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-medium transition-colors text-sm shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50"
                                        >
                                            {isFollowing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Twitter className="w-4 h-4" />
                                                    <span>Follow & Verify</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Success State */}
                        <AnimatePresence>
                            {isXConnected && hasFollowedProject && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 text-center"
                                >
                                    <p className="text-green-400 font-medium mb-1">Verification Complete!</p>
                                    <p className="text-white/60 text-sm">You can now connect your wallet.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
