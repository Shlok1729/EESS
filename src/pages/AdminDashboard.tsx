import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Users, QrCode, Plus, Printer, MapPin, X, CheckSquare, Square, UserPlus, Phone, Clock, Link as LinkIcon, ShieldAlert, Activity, CheckCircle, Download, LogOut } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';


export default function AdminDashboard() {
    const [showCpAssignModal, setShowCpAssignModal] = useState(false);
    const [activeCpForAssign, setActiveCpForAssign] = useState<any | null>(null);
    const [cpAssignmentsMap, setCpAssignmentsMap] = useState<Record<string, string[]>>({});
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSite, setSelectedSite] = useState<any | null>(null);
    const [patrolLogs, setPatrolLogs] = useState<any[]>([]);
    const [showAllLivePatrols, setShowAllLivePatrols] = useState(false);

    const [siteGuards, setSiteGuards] = useState<any[]>([]);
    const [checkpoints, setCheckpoints] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [showAllQrCheckpoints, setShowAllQrCheckpoints] = useState(false);

    const [newCheckpointName, setNewCheckpointName] = useState('');

    // --- MODALS STATE ---
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);
    const [showManageTeamModal, setShowManageTeamModal] = useState(false);
    const [showAddGuardModal, setShowAddGuardModal] = useState(false);

    // --- MANAGE TEAM & GUARD STATE ---
    const [allGuards, setAllGuards] = useState<any[]>([]);
    // Using an object to store assignment details { [guard_id]: { shift_slot: 'Day' } }
    const [assignedGuardsMap, setAssignedGuardsMap] = useState<Record<string, any>>({});

    const [newSiteData, setNewSiteData] = useState({ name: '', address: '', lat: '', lng: '', radius: 100, shift_mode: 12, client_email: '' });
    const [newGuardData, setNewGuardData] = useState({ name: '', phone: '' });
    const navigate = useNavigate(); // Add this line

    // Add this Auth Checker useEffect right here at the top
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/admin/login'); // Kick them out if not logged in!
            }
        });
    }, [navigate]);


    useEffect(() => {
        fetchSites();
    }, []);
    // REAL-TIME LISTENER FOR ATTENDANCE & PATROLS
    useEffect(() => {
        if (!selectedSite) return;
        const realtimeChannel = supabase.channel('live-site-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs', filter: `site_id=eq.${selectedSite.id}` },
                () => handleSiteClick(selectedSite)
            )
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patrol_logs' },
                () => handleSiteClick(selectedSite) // Refresh when a new QR scan happens!
            )
            .subscribe();

        return () => { supabase.removeChannel(realtimeChannel); };
    }, [selectedSite]);

    const fetchSites = async () => {
        setLoading(true);
        const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false });
        if (data) setSites(data);
        setLoading(false);
    };
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const handleSiteClick = async (site: any) => {
        setSelectedSite(site);

        // Fetch Checkpoints
        const { data: cpData } = await supabase.from('checkpoints').select('*').eq('site_id', site.id);
        // 2. Fetch Checkpoint Assignments (Who scans what)
        const cpIds = (cpData || []).map((c: any) => c.id);
        if (cpIds.length > 0) {
            const { data: cpAssigData } = await supabase.from('checkpoint_assignments').select('*').in('checkpoint_id', cpIds);
            const cpMap: Record<string, string[]> = {};
            cpAssigData?.forEach((row: any) => {
                if (!cpMap[row.checkpoint_id]) cpMap[row.checkpoint_id] = [];
                cpMap[row.checkpoint_id].push(row.guard_id);
            });
            setCpAssignmentsMap(cpMap);
        } else {
            setCpAssignmentsMap({});
        }
        // Fetch recent patrol logs for these checkpoints
        if (cpIds.length > 0) {
            const { data: pLogs } = await supabase.from('patrol_logs').select('*').in('checkpoint_id', cpIds).order('scanned_at', { ascending: false });
            setPatrolLogs(pLogs || []);
        } else {
            setPatrolLogs([]);
        }
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
                .select('guard_id, status, selfie_url,clock_in_time')
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
                    active_selfie: activeSelfie, // <-- We added this
                    clock_in_time: activeLog ? (activeLog as any).clock_in_time : null
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

        const { data } = await supabase.from('sites').insert([{
            name: newSiteData.name,
            address: newSiteData.address,
            lat: parseFloat(newSiteData.lat) || null,
            lng: parseFloat(newSiteData.lng) || null,
            radius_meters: newSiteData.radius,
            shift_mode: newSiteData.shift_mode, // Save 8 or 12 hr mode
            client_email: newSiteData.client_email || null
        }]).select();

        if (data && data.length > 0) {
            setSites([data[0], ...sites]);
            setShowAddSiteModal(false);
            setNewSiteData({ name: '', address: '', lat: '', lng: '', radius: 100, shift_mode: 12, client_email: '' });
            handleSiteClick(data[0]);
        } else {
            alert("Failed to add site. Check console.");
        }
    };

    const handleAddGuard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGuardData.name) return;

        const { data } = await supabase.from('guards').insert([{ name: newGuardData.name, phone: newGuardData.phone, status: 'active' }]).select();
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
        // 1. Get the names of the guards assigned to this QR
        const assignedIds = cpAssignmentsMap[checkpointId] || [];
        const guardNames = assignedIds.map(id => siteGuards.find(g => g.id === id)?.name).filter(Boolean).join(', ') || 'None assigned';

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
        <html>
            <head>
            <title>Print QR - ${checkpointName}</title>
            <style>
                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                .qr-container { border: 2px solid #000; padding: 30px; border-radius: 10px; text-align: center; max-width: 350px; }
                h2 { margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
                p { margin-top: 0; color: #555; }
                .guards-box { margin-top: 20px; padding-top: 15px; border-top: 2px dashed #ccc; font-weight: bold; font-size: 14px; color: #000; }
                .guard-names { font-weight: normal; font-size: 16px; color: #333; margin-top: 5px; display: block; line-height: 1.4; }
            </style>
            </head>
            <body>
            <div class="qr-container">
                <h2>EAGLE EYE SECURITY</h2>
                <p style="font-size: 18px; font-weight: bold; color: #000; margin-bottom: 20px;">${checkpointName}</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${checkpointId}" alt="QR" />
                <p style="font-size: 10px; margin-top: 10px; font-family: monospace;">ID: ${checkpointId}</p>
                <div class="guards-box">
                    Authorized Personnel:<br/>
                    <span class="guard-names">${guardNames}</span>
                </div>
            </div>
            <script>
                // We add a tiny delay to ensure the QR image loads before the print dialog opens
                window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
            </script>
            </body>
        </html>
        `);
        printWindow.document.close();
    };

    const downloadQRCode = (checkpointId: string, checkpointName: string) => {
        // Find assigned guards names
        const assignedIds = cpAssignmentsMap[checkpointId] || [];
        const guardNames = assignedIds.map(id => siteGuards.find(g => g.id === id)?.name).filter(Boolean).join(', ') || 'None assigned';

        // We create an invisible HTML Canvas to draw the image + text!
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 550;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw Header Text
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('EAGLE EYE SECURITY', 200, 50);

        ctx.font = '18px sans-serif';
        ctx.fillText(`Checkpoint: ${checkpointName}`, 200, 85);

        // 3. Load QR Image and draw it
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${checkpointId}`;

        img.onload = () => {
            // Draw QR
            ctx.drawImage(img, 75, 110, 250, 250);

            // Draw Checkpoint UUID
            ctx.font = '12px monospace';
            ctx.fillStyle = '#666666';
            ctx.fillText(`ID: ${checkpointId}`, 200, 390);

            // Draw Assigned Guards List
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('Authorized Personnel:', 200, 430);

            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#333333';

            // Quick word-wrap logic so names don't flow off the image
            const maxWidth = 340;
            const words = guardNames.split(', ');
            let line = '';
            let y = 460;

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + (n < words.length - 1 ? ', ' : '');
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, 200, y);
                    line = words[n] + (n < words.length - 1 ? ', ' : '');
                    y += 25;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 200, y);

            // 4. Trigger the Download!
            const link = document.createElement('a');
            link.download = `EES_QR_${checkpointName.replace(/\\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-xl text-ees-navy">Loading HQ...</div>;
    const toggleCpAssignment = async (guardId: string) => {
        if (!activeCpForAssign) return;
        const cpId = activeCpForAssign.id;
        const assignedList = cpAssignmentsMap[cpId] || [];
        const isAssigned = assignedList.includes(guardId);

        if (isAssigned) {
            await supabase.from('checkpoint_assignments').delete().match({ checkpoint_id: cpId, guard_id: guardId });
            setCpAssignmentsMap({ ...cpAssignmentsMap, [cpId]: assignedList.filter(id => id !== guardId) });
        } else {
            await supabase.from('checkpoint_assignments').insert([{ checkpoint_id: cpId, guard_id: guardId }]);
            setCpAssignmentsMap({ ...cpAssignmentsMap, [cpId]: [...assignedList, guardId] });
        }
    };
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative">

            {/* --- ADD NEW GUARD MODAL --- */}
            {showAddGuardModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-ees-navy p-3 sm:p-4 flex justify-between items-center text-white">
                            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2"><UserPlus className="h-5 w-5" /> Register Guard</h2>
                            <button onClick={() => setShowAddGuardModal(false)} className="hover:text-ees-red transition"><X className="h-5 w-5 sm:h-6 sm:w-6" /></button>
                        </div>
                        <form onSubmit={handleAddGuard} className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                                <input required type="text" placeholder="e.g., Ajay Kumar" className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 outline-none focus:border-ees-red text-sm sm:text-base" value={newGuardData.name} onChange={e => setNewGuardData({ ...newGuardData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
                                <input type="tel" placeholder="e.g., 9876543210" className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 outline-none focus:border-ees-red text-sm sm:text-base" value={newGuardData.phone} onChange={e => setNewGuardData({ ...newGuardData, phone: e.target.value })} />
                            </div>
                            <div className="pt-4 border-t mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                                <button type="button" onClick={() => setShowAddGuardModal(false)} className="w-full sm:w-auto px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition text-sm sm:text-base">Cancel</button>
                                <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-ees-red text-white font-bold rounded-lg hover:bg-red-700 transition text-sm sm:text-base">Add Guard</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ADD SITE MODAL --- */}
            {showAddSiteModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-ees-navy p-3 sm:p-4 flex justify-between items-center text-white">
                            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2"><Building2 className="h-5 w-5" /> Add New Site</h2>
                            <button onClick={() => setShowAddSiteModal(false)} className="hover:text-ees-red transition"><X className="h-5 w-5 sm:h-6 sm:w-6" /></button>
                        </div>
                        <form onSubmit={handleAddSite} className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Site Name *</label>
                                <input required type="text" placeholder="e.g., Eastwood Exports" className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 outline-none focus:border-ees-red text-sm sm:text-base" value={newSiteData.name} onChange={e => setNewSiteData({ ...newSiteData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                                <input type="text" placeholder="e.g., Sector 13, Moradabad" className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 outline-none focus:border-ees-red text-sm sm:text-base" value={newSiteData.address} onChange={e => setNewSiteData({ ...newSiteData, address: e.target.value })} />
                            </div>
                            {/* --- NEW: CLIENT EMAIL INPUT --- */}
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">Client Email (For Portal Access)</label>
                                <input
                                    type="email"
                                    placeholder="e.g., manager@kaumo.com"
                                    className="w-full bg-gray-50 border border-gray-600 text-white rounded-lg p-3 outline-none focus:border-ees-red placeholder-gray-500"
                                    value={newSiteData.client_email}
                                    onChange={e => setNewSiteData({ ...newSiteData, client_email: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave blank if client portal access is not needed yet.</p>
                            </div>


                            {/* SHIFT MODE SELECTION */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Site Operating Shift Mode</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 outline-none focus:border-ees-red bg-white text-sm sm:text-base"
                                    value={newSiteData.shift_mode}
                                    onChange={e => setNewSiteData({ ...newSiteData, shift_mode: Number(e.target.value) })}
                                >
                                    <option value={12}>12-Hour Shifts (Day/Night)</option>
                                    <option value={8}>8-Hour Shifts (Morning/Day/Night)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Latitude</label>
                                    <input type="text" placeholder="e.g., 28.8386" className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 outline-none focus:border-ees-red text-sm sm:text-base" value={newSiteData.lat} onChange={e => setNewSiteData({ ...newSiteData, lat: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Longitude</label>
                                    <input type="text" placeholder="e.g., 78.7733" className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 outline-none focus:border-ees-red text-sm sm:text-base" value={newSiteData.lng} onChange={e => setNewSiteData({ ...newSiteData, lng: e.target.value })} />
                                </div>
                            </div>
                            <div className="pt-4 border-t mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                                <button type="button" onClick={() => setShowAddSiteModal(false)} className="w-full sm:w-auto px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition text-sm sm:text-base">Cancel</button>
                                <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-ees-red text-white font-bold rounded-lg hover:bg-red-700 transition text-sm sm:text-base">Save Site</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ASSIGN GUARDS TO CHECKPOINT MODAL --- */}
            {showCpAssignModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-ees-navy p-3 sm:p-4 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold">Assign to QR</h2>
                                <p className="text-[10px] sm:text-xs text-blue-200 mt-1">Checkpoint: {activeCpForAssign?.name}</p>
                            </div>
                            <button onClick={() => setShowCpAssignModal(false)} className="hover:text-ees-red transition"><X className="h-5 w-5 sm:h-6 sm:w-6" /></button>
                        </div>
                        <div className="p-3 sm:p-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto space-y-2">
                            {siteGuards.length === 0 && <p className="text-center text-gray-400 text-sm">No guards assigned to this site yet.</p>}

                            {siteGuards.map(guard => {
                                const isAssigned = (cpAssignmentsMap[activeCpForAssign?.id] || []).includes(guard.id);
                                return (
                                    <div key={guard.id} onClick={() => toggleCpAssignment(guard.id)} className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border cursor-pointer transition ${isAssigned ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-base ${isAssigned ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                                {guard.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-800 text-sm sm:text-base">{guard.name}</span>
                                        </div>
                                        {isAssigned ? <CheckSquare className="text-blue-600 h-5 w-5 sm:h-6 sm:w-6" /> : <Square className="text-gray-300 h-5 w-5 sm:h-6 sm:w-6" />}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-3 sm:p-4 border-t bg-gray-50">
                            <button onClick={() => setShowCpAssignModal(false)} className="w-full bg-ees-navy text-white font-bold py-2.5 sm:py-3 rounded-xl hover:bg-gray-800 transition text-sm sm:text-base">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MANAGE TEAM MODAL (WITH SHIFT SLOTS) --- */}
            {showManageTeamModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="bg-ees-navy p-3 sm:p-4 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2"><Users className="h-4 w-4 sm:h-5 sm:w-5" /> Appoint Guards</h2>
                                <p className="text-[10px] sm:text-xs text-blue-200 mt-1">Site Mode: {selectedSite?.shift_mode}-Hour Shifts</p>
                            </div>
                            <button onClick={() => setShowManageTeamModal(false)} className="hover:text-ees-red transition"><X className="h-5 w-5 sm:h-6 sm:w-6" /></button>
                        </div>
                        <div className="p-3 sm:p-4 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto space-y-3 bg-gray-50">
                            {allGuards.length === 0 && <p className="text-center text-gray-400 text-sm">No active guards found.</p>}

                            {allGuards.map(guard => {
                                const isAssigned = !!assignedGuardsMap[guard.id];
                                return (
                                    <div key={guard.id} className={`flex flex-col p-2.5 sm:p-3 rounded-xl border transition ${isAssigned ? 'bg-white border-ees-red shadow-sm' : 'bg-white border-gray-200 hover:border-ees-red'}`}>

                                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleGuardAssignment(guard)}>
                                            <div className="flex items-center gap-2.5 sm:gap-3">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-base ${isAssigned ? 'bg-ees-red' : 'bg-gray-400'}`}>
                                                    {guard.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-800 text-sm sm:text-base">{guard.name}</span>
                                            </div>
                                            {isAssigned ? <CheckSquare className="text-ees-red h-5 w-5 sm:h-6 sm:w-6" /> : <Square className="text-gray-300 h-5 w-5 sm:h-6 sm:w-6" />}
                                        </div>

                                        {/* SHIFT SELECTION DROPDOWN */}
                                        {isAssigned && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <label className="text-xs sm:text-sm font-semibold text-gray-600 flex items-center gap-1"><Clock className="h-3 w-3 sm:h-4 sm:w-4" /> Assigned Slot:</label>
                                                <select
                                                    className="w-full sm:w-auto border border-gray-300 rounded-md p-1.5 text-xs sm:text-sm outline-none focus:border-ees-red font-semibold text-ees-navy bg-gray-50"
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
                        <div className="p-3 sm:p-4 border-t bg-white">
                            <button onClick={() => setShowManageTeamModal(false)} className="w-full bg-ees-navy text-white font-bold py-2.5 sm:py-3 rounded-xl hover:bg-gray-800 transition shadow-md text-sm sm:text-base">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT SIDEBAR: List of Sites */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-b md:border-b-0 md:border-r border-gray-200 shrink-0 md:h-screen flex flex-col">
                <div className="p-4 sm:p-6 border-b border-gray-200 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-extrabold text-ees-navy">Active Sites</h2>
                    <button onClick={() => setShowAddSiteModal(true)} className="bg-ees-red text-white p-2 rounded-md hover:bg-red-700 transition shadow-md" title="Add New Site">
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                {/* Horizontal scroll on mobile, Vertical on Desktop */}
                <div className="p-4 flex gap-3 overflow-x-auto md:flex-col md:overflow-y-auto md:space-y-3 md:gap-0 scrollbar-hide flex-1 bg-gray-50 md:bg-transparent">
                    {sites.map((site) => (
                        <div key={site.id} onClick={() => handleSiteClick(site)} className={`shrink-0 w-64 md:w-auto p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${selectedSite?.id === site.id ? 'bg-ees-navy text-white border-ees-navy shadow-md' : 'bg-white md:bg-gray-50 border-gray-200 hover:border-ees-red text-ees-navy'}`}>
                            <h3 className="font-bold text-base sm:text-lg truncate">{site.name}</h3>
                            <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-xs">
                                <span className={`px-2 py-0.5 rounded font-bold ${site.shift_mode === 8 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {site.shift_mode}Hr Mode
                                </span>
                                <span className="text-gray-400 flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{site.address || 'No Addr'}</span></span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-50 space-y-3">
                    <button onClick={() => setShowAddGuardModal(true)} className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-white p-3 rounded-xl hover:bg-gray-700 transition shadow-sm font-bold">
                        <UserPlus className="h-5 w-5 text-ees-red" /> Register Guard
                    </button>

                    {/* NEW: SECURE LOGOUT BUTTON */}
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-900/20 border border-red-900/30 text-red-400 p-3 rounded-xl hover:bg-red-900/40 transition shadow-sm font-bold">
                        <LogOut className="h-5 w-5" /> Secure Logout
                    </button>
                </div>
            </div>

            {/* RIGHT MAIN PANEL */}
            <div className="flex-1 bg-gray-50 h-auto md:h-screen overflow-y-auto p-4 md:p-8">
                {!selectedSite ? (
                    <div className="h-[50vh] md:h-full flex flex-col items-center justify-center text-gray-400">
                        <Building2 className="h-16 w-16 sm:h-24 sm:w-24 mb-4 opacity-20" />
                        <h2 className="text-xl sm:text-2xl font-bold text-center">Select a site to view details</h2>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in-up">

                        {/* Site Title Header */}
                        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 items-start">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-ees-navy">{selectedSite.name}</h1>
                                <p className="text-gray-500 mt-1 sm:mt-2 flex items-start sm:items-center gap-1.5 text-xs sm:text-sm">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" /> {selectedSite.address}
                                </p>
                            </div>
                            {/* <button className="text-gray-500 hover:text-ees-navy border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 transition text-sm sm:text-base w-full sm:w-auto justify-center">
                                <Settings className="h-4 w-4 shrink-0" /> Edit Rules
                            </button> */}
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                            {/* Checkpoints & QR Generator */}
                            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                                    <h2 className="text-lg sm:text-xl font-bold text-ees-navy flex items-center gap-2">
                                        <QrCode className="h-5 w-5 text-ees-red shrink-0" /> Patrol Checkpoints
                                    </h2>
                                </div>

                                <form onSubmit={handleAddCheckpoint} className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
                                    <input type="text" placeholder="e.g., Back Boundary Wall" value={newCheckpointName} onChange={(e) => setNewCheckpointName(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2 outline-none focus:border-ees-red text-sm sm:text-base" />
                                    <button type="submit" className="bg-ees-navy text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition font-bold text-sm sm:text-base">Add</button>
                                </form>

                                <div className="space-y-3 sm:space-y-4 pr-1 sm:pr-2">
                                    {checkpoints.length === 0 ? (
                                        <p className="text-gray-500 text-sm text-center py-4">No checkpoints added yet.</p>
                                    ) : null}

                                    {(showAllQrCheckpoints ? checkpoints : checkpoints.slice(0, 5)).map(cp => {
                                        const assignedIds = cpAssignmentsMap[cp.id] || [];
                                        const assignedNames = assignedIds.map(id => siteGuards.find(g => g.id === id)?.name).filter(Boolean);

                                        return (
                                            <div key={cp.id} className="flex flex-col p-3 sm:p-4 bg-gray-50 border border-gray-200 sm:border-gray-700 rounded-xl">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div className="bg-white p-1 border border-gray-300 rounded shadow-sm shrink-0">
                                                            <QRCodeSVG value={cp.id} size={40} className="sm:w-[50px] sm:h-[50px]" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-black text-sm sm:text-base truncate">{cp.name}</p>
                                                            <p className="text-[10px] sm:text-xs text-gray-500 sm:text-gray-800 font-mono mt-0.5 sm:mt-1 truncate">ID: {cp.id.substring(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                                                        <button onClick={() => { setActiveCpForAssign(cp); setShowCpAssignModal(true); }} className="text-blue-500 sm:text-blue-400 bg-blue-50 sm:bg-transparent hover:bg-blue-100 sm:hover:bg-blue-900/30 p-1.5 sm:p-2 rounded-lg transition flex-1 sm:flex-none flex justify-center" title="Assign Guards to this QR">
                                                            <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </button>
                                                        <button onClick={() => downloadQRCode(cp.id, cp.name)} className="text-green-500 sm:text-green-400 bg-green-50 sm:bg-transparent hover:bg-green-100 sm:hover:bg-green-900/30 p-1.5 sm:p-2 rounded-lg transition flex-1 sm:flex-none flex justify-center" title="Download QR as Image">
                                                            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </button>
                                                        <button onClick={() => printQRCode(cp.id, cp.name)} className="text-ees-red bg-red-50 sm:bg-transparent hover:bg-red-100 sm:hover:bg-red-900/30 p-1.5 sm:p-2 rounded-lg transition flex-1 sm:flex-none flex justify-center" title="Print QR Code">
                                                            <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-200 sm:border-gray-800 flex flex-wrap gap-1.5 sm:gap-2">
                                                    {assignedNames.length > 0 ? (
                                                        assignedNames.map((n, i) => (
                                                            <span key={i} className="text-[9px] sm:text-[10px] font-bold bg-blue-50 sm:bg-blue-900/30 text-blue-800 sm:text-black border border-blue-200 sm:border-blue-800 px-2 py-1 rounded">
                                                                {n}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 sm:text-gray-500 bg-white sm:bg-gray-50 px-2 py-1 rounded border border-gray-100 sm:border-none">
                                                            No guards linked yet
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {/* Toggle Button Footer */}
                                    {checkpoints.length > 5 && (
                                        <div className="pt-3 flex justify-center mt-2">
                                            <button
                                                onClick={() => setShowAllQrCheckpoints(!showAllQrCheckpoints)}
                                                className="text-sm font-bold text-ees-navy hover:text-ees-red transition-colors px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 bg-gray-50 shadow-sm"
                                            >
                                                {showAllQrCheckpoints ? 'Show Less' : `See All Checkpoints (${checkpoints.length})`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Appointed Guards Layout */}
                            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                                    <h2 className="text-lg sm:text-xl font-bold text-ees-navy flex items-center gap-2">
                                        <Users className="h-5 w-5 text-ees-red shrink-0" /> Appointed Guards
                                    </h2>
                                    <button onClick={openManageTeamModal} className="text-xs sm:text-sm bg-blue-50 text-blue-600 font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-100 transition w-full sm:w-auto text-center">
                                        Manage Team
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
                                    {siteGuards.length === 0 && <p className="text-gray-400 text-sm">No guards assigned yet.</p>}
                                    {siteGuards.map((g) => {
                                        const assignedCpCount = Object.values(cpAssignmentsMap).filter((guardsList) => guardsList.includes(g.id)).length;

                                        return (
                                            <div key={g.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm relative">

                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg overflow-hidden shrink-0 ${g.is_clocked_in ? 'border-2 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] bg-gray-100' : 'bg-ees-navy text-white'}`}>
                                                        {g.is_clocked_in && g.active_selfie ? (
                                                            <img src={g.active_selfie} alt="Live Duty" className="w-full h-full object-cover" />
                                                        ) : (
                                                            g.name.charAt(0)
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0 pr-16 sm:pr-0">
                                                        <p className="font-extrabold text-gray-800 text-sm sm:text-base truncate">{g.name}</p>
                                                        <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3 shrink-0" /> {g.phone || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                {/* Badges Row - wraps below name on mobile */}
                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 sm:mt-0 sm:flex-1">
                                                    <span className="text-[9px] sm:text-[10px] bg-gray-100 text-gray-600 px-1.5 py-1 sm:px-2 sm:py-1 rounded font-bold border border-gray-200 whitespace-nowrap">
                                                        {g.completed_shifts || 0} SHIFTS
                                                    </span>

                                                    <span className={`text-[9px] sm:text-[10px] px-1.5 py-1 sm:px-2 sm:py-1 rounded font-bold border flex items-center gap-1 whitespace-nowrap ${assignedCpCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                        <QrCode className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> {assignedCpCount} QR
                                                    </span>

                                                    {g.is_clocked_in ? (
                                                        <span className="text-[9px] sm:text-[10px] bg-green-100 text-green-700 px-1.5 py-1 sm:px-2 sm:py-1 rounded font-bold border border-green-200 flex items-center gap-1 shadow-sm whitespace-nowrap">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0"></span> ON DUTY
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] sm:text-[10px] bg-gray-100 text-gray-400 px-1.5 py-1 sm:px-2 sm:py-1 rounded font-bold border border-gray-200 whitespace-nowrap">
                                                            OFF DUTY
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Shift Slot - Absolute Top Right on Mobile */}
                                                <div className="absolute top-3 right-3 sm:relative sm:top-0 sm:right-0 bg-gray-50 sm:bg-gray-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-200 text-center shrink-0">
                                                    <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Slot</p>
                                                    <p className="text-xs sm:text-sm font-bold text-ees-navy">{g.shift_slot}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* --- LIVE PATROL MONITORING PANEL --- */}
                        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mt-6 sm:mt-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                                <h2 className="text-lg sm:text-xl font-bold text-ees-navy flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-ees-red shrink-0" /> Live Patrol Monitoring
                                </h2>
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 bg-gray-50 sm:bg-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-lg border border-gray-200 self-start sm:self-auto">
                                    Site Interval: {selectedSite.patrol_interval_mins} Mins
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {siteGuards.filter(g => g.is_clocked_in).length === 0 && (
                                    <p className="text-gray-400 text-sm col-span-full">No guards currently on duty to monitor.</p>
                                )}

                                {siteGuards.filter(g => g.is_clocked_in).map(g => {
                                    const guardScans = patrolLogs.filter(log => log.guard_id === g.id);
                                    const lastScan = guardScans.length > 0 ? guardScans[0] : null;
                                    const lastActivityTime = lastScan ? new Date(lastScan.scanned_at) : new Date(g.clock_in_time);
                                    const diffMins = Math.floor((new Date().getTime() - lastActivityTime.getTime()) / 60000);
                                    const intervalLimit = selectedSite.patrol_interval_mins || 60;
                                    const isAtRisk = diffMins > intervalLimit;
                                    const activeMonitoredGuards = siteGuards.filter(g => g.is_clocked_in);

                                    return (
                                        <div className="w-full">
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {activeMonitoredGuards.length === 0 && (
                                                    <p className="text-gray-400 text-sm col-span-full py-4 text-center">No guards currently on duty to monitor.</p>
                                                )}

                                                {(showAllLivePatrols ? activeMonitoredGuards : activeMonitoredGuards.slice(0, 6)).map(g => {
                                                    const guardScans = patrolLogs.filter(log => log.guard_id === g.id);
                                                    const lastScan = guardScans.length > 0 ? guardScans[0] : null;
                                                    const lastActivityTime = lastScan ? new Date(lastScan.scanned_at) : new Date(g.clock_in_time);
                                                    const diffMins = Math.floor((new Date().getTime() - lastActivityTime.getTime()) / 60000);



                                                    return (
                                                        <div key={g.id} className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${isAtRisk ? 'bg-red-50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-gray-50 border-gray-200'}`}>
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 shrink-0">
                                                                        {g.active_selfie ? <img src={g.active_selfie} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-ees-navy text-white flex items-center justify-center font-bold text-xs">{g.name.charAt(0)}</div>}
                                                                    </div>
                                                                    <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{g.name}</p>
                                                                </div>
                                                                {isAtRisk ? <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 animate-pulse shrink-0" /> : <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 shrink-0" />}
                                                            </div>

                                                            <div className="space-y-1">
                                                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase">Latest Activity:</p>
                                                                {lastScan ? (
                                                                    <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">Scanned ID: {lastScan.checkpoint_id.substring(0, 8)}</p>
                                                                ) : (
                                                                    <p className="text-xs sm:text-sm font-semibold text-gray-800">Clocked In (No scans yet)</p>
                                                                )}

                                                                <div className={`mt-2 sm:mt-3 p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-sm font-bold flex items-center justify-between ${isAtRisk ? 'bg-red-600 text-white' : 'bg-green-100 text-green-700'}`}>
                                                                    <span>{isAtRisk ? 'PATROL MISSED!' : 'ON TRACK'}</span>
                                                                    <span>{diffMins} mins ago</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {/* Toggle Button Footer */}
                                            {activeMonitoredGuards.length > 6 && (
                                                <div className="pt-4 flex justify-center mt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => setShowAllLivePatrols(!showAllLivePatrols)}
                                                        className="text-sm font-bold text-ees-navy hover:text-ees-red transition-colors px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 bg-gray-50 shadow-sm"
                                                    >
                                                        {showAllLivePatrols ? 'Show Less' : `See All Monitored Guards (${activeMonitoredGuards.length})`}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

// import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { Building2, Users, QrCode, Plus, Printer, MapPin, Settings, X, CheckSquare, Square, UserPlus, Phone, Clock, Link as LinkIcon, ShieldAlert, Activity, Link2, CheckCircle } from 'lucide-react';
// import { QRCodeSVG } from 'qrcode.react';


// export default function AdminDashboard() {
//     const [showCpAssignModal, setShowCpAssignModal] = useState(false);
//     const [activeCpForAssign, setActiveCpForAssign] = useState<any | null>(null);
//     const [cpAssignmentsMap, setCpAssignmentsMap] = useState<Record<string, string[]>>({});
//     const [sites, setSites] = useState<any[]>([]);
//     const [selectedSite, setSelectedSite] = useState<any | null>(null);
//     const [patrolLogs, setPatrolLogs] = useState<any[]>([]);

//     const [siteGuards, setSiteGuards] = useState<any[]>([]);
//     const [checkpoints, setCheckpoints] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);

//     const [newCheckpointName, setNewCheckpointName] = useState('');

//     // --- MODALS STATE ---
//     const [showAddSiteModal, setShowAddSiteModal] = useState(false);
//     const [showManageTeamModal, setShowManageTeamModal] = useState(false);
//     const [showAddGuardModal, setShowAddGuardModal] = useState(false);

//     // --- MANAGE TEAM & GUARD STATE ---
//     const [allGuards, setAllGuards] = useState<any[]>([]);
//     // Using an object to store assignment details { [guard_id]: { shift_slot: 'Day' } }
//     const [assignedGuardsMap, setAssignedGuardsMap] = useState<Record<string, any>>({});

//     const [newSiteData, setNewSiteData] = useState({ name: '', address: '', lat: '', lng: '', radius: 100, shift_mode: 12 });
//     const [newGuardData, setNewGuardData] = useState({ name: '', phone: '' });

//     useEffect(() => {
//         fetchSites();
//     }, []);
//     // REAL-TIME LISTENER FOR ATTENDANCE & PATROLS
//     useEffect(() => {
//         if (!selectedSite) return;
//         const realtimeChannel = supabase.channel('live-site-updates')
//             .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs', filter: `site_id=eq.${selectedSite.id}` },
//                 () => handleSiteClick(selectedSite)
//             )
//             .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patrol_logs' },
//                 () => handleSiteClick(selectedSite) // Refresh when a new QR scan happens!
//             )
//             .subscribe();

//         return () => { supabase.removeChannel(realtimeChannel); };
//     }, [selectedSite]);

//     const fetchSites = async () => {
//         setLoading(true);
//         const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false });
//         if (data) setSites(data);
//         setLoading(false);
//     };

//     const handleSiteClick = async (site: any) => {
//         setSelectedSite(site);

//         // Fetch Checkpoints
//         const { data: cpData } = await supabase.from('checkpoints').select('*').eq('site_id', site.id);
//         // 2. Fetch Checkpoint Assignments (Who scans what)
//         const cpIds = (cpData || []).map((c: any) => c.id);
//         if (cpIds.length > 0) {
//             const { data: cpAssigData } = await supabase.from('checkpoint_assignments').select('*').in('checkpoint_id', cpIds);
//             const cpMap: Record<string, string[]> = {};
//             cpAssigData?.forEach((row: any) => {
//                 if (!cpMap[row.checkpoint_id]) cpMap[row.checkpoint_id] = [];
//                 cpMap[row.checkpoint_id].push(row.guard_id);
//             });
//             setCpAssignmentsMap(cpMap);
//         } else {
//             setCpAssignmentsMap({});
//         }
//         // Fetch recent patrol logs for these checkpoints
//         if (cpIds.length > 0) {
//             const { data: pLogs } = await supabase.from('patrol_logs').select('*').in('checkpoint_id', cpIds).order('scanned_at', { ascending: false });
//             setPatrolLogs(pLogs || []);
//         } else {
//             setPatrolLogs([]);
//         }
//         setCheckpoints(cpData || []);


//         // Fetch Assigned Guards & Their Shifts
//         const { data: assignments } = await supabase
//             .from('site_assignments')
//             .select('guard_id, shift_slot, guards(*)')
//             .eq('site_id', site.id);

//         if (assignments) {
//             // NEW: Fetch all attendance logs for this site
//             const { data: attendanceData } = await supabase
//                 .from('attendance_logs')
//                 .select('guard_id, status, selfie_url,clock_in_time')
//                 .eq('site_id', site.id);

//             const guardsList = assignments.map((a: any) => {
//                 const guardLogs = attendanceData?.filter(log => log.guard_id === a.guard_id) || [];
//                 const completedShifts = guardLogs.filter(log => log.status === 'clocked_out' || log.status === 'auto_clocked_out').length;

//                 // NEW: Grab the active log and the selfie
//                 const activeLog = guardLogs.find(log => log.status === 'clocked_in');
//                 const isClockedIn = !!activeLog;
//                 const activeSelfie = activeLog ? (activeLog as any).selfie_url : null;




//                 return {
//                     ...a.guards,
//                     shift_slot: a.shift_slot,
//                     completed_shifts: completedShifts,
//                     is_clocked_in: isClockedIn,
//                     active_selfie: activeSelfie, // <-- We added this
//                     clock_in_time: activeLog ? (activeLog as any).clock_in_time : null
//                 };
//             }).filter(Boolean);

//             setSiteGuards(guardsList);

//             const map: Record<string, any> = {};
//             assignments.forEach((a: any) => {
//                 map[a.guard_id] = { shift_slot: a.shift_slot || 'Day' };
//             });
//             setAssignedGuardsMap(map);
//         } else {
//             setSiteGuards([]);
//             setAssignedGuardsMap({});
//         }
//     };

//     const handleAddCheckpoint = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!newCheckpointName || !selectedSite) return;

//         const { data } = await supabase.from('checkpoints').insert([{ site_id: selectedSite.id, name: newCheckpointName }]).select();
//         if (data) {
//             setCheckpoints([...checkpoints, data[0]]);
//             setNewCheckpointName('');
//         }
//     };

//     const handleAddSite = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!newSiteData.name) return;

//         const { data, error } = await supabase.from('sites').insert([{
//             name: newSiteData.name,
//             address: newSiteData.address,
//             lat: parseFloat(newSiteData.lat) || null,
//             lng: parseFloat(newSiteData.lng) || null,
//             radius_meters: newSiteData.radius,
//             shift_mode: newSiteData.shift_mode // Save 8 or 12 hr mode
//         }]).select();

//         if (data && data.length > 0) {
//             setSites([data[0], ...sites]);
//             setShowAddSiteModal(false);
//             setNewSiteData({ name: '', address: '', lat: '', lng: '', radius: 100, shift_mode: 12 });
//             handleSiteClick(data[0]);
//         } else {
//             alert("Failed to add site. Check console.");
//         }
//     };

//     const handleAddGuard = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!newGuardData.name) return;

//         const { data, error } = await supabase.from('guards').insert([{ name: newGuardData.name, phone: newGuardData.phone, status: 'active' }]).select();
//         if (data && data.length > 0) {
//             setShowAddGuardModal(false);
//             setNewGuardData({ name: '', phone: '' });
//             if (showManageTeamModal) setAllGuards([...allGuards, data[0]]);
//             alert("Guard Registered Successfully!");
//         } else {
//             alert("Failed to add guard.");
//         }
//     };

//     const openManageTeamModal = async () => {
//         const { data } = await supabase.from('guards').select('*').ilike('status', 'active');
//         if (data) setAllGuards(data);
//         setShowManageTeamModal(true);
//     };

//     // --- NEW LOGIC: ASSIGN GUARD AND SHIFT SLOT ---
//     const toggleGuardAssignment = async (guard: any) => {
//         if (!selectedSite) return;
//         const isAssigned = !!assignedGuardsMap[guard.id];

//         if (isAssigned) {
//             // Unassign Guard
//             await supabase.from('site_assignments').delete().match({ site_id: selectedSite.id, guard_id: guard.id });
//             const newMap = { ...assignedGuardsMap };
//             delete newMap[guard.id];
//             setAssignedGuardsMap(newMap);
//             setSiteGuards(prev => prev.filter(g => g.id !== guard.id));
//         } else {
//             // Assign Guard with Default Shift (Day)
//             const defaultShift = 'Day';
//             await supabase.from('site_assignments').insert([{ site_id: selectedSite.id, guard_id: guard.id, shift_slot: defaultShift }]);
//             setAssignedGuardsMap({ ...assignedGuardsMap, [guard.id]: { shift_slot: defaultShift } });
//             setSiteGuards(prev => [...prev, { ...guard, shift_slot: defaultShift }]);
//         }
//     };

//     const updateGuardShiftSlot = async (guardId: string, newSlot: string) => {
//         if (!selectedSite) return;

//         // Update UI instantly
//         setAssignedGuardsMap({ ...assignedGuardsMap, [guardId]: { shift_slot: newSlot } });
//         setSiteGuards(prev => prev.map(g => g.id === guardId ? { ...g, shift_slot: newSlot } : g));

//         // Update DB
//         await supabase.from('site_assignments').update({ shift_slot: newSlot }).match({ site_id: selectedSite.id, guard_id: guardId });
//     };

//     const printQRCode = (checkpointId: string, checkpointName: string) => {
//         const printWindow = window.open('', '_blank');
//         if (!printWindow) return;
//         printWindow.document.write(`<html><head><title>Print QR - ${checkpointName}</title><style>body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }.qr-container { border: 2px solid #000; padding: 20px; border-radius: 10px; text-align: center; }h2 { margin-bottom: 5px; }p { margin-top: 0; color: #555; }</style></head><body><div class="qr-container"><h2>EAGLE EYE SECURITY</h2><p>Checkpoint: ${checkpointName}</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${checkpointId}" alt="QR" /><p style="font-size: 10px; margin-top: 10px;">ID: ${checkpointId}</p></div><script>window.onload = () => { window.print(); window.close(); }</script></body></html>`);
//         printWindow.document.close();
//     };

//     if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-xl text-ees-navy">Loading HQ...</div>;
//     const toggleCpAssignment = async (guardId: string) => {
//         if (!activeCpForAssign) return;
//         const cpId = activeCpForAssign.id;
//         const assignedList = cpAssignmentsMap[cpId] || [];
//         const isAssigned = assignedList.includes(guardId);

//         if (isAssigned) {
//             await supabase.from('checkpoint_assignments').delete().match({ checkpoint_id: cpId, guard_id: guardId });
//             setCpAssignmentsMap({ ...cpAssignmentsMap, [cpId]: assignedList.filter(id => id !== guardId) });
//         } else {
//             await supabase.from('checkpoint_assignments').insert([{ checkpoint_id: cpId, guard_id: guardId }]);
//             setCpAssignmentsMap({ ...cpAssignmentsMap, [cpId]: [...assignedList, guardId] });
//         }
//     };
//     return (
//         <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative">

//             {/* --- ADD NEW GUARD MODAL --- */}
//             {showAddGuardModal && (
//                 <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//                     <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
//                         <div className="bg-ees-navy p-4 flex justify-between items-center text-white">
//                             <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus className="h-5 w-5" /> Register Guard</h2>
//                             <button onClick={() => setShowAddGuardModal(false)} className="hover:text-ees-red transition"><X className="h-6 w-6" /></button>
//                         </div>
//                         <form onSubmit={handleAddGuard} className="p-6 space-y-4">
//                             <div>
//                                 <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
//                                 <input required type="text" placeholder="e.g., Ajay Kumar" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newGuardData.name} onChange={e => setNewGuardData({ ...newGuardData, name: e.target.value })} />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
//                                 <input type="tel" placeholder="e.g., 9876543210" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newGuardData.phone} onChange={e => setNewGuardData({ ...newGuardData, phone: e.target.value })} />
//                             </div>
//                             <div className="pt-4 border-t mt-6 flex justify-end gap-3">
//                                 <button type="button" onClick={() => setShowAddGuardModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">Cancel</button>
//                                 <button type="submit" className="px-5 py-2.5 bg-ees-red text-white font-bold rounded-lg hover:bg-red-700 transition">Add Guard</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* --- ADD SITE MODAL --- */}
//             {showAddSiteModal && (
//                 <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//                     <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
//                         <div className="bg-ees-navy p-4 flex justify-between items-center text-white">
//                             <h2 className="text-xl font-bold flex items-center gap-2"><Building2 className="h-5 w-5" /> Add New Site</h2>
//                             <button onClick={() => setShowAddSiteModal(false)} className="hover:text-ees-red transition"><X className="h-6 w-6" /></button>
//                         </div>
//                         <form onSubmit={handleAddSite} className="p-6 space-y-4">
//                             <div>
//                                 <label className="block text-sm font-bold text-gray-700 mb-1">Site Name *</label>
//                                 <input required type="text" placeholder="e.g., Eastwood Exports" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newSiteData.name} onChange={e => setNewSiteData({ ...newSiteData, name: e.target.value })} />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
//                                 <input type="text" placeholder="e.g., Sector 13, Moradabad" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newSiteData.address} onChange={e => setNewSiteData({ ...newSiteData, address: e.target.value })} />
//                             </div>

//                             {/* NEW: SHIFT MODE SELECTION */}
//                             <div>
//                                 <label className="block text-sm font-bold text-gray-700 mb-1">Site Operating Shift Mode</label>
//                                 <select
//                                     className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red bg-white"
//                                     value={newSiteData.shift_mode}
//                                     onChange={e => setNewSiteData({ ...newSiteData, shift_mode: Number(e.target.value) })}
//                                 >
//                                     <option value={12}>12-Hour Shifts (Day/Night)</option>
//                                     <option value={8}>8-Hour Shifts (Morning/Day/Night)</option>
//                                 </select>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-bold text-gray-700 mb-1">Latitude</label>
//                                     <input type="text" placeholder="e.g., 28.8386" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newSiteData.lat} onChange={e => setNewSiteData({ ...newSiteData, lat: e.target.value })} />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-bold text-gray-700 mb-1">Longitude</label>
//                                     <input type="text" placeholder="e.g., 78.7733" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-ees-red" value={newSiteData.lng} onChange={e => setNewSiteData({ ...newSiteData, lng: e.target.value })} />
//                                 </div>
//                             </div>
//                             <div className="pt-4 border-t mt-6 flex justify-end gap-3">
//                                 <button type="button" onClick={() => setShowAddSiteModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">Cancel</button>
//                                 <button type="submit" className="px-5 py-2.5 bg-ees-red text-white font-bold rounded-lg hover:bg-red-700 transition">Save Site</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//             {/* --- ASSIGN GUARDS TO CHECKPOINT MODAL --- */}
//             {showCpAssignModal && (
//                 <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//                     <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
//                         <div className="bg-ees-navy p-4 flex justify-between items-center text-white">
//                             <div>
//                                 <h2 className="text-xl font-bold">Assign to QR</h2>
//                                 <p className="text-xs text-blue-200 mt-1">Checkpoint: {activeCpForAssign?.name}</p>
//                             </div>
//                             <button onClick={() => setShowCpAssignModal(false)} className="hover:text-ees-red transition"><X className="h-6 w-6" /></button>
//                         </div>
//                         <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
//                             {siteGuards.length === 0 && <p className="text-center text-gray-400">No guards assigned to this site yet.</p>}

//                             {siteGuards.map(guard => {
//                                 const isAssigned = (cpAssignmentsMap[activeCpForAssign?.id] || []).includes(guard.id);
//                                 return (
//                                     <div key={guard.id} onClick={() => toggleCpAssignment(guard.id)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${isAssigned ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
//                                         <div className="flex items-center gap-3">
//                                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isAssigned ? 'bg-blue-600' : 'bg-gray-400'}`}>
//                                                 {guard.name.charAt(0)}
//                                             </div>
//                                             <span className="font-bold text-gray-800">{guard.name}</span>
//                                         </div>
//                                         {isAssigned ? <CheckSquare className="text-blue-600 h-6 w-6" /> : <Square className="text-gray-300 h-6 w-6" />}
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                         <div className="p-4 border-t bg-gray-50">
//                             <button onClick={() => setShowCpAssignModal(false)} className="w-full bg-ees-navy text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">Done</button>
//                         </div>
//                     </div>
//                 </div>
//             )}


//             {/* --- MANAGE TEAM MODAL (WITH SHIFT SLOTS) --- */}
//             {showManageTeamModal && (
//                 <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//                     <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
//                         <div className="bg-ees-navy p-4 flex justify-between items-center text-white">
//                             <div>
//                                 <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5" /> Appoint Guards</h2>
//                                 <p className="text-xs text-blue-200 mt-1">Site Mode: {selectedSite?.shift_mode}-Hour Shifts</p>
//                             </div>
//                             <button onClick={() => setShowManageTeamModal(false)} className="hover:text-ees-red transition"><X className="h-6 w-6" /></button>
//                         </div>
//                         <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3 bg-gray-50">
//                             {allGuards.length === 0 && <p className="text-center text-gray-400">No active guards found.</p>}

//                             {allGuards.map(guard => {
//                                 const isAssigned = !!assignedGuardsMap[guard.id];
//                                 return (
//                                     <div key={guard.id} className={`flex flex-col p-3 rounded-xl border transition ${isAssigned ? 'bg-white border-ees-red shadow-sm' : 'bg-white border-gray-200 hover:border-ees-red'}`}>

//                                         <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleGuardAssignment(guard)}>
//                                             <div className="flex items-center gap-3">
//                                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isAssigned ? 'bg-ees-red' : 'bg-gray-400'}`}>
//                                                     {guard.name.charAt(0)}
//                                                 </div>
//                                                 <span className="font-bold text-gray-800">{guard.name}</span>
//                                             </div>
//                                             {isAssigned ? <CheckSquare className="text-ees-red h-6 w-6" /> : <Square className="text-gray-300 h-6 w-6" />}
//                                         </div>

//                                         {/* SHIFT SELECTION DROPDOWN (Only visible if assigned) */}
//                                         {isAssigned && (
//                                             <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
//                                                 <label className="text-sm font-semibold text-gray-600 flex items-center gap-1"><Clock className="h-4 w-4" /> Assigned Slot:</label>
//                                                 <select
//                                                     className="border border-gray-300 rounded-md p-1.5 text-sm outline-none focus:border-ees-red font-semibold text-ees-navy bg-gray-50"
//                                                     value={assignedGuardsMap[guard.id].shift_slot}
//                                                     onChange={(e) => updateGuardShiftSlot(guard.id, e.target.value)}
//                                                 >
//                                                     {selectedSite?.shift_mode === 8 ? (
//                                                         <>
//                                                             <option value="Morning">Morning (3 AM - 11 AM)</option>
//                                                             <option value="Day">Day (11 AM - 7 PM)</option>
//                                                             <option value="Night">Night (7 PM - 3 AM)</option>
//                                                         </>
//                                                     ) : (
//                                                         <>
//                                                             <option value="Day">Day (7 AM - 7 PM)</option>
//                                                             <option value="Night">Night (7 PM - 7 AM)</option>
//                                                         </>
//                                                     )}
//                                                 </select>
//                                             </div>
//                                         )}
//                                     </div>
//                                 )
//                             })}
//                         </div>
//                         <div className="p-4 border-t bg-white">
//                             <button onClick={() => setShowManageTeamModal(false)} className="w-full bg-ees-navy text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition shadow-md">Done</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* LEFT SIDEBAR: List of Sites */}
//             <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-900 border-r border-gray-200 h-auto md:h-screen flex flex-col">
//                 <div className="p-6 border-b border-gray-200 bg-gray-900 z-10 flex justify-between items-center">
//                     <h2 className="text-xl font-extrabold text-white">Active Sites</h2>
//                     <button onClick={() => setShowAddSiteModal(true)} className="bg-ees-red text-white p-2 rounded-md hover:bg-red-700 transition shadow-md" title="Add New Site">
//                         <Plus className="h-5 w-5" />
//                     </button>
//                 </div>
//                 <div className="p-4 space-y-3 flex-1 bg-gray-900 overflow-y-auto">
//                     {sites.map((site) => (
//                         <div key={site.id} onClick={() => handleSiteClick(site)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSite?.id === site.id ? 'bg-ees-navy text-white border-ees-navy shadow-md' : 'bg-gray-50 border-gray-200 hover:border-ees-red text-ees-navy'}`}>
//                             <h3 className="font-bold text-lg">{site.name}</h3>
//                             <div className="flex items-center gap-3 mt-2 text-xs">
//                                 <span className={`px-2 py-0.5 rounded font-bold ${site.shift_mode === 8 ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
//                                     {site.shift_mode}Hr Mode
//                                 </span>
//                                 <span className="text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {site.address || 'No Addr'}</span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//                 <div className="p-4 border-t border-gray-200 bg-gray-900">
//                     <button onClick={() => setShowAddGuardModal(true)} className="w-full flex items-center justify-center gap-2 bg-red-800 text-white p-3 rounded-xl hover:bg-gray-50 hover:text-red-800 transition shadow-sm font-bold">
//                         <UserPlus className="h-5 w-5" /> Register Guard
//                     </button>
//                 </div>
//             </div>

//             {/* RIGHT MAIN PANEL */}
//             <div className="flex-1 bg-gray-900 h-screen overflow-y-auto p-4 md:p-8">
//                 {!selectedSite ? (
//                     <div className="h-full flex flex-col items-center justify-center text-gray-400">
//                         <Building2 className="h-24 w-24 mb-4 opacity-20" />
//                         <h2 className="text-2xl font-bold">Select a site to view details</h2>
//                     </div>
//                 ) : (
//                     <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
//                         <div className="bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-start">
//                             <div>
//                                 <h1 className="text-3xl font-extrabold text-white">{selectedSite.name}</h1>
//                                 <p className="text-gray-200 mt-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedSite.address}</p>
//                             </div>
//                             {/* <button className="text-gray-500 hover:text-ees-navy border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition">
//                                 <Settings className="h-4 w-4" /> Edit Rules
//                             </button> */}
//                         </div>

//                         <div className="grid lg:grid-cols-2 gap-8">
//                             {/* Checkpoints & QR Generator (Same as before) */}
//                             <div className="bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200">
//                                 <div className="flex justify-between items-center mb-6">
//                                     <h2 className="text-xl font-bold text-white flex items-center gap-2"><QrCode className="h-5 w-5 text-ees-red" /> Patrol Checkpoints</h2>
//                                 </div>
//                                 <form onSubmit={handleAddCheckpoint} className="flex gap-2 mb-6">
//                                     <input type="text" placeholder="e.g., Back Boundary Wall" value={newCheckpointName} onChange={(e) => setNewCheckpointName(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-ees-red text-white" />
//                                     <button type="submit" className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-gray-200 transition hover:text-red-800 font-bold">Add</button>
//                                 </form>
//                                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
//                                     {checkpoints.map(cp => (
//                                         <div key={cp.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-200 rounded-xl">
//                                             <div className="flex items-center gap-4">
//                                                 <div className="bg-white p-1 border rounded shadow-sm"><QRCodeSVG value={cp.id} size={50} /></div>
//                                                 <div><p className="font-bold text-white">{cp.name}</p><p className="text-xs text-gray-200 font-mono mt-1">ID: {cp.id.substring(0, 8)}...</p></div>
//                                             </div>
//                                             <button
//                                                 onClick={() => { setActiveCpForAssign(cp); setShowCpAssignModal(true); }}
//                                                 className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"
//                                                 title="Assign Guards to this QR"
//                                             >
//                                                 <Link2 className="h-5 w-5" />
//                                             </button>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Appointed Guards (UI Layout) */}
//                             <div className="bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200">
//                                 <div className="flex justify-between items-center mb-6">
//                                     <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                                         <Users className="h-5 w-5 text-ees-red" /> Appointed Guards
//                                     </h2>
//                                     <button onClick={openManageTeamModal} className="text-sm bg-red-800 text-white font-bold px-4 py-2 rounded-lg hover:bg-white hover:text-red-800 transition">
//                                         Manage Team
//                                     </button>
//                                 </div>

//                                 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
//                                     {siteGuards.length === 0 && <p className="text-gray-200 text-sm">No guards assigned yet.</p>}
//                                     {siteGuards.map((g) => {
//                                         // NEW: Calculate how many checkpoints are assigned to this specific guard
//                                         const assignedCpCount = Object.values(cpAssignmentsMap).filter((guardsList) => guardsList.includes(g.id)).length;

//                                         return (
//                                             <div key={g.id} className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-200 rounded-xl shadow-sm">
//                                                 <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 ${g.is_clocked_in ? 'border-2 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] bg-gray-100' : 'bg-ees-navy text-white'}`}>
//                                                     {g.is_clocked_in && g.active_selfie ? (
//                                                         <img src={g.active_selfie} alt="Live Duty" className="w-full h-full object-cover" />
//                                                     ) : (
//                                                         g.name.charAt(0)
//                                                     )}
//                                                 </div>

//                                                 <div className="flex-1">
//                                                     <p className="font-extrabold text-white">{g.name}</p>
//                                                     <p className="text-xs text-gray-200 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {g.phone || 'N/A'}</p>

//                                                     {/* Badges Row */}
//                                                     <div className="flex flex-wrap items-center gap-2 mt-2">
//                                                         <span className="text-[10px] bg-gray-900 text-white px-2 py-1 rounded font-bold border border-gray-200">
//                                                             {g.completed_shifts || 0} SHIFTS
//                                                         </span>

//                                                         {/* NEW: The QR Count Badge */}
//                                                         <span className={`text-[10px] px-2 py-1 rounded font-bold border flex items-center gap-1 ${assignedCpCount > 0 ? 'bg-gray-900 text-white border-blue-500' : 'bg-gray-900 text-white border-red-500'}`}>
//                                                             <QrCode className="h-3 w-3" /> {assignedCpCount} QR ASSIGNED
//                                                         </span>

//                                                         {g.is_clocked_in ? (
//                                                             <span className="text-[10px] bg-gray-900 text-green-700 px-2 py-1 rounded font-bold border border-green-200 flex items-center gap-1 shadow-sm">
//                                                                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> ON DUTY
//                                                             </span>
//                                                         ) : (
//                                                             <span className="text-[10px] bg-gray-900 text-gray-400 px-2 py-1 rounded font-bold border border-gray-200">
//                                                                 OFF DUTY
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>

//                                                 <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 text-center shrink-0">
//                                                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Shift Slot</p>
//                                                     <p className="text-sm font-bold text-ees-navy">{g.shift_slot}</p>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         </div>
//                         {/* --- LIVE PATROL MONITORING PANEL --- */}
//                         <div className="bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                                     <Activity className="h-5 w-5 text-ees-red" /> Live Patrol Monitoring
//                                 </h2>
//                                 <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
//                                     Site Interval: {selectedSite.patrol_interval_mins} Mins
//                                 </span>
//                             </div>

//                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 {siteGuards.filter(g => g.is_clocked_in).length === 0 && (
//                                     <p className="text-gray-400 text-sm col-span-full">No guards currently on duty to monitor.</p>
//                                 )}

//                                 {siteGuards.filter(g => g.is_clocked_in).map(g => {
//                                     // 1. Find this guard's most recent scan
//                                     const guardScans = patrolLogs.filter(log => log.guard_id === g.id);
//                                     const lastScan = guardScans.length > 0 ? guardScans[0] : null;

//                                     // 2. Calculate time since last activity (either last scan, or clock-in time if no scans yet)
//                                     const lastActivityTime = lastScan ? new Date(lastScan.scanned_at) : new Date(g.clock_in_time);
//                                     const diffMins = Math.floor((new Date().getTime() - lastActivityTime.getTime()) / 60000);

//                                     // 3. Determine Risk Status
//                                     const intervalLimit = selectedSite.patrol_interval_mins || 120;
//                                     const isAtRisk = diffMins > intervalLimit;

//                                     return (
//                                         <div key={g.id} className={`p-4 rounded-xl border-2 transition-all ${isAtRisk ? 'bg-gray-900 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-gray-900 border-gray-200'}`}>
//                                             <div className="flex justify-between items-start mb-3">
//                                                 <div className="flex items-center gap-2">
//                                                     <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 ">
//                                                         {g.active_selfie ? <img src={g.active_selfie} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-ees-navy text-white flex items-center justify-center font-bold text-xs">{g.name.charAt(0)}</div>}
//                                                     </div>
//                                                     <p className="font-bold text-white">{g.name}</p>
//                                                 </div>
//                                                 {isAtRisk ? <ShieldAlert className="h-6 w-6 text-red-600 animate-pulse" /> : <CheckCircle className="h-6 w-6 text-green-500" />}
//                                             </div>

//                                             <div className="space-y-1">
//                                                 <p className="text-xs text-gray-200 font-bold uppercase">Latest Activity:</p>
//                                                 {lastScan ? (
//                                                     <p className="text-sm font-semibold text-gray-200">Scanned Checkpoint ID: {lastScan.checkpoint_id.substring(0, 6)}</p>
//                                                 ) : (
//                                                     <p className="text-sm font-semibold text-gray-800">Clocked In (No scans yet)</p>
//                                                 )}

//                                                 <div className={`mt-3 p-2 rounded-lg text-sm font-bold flex items-center justify-between ${isAtRisk ? 'bg-red-600 text-white' : 'bg-green-100 text-green-700'}`}>
//                                                     <span>{isAtRisk ? 'PATROL MISSED!' : 'ON TRACK'}</span>
//                                                     <span>{diffMins} mins ago</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )
//                                 })}
//                             </div>
//                         </div>

//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }