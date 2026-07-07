import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Users, QrCode, Plus, Printer, MapPin, Settings, X, CheckSquare, Square, UserPlus, Phone, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminDashboard() {
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSite, setSelectedSite] = useState<any | null>(null);

    const [siteGuards, setSiteGuards] = useState<any[]>([]);
    const [checkpoints, setCheckpoints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [newCheckpointName, setNewCheckpointName] = useState('');

    // --- MODALS STATE ---
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);
    const [showManageTeamModal, setShowManageTeamModal] = useState(false);
    const [showAddGuardModal, setShowAddGuardModal] = useState(false);

    // --- MANAGE TEAM & GUARD STATE ---
    const [allGuards, setAllGuards] = useState<any[]>([]);
    // Using an object to store assignment details { [guard_id]: { shift_slot: 'Day' } }
    const [assignedGuardsMap, setAssignedGuardsMap] = useState<Record<string, any>>({});

    const [newSiteData, setNewSiteData] = useState({ name: '', address: '', lat: '', lng: '', radius: 100, shift_mode: 12 });
    const [newGuardData, setNewGuardData] = useState({ name: '', phone: '' });

    useEffect(() => {
        fetchSites();
    }, []);
    useEffect(() => {
        // If no site is selected, don't listen
        if (!selectedSite) return;

        // Open a live WebSocket connection
        const realtimeChannel = supabase
            .channel('live-site-updates')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for INSERTS, UPDATES, and DELETES
                    schema: 'public',
                    table: 'attendance_logs',
                    filter: `site_id=eq.${selectedSite.id}` // Only listen for the site you are looking at
                },
                (payload) => {
                    console.log('Live update received!', payload);
                    // Silently refresh the data for this site without reloading the page!
                    handleSiteClick(selectedSite);
                }
            )
            .subscribe();

        // Cleanup: Close the connection if you click a different site
        return () => {
            supabase.removeChannel(realtimeChannel);
        };
    }, [selectedSite]); // This effect restarts whenever you click a new site


    const fetchSites = async () => {
        setLoading(true);
        const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false });
        if (data) setSites(data);
        setLoading(false);
    };

    const handleSiteClick = async (site: any) => {
        setSelectedSite(site);

        // Fetch Checkpoints
        const { data: cpData } = await supabase.from('checkpoints').select('*').eq('site_id', site.id);
        setCheckpoints(cpData || []);

        // Fetch Assigned Guards & Their Shifts
        const { data: assignments } = await supabase
            .from('site_assignments')
            .select('guard_id, shift_slot, guards(*)')
            .eq('site_id', site.id);

        if (assignments) {
            // NEW: Fetch all attendance logs for this site
            const { data: attendanceData } = await supabase
                .from('attendance_logs')
                .select('guard_id, status, selfie_url')
                .eq('site_id', site.id);

            const guardsList = assignments.map((a: any) => {
                const guardLogs = attendanceData?.filter(log => log.guard_id === a.guard_id) || [];
                const completedShifts = guardLogs.filter(log => log.status === 'clocked_out' || log.status === 'auto_clocked_out').length;

                // NEW: Grab the active log and the selfie
                const activeLog = guardLogs.find(log => log.status === 'clocked_in');
                const isClockedIn = !!activeLog;
                const activeSelfie = activeLog ? (activeLog as any).selfie_url : null;

                return {
                    ...a.guards,
                    shift_slot: a.shift_slot,
                    completed_shifts: completedShifts,
                    is_clocked_in: isClockedIn,
                    active_selfie: activeSelfie // <-- We added this
                };
            }).filter(Boolean);

            setSiteGuards(guardsList);

            const map: Record<string, any> = {};
            assignments.forEach((a: any) => {
                map[a.guard_id] = { shift_slot: a.shift_slot || 'Day' };
            });
            setAssignedGuardsMap(map);
        } else {
            setSiteGuards([]);
            setAssignedGuardsMap({});
        }
    };

    const handleAddCheckpoint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCheckpointName || !selectedSite) return;

        const { data } = await supabase.from('checkpoints').insert([{ site_id: selectedSite.id, name: newCheckpointName }]).select();
        if (data) {
            setCheckpoints([...checkpoints, data[0]]);
            setNewCheckpointName('');
        }
    };

    const handleAddSite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSiteData.name) return;

        const { data, error } = await supabase.from('sites').insert([{
            name: newSiteData.name,
            address: newSiteData.address,
            lat: parseFloat(newSiteData.lat) || null,
            lng: parseFloat(newSiteData.lng) || null,
            radius_meters: newSiteData.radius,
            shift_mode: newSiteData.shift_mode // Save 8 or 12 hr mode
        }]).select();

        if (data && data.length > 0) {
            setSites([data[0], ...sites]);
            setShowAddSiteModal(false);
            setNewSiteData({ name: '', address: '', lat: '', lng: '', radius: 100, shift_mode: 12 });
            handleSiteClick(data[0]);
        } else {
            alert("Failed to add site. Check console.");
        }
    };

    const handleAddGuard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuardData.name) return;

        const { data, error } = await supabase.from('guards').insert([{ name: newGuardData.name, phone: newGuardData.phone, status: 'active' }]).select();
        if (data && data.length > 0) {
            setShowAddGuardModal(false);
            setNewGuardData({ name: '', phone: '' });
            if (showManageTeamModal) setAllGuards([...allGuards, data[0]]);
            alert("Guard Registered Successfully!");
        } else {
            alert("Failed to add guard.");
        }
    };

    const openManageTeamModal = async () => {
        const { data } = await supabase.from('guards').select('*').ilike('status', 'active');
        if (data) setAllGuards(data);
        setShowManageTeamModal(true);
    };

    // --- NEW LOGIC: ASSIGN GUARD AND SHIFT SLOT ---
    const toggleGuardAssignment = async (guard: any) => {
        if (!selectedSite) return;
        const isAssigned = !!assignedGuardsMap[guard.id];

        if (isAssigned) {
            // Unassign Guard
            await supabase.from('site_assignments').delete().match({ site_id: selectedSite.id, guard_id: guard.id });
            const newMap = { ...assignedGuardsMap };
            delete newMap[guard.id];
            setAssignedGuardsMap(newMap);
            setSiteGuards(prev => prev.filter(g => g.id !== guard.id));
        } else {
            // Assign Guard with Default Shift (Day)
            const defaultShift = 'Day';
            await supabase.from('site_assignments').insert([{ site_id: selectedSite.id, guard_id: guard.id, shift_slot: defaultShift }]);
            setAssignedGuardsMap({ ...assignedGuardsMap, [guard.id]: { shift_slot: defaultShift } });
            setSiteGuards(prev => [...prev, { ...guard, shift_slot: defaultShift }]);
        }
    };

    const updateGuardShiftSlot = async (guardId: string, newSlot: string) => {
        if (!selectedSite) return;

        // Update UI instantly
        setAssignedGuardsMap({ ...assignedGuardsMap, [guardId]: { shift_slot: newSlot } });
        setSiteGuards(prev => prev.map(g => g.id === guardId ? { ...g, shift_slot: newSlot } : g));

        // Update DB
        await supabase.from('site_assignments').update({ shift_slot: newSlot }).match({ site_id: selectedSite.id, guard_id: guardId });
    };

    const printQRCode = (checkpointId: string, checkpointName: string) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`<html><head><title>Print QR - ${checkpointName}</title><style>body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }.qr-container { border: 2px solid #000; padding: 20px; border-radius: 10px; text-align: center; }h2 { margin-bottom: 5px; }p { margin-top: 0; color: #555; }</style></head><body><div class="qr-container"><h2>EAGLE EYE SECURITY</h2><p>Checkpoint: ${checkpointName}</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${checkpointId}" alt="QR" /><p style="font-size: 10px; margin-top: 10px;">ID: ${checkpointId}</p></div><script>window.onload = () => { window.print(); window.close(); }</script></body></html>`);
        printWindow.document.close();
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-xl text-ees-navy">Loading HQ...</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative">

            {/* --- ADD NEW GUARD MODAL --- */}
            {showAddGuardModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-ees-navy p-4 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus className="h-5 w-5" /> Register Guard</h2>
                            <button onClick={() => setShowAddGuardModal(false)} className="hover:text-ees-red transition"><X className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleAddGuard} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                                <input required type="text" placeholder="e.g., Ajay Kumar" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newGuardData.name} onChange={e => setNewGuardData({ ...newGuardData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
                                <input type="tel" placeholder="e.g., 9876543210" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newGuardData.phone} onChange={e => setNewGuardData({ ...newGuardData, phone: e.target.value })} />
                            </div>
                            <div className="pt-4 border-t mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddGuardModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-ees-red text-white font-bold rounded-lg hover:bg-red-700 transition">Add Guard</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ADD SITE MODAL --- */}
            {showAddSiteModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-ees-navy p-4 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Building2 className="h-5 w-5" /> Add New Site</h2>
                            <button onClick={() => setShowAddSiteModal(false)} className="hover:text-ees-red transition"><X className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleAddSite} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Site Name *</label>
                                <input required type="text" placeholder="e.g., Eastwood Exports" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newSiteData.name} onChange={e => setNewSiteData({ ...newSiteData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                                <input type="text" placeholder="e.g., Sector 13, Moradabad" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newSiteData.address} onChange={e => setNewSiteData({ ...newSiteData, address: e.target.value })} />
                            </div>

                            {/* NEW: SHIFT MODE SELECTION */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Site Operating Shift Mode</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red bg-white"
                                    value={newSiteData.shift_mode}
                                    onChange={e => setNewSiteData({ ...newSiteData, shift_mode: Number(e.target.value) })}
                                >
                                    <option value={12}>12-Hour Shifts (Day/Night)</option>
                                    <option value={8}>8-Hour Shifts (Morning/Day/Night)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Latitude</label>
                                    <input type="text" placeholder="e.g., 28.8386" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newSiteData.lat} onChange={e => setNewSiteData({ ...newSiteData, lat: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Longitude</label>
                                    <input type="text" placeholder="e.g., 78.7733" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newSiteData.lng} onChange={e => setNewSiteData({ ...newSiteData, lng: e.target.value })} />
                                </div>
                            </div>
                            <div className="pt-4 border-t mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddSiteModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-ees-red text-white font-bold rounded-lg hover:bg-red-700 transition">Save Site</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MANAGE TEAM MODAL (WITH SHIFT SLOTS) --- */}
            {showManageTeamModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-ees-navy p-4 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5" /> Appoint Guards</h2>
                                <p className="text-xs text-blue-200 mt-1">Site Mode: {selectedSite?.shift_mode}-Hour Shifts</p>
                            </div>
                            <button onClick={() => setShowManageTeamModal(false)} className="hover:text-ees-red transition"><X className="h-6 w-6" /></button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3 bg-gray-50">
                            {allGuards.length === 0 && <p className="text-center text-gray-400">No active guards found.</p>}

                            {allGuards.map(guard => {
                                const isAssigned = !!assignedGuardsMap[guard.id];
                                return (
                                    <div key={guard.id} className={`flex flex-col p-3 rounded-xl border transition ${isAssigned ? 'bg-white border-ees-red shadow-sm' : 'bg-white border-gray-200 hover:border-ees-red'}`}>

                                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleGuardAssignment(guard)}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isAssigned ? 'bg-ees-red' : 'bg-gray-400'}`}>
                                                    {guard.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-800">{guard.name}</span>
                                            </div>
                                            {isAssigned ? <CheckSquare className="text-ees-red h-6 w-6" /> : <Square className="text-gray-300 h-6 w-6" />}
                                        </div>

                                        {/* SHIFT SELECTION DROPDOWN (Only visible if assigned) */}
                                        {isAssigned && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1"><Clock className="h-4 w-4" /> Assigned Slot:</label>
                                                <select
                                                    className="border border-gray-300 rounded-md p-1.5 text-sm outline-none focus:border-ees-red font-semibold text-ees-navy bg-gray-50"
                                                    value={assignedGuardsMap[guard.id].shift_slot}
                                                    onChange={(e) => updateGuardShiftSlot(guard.id, e.target.value)}
                                                >
                                                    {selectedSite?.shift_mode === 8 ? (
                                                        <>
                                                            <option value="Morning">Morning (3 AM - 11 AM)</option>
                                                            <option value="Day">Day (11 AM - 7 PM)</option>
                                                            <option value="Night">Night (7 PM - 3 AM)</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="Day">Day (7 AM - 7 PM)</option>
                                                            <option value="Night">Night (7 PM - 7 AM)</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="p-4 border-t bg-white">
                            <button onClick={() => setShowManageTeamModal(false)} className="w-full bg-ees-navy text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition shadow-md">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT SIDEBAR: List of Sites */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 h-auto md:h-screen flex flex-col">
                <div className="p-6 border-b border-gray-200 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-xl font-extrabold text-ees-navy">Active Sites</h2>
                    <button onClick={() => setShowAddSiteModal(true)} className="bg-ees-red text-white p-2 rounded-md hover:bg-red-700 transition shadow-md" title="Add New Site">
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                    {sites.map((site) => (
                        <div key={site.id} onClick={() => handleSiteClick(site)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSite?.id === site.id ? 'bg-ees-navy text-white border-ees-navy shadow-md' : 'bg-gray-50 border-gray-200 hover:border-ees-red text-ees-navy'}`}>
                            <h3 className="font-bold text-lg">{site.name}</h3>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                                <span className={`px-2 py-0.5 rounded font-bold ${site.shift_mode === 8 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {site.shift_mode}Hr Mode
                                </span>
                                <span className="text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {site.address || 'No Addr'}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button onClick={() => setShowAddGuardModal(true)} className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white p-3 rounded-xl hover:bg-gray-900 transition shadow-sm font-bold">
                        <UserPlus className="h-5 w-5" /> Register Guard
                    </button>
                </div>
            </div>

            {/* RIGHT MAIN PANEL */}
            <div className="flex-1 bg-gray-50 h-screen overflow-y-auto p-4 md:p-8">
                {!selectedSite ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Building2 className="h-24 w-24 mb-4 opacity-20" />
                        <h2 className="text-2xl font-bold">Select a site to view details</h2>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-extrabold text-ees-navy">{selectedSite.name}</h1>
                                <p className="text-gray-500 mt-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedSite.address}</p>
                            </div>
                            <button className="text-gray-500 hover:text-ees-navy border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition">
                                <Settings className="h-4 w-4" /> Edit Rules
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Checkpoints & QR Generator (Same as before) */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-ees-navy flex items-center gap-2"><QrCode className="h-5 w-5 text-ees-red" /> Patrol Checkpoints</h2>
                                </div>
                                <form onSubmit={handleAddCheckpoint} className="flex gap-2 mb-6">
                                    <input type="text" placeholder="e.g., Back Boundary Wall" value={newCheckpointName} onChange={(e) => setNewCheckpointName(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-ees-red" />
                                    <button type="submit" className="bg-ees-navy text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">Add</button>
                                </form>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {checkpoints.map(cp => (
                                        <div key={cp.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white p-1 border rounded shadow-sm"><QRCodeSVG value={cp.id} size={50} /></div>
                                                <div><p className="font-bold text-ees-navy">{cp.name}</p><p className="text-xs text-gray-500 font-mono mt-1">ID: {cp.id.substring(0, 8)}...</p></div>
                                            </div>
                                            <button onClick={() => printQRCode(cp.id, cp.name)} className="text-ees-red hover:bg-red-50 p-2 rounded-lg transition"><Printer className="h-5 w-5" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Appointed Guards (UI Layout) */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-ees-navy flex items-center gap-2">
                                        <Users className="h-5 w-5 text-ees-red" /> Appointed Guards
                                    </h2>
                                    <button onClick={openManageTeamModal} className="text-sm bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                                        Manage Team
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {siteGuards.length === 0 && <p className="text-gray-400 text-sm">No guards assigned yet.</p>}
                                    {siteGuards.map((g) => (
                                        <div key={g.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 ${g.is_clocked_in ? 'border-2 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] bg-gray-100' : 'bg-ees-navy text-white'}`}>
                                                {g.is_clocked_in && g.active_selfie ? (
                                                    <img src={g.active_selfie} alt="Live Duty" className="w-full h-full object-cover" />
                                                ) : (
                                                    g.name.charAt(0)
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-extrabold text-gray-800">{g.name}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {g.phone || 'N/A'}</p>

                                                {/* NEW: Shift Count & Live Status */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold border border-gray-200">
                                                        {g.completed_shifts || 0} SHIFTS DONE
                                                    </span>
                                                    {g.is_clocked_in ? (
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold border border-green-200 flex items-center gap-1 shadow-sm">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> ON DUTY
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-1 rounded font-bold border border-gray-200">
                                                            OFF DUTY
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 text-center">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Shift Slot</p>
                                                <p className="text-sm font-bold text-ees-navy">{g.shift_slot}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}