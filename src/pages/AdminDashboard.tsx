import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Users, QrCode, Plus, Printer, MapPin, Settings } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminDashboard() {
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSite, setSelectedSite] = useState<any | null>(null);

    const [siteGuards, setSiteGuards] = useState<any[]>([]);
    const [checkpoints, setCheckpoints] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [newCheckpointName, setNewCheckpointName] = useState('');

    useEffect(() => {
        fetchSites();
    }, []);

    // 1. Fetch All Sites
    const fetchSites = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('sites').select('*').order('created_at', { ascending: false });
        if (data) setSites(data);
        setLoading(false);
    };

    // 2. Fetch Details for a Specific Site
    const handleSiteClick = async (site: any) => {
        setSelectedSite(site);

        // Fetch Checkpoints for this site
        const { data: cpData } = await supabase
            .from('checkpoints')
            .select('*')
            .eq('site_id', site.id);
        setCheckpoints(cpData || []);

        // Fetch Guards assigned to this site (Assuming we add a current_site_id to guards table later)
        // For now, we will just fetch all guards to show the UI
        const { data: guardData } = await supabase.from('guards').select('*').limit(5);
        setSiteGuards(guardData || []);
    };

    // 3. Add a New Checkpoint (QR Code)
    const handleAddCheckpoint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCheckpointName || !selectedSite) return;

        const { data, error } = await supabase
            .from('checkpoints')
            .insert([{ site_id: selectedSite.id, name: newCheckpointName }])
            .select();

        if (data) {
            setCheckpoints([...checkpoints, data[0]]);
            setNewCheckpointName('');
        }
    };

    // 4. Print QR Code (Opens a clean print window)
    const printQRCode = (checkpointId: string, checkpointName: string) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // We generate a clean HTML page just for printing the QR
        printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - ${checkpointName}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            .qr-container { border: 2px solid #000; padding: 20px; border-radius: 10px; text-align: center; }
            h2 { margin-bottom: 5px; }
            p { margin-top: 0; color: #555; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>EAGLE EYE SECURITY</h2>
            <p>Checkpoint: ${checkpointName}</p>
            <!-- We pass the UUID here for the scanner app to read -->
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${checkpointId}" alt="QR" />
            <p style="font-size: 10px; margin-top: 10px;">ID: ${checkpointId}</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };


    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-xl text-ees-navy">Loading HQ...</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">

            {/* LEFT SIDEBAR: List of Sites */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 h-auto md:h-screen overflow-y-auto">
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
                    <h2 className="text-xl font-extrabold text-ees-navy">Active Sites</h2>
                    <button className="bg-ees-red text-white p-2 rounded-md hover:bg-red-700 transition">
                        <Plus className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {sites.length === 0 && <p className="text-gray-500 text-center mt-4">No sites added yet.</p>}
                    {sites.map((site) => (
                        <div
                            key={site.id}
                            onClick={() => handleSiteClick(site)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSite?.id === site.id ? 'bg-ees-navy text-white border-ees-navy shadow-md' : 'bg-gray-50 border-gray-200 hover:border-ees-red text-ees-navy'}`}
                        >
                            <h3 className="font-bold text-lg">{site.name}</h3>
                            <p className={`text-sm flex items-center gap-1 mt-1 ${selectedSite?.id === site.id ? 'text-gray-300' : 'text-gray-500'}`}>
                                <MapPin className="h-3 w-3" /> {site.address || 'Address pending'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT MAIN PANEL: Site Control Center */}
            <div className="flex-1 bg-gray-50 h-screen overflow-y-auto p-4 md:p-8">
                {!selectedSite ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Building2 className="h-24 w-24 mb-4 opacity-20" />
                        <h2 className="text-2xl font-bold">Select a site to view details</h2>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">

                        {/* Site Header Row */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-extrabold text-ees-navy">{selectedSite.name}</h1>
                                <p className="text-gray-500 mt-2 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> {selectedSite.address}
                                </p>
                            </div>
                            <button className="text-gray-500 hover:text-ees-navy border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition">
                                <Settings className="h-4 w-4" /> Edit Site Rules
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">

                            {/* Checkpoints & QR Generator */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-ees-navy flex items-center gap-2">
                                        <QrCode className="h-5 w-5 text-ees-red" /> Patrol Checkpoints
                                    </h2>
                                    <span className="bg-red-100 text-ees-red font-bold px-3 py-1 rounded-full text-sm">
                                        {checkpoints.length} Active
                                    </span>
                                </div>

                                {/* Add New Checkpoint Form */}
                                <form onSubmit={handleAddCheckpoint} className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        placeholder="e.g., Back Boundary Wall"
                                        value={newCheckpointName}
                                        onChange={(e) => setNewCheckpointName(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-ees-red"
                                    />
                                    <button type="submit" className="bg-ees-navy text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                                        Add
                                    </button>
                                </form>

                                {/* List of Checkpoints */}
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {checkpoints.map(cp => (
                                        <div key={cp.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                {/* Live generated SVG of the QR Code */}
                                                <div className="bg-white p-1 border rounded shadow-sm">
                                                    <QRCodeSVG value={cp.id} size={50} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-ees-navy">{cp.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {cp.id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => printQRCode(cp.id, cp.name)}
                                                className="text-ees-red hover:bg-red-50 p-2 rounded-lg transition border border-transparent hover:border-red-100"
                                                title="Print or Regenerate QR"
                                            >
                                                <Printer className="h-5 w-5" />
                                            </button>
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
                                    <button className="text-sm text-blue-600 hover:underline">Manage Team</button>
                                </div>

                                <div className="space-y-3">
                                    {/* Dummy data mapping for now until we link guards table */}
                                    {[1, 2, 3].map((g) => (
                                        <div key={g} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-ees-navy text-white flex items-center justify-center font-bold">
                                                G{g}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">Guard #{g}</p>
                                                <p className="text-xs text-green-600 font-semibold">Active - Shift Started</p>
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