"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase, DailyMission, SystemSettings } from "@/lib/supabase";
import { ShieldAlert, Plus, Save, Trash2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPage() {
    const { walletAddress } = useAuthStore();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [missions, setMissions] = useState<DailyMission[]>([]);

    // Form State
    const [activeDate, setActiveDate] = useState("");
    const [title, setTitle] = useState("");
    const [fragmentName, setFragmentName] = useState("");
    const [briefing, setBriefing] = useState(""); // newline separated
    const [success, setSuccess] = useState("");
    const [failure, setFailure] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            if (!walletAddress) {
                setIsAuthorized(false);
                return;
            }
            const { data } = await supabase.from('system_settings').select('admin_wallet_address').eq('id', 1).single();
            if (data && data.admin_wallet_address === walletAddress) {
                setIsAuthorized(true);
                fetchMissions();
            } else {
                setIsAuthorized(false);
            }
        };
        checkAuth();
    }, [walletAddress]);

    const fetchMissions = async () => {
        const { data, error } = await supabase.from('daily_missions').select('*').order('active_date', { ascending: false });
        if (data) setMissions(data);
    };

    const handleCreate = async () => {
        if (!activeDate || !title || !fragmentName) {
            toast.error("Please fill all required fields");
            return;
        }

        const newMission = {
            active_date: activeDate,
            title,
            fragment_name: fragmentName,
            briefing_dialogue: briefing.split('\n').filter(s => s.trim() !== ''),
            success_dialogue: success.split('\n').filter(s => s.trim() !== ''),
            failure_dialogue: failure.split('\n').filter(s => s.trim() !== '')
        };

        const { error } = await supabase.from('daily_missions').insert([newMission]);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Mission Scheduled!");
            fetchMissions();
            // Reset form
            setActiveDate(''); setTitle(''); setFragmentName(''); setBriefing(''); setSuccess(''); setFailure('');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const { error } = await supabase.from('daily_missions').delete().eq('id', id);
        if (!error) {
            toast.success("Mission Deleted");
            fetchMissions();
        }
    };

    if (isAuthorized === null) return <div className="min-h-screen pt-32 text-center text-white">Verifying credentials...</div>;

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center p-4">
                <ShieldAlert className="w-16 h-16 text-brand-accent mb-4" />
                <h1 className="text-2xl font-bold text-white font-heading mb-2">Access Denied</h1>
                <p className="text-foreground/60 max-w-md text-center">Your connected wallet does not hold administrator privileges for the Modus Nexus Protocol.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
            <div>
                <h1 className="text-4xl font-bold font-heading text-white mb-2">Director's Terminal</h1>
                <p className="text-foreground/60 text-lg">Schedule the daily Chronos Breach campaigns via Supabase injection.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Editor */}
                <div className="glass-panel p-6 sm:p-8 space-y-6 bg-brand-background shadow-2xl">
                    <h2 className="text-xl font-bold text-white flex items-center mb-6 border-b border-brand-primary/20 pb-4">
                        <Plus className="w-5 h-5 text-brand-primary mr-2" />
                        Draft New Mission
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-brand-primary/80 font-bold mb-2">Active Date</label>
                                <input type="date" value={activeDate} onChange={e => setActiveDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-brand-primary/80 font-bold mb-2">Fragment Name</label>
                                <input type="text" placeholder="e.g. Quantum Core" value={fragmentName} onChange={e => setFragmentName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary transition-colors" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-brand-primary/80 font-bold mb-2">Mission Title</label>
                            <input type="text" placeholder="Operation Sandstorm" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary transition-colors" />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-brand-primary/80 font-bold mb-2">Briefing Dialogue (New line = new screen)</label>
                            <textarea rows={4} value={briefing} onChange={e => setBriefing(e.target.value)} placeholder="Sentinel, we have a breach... \n Secure the core." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary transition-colors resize-none" />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-green-400/80 font-bold mb-2">Success Dialogue</label>
                            <textarea rows={2} value={success} onChange={e => setSuccess(e.target.value)} placeholder="Excellent work. Fragment secured." className="w-full bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-2 text-green-100 outline-none focus:border-green-500 transition-colors resize-none" />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-red-400/80 font-bold mb-2">Failure Dialogue</label>
                            <textarea rows={2} value={failure} onChange={e => setFailure(e.target.value)} placeholder="You were too slow. Try again." className="w-full bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-2 text-red-100 outline-none focus:border-red-500 transition-colors resize-none" />
                        </div>

                        <button onClick={handleCreate} className="w-full mt-4 glass-button bg-brand-primary text-white border-brand-primary/50 hover:bg-brand-primary/90 font-bold py-3 uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all">
                            <Save className="w-5 h-5" />
                            <span>Schedule Mission</span>
                        </button>
                    </div>
                </div>

                {/* Display Scheduled Missions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center mb-6 pl-2">
                        <Calendar className="w-5 h-5 text-brand-secondary mr-2" />
                        Scheduled Protocol Breaches
                    </h2>

                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {missions.length === 0 ? <p className="text-foreground/50 italic px-2">No missions scheduled. The timeline is dark.</p> : null}

                        {missions.map(m => (
                            <div key={m.id} className="glass-panel p-5 relative group border-l-4 border-l-brand-primary/50 bg-[#1A110D]">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-full transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <span className="text-sm font-mono text-brand-secondary">{new Date(m.active_date).toDateString()}</span>
                                    <h3 className="text-xl font-bold font-heading text-white">{m.title}</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs border border-brand-primary/30 rounded-full font-medium">
                                            {m.fragment_name}
                                        </span>
                                        <span className="text-xs text-foreground/40">{m.briefing_dialogue.length} Screens</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
