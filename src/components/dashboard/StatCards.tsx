"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Activity, ArrowUpRight, DollarSign, Users } from "lucide-react";

function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
    const spring = useSpring(0, { bounce: 0, duration: 2000 });
    const display = useTransform(spring, (current) =>
        `${prefix}${current.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
    );

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
}

export function StatCards() {
    const stats = [
        { title: "Total Value Locked", value: 124500000, prefix: "$", suffix: "", decimals: 0, icon: <DollarSign className="w-5 h-5 text-brand-primary" /> },
        { title: "24h Volume", value: 34200000, prefix: "$", suffix: "", decimals: 0, icon: <Activity className="w-5 h-5 text-brand-secondary" /> },
        { title: "Active Users", value: 14500, prefix: "", suffix: "+", decimals: 0, icon: <Users className="w-5 h-5 text-brand-primary" /> },
        { title: "Avg. Yield (APY)", value: 12.4, prefix: "", suffix: "%", decimals: 2, icon: <ArrowUpRight className="w-5 h-5 text-brand-secondary" /> },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="glass-panel p-6 flex flex-col relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-foreground/70 font-medium text-sm tracking-wide">{stat.title}</h3>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                            {stat.icon}
                        </div>
                    </div>

                    <div className="text-3xl font-bold text-white tracking-tight flex items-center">
                        <CountUp
                            value={stat.value}
                            prefix={stat.prefix}
                            suffix={stat.suffix}
                            decimals={stat.decimals}
                        />
                    </div>

                    <div className="mt-4 text-xs text-brand-secondary font-medium flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        <span>+{(Math.random() * 5 + 1).toFixed(1)}% this week</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
