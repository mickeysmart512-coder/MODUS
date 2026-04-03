"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Zap, RefreshCw } from "lucide-react";

interface ActivityItem {
    id: string;
    type: "swap" | "stake" | "deposit";
    user: string;
    amount: string;
    asset: string;
    time: string;
}

const generateActivity = (id: number): ActivityItem => {
    const types: ("swap" | "stake" | "deposit")[] = ["swap", "stake", "deposit"];
    const assets = ["SOL", "USDC", "BONK", "JUP", "WIF"];

    const type = types[Math.floor(Math.random() * types.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const amount = (Math.random() * 1000).toFixed(2);
    const user = `...${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return {
        id: `act-${id}-${Date.now()}`,
        type,
        user,
        amount,
        asset,
        time: "Just now",
    };
};

export function LiveActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        // Initial feed
        const initial = Array.from({ length: 5 }).map((_, i) => generateActivity(i));
        setActivities(initial);

        // Simulate real-time updates
        const interval = setInterval(() => {
            setActivities((prev) => {
                const newFeed = [generateActivity(counter), ...prev];
                return newFeed.slice(0, 8); // Keep only latest 8
            });
            setCounter((c) => c + 1);
        }, 3500);

        return () => clearInterval(interval);
    }, [counter]);

    const getIcon = (type: string) => {
        switch (type) {
            case "swap": return <ArrowUpDown className="w-4 h-4 text-brand-primary" />;
            case "stake": return <Zap className="w-4 h-4 text-brand-secondary" />;
            case "deposit": return <RefreshCw className="w-4 h-4 text-blue-400" />;
            default: return <Activity className="w-4 h-4 text-white" />;
        }
    };

    const getActionText = (type: string) => {
        switch (type) {
            case "swap": return "Swapped";
            case "stake": return "Staked";
            case "deposit": return "Deposited";
            default: return "Acted";
        }
    };

    return (
        <div className="glass-panel p-6 flex flex-col h-full h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white tracking-wide flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                    Live Activity
                </h2>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-brand-surface to-transparent z-10 pointer-events-none" />

                <div className="flex flex-col gap-3 h-full overflow-y-auto pb-4 hide-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {activities.map((activity) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="flex items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 mr-4">
                                    {getIcon(activity.type)}
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm text-foreground/90">
                                        <span className="font-medium text-white">{activity.user}</span>{" "}
                                        <span className="text-foreground/60">{getActionText(activity.type)}</span>{" "}
                                        <span className="font-semibold text-brand-primary">{activity.amount} {activity.asset}</span>
                                    </p>
                                    <span className="text-xs text-foreground/40">{activity.time}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-brand-surface to-transparent z-10 pointer-events-none" />
            </div>
        </div>
    );
}
