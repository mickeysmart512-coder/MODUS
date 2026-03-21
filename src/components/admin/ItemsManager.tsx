"use client";

import { useState, useEffect } from "react";
import { supabase, Item } from "@/lib/supabase";
import { Plus, Image as ImageIcon, Check } from "lucide-react";

export default function ItemsManager() {
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({
        name: "",
        description: "",
        price: 0,
        currency_type: "crypto" as "crypto" | "credits",
        prompt: "",
        image_url: "",
        power_bonus: 0
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
        if (data) setItems(data);
        setIsLoading(false);
    };

    const handleGenerateImage = async () => {
        if (!newItem.prompt) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/generate-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: newItem.prompt })
            });
            const data = await res.json();
            if (data.success) {
                setNewItem({ ...newItem, image_url: data.imageUrl });
            }
        } catch (error) {
            console.error("Failed to generate image", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveItem = async () => {
        try {
            const { error } = await supabase.from('items').insert([{
                name: newItem.name,
                description: newItem.description,
                price: newItem.price,
                currency_type: newItem.currency_type,
                image_url: newItem.image_url,
                power_bonus: newItem.power_bonus
            }]);

            if (!error) {
                setShowForm(false);
                fetchItems();
                setNewItem({ name: "", description: "", price: 0, currency_type: "crypto", prompt: "", image_url: "", power_bonus: 0 });
            }
        } catch (error) {
            console.error("Failed to save item", error);
        }
    };

    const handleDelete = async (id: number) => {
        await supabase.from('items').delete().eq('id', id);
        fetchItems();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-16">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-white">Item Master & AI Generation</h2>
                    <p className="text-foreground/60 text-sm mt-1">Create and manage items using AI</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create New Item</span>
                </button>
            </div>

            {showForm && (
                <div className="glass-panel p-6 border border-brand-primary/30 space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">New Item Generator</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Item Name</label>
                                <input type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary" placeholder="e.g. Cyber Visor" />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">AI Prompt</label>
                                <div className="flex space-x-2">
                                    <input type="text" value={newItem.prompt} onChange={e => setNewItem({ ...newItem, prompt: e.target.value })} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary" placeholder="e.g. highly detailed glowing red cyber visor transparent png" />
                                    <button onClick={handleGenerateImage} disabled={isGenerating || !newItem.prompt} className="bg-brand-accent hover:bg-brand-accent/90 text-black px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50">
                                        {isGenerating ? 'Generating...' : 'Generate'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-white/70 mb-1">Price</label>
                                    <input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-white/70 mb-1">Currency Type</label>
                                    <select value={newItem.currency_type} onChange={e => setNewItem({ ...newItem, currency_type: e.target.value as "crypto" | "credits" })} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary">
                                        <option value="crypto">Crypto (SOL)</option>
                                        <option value="credits">Credits</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Power Bonus (PWR)</label>
                                <input type="number" value={newItem.power_bonus} onChange={e => setNewItem({ ...newItem, power_bonus: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-primary" />
                            </div>
                            <button onClick={handleSaveItem} disabled={!newItem.name || !newItem.image_url} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50">
                                <Check className="w-5 h-5" />
                                <span>Save Item</span>
                            </button>
                        </div>
                        <div className="flex items-center justify-center bg-black/40 rounded-xl border border-white/10 min-h-[250px] relative overflow-hidden">
                            {newItem.image_url ? (
                                <img src={newItem.image_url} alt="Generated item" className="w-48 h-48 object-contain" />
                            ) : (
                                <div className="text-white/30 flex flex-col items-center">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span>AI Image Preview</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="text-white/50 col-span-3 text-center py-8">Loading items...</div>
                ) : items.length === 0 ? (
                    <div className="text-white/50 col-span-3 text-center py-8 glass-panel">No items found. Create one above.</div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="glass-panel p-4 flex flex-col">
                            <div className="bg-black/40 rounded-lg mb-4 flex items-center justify-center p-4 h-40">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="max-h-full object-contain" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-white/20" />
                                )}
                            </div>
                            <h3 className="font-bold text-white text-lg">{item.name}</h3>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className={item.currency_type === 'crypto' ? 'text-brand-primary' : 'text-brand-accent'}>
                                    {item.price} {item.currency_type.toUpperCase()}
                                </span>
                                <span className="text-white/50">+{item.power_bonus} PWR</span>
                            </div>
                            <button onClick={() => handleDelete(item.id)} className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors w-max">
                                Delete Item
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
