"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Sparkles, Check, Loader2, ShoppingCart, User, Paintbrush, Smile, Wand2 } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createUpgradeTransaction } from "@/lib/solana";
import { supabase, Item, SystemSettings } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import DiceBearAvatar from "./DiceBearAvatar";
import {
    NeonVisorLayer, CyberHelmLayer,
    PlasmaCoreLayer, TitaniumShellLayer,
    VoidBladeLayer
} from "./layers/EquipmentLayers";
import { 
    skinColors, hairColors, clothesColors, topOptions, 
    eyesOptions, mouthOptions, clothingOptions, facialHairOptions, accessoriesOptions 
} from "./CharacterOptions";

type Gender = "male" | "female" | null;

interface CharacterBuilderProps {
    previewOnly?: boolean;
}

export default function CharacterBuilder({ previewOnly = false }: CharacterBuilderProps) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { inventory, addToInventory, spendCredits, credits, powerLevel } = useAuthStore();
    const [gender, setGender] = useState<Gender>("male"); // Auto-init to bypass the old selection screen
    const [selectedTrait, setSelectedTrait] = useState("head");
    const [activeItem, setActiveItem] = useState<number | null>(null);
    const [isEquipping, setIsEquipping] = useState(false);

    // Remote data state
    const [items, setItems] = useState<Item[]>([]);
    const [settings, setSettings] = useState<SystemSettings | null>(null);

    // Dynamic AI Avatar URL
    const [layeredAvatarUrl, setLayeredAvatarUrl] = useState<string | null>(null);
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    // Track officially equipped items vs just previewed items
    const [equippedItems, setEquippedItems] = useState<{
        head: number | null,
        body: number | null,
        weapon: number | null
    }>({ head: null, body: null, weapon: null });

    useEffect(() => {
        // Fetch items and config from DB
        const loadData = async () => {
            const { data: itemsData } = await supabase.from('items').select('*');
            if (itemsData) setItems(itemsData);

            const { data: settingsData } = await supabase.from('system_settings').select('*').eq('id', 1).single();
            if (settingsData) setSettings(settingsData);
        };
        loadData();
    }, []);

    const traits = [
        { id: "head", label: "Headwear", icon: Sparkles },
        { id: "body", label: "Armor", icon: Shield },
        { id: "weapon", label: "Weapon", icon: Zap },
    ];

    const filteredItems = items.filter(item => {
        // Simple mapping based on logic or name for demo since the schema didn't enforce a 'type' column
        // We'll infer type from name or default to 'head' for new items if they contain specific words
        const name = item.name.toLowerCase();
        let type = 'head';
        if (name.includes('armor') || name.includes('core') || name.includes('shell')) type = 'body';
        if (name.includes('blade') || name.includes('weapon') || name.includes('gun')) type = 'weapon';

        return type === selectedTrait;
    });

    const activeItemData = items.find(i => i.id === activeItem);
    const isOwned = activeItemData ? inventory.includes(activeItemData.id) : false;

    // Call AI Endpoint to synthesize a fully 3D realistic avatar
    const handleSynthesize = async () => {
        setIsSynthesizing(true);
        try {
            const res = await fetch('/api/ai/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config: avatarConfig, equippedItems })
            });
            const data = await res.json();
            if (data.success && data.layeredAvatarUrl) {
                setLayeredAvatarUrl(data.layeredAvatarUrl);
            }
        } catch (error) {
            console.error("AI Synthesis failed", error);
            alert("Failed to synthesize the 3D character.");
        } finally {
            setIsSynthesizing(false);
        }
    };

    // Reset synthesis if they change equipped logic (optional, but let's keep it simple for now)
    const synthesizeAvatarWithAI = async (itemId: number) => {
        // We will just clear the synthesized image if they equip something new to show dynamic changes again
        if (layeredAvatarUrl) {
           setLayeredAvatarUrl(null);
        }
    };

    const handleAction = async () => {
        if (!activeItemData) return;

        // INFER TYPE HACK TO MATCH DB
        const name = activeItemData.name.toLowerCase();
        let inferredType = 'head';
        if (name.includes('armor') || name.includes('core') || name.includes('shell')) inferredType = 'body';
        if (name.includes('blade') || name.includes('weapon') || name.includes('gun')) inferredType = 'weapon';

        if (isOwned) {
            // Equip instantly
            setEquippedItems(prev => ({
                ...prev,
                [inferredType]: activeItemData.id
            }));
            await synthesizeAvatarWithAI(activeItemData.id);
            return;
        }

        // Must buy unowned item
        // Check if Crypto or Credit purchase
        if (activeItemData.currency_type === 'crypto') {
            if (!publicKey) {
                alert("Please connect your Web3 wallet first to purchase crypto items!");
                return;
            }
            if (!settings?.admin_wallet_address) {
                alert("Platform admin wallet not configured. Cannot process payment.");
                return;
            }

            try {
                setIsEquipping(true);
                const transaction = await createUpgradeTransaction(
                    connection,
                    publicKey,
                    activeItemData.price,
                    settings.admin_wallet_address
                );
                const signature = await sendTransaction(transaction, connection);
                await connection.confirmTransaction(signature, 'confirmed');

                // Success
                await finalizePurchaseAndEquip(activeItemData, inferredType);
                alert(`Successfully purchased and equipped ${activeItemData.name}! Transaction Signature: ${signature.slice(0, 8)}...`);
            } catch (error) {
                console.error("Failed crypto transaction:", error);
                alert("Crypto transaction failed or was rejected.");
            } finally {
                setIsEquipping(false);
            }

        } else if (activeItemData.currency_type === 'credits') {
            // Internal Credit Purchase
            if (credits < activeItemData.price) {
                alert("Insufficient Credits!");
                return;
            }

            try {
                setIsEquipping(true);
                const success = await spendCredits(activeItemData.price, `Bought ${activeItemData.name}`);
                if (success) {
                    await finalizePurchaseAndEquip(activeItemData, inferredType);
                    alert(`Successfully purchased ${activeItemData.name} using internal credits!`);
                } else {
                    alert("Failed to spend credits. Try again.");
                }
            } catch (error) {
                console.error("Credit purchase failed", error);
            } finally {
                setIsEquipping(false);
            }
        }
    };

    const finalizePurchaseAndEquip = async (itemData: Item, inferredType: string) => {
        setEquippedItems(prev => ({ ...prev, [inferredType]: itemData.id }));
        addToInventory([itemData.id], itemData.power_bonus);

        // AI Avatar generation request in the background
        await synthesizeAvatarWithAI(itemData.id);
    };

    const getRenderedItemId = (type: "head" | "body" | "weapon") => {
        // Reverse type inference
        const matchesType = (item: Item | undefined) => {
            if (!item) return false;
            const nm = item.name.toLowerCase();
            if (type === 'body') return nm.includes('armor') || nm.includes('core') || nm.includes('shell');
            if (type === 'weapon') return nm.includes('blade') || nm.includes('weapon') || nm.includes('gun');
            return !((nm.includes('armor') || nm.includes('core') || nm.includes('shell') || nm.includes('blade') || nm.includes('weapon') || nm.includes('gun')));
        };

        if (activeItemData && matchesType(activeItemData)) return activeItem;
        return equippedItems[type];
    };

    if (previewOnly) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden group cursor-default">
                <div className="absolute inset-0 bg-brand-primary/20 blur-[80px] -z-10 group-hover:bg-brand-secondary/30 transition-colors duration-1000" />
                <div className="w-[80%] max-w-[300px] aspect-[2/3] relative z-10 drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                    <DiceBearAvatar seed="preview-hero-seed" />
                    <div className="absolute inset-0 pointer-events-none">
                        <NeonVisorLayer />
                        <VoidBladeLayer />
                        <PlasmaCoreLayer />
                    </div>
                </div>
            </div>
        );
    }
    // Auto-initialized via wallet seed.

    const renderedHeadId = getRenderedItemId("head");
    const renderedBodyId = getRenderedItemId("body");
    const renderedWeaponId = getRenderedItemId("weapon");

    const { avatarConfig, setAvatarConfig } = useAuthStore();

    type MasterTab = 'face' | 'style' | 'forge';
    const [activeMasterTab, setActiveMasterTab] = useState<MasterTab>('face');
    const [activeSubTab, setActiveSubTab] = useState<string>('skinColor');

    useEffect(() => {
        if (activeMasterTab === 'face') setActiveSubTab('skinColor');
        if (activeMasterTab === 'style') setActiveSubTab('clothing');
        if (activeMasterTab === 'forge') setActiveSubTab('head');
        
        // If they change tabs, it might mean they want to modify the character, 
        // return back to 2D view so they can see changes
        if (layeredAvatarUrl && !isSynthesizing) {
            setLayeredAvatarUrl(null);
        }
    }, [activeMasterTab]);

    const masterTabs = [
        { id: 'face', label: 'Face & Hair', icon: User },
        { id: 'style', label: 'Style & Expression', icon: Smile },
        { id: 'forge', label: 'Forge Items', icon: Wand2 },
    ];

    const renderSubTabs = (tabs: { id: string, label: string }[]) => (
        <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
            {tabs.map(t => (
                <button 
                    key={t.id} 
                    onClick={() => setActiveSubTab(t.id)} 
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${activeSubTab === t.id ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-white/5 text-foreground/60 hover:bg-white/10'}`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );

    const renderColorPicker = (options: { name: string, value: string }[], configKey: string) => (
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-3">
            {options.map(c => (
                <button 
                    key={c.value} 
                    onClick={() => { setAvatarConfig({ [configKey]: [c.value] }); setLayeredAvatarUrl(null); }}
                    title={c.name}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${avatarConfig && (avatarConfig as any)[configKey]?.[0] === c.value ? 'ring-2 ring-brand-primary ring-offset-2 ring-offset-[#0B0F19] scale-110' : 'hover:scale-110 opacity-80'}`}
                    style={{ backgroundColor: `#${c.value}` }}
                />
            ))}
        </div>
    );

    const renderOptionGrid = (options: string[], configKey: string) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {options.map(opt => (
                <button 
                    key={opt}
                    onClick={() => { setAvatarConfig({ [configKey]: opt }); setLayeredAvatarUrl(null); }}
                    className={`p-3 rounded-xl border transition-all text-xs font-medium truncate ${avatarConfig && (avatarConfig as any)[configKey] === opt ? 'bg-brand-primary/20 border-brand-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 border-white/10 text-foreground/70 hover:bg-white/10 hover:text-white'}`}
                >
                    {opt.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </button>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4 sm:p-8 flex flex-col lg:flex-row gap-8 min-h-[70vh]">

                {/* Left Column: Fixed Character Preview Area */}
                <div className="lg:w-2/5 flex flex-col items-center justify-between p-8 rounded-[40px] bg-[#05070B] border border-white/5 relative overflow-hidden group shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] min-h-[600px] lg:sticky lg:top-24">
                    <div className="absolute inset-0 bg-brand-primary/10 blur-[100px] -z-10 transition-colors duration-500" />

                    {/* Highly dynamic rendering area + PWR DP effect! */}
                    <div className={`w-full max-w-[320px] aspect-square relative z-10 p-2 transition-all duration-700 mt-4 flex items-center justify-center ${powerLevel >= 20000 ? 'border-[3px] border-brand-accent shadow-[0_0_50px_rgba(20,241,149,0.8)] rounded-full' : 'drop-shadow-2xl'}`}>
                        {layeredAvatarUrl ? (
                            <img src={layeredAvatarUrl} alt="AI Avatar" className="w-full h-full object-contain" />
                        ) : (
                            <div className="absolute inset-0 z-0">
                                <DiceBearAvatar 
                                    seed={publicKey?.toBase58() || "guest-player-1"} 
                                    config={avatarConfig}
                                    equippedItems={equippedItems} 
                                />
                                {/* Buttery Smooth Framer Motion Equipment Layers */}
                                <div className="absolute inset-0 pointer-events-none overflow-visible">
                                    <AnimatePresence>
                                        {renderedBodyId === 4 && (
                                            <motion.div key="body-4" initial={{ opacity: 0, scale: 1.1, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", bounce: 0.4 }} className="absolute inset-0">
                                                <PlasmaCoreLayer />
                                            </motion.div>
                                        )}
                                        {renderedBodyId === 5 && (
                                            <motion.div key="body-5" initial={{ opacity: 0, scale: 1.1, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", bounce: 0.4 }} className="absolute inset-0">
                                                <TitaniumShellLayer />
                                            </motion.div>
                                        )}
                                        {renderedHeadId === 1 && (
                                            <motion.div key="head-1" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ type: "spring", bounce: 0.5 }} className="absolute inset-0">
                                                <NeonVisorLayer />
                                            </motion.div>
                                        )}
                                        {renderedHeadId === 2 && (
                                            <motion.div key="head-2" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ type: "spring", bounce: 0.5 }} className="absolute inset-0">
                                                <CyberHelmLayer />
                                            </motion.div>
                                        )}
                                        {renderedWeaponId === 6 && (
                                            <motion.div key="weap-6" initial={{ opacity: 0, x: -30, rotate: -20 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -30, rotate: -20 }} transition={{ type: "spring", bounce: 0.6 }} className="absolute inset-0 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]">
                                                <VoidBladeLayer />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-primary/50 blur-[1px] animate-[scan_4s_ease-in-out_infinite] z-50 pointer-events-none" />
                    </div>

                    <div className="w-full flex justify-between items-center text-sm z-50 mt-8 mb-2 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="flex flex-col">
                            <span className="text-foreground/60 tracking-wider text-[10px] uppercase font-bold">PWR LVL</span>
                            <span className={`font-bold text-xl font-heading ${powerLevel >= 20000 ? 'text-brand-accent drop-shadow-[0_0_5px_rgba(20,241,149,0.8)]' : 'text-brand-primary'}`}>{powerLevel.toLocaleString()}</span>
                            {powerLevel >= 20000 && <span className="text-[10px] text-brand-accent">Awakened DP</span>}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-foreground/60 tracking-wider text-[10px] uppercase font-bold">BALANCE</span>
                            <div className="flex items-center space-x-1">
                                <span className="text-white font-bold text-xl font-heading">{credits.toLocaleString()}</span>
                                <span className="text-brand-primary font-medium text-xs mt-1">CR</span>
                            </div>
                        </div>
                    </div>

                    {/* Synthesize Button */}
                    <button 
                        onClick={handleSynthesize}
                        disabled={isSynthesizing}
                        className="w-full mt-4 glass-button bg-brand-accent/20 hover:bg-brand-accent/30 border-brand-accent/50 min-h-[60px] rounded-2xl flex items-center justify-center space-x-2 transition-all group overflow-hidden relative"
                    >
                        {isSynthesizing && (
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        )}
                        {isSynthesizing ? (
                            <><Loader2 className="w-5 h-5 animate-spin text-brand-accent" /><span className="font-bold text-brand-accent">Synthesizing 3D Avatar...</span></>
                        ) : (
                            <><Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform text-white" /><span className="font-bold tracking-wide text-white">Synthesize 3D Character ✨</span></>
                        )}
                    </button>
                </div>

                {/* Right Column: Customization Studio */}
                <div className="lg:w-3/5 flex flex-col space-y-6">
                    {/* Master Tabs */}
                    <div className="flex space-x-2 bg-black/20 p-2 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
                        {masterTabs.map((tab) => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveMasterTab(tab.id as MasterTab)} 
                                className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 ${activeMasterTab === tab.id ? "bg-white/10 text-white shadow-lg" : "text-foreground/60 hover:text-white hover:bg-white/5"}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 bg-black/20 p-6 rounded-3xl border border-white/5 h-full overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeMasterTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                
                                {activeMasterTab === 'face' && (
                                    <div className="space-y-6">
                                        {renderSubTabs([
                                            { id: 'skinColor', label: 'Skin Color' },
                                            { id: 'top', label: 'Hair Style' },
                                            { id: 'hairColor', label: 'Hair Color' },
                                            { id: 'facialHair', label: 'Facial Hair' }
                                        ])}

                                        {activeSubTab === 'skinColor' && renderColorPicker(skinColors, 'skinColor')}
                                        {activeSubTab === 'hairColor' && renderColorPicker(hairColors, 'hairColor')}
                                        {activeSubTab === 'top' && renderOptionGrid(topOptions, 'top')}
                                        {activeSubTab === 'facialHair' && renderOptionGrid(facialHairOptions, 'facialHair')}
                                    </div>
                                )}

                                {activeMasterTab === 'style' && (
                                    <div className="space-y-6">
                                        {renderSubTabs([
                                            { id: 'clothing', label: 'Clothing' },
                                            { id: 'clothesColor', label: 'Clothing Color' },
                                            { id: 'eyes', label: 'Eyes' },
                                            { id: 'mouth', label: 'Mouth' },
                                            { id: 'accessories', label: 'Accessories' }
                                        ])}

                                        {activeSubTab === 'clothing' && renderOptionGrid(clothingOptions, 'clothing')}
                                        {activeSubTab === 'clothesColor' && renderColorPicker(clothesColors, 'clothesColor')}
                                        {activeSubTab === 'eyes' && renderOptionGrid(eyesOptions, 'eyes')}
                                        {activeSubTab === 'mouth' && renderOptionGrid(mouthOptions, 'mouth')}
                                        {activeSubTab === 'accessories' && renderOptionGrid(accessoriesOptions, 'accessories')}
                                    </div>
                                )}

                                {activeMasterTab === 'forge' && (
                                    <div className="space-y-6">
                                        {renderSubTabs([
                                            { id: 'head', label: 'Headwear' },
                                            { id: 'body', label: 'Armor' },
                                            { id: 'weapon', label: 'Weapon' }
                                        ])}
                                        
                                        {/* The Existing Forge Item Store! */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {filteredItems.filter(item => {
                                                const name = item.name.toLowerCase();
                                                let type = 'head';
                                                if (name.includes('armor') || name.includes('core') || name.includes('shell')) type = 'body';
                                                if (name.includes('blade') || name.includes('weapon') || name.includes('gun')) type = 'weapon';
                                                return type === activeSubTab;
                                            }).length === 0 ? (
                                                <div className="col-span-2 text-white/50 text-center py-12">No items found for this slot.</div>
                                            ) : (
                                                filteredItems.filter(item => {
                                                    const name = item.name.toLowerCase();
                                                    let type = 'head';
                                                    if (name.includes('armor') || name.includes('core') || name.includes('shell')) type = 'body';
                                                    if (name.includes('blade') || name.includes('weapon') || name.includes('gun')) type = 'weapon';
                                                    return type === activeSubTab;
                                                }).map((item, i) => {
                                                    const itemIsOwned = inventory.includes(item.id);
                                                    const isEquipped = activeItemData?.id === item.id || Object.values(equippedItems).includes(item.id);
                                                    
                                                    return (
                                                        <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setActiveItem(item.id)} className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 flex flex-col justify-between h-[120px] ${activeItem === item.id ? "bg-brand-primary/20 border-brand-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"}`}>
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="text-white font-bold font-heading leading-tight">{item.name}</h4>
                                                                {itemIsOwned && <span className="text-[9px] uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/30">Owned</span>}
                                                            </div>
                                                            <div className="flex justify-between items-center mt-auto">
                                                                <span className="text-brand-accent font-bold text-xs">+{item.power_bonus} PWR</span>
                                                                <span className="text-white font-medium text-sm bg-black/30 px-2 py-1 rounded-md">{itemIsOwned ? "Free" : `${item.price} ${item.currency_type.toUpperCase()}`}</span>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {/* Forge Checkout Bar */}
                                        <div className="pt-6 mt-4 border-t border-white/10 flex justify-end">
                                            <button onClick={handleAction} disabled={!activeItemData || isEquipping || (activeItemData && filteredItems.filter(item => {
                                                const name = item.name.toLowerCase();
                                                let type = 'head';
                                                if (name.includes('armor') || name.includes('core') || name.includes('shell')) type = 'body';
                                                if (name.includes('blade') || name.includes('weapon') || name.includes('gun')) type = 'weapon';
                                                return type === activeSubTab;
                                            }).findIndex(i => i.id === activeItemData.id) === -1)} className={`glass-button px-8 py-3 flex items-center justify-center space-x-2 w-full transition-all rounded-xl ${!activeItemData || (activeItemData && filteredItems.filter(item => {
                                                const name = item.name.toLowerCase();
                                                let type = 'head';
                                                if (name.includes('armor') || name.includes('core') || name.includes('shell')) type = 'body';
                                                if (name.includes('blade') || name.includes('weapon') || name.includes('gun')) type = 'weapon';
                                                return type === activeSubTab;
                                            }).findIndex(i => i.id === activeItemData.id) === -1) ? 'opacity-50 cursor-not-allowed bg-white/5 text-foreground/50 border-white/5' : 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.5)]'}`}>
                                                {isEquipping ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /><span className="font-bold">Processing Link...</span></>
                                                ) : (
                                                    <>
                                                        <span className="font-bold tracking-wide">
                                                            {!activeItemData || (activeItemData && filteredItems.filter(item => {
                                                                const name = item.name.toLowerCase();
                                                                let type = 'head';
                                                                if (name.includes('armor') || name.includes('core') || name.includes('shell')) type = 'body';
                                                                if (name.includes('blade') || name.includes('weapon') || name.includes('gun')) type = 'weapon';
                                                                return type === activeSubTab;
                                                            }).findIndex(i => i.id === activeItemData.id) === -1) ? "Select an item above" : Object.values(equippedItems).includes(activeItemData?.id as number) ? "Already Equipped" : isOwned ? `Equip ${activeItemData.name}` : `Buy for ${activeItemData?.price} ${activeItemData?.currency_type.toUpperCase()}`}
                                                        </span>
                                                        {!isOwned && activeItemData && (activeItemData && filteredItems.filter(item => {
                                                            const name = item.name.toLowerCase();
                                                            let type = 'head';
                                                            if (name.includes('armor') || name.includes('core') || name.includes('shell')) type = 'body';
                                                            if (name.includes('blade') || name.includes('weapon') || name.includes('gun')) type = 'weapon';
                                                            return type === activeSubTab;
                                                        }).findIndex(i => i.id === activeItemData.id) !== -1) && <ShoppingCart className="w-5 h-5 ml-2" />}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
