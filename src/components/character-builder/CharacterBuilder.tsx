"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Battery, Crosshair, ArrowRight, ShoppingCart, Loader2, Zap, Palette, Shirt, UserCircle } from "lucide-react";
import { createUpgradeTransaction } from "@/lib/solana";
import { supabase, Item, SystemSettings } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import DiceBearAvatar from "./DiceBearAvatar";
import {
    NeonVisorLayer, CyberHelmLayer,
    PlasmaCoreLayer, TitaniumShellLayer,
    VoidBladeLayer
} from "./layers/EquipmentLayers";
import { toast } from "react-hot-toast";

// Avataaars Collections
const AVATAR_OPTIONS = {
    skinColor: ["pale", "light", "yellow", "tanned", "brown", "darkBrown", "black"],
    hairColor: ["blonde", "brownDark", "black", "pastelPink", "blue", "platinum"],
    hair: ["noHair", "shortHairShortFlat", "shortHairTheCaesar", "shortHairDreads01", "longHairCurly", "longHairStraight", "longHairDreads", "longHairFro"],
    clothing: ["hoodie", "blazerShirt", "collarSweater", "graphicShirt", "shirtCrewNeck", "overall"],
    clothingColor: ["black", "blue01", "pastelRed", "pastelGreen", "white", "gray01"],
    eyes: ["default", "happy", "cry", "eyeRoll", "hearts", "squint", "surprised"],
    mouth: ["default", "smile", "serious", "sad", "twinkle", "eating"],
};

