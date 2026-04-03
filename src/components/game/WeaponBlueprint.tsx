"use client";
import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Target, Zap, Shield, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WeaponBlueprint() {
    const { fragmentsSecured } = useAuthStore();

    // A hardcoded skeletal list of fragments that make up the "Chronos Weapon"
    const blueprintNodes = [
        { id: "Quantum Core", name: "Quantum Core", type: "Core", icon: Zap },
        { id: "Temporal Lens", name: "Temporal Lens", type: "Optics", icon: Target },
        { id: "Aegis Plating", name: "Aegis Plating", type: "Defense", icon: Shield },
        { id: "Plasma Emitter", name: "Plasma Emitter", type: "Weaponry", icon: Zap },
    ];

    return (
        <div className="glass-panel border-white/5 bg-[#140D0A]/90 p-8 h-full shadow-[inset_0_0_20px_rgba(44,30,22,0.8)] relative overflow-hidden flex flex-col">
            {/* Background Graphic */}
            <div className="absolute inset-0 bg-brand-primary/5 blur-[100px] z-0" />

            <div className="flex items-center justify-between mb-8 border-b border-brand-primary/20 pb-4 relative z-10">
                <h2 className="font-heading font-bold text-xl text-white tracking-widest uppercase">
                    Project <span className="text-brand-primary">Chronos</span>
                </h2>
                <div className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded text-brand-primary text-xs font-bold font-mono tracking-widest">
                    {fragmentsSecured.length} / {blueprintNodes.length} ASSEMBLED
                </div>
            </div>

            <div className="flex-1 relative z-10 flex flex-col justify-center gap-6">
                {blueprintNodes.map((node, i) => {
                    const isUnlocked = fragmentsSecured.includes(node.id);
                    const Icon = isUnlocked ? node.icon : HelpCircle;

                    return (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`flex items-center p-4 rounded-xl border transition-all duration-500 ${isUnlocked ? 'bg-brand-primary/10 border-brand-primary/50 shadow-[0_0_15px_rgba(196,155,97,0.2)]' : 'bg-black/20 border-white/5 border-dashed grayscale opacity-50'}`}
                        >
                            <div className={`p-3 rounded-lg mr-4 ${isUnlocked ? 'bg-brand-primary text-[#140D0A]' : 'bg-white/5 text-white/50'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={`font-bold font-heading tracking-wider ${isUnlocked ? 'text-white' : 'text-white/50'}`}>
                                    {isUnlocked ? node.name : "Unknown Fragment"}
                                </h3>
                                <p className={`text-xs font-mono tracking-widest ${isUnlocked ? 'text-brand-primary' : 'text-white/30'}`}>
                                    {node.type}
                                </p>
                            </div>
                            {isUnlocked && (
                                <div className="ml-auto text-brand-primary text-xs font-bold uppercase tracking-widest animate-pulse">
                                    Secured
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            <div className="mt-8 text-center text-xs font-mono text-white/30 uppercase tracking-widest border-t border-white/5 pt-4 relative z-10">
                Awaiting further operational directives from Command.
            </div>
        </div>
    );
}
