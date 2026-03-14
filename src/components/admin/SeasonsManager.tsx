"use client";

import { useState, useEffect } from "react";
import { supabase, SystemSettings } from "@/lib/supabase";
import { Clock, Lock, AlertTriangle, CalendarDays } from "lucide-react";

export default function SeasonsManager() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form state for updating
    const [selectedSeason, setSelectedSeason] = useState<SystemSettings['active_season']>('Pre-Season');
    const [countdownMonths, setCountdownMonths] = useState(3);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
        if (data) {
            setSettings(data);
            setSelectedSeason(data.active_season);
        }
        setIsLoading(false);
    };

    const handleLockSeason = async () => {
        if (
            !confirm(
                `WARNING: You are about to lock in a new season (${selectedSeason}) with a ${countdownMonths}-month countdown.\n\nThis action CANNOT be stopped once initiated. Continue?`
            )
        ) return;

        setIsSaving(true);

        // Calculate future date
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + countdownMonths);

        try {
            const { error } = await supabase.from('system_settings').update({
                active_season: selectedSeason,
                season_countdown_end: endDate.toISOString()
            }).eq('id', 1);

            if (!error) {
                fetchSettings();
            }
        } catch (error) {
            console.error("Failed to update season", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-white/50 py-8 animate-pulse">Loading Season Config...</div>;

    const isCountdownActive = !!(settings?.season_countdown_end && new Date(settings.season_countdown_end) > new Date());

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-16">
            <div>
                <h2 className="text-2xl font-bold font-heading text-white">Season & Epoch Management</h2>
                <p className="text-foreground/60 text-sm mt-1">Control the global phases of the application</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current State Panel */}
                <div className="glass-panel p-8 border border-white/10 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center space-x-3 mb-6 relative">
                        <CalendarDays className="w-6 h-6 text-brand-primary" />
                        <h3 className="text-xl font-bold text-white">Current Status</h3>
                    </div>

                    <div className="space-y-6 relative">
                        <div>
                            <div className="text-sm text-foreground/50 mb-1">Active Phase</div>
                            <div className="text-3xl font-bold text-white font-heading tracking-wider flex items-center space-x-3">
                                <span>{settings?.active_season}</span>
                                {isCountdownActive && <span className="w-3 h-3 rounded-full bg-brand-accent animate-pulse"></span>}
                            </div>
                        </div>

                        {settings?.season_countdown_end && (
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                <div className="text-sm text-foreground/50 mb-2 flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Locked Countdown End Date</span>
                                </div>
                                <div className="text-xl font-mono text-brand-accent font-bold">
                                    {new Date(settings.season_countdown_end).toLocaleString()}
                                </div>
                                {isCountdownActive ? (
                                    <div className="text-xs text-brand-primary mt-2 flex items-center space-x-1">
                                        <Lock className="w-3 h-3" />
                                        <span>Time lock active.</span>
                                    </div>
                                ) : (
                                    <div className="text-xs text-foreground/50 mt-2">
                                        Countdown completed. Ready for next phase.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="glass-panel p-8 border border-brand-accent/30 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-brand-accent" />
                            <h3 className="text-xl font-bold text-white">Trigger New Database Epoch</h3>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm text-white/70 mb-2">Select Next Season</label>
                                <select
                                    value={selectedSeason}
                                    onChange={(e) => setSelectedSeason(e.target.value as SystemSettings["active_season"])}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-brand-accent"
                                    disabled={isCountdownActive}
                                >
                                    <option value="Pre-Season">Pre-Season (Onboarding)</option>
                                    <option value="Season 1">Season 1</option>
                                    <option value="Season 2">Season 2</option>
                                    <option value="Season 3">Season 3</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-white/70 mb-2">Duration Before End (Months)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={countdownMonths}
                                    onChange={(e) => setCountdownMonths(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-brand-accent font-mono"
                                    disabled={isCountdownActive}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={handleLockSeason}
                            disabled={isCountdownActive || isSaving}
                            className={`w-full py-4 rounded-xl flex items-center justify-center space-x-3 font-bold text-white transition-all ${isCountdownActive
                                ? 'bg-white/5 border border-white/10 cursor-not-allowed opacity-50'
                                : 'bg-brand-accent hover:bg-brand-accent/80 text-black shadow-[0_0_20px_rgba(20,241,149,0.3)]'
                                }`}
                        >
                            <Lock className="w-5 h-5" />
                            <span>{isCountdownActive ? 'System Locked by active countdown' : 'Initiate and Lock Epoch'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
