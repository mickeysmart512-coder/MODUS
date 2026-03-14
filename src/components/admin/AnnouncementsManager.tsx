"use client";

import { useState, useEffect } from "react";
import { supabase, Announcement } from "@/lib/supabase";
import { Plus, Megaphone, Trash2, Edit3 } from "lucide-react";

export default function AnnouncementsManager() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAnnouncements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (data) setAnnouncements(data);
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!title || !content) return;

        try {
            if (editingId) {
                await supabase.from('announcements').update({ title, content, is_active: isActive }).eq('id', editingId);
            } else {
                await supabase.from('announcements').insert([{ title, content, is_active: isActive }]);
            }

            setShowForm(false);
            setEditingId(null);
            setTitle("");
            setContent("");
            setIsActive(true);
            fetchAnnouncements();
        } catch (error) {
            console.error("Failed to save announcement", error);
        }
    };

    const handleEdit = (ann: Announcement) => {
        setTitle(ann.title);
        setContent(ann.content);
        setIsActive(ann.is_active);
        setEditingId(ann.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        await supabase.from('announcements').delete().eq('id', id);
        fetchAnnouncements();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-16">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-white">Announcement System</h2>
                    <p className="text-foreground/60 text-sm mt-1">Broadcast messages to the user dashboard</p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setTitle(""); setContent(""); }}
                    className="flex items-center space-x-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Draft</span>
                </button>
            </div>

            {showForm && (
                <div className="glass-panel p-6 border border-brand-primary/30 space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit Announcement' : 'Draft External Broadcast'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-white/70 mb-1">Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary" placeholder="e.g. Server Maintenance Notice" />
                        </div>
                        <div>
                            <label className="block text-sm text-white/70 mb-1">Content block</label>
                            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary resize-none" placeholder="Write your full message here..."></textarea>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 accent-brand-primary" />
                            <label htmlFor="isActive" className="text-sm text-white">Mark as Active (will display to users immediately)</label>
                        </div>
                        <button onClick={handleSave} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-6 rounded-lg">
                            {editingId ? 'Update Broadcast' : 'Send Broadcast'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-white/50 text-center py-8">Loading announcements...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-white/50 text-center py-8 glass-panel">No announcements scheduled or sent.</div>
                ) : (
                    announcements.map(ann => (
                        <div key={ann.id} className={`glass-panel p-5 border-l-4 ${ann.is_active ? 'border-l-brand-primary' : 'border-l-white/20'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                    <Megaphone className={`w-5 h-5 ${ann.is_active ? 'text-brand-primary' : 'text-white/40'}`} />
                                    <h3 className="font-bold text-white text-lg">{ann.title}</h3>
                                    {!ann.is_active && <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-md">Draft / Inactive</span>}
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(ann)} className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(ann.id)} className="text-white/40 hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-white/70 text-sm whitespace-pre-wrap pl-8">{ann.content}</p>
                            <div className="text-xs text-white/40 mt-3 pl-8">
                                Sent: {new Date(ann.created_at).toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
