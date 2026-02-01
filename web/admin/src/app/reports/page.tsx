export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/reports')
            .then(res => res.json())
            .then(res => {
                if (res.success) setData(res.data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="py-40 text-center text-white font-black uppercase tracking-[0.4em]">Compiling Ledger Data...</div>;

    const metrics = data?.metrics || [
        { label: 'Total Volume', value: '$0.0', trend: '+0.0%', up: true },
        { label: 'Net Revenue', value: '$0.0', trend: '+0.0%', up: true },
        { label: 'Avg Order', value: '$0.00', trend: '+0.0', up: true },
        { label: 'Total Logs', value: '0', trend: '+0', up: true },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FileBarChart className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Analytics Suite</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                        Protocol <span className="text-blue-500">Insights</span>
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">Global transaction volume, node performance, and revenue distribution.</p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/5 bg-white/5 hover:bg-white/10 rounded-2xl px-6 py-6 font-black uppercase text-[10px] tracking-widest">
                        <Download className="w-4 h-4 mr-2" /> Export PDF
                    </Button>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metrics.map((stat: any, i: number) => (
                    <GlassCard key={i} delay={i * 0.1} className="p-6 border border-white/5 group">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="flex items-baseline justify-between">
                            <h3 className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</h3>
                            <span className={cn(
                                "text-[10px] font-bold flex items-center",
                                stat.up ? "text-green-400" : "text-red-400"
                            )}>
                                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </span>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Graph Placeholder */}
                <GlassCard className="lg:col-span-2 p-8 border border-white/5 min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Settlement Velocity</h3>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black">Live Data</Badge>
                    </div>

                    <div className="flex-1 flex items-end gap-3 pb-4">
                        {[40, 60, 45, 90, 65, 80, 55, 70, 85, 100, 75, 95].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05, duration: 1, ease: "easeOut" }}
                                className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-500/60 rounded-t-lg group relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ${(h * 12).toLocaleString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between px-2 pt-4 border-t border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        <span>Jan</span>
                        <span>Mar</span>
                        <span>May</span>
                        <span>Jul</span>
                        <span>Sep</span>
                        <span>Nov</span>
                    </div>
                </GlassCard>

                {/* Node Distribution */}
                <GlassCard className="p-8 border border-white/5 flex flex-col">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8">Node Distribution</h3>
                    <div className="space-y-6 flex-1">
                        {(data?.distribution || []).map((r: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{r.region}</span>
                                    <span className="text-[10px] font-bold text-blue-400">{r.value}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: r.value }}
                                        transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                        className={cn("h-full rounded-full", r.color)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Generated Reports List */}
            <GlassCard className="border border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Financial Audit Log</h3>
                    <div className="flex gap-4">
                        <Button size="sm" variant="outline" className="border-white/5 bg-white/5 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest"><Filter className="w-3 h-3 mr-2" /> Sort</Button>
                    </div>
                </div>
                <div className="divide-y divide-white/5">
                    {(data?.audits || []).map((report: any, i: number) => (
                        <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-gray-400 group-hover:text-blue-400 transition-colors">
                                    <FileBarChart className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-white uppercase italic tracking-tight">{report.name}</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{report.date}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[8px] font-black px-3 py-1">{report.type}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

// Internal mock component
function Activity({ className }: { className?: string }) {
    return <TrendingUp className={className} />;
}
