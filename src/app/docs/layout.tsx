"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, FileText, Map, ChevronRight, Coins } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const navLinks = [
    { href: "/docs/tokenomics", label: "Tokenomics", icon: <Coins className="w-4 h-4" /> },
    { href: "/docs/security", label: "Security & Oracles", icon: <Shield className="w-4 h-4" /> },
    { href: "/docs/roadmap", label: "Roadmap", icon: <Map className="w-4 h-4" /> },
];

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen pt-24 max-w-7xl mx-auto">
            {/* Sidebar Navigation */}
            <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-white/10 pr-6 h-[calc(100vh-6rem)] sticky top-24">
                <div className="mb-8">
                    <h2 className="text-xs font-semibold text-foreground/50 uppercase tracking-widest mb-4 px-3">
                        Documentation
                    </h2>
                    <nav className="space-y-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                                            : "text-foreground/70 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={cn(isActive ? "text-brand-primary" : "text-foreground/40 group-hover:text-foreground/80")}>
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 px-4 md:px-12 pb-24 max-w-4xl">
                <div className="prose prose-invert prose-headings:font-bold prose-a:text-brand-primary hover:prose-a:text-brand-secondary prose-p:leading-relaxed max-w-none">
                    {children}
                </div>
            </main>
        </div>
    );
}
