"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ShieldAlert, CheckCircle2, Play } from "lucide-react";
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

    const dialogueLines =
        dialogueType === "briefing" ? mission.briefing_dialogue
            : dialogueType === "success" ? mission.success_dialogue
                : mission.failure_dialogue;

    const fullText = dialogueLines[currentScreen] || "Connection Established...";

    useEffect(() => {
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
        }, 25);

        return () => clearInterval(interval);
    }, [currentScreen, fullText]);

    const handleNext = () => {
        if (isTyping) {
            setDisplayedText(fullText);
            setIsTyping(false);
        } else {
            if (currentScreen < dialogueLines.length - 1) {
                setCurrentScreen(s => s + 1);
            } else {
                onComplete();
            }
        }
    };

    const isSuccess = dialogueType === "success";
    const isFailure = dialogueType === "failure";
    const isLastScreen = currentScreen === dialogueLines.length - 1;

    return (
        <div className="relative overflow-hidden bg-[#0a0604] min-h-[550px] flex flex-col justify-end rounded-3xl border border-white/5 shadow-2xl">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(196,155,97,0.1),transparent)] opacity-50" />
            
            {/* Command Silhouette */}
            <AnimatePresence mode="wait">
                <motion.div
                    key="command-silhouette"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
                >
                    <div className="relative w-full h-full max-w-[500px]">
                        {/* Shadowy Silhouette UI */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0604] via-transparent to-transparent z-10" />
                        <motion.div 
                            animate={{ 
                                opacity: [0.4, 0.6, 0.4],
                                filter: ["brightness(1) contrast(1.2)", "brightness(1.2) contrast(1.4)", "brightness(1) contrast(1.2)"]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-full h-full grayscale brightness-[0.2] contrast-[2] opacity-80"
                        >
                            <img
                                src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Command&backgroundColor=transparent&eyes=frame1,frame2&mouth=smile01,smile02"
                                alt="Command Silhouette"
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                        {/* Glitch Overlay for Failure */}
                        {isFailure && (
                            <motion.div 
                                animate={{ opacity: [0, 0.2, 0] }}
                                transition={{ duration: 0.2, repeat: Infinity }}
                                className="absolute inset-0 bg-red-500/20 mix-blend-overlay z-20"
                            />
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Comic Cloud Dialogue */}
            <div className="relative z-20 w-full p-6 sm:p-10 flex flex-col items-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full max-w-2xl group"
                >
                    {/* SVG Bubble Pointer */}
                    <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-brand-primary/20 pointer-events-none" />

                    <div 
                        onClick={handleNext}
                        className="w-full bg-[#1A110D]/95 backdrop-blur-xl border-2 border-brand-primary/20 rounded-[40px] p-8 sm:p-10 cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all hover:border-brand-primary/50 relative"
                    >
                        {/* Status Tags */}
                        <div className="absolute -top-4 left-10 flex space-x-2">
                             <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border shadow-lg ${isSuccess ? 'bg-green-500/20 text-green-400 border-green-500/30' : isFailure ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-brand-primary/20 text-brand-primary border-brand-primary/30'}`}>
                                {dialogueType}
                             </div>
                             <div className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-white/5 text-white/40 border border-white/10">
                                CHRN-TX {currentScreen + 1}/{dialogueLines.length}
                             </div>
                        </div>

                        <div className="min-h-[120px] flex flex-col justify-center">
                            <p className="text-white font-heading text-xl sm:text-2xl leading-relaxed text-center tracking-wide">
                                <span className="text-brand-primary/50 mr-2 text-3xl font-serif">"</span>
                                {displayedText}
                                {isTyping && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity }} className="inline-block w-1 h-6 bg-brand-primary ml-1" />}
                                <span className="text-brand-primary/50 ml-2 text-3xl font-serif">"</span>
                            </p>
                        </div>

                        {/* Control Area */}
                        <div className="mt-8 flex justify-center">
                            <AnimatePresence mode="wait">
                                {isLastScreen && !isTyping ? (
                                    <motion.button
                                        key="init-button"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-brand-primary text-black font-heading font-black text-lg px-10 py-4 rounded-full flex items-center space-x-3 shadow-[0_0_30px_rgba(196,155,97,0.5)] uppercase tracking-tighter"
                                    >
                                        <Play className="fill-current w-5 h-5" />
                                        <span>Initialize Breach</span>
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        key="next-button"
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="flex items-center space-x-2 text-brand-primary/60 font-mono text-sm uppercase tracking-widest"
                                    >
                                        <span>{isTyping ? "Transmitting..." : "Click to continue"}</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
