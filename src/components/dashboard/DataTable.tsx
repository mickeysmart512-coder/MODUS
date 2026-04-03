"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Search, Filter } from "lucide-react";

interface TransactionData {
    id: string;
    asset: string;
    type: string;
    amount: number;
    value: number;
    status: "Completed" | "Pending" | "Failed";
    time: string;
}

const DUMMY_DATA: TransactionData[] = [
    { id: "tx-1", asset: "SOL", type: "Swap", amount: 12.5, value: 1875.5, status: "Completed", time: "2m ago" },
    { id: "tx-2", asset: "USDC", type: "Deposit", amount: 5000, value: 5000, status: "Completed", time: "15m ago" },
    { id: "tx-3", asset: "JUP", type: "Stake", amount: 1540, value: 840.2, status: "Pending", time: "1h ago" },
    { id: "tx-4", asset: "BONK", type: "Swap", amount: 5000000, value: 125.4, status: "Completed", time: "3h ago" },
    { id: "tx-5", asset: "WIF", type: "Swap", amount: 450, value: 980.5, status: "Failed", time: "5h ago" },
    { id: "tx-6", asset: "SOL", type: "Withdraw", amount: 5, value: 750.2, status: "Completed", time: "1d ago" },
];

type SortKey = keyof TransactionData;

export function DataTable() {
    const [data, setData] = useState<TransactionData[]>(DUMMY_DATA);
    const [sortKey, setSortKey] = useState<SortKey>("time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filter, setFilter] = useState("");

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("desc");
        }
    };

    const filteredAndSorted = useMemo(() => {
        let result = [...data];

        if (filter) {
            result = result.filter(item =>
                item.asset.toLowerCase().includes(filter.toLowerCase()) ||
                item.type.toLowerCase().includes(filter.toLowerCase()) ||
                item.status.toLowerCase().includes(filter.toLowerCase())
            );
        }

        result.sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [data, sortKey, sortOrder, filter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed": return "text-green-400 bg-green-400/10 border-green-400/20";
            case "Pending": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case "Failed": return "text-red-400 bg-red-400/10 border-red-400/20";
            default: return "text-gray-400 bg-gray-400/10";
        }
    };

    return (
        <div className="glass-panel flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white tracking-wide">Recent Transactions</h2>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
                        <input
                            type="text"
                            placeholder="Search assets, types..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-foreground/40 focus:outline-none focus:border-brand-primary transition-colors w-full sm:w-64 glass-button hover:bg-white/5"
                        />
                    </div>
                    <button className="glass-button p-2" aria-label="Filter">
                        <Filter className="w-4 h-4 text-foreground/70" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            {["Asset", "Type", "Amount", "Value", "Status", "Time"].map((head) => {
                                const key = head.toLowerCase() as SortKey;
                                return (
                                    <th
                                        key={head}
                                        className="p-4 text-xs font-medium text-foreground/60 uppercase tracking-wider cursor-pointer hover:text-white transition-colors group"
                                        onClick={() => handleSort(key)}
                                    >
                                        <div className="flex items-center">
                                            {head}
                                            {sortKey === key && (
                                                sortOrder === "asc" ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredAndSorted.length > 0 ? (
                            filteredAndSorted.map((row) => (
                                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center font-medium text-white">
                                            <div className="w-6 h-6 rounded-full bg-gradient-dynamic mr-3 flex items-center justify-center text-[10px] shadow-lg">
                                                {row.asset[0]}
                                            </div>
                                            {row.asset}
                                        </div>
                                    </td>
                                    <td className="p-4 text-foreground/80 text-sm whitespace-nowrap">{row.type}</td>
                                    <td className="p-4 text-white text-sm font-medium whitespace-nowrap">{row.amount.toLocaleString()}</td>
                                    <td className="p-4 text-foreground/80 text-sm whitespace-nowrap">${row.value.toLocaleString()}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-xs rounded-full border ${getStatusColor(row.status)}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-foreground/50 text-sm whitespace-nowrap">{row.time}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-foreground/50 text-sm">
                                    No transactions found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
