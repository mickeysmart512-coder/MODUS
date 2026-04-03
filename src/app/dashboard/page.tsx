"use client";
import React, { useState, useEffect } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { MazeCanvas } from "@/components/game/MazeCanvas";
import { CommandDialog } from "@/components/game/CommandDialog";
import { WeaponBlueprint } from "@/components/game/WeaponBlueprint";
import { supabase, DailyMission } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

type FlowPhase = 'loading' | 'briefing' | 'maze' | 'success' | 'failure' | 'complete';

export default function DashboardPage() {
    const { addSecuredFragment, fragmentsSecured } = useAuthStore();
    const [mission, setMission] = useState<DailyMission | null>(null);
    const [phase, setPhase] = useState<FlowPhase>('loading');

    useEffect(() => {
        const fetchTodayMission = async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await supabase.from('daily_missions').select('*').eq('active_date', today).single();

            if (data) {
                setMission(data);
                // Check if already completed today
                if (fragmentsSecured.includes(data.fragment_name)) {
                    setPhase('complete');
                } else {
                    setPhase('briefing');
                }
            } else {
                setPhase('complete'); // No mission today
            }
        };
        fetchTodayMission();
    }, [fragmentsSecured]);

    const handleCheckpoint = async () => {
        if (!mission) return;
        toast.success("Checkpoint Secured! Transmitting...", { icon: '🛡️', style: { background: '#2C1E16', color: '#F5E6D3' } });
        setPhase('success');
    };

    const handleCaught = () => {
        toast.error("Scout Compromised.", { icon: '⚠️', style: { background: '#1A0B0B', color: '#ff4444' } });
        setPhase('failure');
    };

    const handleDialogComplete = () => {
        if (phase === 'briefing') {
            setPhase('maze');
        } else if (phase === 'success') {
            if (mission) addSecuredFragment(mission.fragment_name);
            setPhase('complete');
        } else if (phase === 'failure') {
            setPhase('maze'); // Retry
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-12">
            <div>
                <h1 className="text-4xl font-bold font-heading text-white mb-2 tracking-tight">Tactical Command</h1>
                <p className="text-foreground/60 text-lg">Oversee agent operations and secure active breaches.</p>
            </div>

            {/* The Chronos Campaign Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[500px]">

                {/* Active Interface Area */}
                <div className="xl:col-span-2 flex flex-col justify-center">
                    {phase === 'loading' && <div className="text-white/50 text-center animate-pulse">Establishing secure link to Command...</div>}

                    {(phase === 'briefing' || phase === 'success' || phase === 'failure') && mission && (
                        <CommandDialog mission={mission} dialogueType={phase} onComplete={handleDialogComplete} />
                    )}

                    {phase === 'maze' && (
                        <MazeCanvas onCheckpointReached={handleCheckpoint} onCaught={handleCaught} />
                    )}

                    {phase === 'complete' && !mission && (
                        <div className="glass-panel border-white/5 bg-brand-background/50 h-full flex items-center justify-center text-white/50 text-xl font-heading tracking-widest border border-dashed border-white/10 uppercase p-12 text-center rounded-xl">
                            No Active Directives For Today.<br /><span className="text-sm mt-2 font-mono">Rest, Sentinel.</span>
                        </div>
                    )}

                    {phase === 'complete' && mission && (
                        <div className="glass-panel border-brand-primary/20 bg-brand-primary/5 h-full flex flex-col items-center justify-center p-12 text-center rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                            <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mb-4">
                                <div className="w-8 h-8 text-brand-primary">✓</div>
                            </div>
                            <h3 className="text-2xl font-bold text-white font-heading tracking-widest uppercase mb-2">Directive Complete</h3>
                            <p className="text-brand-primary/80 font-mono text-sm max-w-sm">The {mission.fragment_name} has been securely extracted and added to the schema.</p>
                        </div>
                    )}
                </div>

                {/* Weapon Schema Area */}
                <div className="xl:col-span-1 h-full min-h-[500px]">
                    <WeaponBlueprint />
                </div>
            </div>

            {/* Original Dashboard / Inventory */}
            <div className="pt-12 border-t border-brand-primary/10">
                <Dashboard />
            </div>
        </div>
    );
}
