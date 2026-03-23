import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface AuthState {
    walletAddress: string | null;
    username: string | null;

    // Social Onboarding Mock States
    isXConnected: boolean;
    hasFollowedProject: boolean;
    isSocialModalOpen: boolean;

    // Admin Auth State
    isAdmin: boolean;

    // Database Mock States
    inventory: number[];
    credits: number;
    modTokens: number;
    powerLevel: number;
    accountLevel: number;

    // Avatar Configuration State
    avatarConfig: {
        skinColor: string[];
        top: string;
        hairColor: string[];
        clothing: string;
        clothesColor: string[];
        eyes: string;
        eyebrows: string;
        mouth: string;
        facialHair: string;
        facialHairColor: string[];
        accessories: string;
        accessoriesColor: string[];
    };

    setWallet: (address: string | null) => void;
    setAvatarConfig: (config: Partial<AuthState['avatarConfig']>) => void;
    setUsername: (name: string) => void;
    setXConnected: (status: boolean) => void;
    setHasFollowedProject: (status: boolean) => void;
    setSocialModalOpen: (status: boolean) => void;
    setIsAdmin: (status: boolean) => void;
    addToInventory: (itemIds: number[], powerAdded?: number) => Promise<void>;
    spendCredits: (amount: number, description: string) => Promise<boolean>;
    disconnect: () => void;
    fetchUserData: (walletAddress: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            walletAddress: null,
            username: null,
            isXConnected: false,
            hasFollowedProject: false,
            isSocialModalOpen: false,
            isAdmin: false,
            // Give them some default owned items for testing
            inventory: [],
            credits: 0,
            modTokens: 0,
            powerLevel: 0,
            accountLevel: 1,

            avatarConfig: {
                skinColor: ["edb98a"],
                top: "shortFlat",
                hairColor: ["2c1b18"],
                clothing: "hoodie",
                clothesColor: ["3c4f5c"],
                eyes: "default",
                eyebrows: "defaultNatural",
                mouth: "smile",
                facialHair: "none",
                facialHairColor: ["2c1b18"],
                accessories: "none",
                accessoriesColor: ["262e33"]
            },

            setAvatarConfig: (newConfig) => set((state) => ({ 
                avatarConfig: { ...state.avatarConfig, ...newConfig } 
            })),

            setWallet: async (address) => {
                set({ walletAddress: address });
                if (address) {
                    await get().fetchUserData(address);
                } else {
                    set({ inventory: [], credits: 0, modTokens: 0, powerLevel: 0, accountLevel: 1, username: null });
                }
            },

            fetchUserData: async (walletAddress) => {
                const state = get();
                const xUsernameFromState = state.username; // Could be from X OAuth

                try {
                    // Fetch user profile
                    const response = await supabase
                        .from('users')
                        .select('*')
                        .eq('wallet_address', walletAddress)
                        .single();

                    let user = response.data;
                    const userError = response.error;

                    // Auto-create user if they don't exist yet
                    if (userError?.code === 'PGRST116' || !user) {
                        const newUsername = xUsernameFromState || `Player_${walletAddress.slice(0, 4)}`;
                        const { data: newUser } = await supabase
                            .from('users')
                            .insert([
                                {
                                    wallet_address: walletAddress,
                                    username: newUsername,
                                    x_username: xUsernameFromState,
                                    credits: 1500, // Starting bonus
                                    mod_tokens: 0,
                                    power_level: 0,
                                    account_level: 1
                                }
                            ])
                            .select()
                            .single();
                        user = newUser;
                    } else if (xUsernameFromState && user.x_username !== xUsernameFromState) {
                        // Update existing user with newly connected X username
                        await supabase
                            .from('users')
                            .update({ username: xUsernameFromState, x_username: xUsernameFromState })
                            .eq('wallet_address', walletAddress);
                        user.username = xUsernameFromState;
                        user.x_username = xUsernameFromState;
                    }

                    if (user) {
                        set({
                            username: user.username,
                            credits: user.credits,
                            modTokens: user.mod_tokens,
                            powerLevel: user.power_level,
                            accountLevel: user.account_level
                        });

                        // Fetch inventory
                        const { data: inventoryData } = await supabase
                            .from('inventory')
                            .select('item_id')
                            .eq('user_wallet', walletAddress);

                        if (inventoryData) {
                            set({ inventory: inventoryData.map(i => i.item_id) });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            },

            setUsername: (name) => set({ username: name }),
            setXConnected: (status) => set({ isXConnected: status }),
            setHasFollowedProject: (status) => set({ hasFollowedProject: status }),
            setSocialModalOpen: (status) => set({ isSocialModalOpen: status }),
            setIsAdmin: (status) => set({ isAdmin: status }),

            addToInventory: async (itemIds, powerAdded = 0) => {
                const state = get();
                if (!state.walletAddress) return;

                const newPowerLevel = state.powerLevel + powerAdded;
                // Level 1 up to 49 Power. Level 2 at 50 Power.
                const newAccountLevel = Math.max(1, Math.floor(newPowerLevel / 50) + 1);

                // Optimistic UI update
                set({
                    inventory: Array.from(new Set([...state.inventory, ...itemIds])),
                    powerLevel: newPowerLevel,
                    accountLevel: newAccountLevel
                });

                // Sync to Supabase
                try {
                    const inserts = itemIds.map(id => ({
                        user_wallet: state.walletAddress,
                        item_id: id
                    }));
                    await supabase.from('inventory').insert(inserts);

                    if (powerAdded > 0) {
                        await supabase.from('users').update({
                            power_level: newPowerLevel,
                            account_level: newAccountLevel
                        }).eq('wallet_address', state.walletAddress);
                    }
                } catch (error) {
                    console.error("Failed to sync inventory to DB", error);
                }
            },

            spendCredits: async (amount, description) => {
                const state = get();
                if (!state.walletAddress || state.credits < amount) return false;

                const newBalance = state.credits - amount;

                // Optimistic update
                set({ credits: newBalance });

                try {
                    // Update user balance in DB
                    await supabase
                        .from('users')
                        .update({ credits: newBalance })
                        .eq('wallet_address', state.walletAddress);

                    // Track activity
                    await supabase.from('activities').insert([{
                        user_wallet: state.walletAddress,
                        action_type: 'spend',
                        description: description,
                        value: `-${amount} Credits`
                    }]);

                    return true;
                } catch (error) {
                    console.error("Failed to sync credit spend", error);
                    // Revert on failure
                    set({ credits: state.credits });
                    return false;
                }
            },

            disconnect: () => set({
                walletAddress: null,
                username: null,
                isXConnected: false,
                hasFollowedProject: false,
                isAdmin: false,
                inventory: [],
                credits: 0,
                modTokens: 0,
                powerLevel: 0,
                accountLevel: 1
            }),
        }),
        {
            name: 'modus-auth-storage',
        }
    )
);
