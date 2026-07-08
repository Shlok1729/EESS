import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, ShieldCheck, MapPin, Clock, User, QrCode, LogOut, Loader2, Activity, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClientDashboard() {
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSite, setSelectedSite] = useState<any | null>(null);
    const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
    const [patrolLogs, setPatrolLogs] = useState<any[]>([]);
    const [assignedGuards, setAssignedGuards] = useState<any[]>([]);
    const [siteCheckpoints, setSiteCheckpoints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [clientEmail, setClientEmail] = useState('');
    const [showAllPatrols, setShowAllPatrols] = useState(false);
    const [showAllTeam, setShowAllTeam] = useState(false);
    const [showAllCheckpoints, setShowAllCheckpoints] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        checkSession();
    }, []);

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
        const { data } = await supabase.from('sites').select('*').eq('client_email', email);

        if (data && data.length > 0) {
            setSites(data);
            setSelectedSite(data[0]);
            fetchSiteData(data[0]);
        } else {
            setLoading(false);
        }
    };

    const fetchSiteData = async (site: any) => {
        setLoading(true);

        const { data: attData } = await supabase
            .from('attendance_logs')
            .select('*, guards(name, phone)')
            .eq('site_id', site.id)
            .order('clock_in_time', { ascending: false })
            .limit(15);
        setAttendanceLogs(attData || []);

        const { data: cpData } = await supabase.from('checkpoints').select('*').eq('site_id', site.id);
        setSiteCheckpoints(cpData || []);

        const cpIds = (cpData || []).map((c: any) => c.id);
        if (cpIds.length > 0) {
            const { data: pLogs } = await supabase
                .from('patrol_logs')
                .select('*, guards(name)')
                .in('checkpoint_id', cpIds)
                .order('scanned_at', { ascending: false })
                .limit(15);

            const enrichedLogs = (pLogs || []).map((log: any) => {
                const cp = cpData?.find((c: any) => c.id === log.checkpoint_id);
                return { ...log, checkpoint_name: cp?.name || 'Unknown' };
            });
            setPatrolLogs(enrichedLogs);
        }

        const { data: assignments } = await supabase
            .from('site_assignments')
            .select('shift_slot, guards(name, phone)')
            .eq('site_id', site.id);
        setAssignedGuards(assignments || []);

        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/client/login');
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-ees-red animate-spin mb-4" />
            <p className="font-bold text-gray-500">Loading Secure Portal...</p>
        </div>
    );

    if (sites.length === 0) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
            <Building2 className="h-16 w-16 md:h-20 md:w-20 text-gray-300 mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-ees-navy">No Sites Linked</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-sm">Your email ({clientEmail}) is not linked to any active security sites.</p>
            <button onClick={handleLogout} className="mt-6 text-ees-red font-bold hover:underline px-4 py-2">Log Out</button>
        </div>
    );

    const activeGuards = attendanceLogs.filter(log => log.status === 'clocked_in');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Client Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                        <img src="/logo.png" alt="Eagle Eye" className="h-8 md:h-10 w-auto" />
                        <div className="border-l-2 border-gray-200 pl-2 md:pl-3 ml-1">
                            <h1 className="text-base md:text-xl font-black text-ees-navy tracking-tight leading-none">CLIENT PORTAL</h1>
                            <p className="text-[9px] md:text-xs text-ees-red font-bold tracking-widest uppercase mt-0.5">Live Security Feed</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <span className="text-xs md:text-sm font-bold text-gray-500 hidden sm:block max-w-[150px] md:max-w-[200px] truncate">
                            {clientEmail}
                        </span>
                        <button onClick={handleLogout} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 md:p-2.5 rounded-lg transition" title="Log Out">
                            <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 w-full">

                {/* Site Selection Tabs */}
                {sites.length > 1 && (
                    <div className="mb-4 md:mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        {sites.map(site => (
                            <button
                                key={site.id}
                                onClick={() => { setSelectedSite(site); fetchSiteData(site); }}
                                className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base whitespace-nowrap transition-all flex-shrink-0 ${selectedSite?.id === site.id
                                    ? 'bg-ees-navy text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-ees-navy'
                                    }`}
                            >
                                {site.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Site Header */}
                <div className="mb-5 md:mb-8">
                    <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                        {selectedSite?.name}
                    </h2>
                    <p className="text-gray-500 flex items-start sm:items-center gap-1.5 mt-1.5 text-xs md:text-base font-medium">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
                        <span className="leading-snug">{selectedSite?.address}</span>
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-5 md:gap-8">

                    {/* LEFT COLUMN: LIVE GUARDS & PATROLS */}
                    <div className="lg:col-span-2 space-y-5 md:space-y-8">

                        {/* LIVE GUARDS */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-4 md:p-5 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-sm md:text-lg font-bold text-ees-navy flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-green-500" /> Currently On Duty
                                </h3>
                                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {activeGuards.length} Active
                                </span>
                            </div>

                            <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {activeGuards.length === 0 ? (
                                    <p className="text-gray-500 col-span-full py-4 text-center border-2 border-dashed border-gray-100 rounded-xl text-sm md:text-base">
                                        No guards currently clocked in.
                                    </p>
                                ) : (
                                    activeGuards.map(log => (
                                        <div key={log.id} className="flex gap-3 p-3 md:p-4 border border-gray-100 rounded-xl bg-gray-50 shadow-sm items-center">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-green-500 shadow-sm bg-white shrink-0">
                                                {log.selfie_url ? (
                                                    <img src={log.selfie_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-full h-full p-2 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-extrabold text-gray-900 text-sm md:text-lg leading-tight truncate">
                                                    {log.guards?.name}
                                                </p>
                                                <p className="text-[10px] md:text-xs text-gray-500 font-bold mb-1">ID Verified</p>
                                                <p className="text-xs md:text-sm font-bold text-green-600 flex items-center gap-1">
                                                    <Clock className="h-3 w-3 shrink-0" />
                                                    In: {formatTime(log.clock_in_time)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RECENT PATROLS LOG */}
                        {/* RECENT PATROLS LOG */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-4 md:p-5 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-sm md:text-lg font-bold text-ees-navy flex items-center gap-2">
                                    <QrCode className="h-4 w-4 md:h-5 md:w-5 text-ees-red" /> Latest Patrol Scans
                                </h3>
                                <Activity className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                            </div>

                            <div className="w-full">
                                {patrolLogs.length === 0 ? (
                                    <p className="text-gray-500 p-4 md:p-6 text-center text-sm md:text-base">No patrol scans recorded recently.</p>
                                ) : (
                                    <>
                                        {/* Mobile View: Stacked Cards */}
                                        <div className="md:hidden flex flex-col divide-y divide-gray-100">
                                            {(showAllPatrols ? patrolLogs : patrolLogs.slice(0, 5)).map(log => (
                                                <div key={log.id} className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition">
                                                    <div className="flex-1 min-w-0 pr-3">
                                                        <p className="text-sm font-bold text-ees-navy truncate">{log.checkpoint_name}</p>
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{log.guards?.name}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-bold text-gray-900 mb-1">{formatTime(log.scanned_at)}</p>
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">Verified</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop View: Table */}
                                        <div className="hidden md:block overflow-x-auto w-full">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                                                    <tr>
                                                        <th className="p-4 font-bold whitespace-nowrap">Time</th>
                                                        <th className="p-4 font-bold whitespace-nowrap">Checkpoint</th>
                                                        <th className="p-4 font-bold whitespace-nowrap">Guard</th>
                                                        <th className="p-4 font-bold whitespace-nowrap">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(showAllPatrols ? patrolLogs : patrolLogs.slice(0, 5)).map(log => (
                                                        <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                                            <td className="p-4 font-bold text-gray-900 whitespace-nowrap">{formatTime(log.scanned_at)}</td>
                                                            <td className="p-4 font-semibold text-ees-navy whitespace-nowrap">{log.checkpoint_name}</td>
                                                            <td className="p-4 text-gray-600 whitespace-nowrap">{log.guards?.name}</td>
                                                            <td className="p-4 whitespace-nowrap">
                                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Verified</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Toggle Button Footer */}
                                        {patrolLogs.length > 5 && (
                                            <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-center">
                                                <button
                                                    onClick={() => setShowAllPatrols(!showAllPatrols)}
                                                    className="text-sm font-bold text-ees-navy hover:text-ees-red transition-colors px-4 py-1.5 rounded-lg hover:bg-gray-200"
                                                >
                                                    {showAllPatrols ? 'Show Less' : `See All (${patrolLogs.length})`}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SITE SPECS & SHIFT HISTORY */}
                    <div className="space-y-5 md:space-y-8">

                        {/* APPOINTED TEAM */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                                <h3 className="text-sm md:text-lg font-bold text-ees-navy flex items-center gap-2">
                                    <Users className="h-4 w-4 md:h-5 md:w-5 text-ees-red" /> Appointed Team
                                </h3>
                            </div>

                            <div className="p-3 md:p-4 space-y-2.5">
                                {assignedGuards.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-2">No guards assigned.</p>
                                ) : null}

                                {(showAllTeam ? assignedGuards : assignedGuards.slice(0, 5)).map((ag, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                                        <div className="truncate pr-3">
                                            <p className="font-bold text-gray-800 text-sm truncate">{ag.guards?.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{ag.guards?.phone || 'No Phone'}</p>
                                        </div>
                                        <div className="text-center shrink-0">
                                            <span className="text-[10px] md:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-md block whitespace-nowrap">
                                                {ag.shift_slot} Shift
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Toggle Button Footer */}
                            {assignedGuards.length > 5 && (
                                <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-center">
                                    <button
                                        onClick={() => setShowAllTeam(!showAllTeam)}
                                        className="text-sm font-bold text-ees-navy hover:text-ees-red transition-colors px-4 py-1.5 rounded-lg hover:bg-gray-200"
                                    >
                                        {showAllTeam ? 'Show Less' : `See All (${assignedGuards.length})`}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* SITE CHECKPOINTS */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-sm md:text-lg font-bold text-ees-navy flex items-center gap-2">
                                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-ees-red" /> Patrol Route
                                </h3>
                                <span className="text-[10px] md:text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                    {siteCheckpoints.length} Pts
                                </span>
                            </div>

                            <div className="p-3 md:p-4 space-y-2">
                                {siteCheckpoints.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-2">No checkpoints added.</p>
                                ) : null}

                                {(showAllCheckpoints ? siteCheckpoints : siteCheckpoints.slice(0, 5)).map(cp => (
                                    <div key={cp.id} className="p-2.5 md:p-3 border border-gray-100 rounded-lg bg-gray-50 text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2.5 truncate">
                                        <div className="w-2 h-2 rounded-full bg-ees-red shrink-0"></div>
                                        <span className="truncate">{cp.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Toggle Button Footer */}
                            {siteCheckpoints.length > 5 && (
                                <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-center">
                                    <button
                                        onClick={() => setShowAllCheckpoints(!showAllCheckpoints)}
                                        className="text-sm font-bold text-ees-navy hover:text-ees-red transition-colors px-4 py-1.5 rounded-lg hover:bg-gray-200"
                                    >
                                        {showAllCheckpoints ? 'Show Less' : `See All (${siteCheckpoints.length})`}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* COMPLETED SHIFTS HISTORY */}
                        {/* COMPLETED SHIFTS HISTORY */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                                <h3 className="text-sm md:text-lg font-bold text-ees-navy flex items-center gap-2">
                                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-500" /> Shift History
                                </h3>
                            </div>
                            <div className="p-3 md:p-4 space-y-2.5">
                                {(() => {
                                    // Filter the logs once to avoid repeating the logic
                                    const completedShifts = attendanceLogs.filter(l => l.status === 'clocked_out' || l.status === 'auto_clocked_out');

                                    return (
                                        <>
                                            {completedShifts.length === 0 && (
                                                <p className="text-gray-500 text-sm text-center py-2">No completed shifts yet.</p>
                                            )}

                                            {(showAllHistory ? completedShifts : completedShifts.slice(0, 5)).map(log => (
                                                <div key={log.id} className="p-3 border border-gray-100 rounded-xl bg-gray-50">
                                                    <div className="flex justify-between items-start mb-2 gap-2">
                                                        <p className="font-bold text-gray-800 text-sm truncate">{log.guards?.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 whitespace-nowrap shrink-0 pt-0.5">
                                                            {formatDate(log.clock_in_time)}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-row justify-between items-center text-[10px] sm:text-xs font-semibold bg-white p-2 rounded border border-gray-100">
                                                        <span className="text-green-600">In: {formatTime(log.clock_in_time)}</span>
                                                        <span className={log.status === 'auto_clocked_out' ? 'text-red-500' : 'text-blue-600'}>
                                                            Out: {log.clock_out_time ? formatTime(log.clock_out_time) : 'Auto'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Toggle Button Footer */}
                                            {completedShifts.length > 5 && (
                                                <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-center -mx-3 md:-mx-4 mb:-mb-3 md:-mb-4 mt-2">
                                                    <button
                                                        onClick={() => setShowAllHistory(!showAllHistory)}
                                                        className="text-sm font-bold text-ees-navy hover:text-ees-red transition-colors px-4 py-1.5 rounded-lg hover:bg-gray-200"
                                                    >
                                                        {showAllHistory ? 'Show Less' : `See All (${completedShifts.length})`}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}