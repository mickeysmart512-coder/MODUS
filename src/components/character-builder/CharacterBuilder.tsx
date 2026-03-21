"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Sparkles, ChevronRight, Check, Loader2, User, Share2, Download, AlertCircle, ShoppingCart } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createUpgradeTransaction } from "@/lib/solana";
import { supabase, Item, SystemSettings } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { MaleBase, FemaleBase } from "./layers/BaseCharacters";
import {
    NeonVisorLayer, CyberHelmLayer,
    PlasmaCoreLayer, TitaniumShellLayer,
    VoidBladeLayer
} from "./layers/EquipmentLayers";

type Gender = "male" | "female" | null;

interface CharacterBuilderProps {
    previewOnly?: boolean;
}

export default function CharacterBuilder({ previewOnly = false }: CharacterBuilderProps) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { inventory, addToInventory, spendCredits, credits, powerLevel } = useAuthStore();
    const [gender, setGender] = useState<Gender>(null);
    const [selectedTrait, setSelectedTrait] = useState("head");
    const [activeItem, setActiveItem] = useState<number | null>(null);
    const [isEquipping, setIsEquipping] = useState(false);

    // Remote data state
    const [items, setItems] = useState<Item[]>([]);
    const [settings, setSettings] = useState<SystemSettings | null>(null);

    // Dynamic AI Avatar URL
    const [layeredAvatarUrl, setLayeredAvatarUrl] = useState<string | null>(null);

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

    // Call AI Endpoint to layer the avatar visually
    const synthesizeAvatarWithAI = async (itemId: number) => {
        const itemImg = items.find(i => i.id === itemId)?.image_url;
        if (!itemImg) return;

        try {
            const res = await fetch('/api/ai/layer-avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarUrl: "base_avatar", itemUrl: itemImg })
            });
            const data = await res.json();
            if (data.success && data.layeredAvatarUrl !== "base_avatar") {
                setLayeredAvatarUrl(data.layeredAvatarUrl);
            }
        } catch (error) {
            console.error("AI Layering failed", error);
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
                    <MaleBase />
                    <div className="absolute inset-0 pointer-events-none">
                        <NeonVisorLayer />
                        <VoidBladeLayer />
                        <PlasmaCoreLayer />
                    </div>
                </div>
            </div>
        );
    }

    if (!gender) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white font-heading mb-4">Initialize Character</h2>
                    <p className="text-foreground/60 max-w-lg">
                        Before entering the forge, select your Base Avatar. Custom layered AI mapping begins hereafter.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl px-4">
                    <motion.button onClick={() => setGender('male')} className="glass-panel p-8 flex flex-col items-center justify-center space-y-6 border-white/10 hover:border-brand-primary/50 transition-colors group">
                        <div className="w-48 h-64 relative bg-black/20 rounded-xl overflow-hidden group-hover:bg-brand-primary/5 transition-colors"><MaleBase /></div>
                        <h3 className="text-2xl font-bold font-heading text-white">Male Base</h3>
                    </motion.button>
                    <motion.button onClick={() => setGender('female')} className="glass-panel p-8 flex flex-col items-center justify-center space-y-6 border-white/10 hover:border-brand-secondary/50 transition-colors group">
                        <div className="w-48 h-64 relative bg-black/20 rounded-xl overflow-hidden group-hover:bg-brand-secondary/5 transition-colors"><FemaleBase /></div>
                        <h3 className="text-2xl font-bold font-heading text-white">Female Base</h3>
                    </motion.button>
                </div>
            </div>
        );
    }

    const renderedHeadId = getRenderedItemId("head");
    const renderedBodyId = getRenderedItemId("body");
    const renderedWeaponId = getRenderedItemId("weapon");

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row gap-8">

                {/* Character Preview Area */}
                <div className="md:w-1/3 flex flex-col items-center justify-center p-8 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-brand-primary/10 blur-[80px] -z-10 transition-colors duration-500" />

                    <button onClick={() => setGender(null)} className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-foreground/50 hover:text-white transition-colors z-50">
                        <User className="w-4 h-4" />
                    </button>

                    {/* Highly dynamic rendering area + PWR DP effect! */}
                    <div className={`w-full max-w-[300px] aspect-[2/3] relative z-10 p-4 transition-all duration-700 ${powerLevel >= 20000 ? 'border-[3px] border-brand-accent shadow-[0_0_50px_rgba(20,241,149,0.8)] rounded-3xl' : 'drop-shadow-2xl'}`}>
                        {layeredAvatarUrl ? (
                            // Render AI composite if created
                            <img src={layeredAvatarUrl} alt="AI Avatar" className="w-full h-full object-contain" />
                        ) : (
                            // Render Base SVG Stack normally
                            <div className="absolute inset-0 z-0">
                                {gender === 'male' ? <MaleBase /> : <FemaleBase />}
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Fallback legacy components for some items */}
                                    {renderedBodyId === 4 && <PlasmaCoreLayer />}
                                    {renderedBodyId === 5 && <TitaniumShellLayer />}
                                    {renderedHeadId === 1 && <NeonVisorLayer />}
                                    {renderedHeadId === 2 && <CyberHelmLayer />}
                                    {renderedWeaponId === 6 && <VoidBladeLayer />}
                                </div>
                            </div>
                        )}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-primary/50 blur-[1px] animate-[scan_4s_ease-in-out_infinite] z-50 pointer-events-none" />
                    </div>

                    <div className="mt-6 w-full flex justify-between items-center text-sm z-50">
                        <div className="flex flex-col">
                            <span className="text-foreground/60 tracking-wider text-xs">PWR LVL</span>
                            <span className={`font-bold text-lg ${powerLevel >= 20000 ? 'text-brand-accent drop-shadow-[0_0_5px_rgba(20,241,149,0.8)]' : 'text-brand-primary'}`}>{powerLevel.toLocaleString()}</span>
                            {powerLevel >= 20000 && <span className="text-[10px] text-brand-accent bg-brand-accent/20 px-2 rounded-full border border-brand-accent/50">Awakened DP Active!</span>}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-foreground/60 tracking-wider text-xs">BALANCE</span>
                            <div className="flex items-center space-x-1">
                                <span className="text-brand-primary font-bold text-lg">{credits.toLocaleString()}</span>
                                <span className="text-brand-primary/80 font-medium text-xs mt-1">CR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customization Area */}
                <div className="md:w-2/3 flex flex-col space-y-6">
                    <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/5">
                        {traits.map((trait) => (
                            <button key={trait.id} onClick={() => setSelectedTrait(trait.id)} className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all ${selectedTrait === trait.id ? "bg-white/10 text-white shadow-lg" : "text-foreground/60 hover:text-white hover:bg-white/5"}`}>
                                <trait.icon className="w-4 h-4" />
                                <span className="font-medium hidden sm:block">{trait.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                        {filteredItems.length === 0 ? (
                            <div className="col-span-2 text-white/50 text-center py-12">No items found for this slot.</div>
                        ) : (
                            filteredItems.map((item, i) => {
                                const itemIsOwned = inventory.includes(item.id);
                                const isEquipped = activeItemData?.id === item.id || Object.values(equippedItems).includes(item.id);
                                return (
                                    <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} onClick={() => setActiveItem(item.id)} className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 flex flex-col justify-between ${activeItem === item.id ? "bg-brand-primary/20 border-brand-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "bg-white/5 border-white/10 hover:border-white/30"}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="text-white font-bold font-heading">{item.name}</h4>
                                                    {itemIsOwned && <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/30">Owned</span>}
                                                </div>
                                            </div>
                                            {activeItem === item.id && <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white"><Check className="w-4 h-4" /></div>}
                                        </div>
                                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                                            <span className="text-brand-accent/80 font-medium text-sm">+{item.power_bonus} PWR</span>
                                            <span className="text-white font-bold">{itemIsOwned ? "Free" : `${item.price} ${item.currency_type.toUpperCase()}`}</span>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button onClick={handleAction} disabled={!activeItemData || isEquipping} className={`glass-button px-8 py-3 flex items-center justify-center space-x-2 w-full sm:w-auto transition-all ${!activeItemData ? 'opacity-50 cursor-not-allowed bg-white/5 text-foreground/50 border-white/5' : 'bg-brand-primary/20 border-brand-primary/50 text-white hover:bg-brand-primary/30'}`}>
                            {isEquipping ? (
                                <><Loader2 className="w-5 h-5 animate-spin text-brand-primary" /><span className="font-semibold text-brand-primary">Processing...</span></>
                            ) : (
                                <>
                                    <span className="font-semibold">
                                        {Object.values(equippedItems).includes(activeItemData?.id as number) ? "Already Equipped" : isOwned ? "Equip Item" : `Buy for ${activeItemData?.price} ${activeItemData?.currency_type.toUpperCase()}`}
                                    </span>
                                    {!isOwned && <ShoppingCart className="w-5 h-5 ml-1" />}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
