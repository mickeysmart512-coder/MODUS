// . trigger rebuild
import Dashboard from "@/components/dashboard/Dashboard";
import { SentinelTerminal } from "@/components/game/SentinelTerminal";
import { MazeCanvas } from "@/components/game/MazeCanvas";
import toast from "react-hot-toast";

export default function DashboardPage() {
    const handleCheckpoint = () => {
        toast.success("Checkpoint Secured! Daily Yield Locked.", {
            icon: '🛡️',
            style: { background: '#2C1E16', color: '#F5E6D3', border: '1px solid #C49B61' }
        });
    };

    const handleCaught = () => {
        toast.error("Scout Compromised. Unsecured Yield Lost.", {
            icon: '⚠️',
            style: { background: '#1A0B0B', color: '#ff4444', border: '1px solid #4a1c1c' }
        });
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-12">
            <div>
                <h1 className="text-4xl font-bold font-heading text-white mb-2 tracking-tight">Tactical Command</h1>
                <p className="text-foreground/60 text-lg">Oversee agent operations and secure active breaches.</p>
            </div>

            {/* The Dual Loop System */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Active Loop */}
                <div className="xl:col-span-2">
                    <MazeCanvas onCheckpointReached={handleCheckpoint} onCaught={handleCaught} />
                </div>

                {/* Passive Loop */}
                <div className="xl:col-span-1 h-[500px]">
                    <SentinelTerminal processingPower={1450} defenseStat={820} />
                </div>
            </div>

            {/* Original Dashboard Code / Inventory */}
            <div className="pt-12 border-t border-brand-primary/10">
                <Dashboard />
            </div>
        </div>
    );
}
