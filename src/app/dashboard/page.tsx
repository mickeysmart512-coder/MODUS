import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-heading text-white mb-2">Command Center</h1>
                <p className="text-foreground/60">Overview of your Web3 journey and character progression.</p>
            </div>
            <Dashboard />
        </div>
    );
}
