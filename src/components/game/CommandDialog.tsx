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

    // Check if it's the last screen of the briefing
    const isBriefing = dialogueType === "briefing";
    const isLastScreen = currentScreen === dialogueLines.length - 1;

    return (
        <div className="glass-panel border-white/10 relative overflow-hidden bg-[#0a0604] min-h-[500px] flex flex-col justify-end shadow-2xl">
            {/* Background Narrative Lighting */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${isSuccess ? 'bg-green-500/5' : isFailure ? 'bg-red-500/10' : 'bg-brand-primary/5'}`} />
            
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

            {/* Header */}
            <div className="absolute top-0 w-full p-4 border-b border-white/5 flex justify-between items-center z-30 bg-black/60 backdrop-blur-md">
                <div className="flex items-center space-x-3">
                    {isSuccess ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : isFailure ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />}
                    <h2 className="font-heading font-bold text-white tracking-widest uppercase text-xs">
                        {dialogueType === "briefing" ? "Nexus Protocol: Incoming" : "Terminal: Mission Log"}
                    </h2>
                </div>
            </div>

            {/* Commander Silhouette */}
            <AnimatePresence mode="wait">
                <motion.div
                    key="commander-silhouette"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                >
                    <div className="relative w-full h-full max-w-[600px] opacity-40 mix-blend-overlay">
                         <img
                            src="https://api.dicebear.com/7.x/bottts/svg?seed=NexusCommand&primaryColor=C49B61&backgroundColor=transparent"
                            alt="Command Silhouette"
                            className="w-full h-full object-contain brightness-0 invert opacity-20"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0a0604] via-transparent to-transparent" />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Comic Cloud Dialogue */}
            <div className="relative z-20 w-full p-6 sm:p-12 flex flex-col items-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={currentScreen}
                    className="relative max-w-2xl w-full"
                >
                    {/* The Speech Bubble */}
                    <div className="bg-white/5 backdrop-blur-xl border-2 border-brand-primary/40 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
                        {/* The Bubble Tail */}
                        <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-brand-primary/40"></div>
                        <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[18px] border-t-[#16110e]"></div>

                        <div className="flex flex-col space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.3em]">
                                    {isSuccess ? "Transmission Complete" : isFailure ? "Signal Lost" : `Data Chunk ${currentScreen + 1}/${dialogueLines.length}`}
                                </span>
                                <div className="flex space-x-1">
                                    {[...Array(dialogueLines.length)].map((_, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentScreen ? 'bg-brand-primary shadow-[0_0_8px_#C49B61]' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </div>

                            <div className="min-h-[100px]">
                                <p className="text-white/95 text-xl sm:text-2xl font-medium leading-relaxed italic font-serif">
                                    "{displayedText}"
                                    {isTyping && <span className="inline-block w-1.5 h-6 bg-brand-primary ml-2 animate-pulse" />}
                                </p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleNext}
                                    disabled={isTyping && !isLastScreen && isBriefing}
                                    className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 flex items-center space-x-2 
                                        ${isLastScreen && isBriefing 
                                            ? 'bg-brand-primary text-black shadow-[0_0_25px_rgba(196,155,97,0.5)] hover:scale-105 active:scale-95' 
                                            : 'bg-white/5 text-brand-primary border border-brand-primary/30 hover:bg-white/10'}`}
                                >
                                    <span>
                                        {isTyping ? "Skip" : (isLastScreen && isBriefing ? "Initialize Breach" : isLastScreen ? "Acknowledge" : "Next")}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 ${isLastScreen && isBriefing ? 'animate-bounce-x' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
