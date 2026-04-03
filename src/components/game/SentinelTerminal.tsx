"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Cpu, Activity, Server } from "lucide-react";

interface LogEntry {
    id: string;
    time: string;
    message: string;
    type: "scan" | "yield" | "alert" | "system";
}

const generateLog = (id: number, power: number): LogEntry => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const rand = Math.random();
    let type: LogEntry["type"] = "scan";
    let message = "";

    if (rand > 0.8) {
        type = "yield";
        const amount = (Math.random() * (power / 100)).toFixed(4);
        message = `SUCCESS: Secure fragment extracted. Yield +${amount} MODUS.`;
    } else if (rand > 0.6) {
        type = "alert";
        message = "WARNING: Time-Alien logic anomaly detected in Sector 7.";
    } else if (rand > 0.4) {
        type = "system";
        message = "SYS: Firewall integrity nominal. Oracle sync complete.";
    } else {
        type = "scan";
        message = `SCAN: Probing Blockchain Epoch ${Math.floor(Math.random() * 1000000)}...`;
    }

    return { id: `log-${id}`, time, message, type };
};

export function SentinelTerminal({ processingPower = 100, defenseStat = 50 }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [counter, setCounter] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initial = Array.from({ length: 4 }).map((_, i) => generateLog(i, processingPower));
        setLogs(initial);

        const interval = setInterval(() => {
            setLogs((prev) => {
                const newLogs = [...prev, generateLog(counter + 4, processingPower)];
                if (newLogs.length > 20) newLogs.shift();
                return newLogs;
            });
            setCounter(c => c + 1);
        }, 2500); // New log every 2.5 seconds

        return () => clearInterval(interval);
    }, [counter, processingPower]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getColor = (type: string) => {
        switch (type) {
            case "yield": return "text-brand-primary font-semibold";
            case "alert": return "text-red-400";
            case "system": return "text-brand-secondary";
            default: return "text-foreground/60";
        }
    };

    return (
        <div className="glass-panel border-white/5 bg-[#140D0A]/90 p-6 flex flex-col h-full min-h-[400px] shadow-[inset_0_0_20px_rgba(44,30,22,0.8)]">
            <div className="flex items-center justify-between mb-4 border-b border-brand-primary/20 pb-4">
                <div className="flex items-center space-x-2 text-brand-primary">
                    <Terminal className="w-5 h-5" />
                    <h2 className="font-heading font-bold tracking-widest uppercase text-sm">Sentinel Uplink</h2>
                </div>
                <div className="flex items-center space-x-4 text-xs font-mono text-brand-secondary">
                    <div className="flex items-center group cursor-help">
                        <Cpu className="w-3 h-3 mr-1 text-foreground/50 group-hover:text-brand-primary transition-colors" />
                        <span>PRC: {processingPower}</span>
                    </div>
                    <div className="flex items-center group cursor-help">
                        <Shield className="w-3 h-3 mr-1 text-foreground/50 group-hover:text-brand-primary transition-colors" />
                        <span>DEF: {defenseStat}</span>
                    </div>
                    <div className="flex items-center text-green-500/80">
                        <Server className="w-3 h-3 mr-1 animate-pulse" />
                        <span>SYNCED</span>
                    </div>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto font-mono text-[11px] sm:text-xs leading-relaxed space-y-2 pr-2 scrollbar-thin scrollbar-thumb-brand-primary/20 scrollbar-track-transparent scroll-smooth"
            >
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex space-x-3 hover:bg-white/[0.02] p-1 rounded"
                        >
                            <span className="text-foreground/40 shrink-0">[{log.time}]</span>
                            <span className={`${getColor(log.type)} break-words`}>
                                <span className="text-brand-primary/40 mr-2">{'>'}</span>
                                {log.message}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-brand-primary/20 flex justify-between items-center">
                <span className="text-xs text-foreground/50 font-mono flex items-center">
                    <Activity className="w-3 h-3 justify-center mr-2 animate-pulse text-brand-primary" />
                    Background scouting active...
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary/40">Modus Protocol V2</span>
            </div>
        </div>
    );
}
