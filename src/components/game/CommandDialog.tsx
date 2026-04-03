"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { DailyMission } from "@/lib/supabase";

interface CommandDialogProps {
    mission: DailyMission;
    dialogueType: "briefing" | "success" | "failure";
    onComplete: () => void;
}

export function CommandDialog({ mission, dialogueType, onComplete }: CommandDialogProps) {
    const [currentScreen, setCurrentScreen] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    // Fetch the correct array based on type
    const dialogueLines =
        dialogueType === "briefing" ? mission.briefing_dialogue
            : dialogueType === "success" ? mission.success_dialogue
                : mission.failure_dialogue;

    const fullText = dialogueLines[currentScreen] || "Connection Established...";

    useEffect(() => {
        // Typewriter effect
        let currentIndex = 0;
        setIsTyping(true);
        setDisplayedText("");

        const interval = setInterval(() => {
            if (currentIndex < fullText.length) {
                setDisplayedText(prev => prev + fullText.charAt(currentIndex));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 30); // 30ms per character

        return () => clearInterval(interval);
    }, [currentScreen, fullText]);

    const handleNext = () => {
        if (isTyping) {
            // Skip typing
            setDisplayedText(fullText);
            setIsTyping(false);
        } else {
            // Next screen or complete
            if (currentScreen < dialogueLines.length - 1) {
                setCurrentScreen(s => s + 1);
            } else {
                onComplete();
            }
        }
    };

    const isSuccess = dialogueType === "success";
    const isFailure = dialogueType === "failure";

    return (
        <div className="glass-panel border-white/10 relative overflow-hidden bg-gradient-to-br from-[#1A110D] to-[#0a0604] min-h-[500px] flex flex-col justify-end shadow-2xl">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            <div className={`absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] ${isSuccess ? 'bg-brand-primary/20' : isFailure ? 'bg-red-500/10' : 'bg-brand-accent/10'}`} />

            {/* Header */}
            <div className="absolute top-0 w-full p-4 border-b border-white/5 flex justify-between items-center z-10 bg-black/40 backdrop-blur-md">
                <div className="flex items-center space-x-3">
                    {isSuccess ? <CheckCircle2 className="w-5 h-5 text-brand-primary" /> : isFailure ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />}
                    <h2 className="font-heading font-bold text-white tracking-widest uppercase text-sm">
                        {dialogueType === "briefing" ? "Incoming Transmission" : "Mission Report"}
                    </h2>
                </div>
                <div className="text-xs font-mono text-white/50 bg-white/5 px-2 py-1 rounded-sm border border-white/10">
                    SECURE CHANNEL
                </div>
            </div>

            {/* Character Portrait */}
            <AnimatePresence mode="wait">
                <motion.div
                    key="commander"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute bottom-12 left-0 w-full max-w-[400px] aspect-[4/3] pointer-events-none z-10 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140D0A] via-transparent to-transparent z-10" />
                    <img
                        src={isFailure ? "https://api.dicebear.com/7.x/bottts/svg?seed=CommanderFail&colors=red" : "https://api.dicebear.com/7.x/bottts/svg?seed=Commander&primaryColor=C49B61"}
                        alt="Command"
                        className={`w-full h-full object-contain ${isFailure ? 'grayscale opacity-70 sepia' : ''}`}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Dialogue Box */}
            <div className="relative z-20 w-full p-4 sm:p-8 shrink-0">
                <div
                    onClick={handleNext}
                    className="w-full bg-[#1A110D]/90 backdrop-blur-lg border border-brand-primary/30 rounded-2xl p-6 sm:p-8 cursor-pointer group shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-all hover:border-brand-primary/60"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className={`font-bold font-heading uppercase tracking-widest text-lg ${isFailure ? 'text-red-400' : 'text-brand-primary'}`}>
                            Nexus Command
                        </h3>
                        <span className="text-[10px] text-white/30 font-mono tracking-widest">
                            LGG-{(currentScreen + 1).toString().padStart(2, '0')}/{dialogueLines.length.toString().padStart(2, '0')}
                        </span>
                    </div>

                    <div className="min-h-[80px]">
                        <p className="text-white/90 text-lg sm:text-xl font-light leading-relaxed">
                            {displayedText}
                            {isTyping && <span className="inline-block w-2 h-5 bg-brand-primary ml-1 animate-pulse" />}
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <motion.div
                            animate={{ x: isTyping ? 0 : [0, 5, 0] }}
                            transition={{ repeat: isTyping ? 0 : Infinity, duration: 1 }}
                            className={`flex items-center text-xs font-bold uppercase tracking-widest ${isTyping ? 'text-white/20' : 'text-brand-primary group-hover:text-white transition-colors'}`}
                        >
                            <span>{isTyping ? "Skip" : currentScreen < dialogueLines.length - 1 ? "Next" : "Acknowledge"}</span>
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
