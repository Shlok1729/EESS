import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, Camera, QrCode, LogOut, Building2, Loader2, Lock, UserCheck } from 'lucide-react';

export default function GuardApp() {
    const [guards, setGuards] = useState<any[]>([]);
    const [sites, setSites] = useState<any[]>([]);

    const [selectedGuard, setSelectedGuard] = useState<any | null>(null);
    const [selectedSite, setSelectedSite] = useState<any | null>(null);

    // NEW: State to hold the guard they tapped before confirming
    const [confirmingGuard, setConfirmingGuard] = useState<any | null>(null);

    const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
    const [checkingStatus, setCheckingStatus] = useState<boolean>(false);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedGuard && selectedSite) {
            checkAttendanceStatus();
        }
    }, [selectedGuard, selectedSite]);

    const fetchInitialData = async () => {
        const savedGuard = localStorage.getItem('active_guard');
        const savedSite = localStorage.getItem('active_site');

        if (savedGuard) setSelectedGuard(JSON.parse(savedGuard));
        if (savedSite) setSelectedSite(JSON.parse(savedSite));

        const { data } = await supabase.from('guards').select('*').ilike('status', 'active');
        if (data) setGuards(data);
        setLoading(false);
    };

    const handleLogin = async (guard: any) => {
        setSelectedGuard(guard);
        setConfirmingGuard(null); // Clear the confirmation screen
        localStorage.setItem('active_guard', JSON.stringify(guard));

        // Fetch ONLY the sites assigned to this specific guard
        const { data } = await supabase
            .from('site_assignments')
            .select('shift_slot, sites(*)')
            .eq('guard_id', guard.id);

        if (data) {
            const assignedSites = data.map((item: any) => ({
                ...item.sites,
                shift_slot: item.shift_slot
            }));
            setSites(assignedSites);
        } else {
            setSites([]);
        }
    };

    const handleSiteSelect = (site: any) => {
        setSelectedSite(site);
        localStorage.setItem('active_site', JSON.stringify(site));
    };

    const handleLogout = () => {
        setSelectedGuard(null);
        setSelectedSite(null);
        setIsClockedIn(false);
        setConfirmingGuard(null);
        localStorage.removeItem('active_guard');
        localStorage.removeItem('active_site');
    };

    const checkAttendanceStatus = async () => {
        setCheckingStatus(true);
        const { data } = await supabase
            .from('attendance_logs')
            .select('status')
            .eq('guard_id', selectedGuard.id)
            .eq('site_id', selectedSite.id)
            .order('clock_in_time', { ascending: false })
            .limit(1);

        if (data && data.length > 0 && data[0].status === 'clocked_in') {
            setIsClockedIn(true);
        } else {
            setIsClockedIn(false);
        }
        setCheckingStatus(false);
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Terminal...</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">

                {/* Header */}
                <div className="bg-ees-navy p-6 text-center border-b border-gray-700 flex flex-col items-center">
                    <Shield className="h-12 w-12 text-ees-red mb-2" />
                    <h1 className="text-2xl font-extrabold text-white tracking-widest">EAGLE EYE</h1>
                    <p className="text-gray-400 text-sm font-semibold tracking-widest uppercase">Site Terminal</p>
                </div>

                <div className="p-6">

                    {/* STEP 1A: Two-Step Confirmation Screen */}
                    {confirmingGuard ? (
                        <div className="animate-fade-in-up text-center py-4">
                            <div className="w-24 h-24 bg-ees-red rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-4xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                                {confirmingGuard.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{confirmingGuard.name}</h2>
                            <p className="text-gray-400 mb-8 font-medium">Please confirm your identity to proceed.</p>

                            <div className="flex gap-4">
                                <button onClick={() => setConfirmingGuard(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-xl font-bold transition">
                                    No, Back
                                </button>
                                <button onClick={() => handleLogin(confirmingGuard)} className="flex-1 bg-ees-red hover:bg-red-700 text-white p-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2">
                                    <UserCheck className="h-5 w-5" /> Yes, Login
                                </button>
                            </div>
                        </div>
                    ) :

                        /* STEP 1B: Select Guard List */
                        !selectedGuard ? (
                            <div className="animate-fade-in-up">
                                <h2 className="text-white text-lg font-bold mb-4 text-center">Select Your Profile</h2>
                                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                                    {guards.map(guard => (
                                        // Notice: onClick now triggers setConfirmingGuard instead of handleLogin directly
                                        <button key={guard.id} onClick={() => setConfirmingGuard(guard)} className="w-full bg-gray-700 hover:bg-gray-600 text-white p-5 rounded-xl text-left font-bold transition-colors flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-xl">{guard.name.charAt(0)}</div>
                                            <span className="text-lg">{guard.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) :

                            /* STEP 2: Select Site */
                            !selectedSite ? (
                                <div className="animate-fade-in-up">
                                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                                        <p className="text-white font-bold text-lg">Hi, {selectedGuard.name}</p>
                                        {!isClockedIn && <button onClick={handleLogout} className="text-red-400 text-sm font-bold">Change Guard</button>}                                    </div>
                                    <h2 className="text-white text-lg font-bold mb-4 text-center">Where are you deployed today?</h2>
                                    <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                                        {sites.map(site => (
                                            <button key={site.id} onClick={() => handleSiteSelect(site)} className="w-full bg-gray-700 hover:bg-ees-navy text-white p-5 rounded-xl text-left font-bold transition-colors flex items-center gap-4">
                                                <Building2 className="text-gray-400 h-7 w-7" />
                                                <span className="text-lg">{site.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) :

                                /* STEP 3: Action Buttons */
                                (
                                    <div className="animate-fade-in-up flex flex-col gap-4">
                                        <div className="bg-gray-700 p-4 rounded-xl flex justify-between items-center mb-4">
                                            <div>
                                                <p className="text-white font-bold text-lg">{selectedGuard.name}</p>
                                                <p className="text-gray-400 text-xs font-bold uppercase mt-1 flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" /> {selectedSite.name}
                                                </p>
                                            </div>
                                            {!isClockedIn && (
                                                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-2 transition">
                                                    <LogOut className="h-6 w-6" />
                                                </button>
                                            )}
                                        </div>

                                        {/* ATTENDANCE BUTTON (Always Visible) */}
                                        <button onClick={() => navigate('/guard/clock-in')} className={`w-full text-white p-6 rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] flex flex-col items-center gap-3 border-2 ${isClockedIn ? 'bg-blue-600 hover:bg-blue-700 border-blue-800' : 'bg-ees-red hover:bg-red-700 border-red-800'}`}>
                                            <Camera className="h-10 w-10" />
                                            {isClockedIn ? 'END SHIFT (CLOCK OUT)' : 'START SHIFT (CLOCK IN)'}
                                        </button>

                                        {/* NIGHT PATROL BUTTON (Conditionally Rendered) */}
                                        {checkingStatus ? (
                                            <div className="flex justify-center p-4">
                                                <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />
                                            </div>
                                        ) : isClockedIn ? (
                                            <button onClick={() => navigate('/guard/patrol')} className="w-full bg-ees-navy hover:bg-blue-900 text-white p-6 rounded-2xl font-bold text-lg transition-all shadow-lg flex flex-col items-center gap-3 border-2 border-blue-900 mt-2 animate-fade-in-up">
                                                <QrCode className="h-10 w-10" /> NIGHT PATROL (SCAN)
                                            </button>
                                        ) : (
                                            <div className="mt-2 p-6 border-2 border-dashed border-gray-700 bg-gray-800/50 rounded-2xl flex flex-col items-center text-center">
                                                <Lock className="h-8 w-8 text-gray-600 mb-2" />
                                                <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">Patrol Locked</p>
                                                <p className="text-gray-500 text-xs mt-1">Clock in to start patrolling.</p>
                                            </div>
                                        )}

                                    </div>
                                )}
                </div>
            </div>
        </div>
    );
}