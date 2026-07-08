import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, ShieldCheck, MapPin, Clock, User, QrCode, LogOut, Loader2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSite, setSelectedSite] = useState<any | null>(null);
    const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
    const [patrolLogs, setPatrolLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [clientEmail, setClientEmail] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        checkSession();
    }, []);

    // REAL-TIME LISTENER FOR THE CLIENT
    useEffect(() => {
        if (!selectedSite) return;
        const realtimeChannel = supabase.channel('client-live-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs', filter: `site_id=eq.${selectedSite.id}` },
                () => fetchSiteData(selectedSite)
            )
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patrol_logs' },
                () => fetchSiteData(selectedSite)
            )
            .subscribe();

        return () => { supabase.removeChannel(realtimeChannel); };
    }, [selectedSite]);

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/client/login');
            return;
        }
        setClientEmail(session.user.email || '');
        fetchSites(session.user.email);
    };

    const fetchSites = async (email: string | undefined) => {
        if (!email) return;
        // Security: ONLY fetch sites where client_email matches their login email!
        const { data } = await supabase.from('sites').select('*').eq('client_email', email);

        if (data && data.length > 0) {
            setSites(data);
            setSelectedSite(data[0]); // Auto-select their first site
            fetchSiteData(data[0]);
        } else {
            setLoading(false);
        }
    };

    const fetchSiteData = async (site: any) => {
        setLoading(true);

        // 1. Fetch Today's Attendance Logs (Guards currently on site)
        const { data: attData } = await supabase
            .from('attendance_logs')
            .select('*, guards(name, phone)')
            .eq('site_id', site.id)
            .order('clock_in_time', { ascending: false })
            .limit(10);

        setAttendanceLogs(attData || []);

        // 2. Fetch Recent Patrol Logs for this site
        const { data: cpData } = await supabase.from('checkpoints').select('id, name').eq('site_id', site.id);
        const cpIds = (cpData || []).map((c: any) => c.id);

        if (cpIds.length > 0) {
            const { data: pLogs } = await supabase
                .from('patrol_logs')
                .select('*, guards(name)')
                .in('checkpoint_id', cpIds)
                .order('scanned_at', { ascending: false })
                .limit(15);

            // Map checkpoint names into the logs
            const enrichedLogs = (pLogs || []).map((log: any) => {
                const cp = cpData?.find((c: any) => c.id === log.checkpoint_id);
                return { ...log, checkpoint_name: cp?.name || 'Unknown' };
            });
            setPatrolLogs(enrichedLogs);
        }

        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/client/login');
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center"><Loader2 className="h-10 w-10 text-ees-red animate-spin mb-4" /><p className="font-bold text-gray-500">Loading Secure Portal...</p></div>;

    if (sites.length === 0) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
            <Building2 className="h-20 w-20 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-ees-navy">No Sites Linked</h2>
            <p className="text-gray-500 mt-2">Your email ({clientEmail}) is not linked to any active security sites.</p>
            <button onClick={handleLogout} className="mt-6 text-ees-red font-bold hover:underline">Log Out</button>
        </div>
    );

    const activeGuards = attendanceLogs.filter(log => log.status === 'clocked_in');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Client Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Eagle Eye" className="h-10 w-auto" />
                        <div className="border-l-2 border-gray-200 pl-3 ml-1">
                            <h1 className="text-xl font-black text-ees-navy tracking-tight">CLIENT PORTAL</h1>
                            <p className="text-xs text-ees-red font-bold tracking-widest uppercase">Live Security Feed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-500 hidden md:block">{clientEmail}</span>
                        <button onClick={handleLogout} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition" title="Log Out">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* Site Selector (If they have multiple factories) */}
                {sites.length > 1 && (
                    <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
                        {sites.map(site => (
                            <button
                                key={site.id}
                                onClick={() => { setSelectedSite(site); fetchSiteData(site); }}
                                className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${selectedSite?.id === site.id ? 'bg-ees-navy text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-ees-navy'}`}
                            >
                                {site.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">{selectedSite?.name}</h2>
                    <p className="text-gray-500 flex items-center gap-1 mt-1 font-medium"><MapPin className="h-4 w-4" /> {selectedSite?.address}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LIVE GUARDS PANEL */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-ees-navy flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" /> Currently On Duty
                                </h3>
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                                    {activeGuards.length} Active
                                </span>
                            </div>

                            <div className="p-6 grid sm:grid-cols-2 gap-4">
                                {activeGuards.length === 0 ? (
                                    <p className="text-gray-500 col-span-full">No guards currently clocked in.</p>
                                ) : (
                                    activeGuards.map(log => (
                                        <div key={log.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 shadow-sm">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 shadow-sm bg-white shrink-0">
                                                {log.selfie_url ? <img src={log.selfie_url} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-gray-400" />}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-gray-900 text-lg">{log.guards?.name}</p>
                                                <p className="text-xs text-gray-500 font-bold mb-1">ID Verified</p>
                                                <p className="text-sm font-bold text-green-600 flex items-center gap-1"><Clock className="h-3 w-3" /> In: {formatTime(log.clock_in_time)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RECENT PATROLS LOG */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-ees-navy flex items-center gap-2">
                                    <QrCode className="h-5 w-5 text-ees-red" /> Latest Night Patrols
                                </h3>
                                <Activity className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="p-0">
                                {patrolLogs.length === 0 ? (
                                    <p className="text-gray-500 p-6">No patrol scans recorded recently.</p>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                                            <tr>
                                                <th className="p-4 font-bold">Time</th>
                                                <th className="p-4 font-bold">Checkpoint</th>
                                                <th className="p-4 font-bold">Guard</th>
                                                <th className="p-4 font-bold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patrolLogs.map(log => (
                                                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                                    <td className="p-4 font-bold text-gray-900">{formatTime(log.scanned_at)}</td>
                                                    <td className="p-4 font-semibold text-ees-navy">{log.checkpoint_name}</td>
                                                    <td className="p-4 text-gray-600">{log.guards?.name}</td>
                                                    <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Verified</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR: SHIFT HISTORY */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-5 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-ees-navy">Completed Shifts</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {attendanceLogs.filter(l => l.status === 'clocked_out' || l.status === 'auto_clocked_out').slice(0, 5).map(log => (
                                    <div key={log.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                                        <p className="font-bold text-gray-800 text-sm">{log.guards?.name}</p>
                                        <div className="flex justify-between mt-1 text-xs text-gray-500 font-semibold">
                                            <span>In: {formatTime(log.clock_in_time)}</span>
                                            <span>Out: {log.clock_out_time ? formatTime(log.clock_out_time) : 'Auto'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}