export default function CharacterBuilder({ previewOnly = false }: { previewOnly?: boolean }) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { inventory, addToInventory, spendCredits, credits, powerLevel, avatarTraits, setAvatarTrait } = useAuthStore();
    
    // UI State
    const [mainTab, setMainTab] = useState<"AVATAR" | "GEAR">("AVATAR");
    const [avatarSubTab, setAvatarSubTab] = useState<keyof typeof AVATAR_OPTIONS>("skinColor");
    const [gearSubTab, setGearSubTab] = useState("head");
    
    const [activeItem, setActiveItem] = useState<number | null>(null);
    const [isEquipping, setIsEquipping] = useState(false);
    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
    const [availableItems, setAvailableItems] = useState<Item[]>([]);
    
    // The items the user currently has visibly "equipped" on their avatar stage
    const [equippedItems, setEquippedItems] = useState<{
        head: number | null,
        body: number | null,
        weapon: number | null
    }>({
        head: null,
        body: null,
        weapon: null
    });

    useEffect(() => {
        const loadInitialData = async () => {
            const [settingsRes, itemsRes] = await Promise.all([
                supabase.from('system_settings').select('*').single(),
                supabase.from('items').select('*')
            ]);
            if (settingsRes.data) setSystemSettings(settingsRes.data);
            if (itemsRes.data) setAvailableItems(itemsRes.data);
        };
        loadInitialData();
    }, []);

    // Auto-equip the user's highest tier owned items on load
    useEffect(() => {
        if (inventory.length > 0 && availableItems.length > 0) {
            const ownedItems = availableItems.filter(i => inventory.includes(i.id));
            const bestHead = ownedItems.filter(i => ['head', 'visor', 'helm'].some(kw => i.name.toLowerCase().includes(kw))).sort((a, b) => b.power_bonus - a.power_bonus)[0];
            const bestBody = ownedItems.filter(i => ['body', 'core', 'armor', 'shell'].some(kw => i.name.toLowerCase().includes(kw))).sort((a, b) => b.power_bonus - a.power_bonus)[0];
            const bestWeapon = ownedItems.filter(i => ['weapon', 'blade', 'gun', 'axe'].some(kw => i.name.toLowerCase().includes(kw))).sort((a, b) => b.power_bonus - a.power_bonus)[0];
            
            setEquippedItems({
                head: bestHead?.id || null,
                body: bestBody?.id || null,
                weapon: bestWeapon?.id || null
            });
        }
    }, [inventory, availableItems]);

    // Active item being viewed in the Gear tab
    const activeItemData = availableItems.find(i => i.id === activeItem);
    const isOwned = activeItem ? inventory.includes(activeItem) : false;

    const handlePurchase = async () => {
        if (!activeItemData || !publicKey || !systemSettings) return;
        setIsEquipping(true);
        try {
            if (activeItemData.currency_type === 'crypto') {
                const tx = await createUpgradeTransaction(connection, publicKey, activeItemData.price, systemSettings.admin_wallet_address);
                const txSignature = await sendTransaction(tx, connection);
                if (txSignature) {
                    await finalizePurchaseAndEquip(activeItemData, gearSubTab);
                    toast.success(`Successfully minted ${activeItemData.name}!`);
                }
            } else if (activeItemData.currency_type === 'credits') {
                const success = await spendCredits(activeItemData.price, `Purchased ${activeItemData.name}`);
                if (success) {
                    await finalizePurchaseAndEquip(activeItemData, gearSubTab);
                    toast.success(`Purchased ${activeItemData.name}!`);
                } else {
                    toast.error("Insufficient Credits.");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Transaction failed.");
        } finally {
            setIsEquipping(false);
        }
    };

    const finalizePurchaseAndEquip = async (itemData: Item, inferredType: string) => {
        setEquippedItems(prev => ({ ...prev, [inferredType]: itemData.id }));
        addToInventory([itemData.id], itemData.power_bonus);
    };

    const getRenderedItemId = (type: "head" | "body" | "weapon") => {
        const matchesType = (item: Item | undefined) => {
            if (!item) return false;
            const nm = item.name.toLowerCase();
            if (type === 'body') return nm.includes('armor') || nm.includes('core') || nm.includes('shell');
            if (type === 'weapon') return nm.includes('blade') || nm.includes('weapon') || nm.includes('gun') || nm.includes('axe');
            return !((nm.includes('armor') || nm.includes('core') || nm.includes('shell') || nm.includes('blade') || nm.includes('weapon') || nm.includes('gun') || nm.includes('axe')));
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

    const renderedHeadId = getRenderedItemId("head");
    const renderedBodyId = getRenderedItemId("body");
    const renderedWeaponId = getRenderedItemId("weapon");

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 relative min-h-[calc(100vh-100px)] pt-12">
            
            {/* LEFT PANE: The Stage */}
            <div className="lg:w-1/2 flex flex-col items-center justify-center p-4 lg:sticky lg:top-24 h-[50vh] lg:h-[calc(100vh-120px)] relative overflow-hidden rounded-3xl group">
                {/* Background ambient lighting */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-primary/20 blur-[100px] rounded-full animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
                </div>

                <div className={`w-full max-w-[340px] aspect-[3/4] relative z-20 p-4 transition-all duration-700 ${powerLevel >= 20000 ? 'drop-shadow-[0_0_50px_rgba(20,241,149,0.5)]' : 'drop-shadow-2xl'}`}>
                    <div className="absolute inset-0 z-0">
                        <DiceBearAvatar 
                            seed={publicKey?.toBase58() || "guest-player-1"} 
                            equippedItems={equippedItems} 
                            powerLevel={powerLevel}
                            avatarTraits={avatarTraits}
                        />
                        
                        {/* Buttery Smooth Framer Motion Equipment Layers */}
                        <div className="absolute inset-0 pointer-events-none overflow-visible">
                            <AnimatePresence>
                                {renderedBodyId === 4 && <motion.div key="body-4" initial={{ opacity: 0, scale: 1.1, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", bounce: 0.4 }} className="absolute inset-0"><PlasmaCoreLayer /></motion.div>}
                                {renderedBodyId === 5 && <motion.div key="body-5" initial={{ opacity: 0, scale: 1.1, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", bounce: 0.4 }} className="absolute inset-0"><TitaniumShellLayer /></motion.div>}
                                {renderedHeadId === 1 && <motion.div key="head-1" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ type: "spring", bounce: 0.5 }} className="absolute inset-0"><NeonVisorLayer /></motion.div>}
                                {renderedHeadId === 2 && <motion.div key="head-2" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ type: "spring", bounce: 0.5 }} className="absolute inset-0"><CyberHelmLayer /></motion.div>}
                                {renderedWeaponId === 6 && <motion.div key="weap-6" initial={{ opacity: 0, x: -30, rotate: -20 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -30, rotate: -20 }} transition={{ type: "spring", bounce: 0.6 }} className="absolute inset-0 drop-shadow-[0_0_20px_rgba(139,92,246,0.8)]"><VoidBladeLayer /></motion.div>}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* HUD Elements */}
                <div className="absolute top-4 left-4 flex flex-col text-sm z-50">
                    <span className="text-foreground/60 tracking-wider text-[10px] font-bold">PWR LVL</span>
                    <span className={`font-black text-2xl font-heading tracking-tighter ${powerLevel >= 20000 ? 'text-brand-accent drop-shadow-[0_0_10px_rgba(20,241,149,0.8)]' : 'text-brand-primary'}`}>{powerLevel.toLocaleString()}</span>
                    {powerLevel >= 20000 && <span className="text-[10px] uppercase font-bold text-brand-accent mt-1 animate-pulse">Awakened State</span>}
                </div>
            </div>

            {/* RIGHT PANE: The Controls (Glassmorphic Drawer) */}
            <div className="lg:w-1/2 flex flex-col h-[60vh] lg:h-[calc(100vh-120px)] rounded-[32px] glass-panel border border-white/10 shadow-2xl relative overflow-hidden pb-10">
                {/* Main Tabs (Avatar vs Web3 Gear) */}
                <div className="flex w-full p-2 bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
                    <button onClick={() => setMainTab("AVATAR")} className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${mainTab === "AVATAR" ? "bg-white/10 text-white shadow-lg" : "text-foreground/50 hover:text-white"}`}>
                        <div className="flex items-center justify-center gap-2"><UserCircle className="w-5 h-5"/> Appearance</div>
                    </button>
                    <button onClick={() => setMainTab("GEAR")} className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${mainTab === "GEAR" ? "bg-white/10 text-brand-primary shadow-lg" : "text-foreground/50 hover:text-white"}`}>
                        <div className="flex items-center justify-center gap-2"><Shield className="w-5 h-5"/> Web3 Gear</div>
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto w-full p-4 lg:p-8 custom-scrollbar">
                    {mainTab === "AVATAR" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            
                            {/* Horizontal Pill Bar for Avatar Traits */}
                            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar mask-edge-fade">
                                {Object.keys(AVATAR_OPTIONS).map((key) => (
                                    <button 
                                        key={key} 
                                        onClick={() => setAvatarSubTab(key as any)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${avatarSubTab === key ? "bg-brand-primary text-white" : "bg-white/5 text-foreground/60 hover:bg-white/10 hover:text-white"}`}
                                    >
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </button>
                                ))}
                            </div>

                            {/* Options Grid for selected trait */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {AVATAR_OPTIONS[avatarSubTab].map((opt) => {
                                    const isSelected = avatarTraits[avatarSubTab] === opt;
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => setAvatarTrait(avatarSubTab, opt)}
                                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all p-2 ${isSelected ? "bg-white/20 border-2 border-brand-primary/80 shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-105" : "bg-black/30 border border-white/5 hover:bg-white/10"}`}
                                        >
                                            <span className="text-[10px] font-medium text-white/80 break-words text-center">
                                                {opt.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1" />}
                                        </button>
                                    );
                                })}
                            </div>

                        </motion.div>
                    )}

                    {mainTab === "GEAR" && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 h-full flex flex-col">
                            {/* Gear Sub Tabs */}
                            <div className="flex space-x-2 border-b border-foreground/10 pb-2 overflow-x-auto">
                                {[
                                    { id: 'head', label: 'Headwear', icon: Crosshair },
                                    { id: 'body', label: 'Core / Armor', icon: Shield },
                                    { id: 'weapon', label: 'Arsenal', icon: Zap }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setGearSubTab(tab.id); setActiveItem(null); }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all whitespace-nowrap ${gearSubTab === tab.id ? "bg-white/10 text-white" : "text-foreground/60 hover:text-white hover:bg-white/5"}`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Items Grid & Purchase Flow */}
                            <div className="grid grid-cols-2 gap-4">
                                {availableItems
                                    .filter(item => {
                                        const nm = item.name.toLowerCase();
                                        if (gearSubTab === 'body') return nm.includes('armor') || nm.includes('core') || nm.includes('shell');
                                        if (gearSubTab === 'weapon') return nm.includes('blade') || nm.includes('weapon') || nm.includes('gun') || nm.includes('axe');
                                        return !((nm.includes('armor') || nm.includes('core') || nm.includes('shell') || nm.includes('blade') || nm.includes('weapon') || nm.includes('gun') || nm.includes('axe')));
                                    })
                                    .map(item => {
                                        const hasItem = inventory.includes(item.id);
                                        const isViewing = activeItem === item.id;
                                        const isEquipped = equippedItems[gearSubTab as keyof typeof equippedItems] === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setActiveItem(item.id);
                                                    if (hasItem) setEquippedItems(prev => ({ ...prev, [gearSubTab]: item.id }));
                                                }}
                                                className={`relative p-4 rounded-xl border flex flex-col items-center justify-center space-y-3 transition-all ${isViewing ? "border-brand-primary bg-brand-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-[1.02]" : "border-white/5 bg-black/40 hover:bg-white/5"} ${isEquipped ? "border-brand-accent/50 shadow-[0_0_10px_rgba(20,241,149,0.2)]" : ""}`}
                                            >
                                                {hasItem && (
                                                    <div className="absolute top-2 right-2 flex gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-brand-accent" title="Owned" />
                                                        {isEquipped && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" title="Equipped" />}
                                                    </div>
                                                )}
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-2xl">
                                                    {item.name.includes("Visor") ? "👓" : item.name.includes("Core") ? "🔋" : item.name.includes("Blade") ? "🗡️" : item.name.includes("Axe") ? "🪓" : item.name.includes("Shell") ? "🦪" : "🛡️"}
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="font-bold text-sm text-white line-clamp-1">{item.name}</h4>
                                                    {!hasItem && (
                                                        <span className="text-[10px] text-brand-primary font-bold bg-brand-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                            {item.price} {item.currency_type === 'crypto' ? 'SOL' : 'CR'}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                })}
                            </div>

                            {activeItemData && !isOwned && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-black/40 rounded-2xl border border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-2">{activeItemData.name}</h3>
                                    <p className="text-sm text-foreground/70 mb-4">{activeItemData.description}</p>
                                    
                                    <div className="flex items-center space-x-4 mb-6 text-sm text-orange-300 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                                        <Zap className="w-4 h-4" />
                                        <span>+{activeItemData.power_bonus} Base Power Level</span>
                                    </div>

                                    {!publicKey ? (
                                        <div className="text-sm text-brand-primary p-4 bg-brand-primary/10 rounded-xl text-center font-bold">
                                            Connect wallet to mint Web3 logic items.
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handlePurchase}
                                            disabled={isEquipping || (activeItemData.currency_type === 'credits' && credits < activeItemData.price)}
                                            className="w-full glass-button bg-brand-primary hover:bg-brand-primary/90 text-white p-4 rounded-xl font-bold flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                                        >
                                            {isEquipping ? (
                                                <div className="flex items-center space-x-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Processing Blockchain Transaction...</span></div>
                                            ) : (
                                                <>
                                                    <span className="flex items-center space-x-2 text-lg">
                                                        <ShoppingCart className="w-5 h-5" />
                                                        <span>Acquire Digital Asset</span>
                                                    </span>
                                                    <span className="text-sm text-white/70 font-normal mt-1 flex items-center">
                                                        Pay {activeItemData.price} <span className="uppercase ml-1 tracking-wider">{activeItemData.currency_type === 'crypto' ? "SOL 🪙" : "CR 💎"}</span>
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
