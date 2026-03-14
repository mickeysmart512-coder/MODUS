"use client";

import { useState, useEffect } from "react";
import { supabase, SystemSettings } from "@/lib/supabase";
import { Settings2, ShieldAlert, Wallet, Save } from "lucide-react";

export default function SystemSettingsManager() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [adminWallet, setAdminWallet] = useState("");
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).single();
        if (data) {
            setSettings(data);
            setAdminWallet(data.admin_wallet_address || "");
            setMaintenanceMode(data.maintenance_mode);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await supabase.from('system_settings').update({
                admin_wallet_address: adminWallet,
                maintenance_mode: maintenanceMode
            }).eq('id', 1);
            fetchSettings();
        } catch (error) {
            console.error("Failed to update settings", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-white/50 py-8 animate-pulse">Loading System Config...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            <div>
                <h2 className="text-2xl font-bold font-heading text-white">Global Platform Settings</h2>
                <p className="text-foreground/60 text-sm mt-1">Manage core platform access and treasury controls</p>
            </div>

            <div className="glass-panel p-8 max-w-2xl">
                <div className="space-y-8">

                    {/* Treasury Module */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4 border-b border-white/10 pb-4">
                            <Wallet className="w-5 h-5 text-brand-primary" />
                            <h3 className="text-lg font-bold text-white">Treasury Configuration</h3>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm text-foreground/70">Primary Admin Receiving Wallet</label>
                            <p className="text-xs text-foreground/50 mb-3">All user crypto purchases for generated items will be routed to this Solana address.</p>
                            <input
                                type="text"
                                value={adminWallet}
                                onChange={(e) => setAdminWallet(e.target.value)}
                                placeholder="Enter Solana Wallet Address..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm outline-none focus:border-brand-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Security Module */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4 border-b border-white/10 pb-4">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                            <h3 className="text-lg font-bold text-white">Platform Security</h3>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-400/5 border border-red-400/20 rounded-xl">
                            <div>
                                <h4 className="font-bold text-white mb-1 flex items-center space-x-2">
                                    <span>Suspend Platform</span>
                                    {maintenanceMode && <span className="text-[10px] uppercase font-bold tracking-wider bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Active</span>}
                                </h4>
                                <p className="text-sm text-foreground/60">Activate Global Maintenance Mode. This immediately restricts frontend access for all non-admin users and invalidates active gameplay sessions.</p>
                            </div>
                            <button
                                onClick={() => setMaintenanceMode(!maintenanceMode)}
                                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-9' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl transition-all font-bold tracking-wide flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
