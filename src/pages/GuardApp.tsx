import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, Camera, QrCode, LogOut, Building2 } from 'lucide-react';

export default function GuardApp() {
    const [guards, setGuards] = useState<any[]>([]);
    const [sites, setSites] = useState<any[]>([]);

    const [selectedGuard, setSelectedGuard] = useState<any | null>(null);
    const [selectedSite, setSelectedSite] = useState<any | null>(null);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const savedGuard = localStorage.getItem('active_guard');
        const savedSite = localStorage.getItem('active_site');

        if (savedGuard) setSelectedGuard(JSON.parse(savedGuard));
        if (savedSite) setSelectedSite(JSON.parse(savedSite));
    }, []);

    const fetchData = async () => {
        // Fetch both Guards and Sites at the same time
        const [guardRes, siteRes] = await Promise.all([
            supabase.from('guards').select('*').ilike('status', 'active'),
            supabase.from('sites').select('*').order('name')
        ]);

        if (guardRes.data) setGuards(guardRes.data);
        if (siteRes.data) setSites(siteRes.data);
        setLoading(false);
    };

    // ... inside GuardApp.tsx ...

    const handleLogin = async (guard: any) => {
        setSelectedGuard(guard);
        localStorage.setItem('active_guard', JSON.stringify(guard));

        const { data } = await supabase
            .from('site_assignments')
            .select('shift_slot, sites(*)')
            .eq('guard_id', guard.id);

        if (data) {
            // WE MERGE THE SHIFT SLOT INTO THE SITE OBJECT HERE
            const assignedSites = data.map((item: any) => ({
                ...item.sites,
                shift_slot: item.shift_slot
            }));
            setSites(assignedSites);
        } else {
            setSites([]);
        }
    };

    // (Delete the `supabase.from('sites').select('*')` part from the `fetchData` useEffect at the top of the file, because we only fetch sites AFTER a guard logs in now!)

    const handleSiteSelect = (site: any) => {
        setSelectedSite(site);
        localStorage.setItem('active_site', JSON.stringify(site));
    };

    const handleLogout = () => {
        setSelectedGuard(null);
        setSelectedSite(null);
        localStorage.removeItem('active_guard');
        localStorage.removeItem('active_site');
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
                    {/* STEP 1: Select Guard */}
                    {!selectedGuard ? (
                        <div className="animate-fade-in-up">
                            <h2 className="text-white text-lg font-bold mb-4 text-center">Select Your Profile</h2>
                            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                                {guards.map(guard => (
                                    <button key={guard.id} onClick={() => handleLogin(guard)} className="w-full bg-gray-700 hover:bg-ees-red text-white p-4 rounded-xl text-left font-bold transition-colors flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl">{guard.name.charAt(0)}</div>
                                        {guard.name}
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
                                    <button onClick={handleLogout} className="text-red-400 text-sm font-bold">Cancel</button>
                                </div>
                                <h2 className="text-white text-lg font-bold mb-4 text-center">Where are you deployed today?</h2>
                                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                                    {sites.map(site => (
                                        <button key={site.id} onClick={() => handleSiteSelect(site)} className="w-full bg-gray-700 hover:bg-ees-navy text-white p-4 rounded-xl text-left font-bold transition-colors flex items-center gap-3">
                                            <Building2 className="text-gray-400 h-6 w-6" />
                                            {site.name}
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
                                        <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-2 transition">
                                            <LogOut className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <button onClick={() => navigate('/guard/clock-in')} className="w-full bg-ees-red hover:bg-red-700 text-white p-6 rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex flex-col items-center gap-3 border-2 border-red-800">
                                        <Camera className="h-10 w-10" /> CLOCK IN (SELFIE)
                                    </button>

                                    <button onClick={() => navigate('/guard/patrol')} className="w-full bg-ees-navy hover:bg-blue-900 text-white p-6 rounded-2xl font-bold text-lg transition-all shadow-lg flex flex-col items-center gap-3 border-2 border-blue-900 mt-2">
                                        <QrCode className="h-10 w-10" /> NIGHT PATROL (SCAN)
                                    </button>
                                </div>
                            )}
                </div>
            </div>
        </div>
    );
}