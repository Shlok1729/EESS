import { useEffect, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, MapPin, ArrowLeft, Lock, Loader2, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GuardPatrol() {
    const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('Point camera at the QR code');
    const [isClockedIn, setIsClockedIn] = useState<boolean | null>(null);

    // --- NEW: TOUR MANAGEMENT STATE ---
    const [assignedCheckpoints, setAssignedCheckpoints] = useState<any[]>([]);
    const [scannedIds, setScannedIds] = useState<string[]>([]);
    const [roundComplete, setRoundComplete] = useState(false);

    const navigate = useNavigate();

    const activeGuard = JSON.parse(localStorage.getItem('active_guard') || '{}');
    const activeSite = JSON.parse(localStorage.getItem('active_site') || '{}');
    const GUARD_ID = activeGuard.id;
    const SITE_ID = activeSite.id;

    useEffect(() => {
        if (!GUARD_ID || !SITE_ID) {
            setIsClockedIn(false);
            setMessage('Session expired. Please log in again.');
            return;
        }
        verifyActiveShiftAndFetchTour();
    }, []);

    const verifyActiveShiftAndFetchTour = async () => {
        try {
            // 1. Check if clocked in
            const { data: attendance } = await supabase
                .from('attendance_logs')
                .select('*')
                .eq('guard_id', GUARD_ID)
                .eq('site_id', SITE_ID)
                .eq('status', 'clocked_in')
                .limit(1);

            if (attendance && attendance.length > 0) {
                setIsClockedIn(true);

                // 2. Fetch Checkpoints assigned to THIS specific guard
                const { data: assignments } = await supabase
                    .from('checkpoint_assignments')
                    .select('checkpoints(*)')
                    .eq('guard_id', GUARD_ID);

                if (assignments) {
                    // Filter to make sure we only grab checkpoints for the CURRENT site
                    const cps = assignments
                        .map((a: any) => a.checkpoints)
                        .filter((cp: any) => cp.site_id === SITE_ID);
                    setAssignedCheckpoints(cps);
                }
            } else {
                setIsClockedIn(false);
                setMessage('Access Denied: You must be Clocked-In.');
            }
        } catch (err) {
            setIsClockedIn(false);
            setMessage('Database error.');
        }
    };

    const handleScan = async (scannedText: string) => {
        if (scanStatus === 'processing' || scanStatus === 'success' || roundComplete) return;

        // Prevent scanning if this QR is not in their assigned list
        const isValidQR = assignedCheckpoints.some(cp => cp.id === scannedText);
        if (!isValidQR) {
            setScanStatus('error');
            setMessage('Error: This checkpoint is not assigned to you.');
            setTimeout(() => setScanStatus('idle'), 3000);
            return;
        }

        // Prevent double scanning the same QR in one round
        if (scannedIds.includes(scannedText)) {
            setScanStatus('error');
            setMessage('You already scanned this checkpoint for this round!');
            setTimeout(() => setScanStatus('idle'), 3000);
            return;
        }

        setScanStatus('processing');
        setMessage('Verifying checkpoint...');

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // Save to database
                        await supabase.from('patrol_logs').insert([{
                            checkpoint_id: scannedText,
                            guard_id: GUARD_ID,
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            status: 'success'
                        }]);

                        // Update local state
                        const newScannedIds = [...scannedIds, scannedText];
                        setScannedIds(newScannedIds);

                        setScanStatus('success');

                        // Check if Round is Complete
                        if (newScannedIds.length === assignedCheckpoints.length) {
                            setRoundComplete(true);
                            setMessage('ALL CHECKPOINTS SCANNED! ROUND COMPLETE.');
                        } else {
                            setMessage('Verified! Scan next checkpoint.');
                            setTimeout(() => setScanStatus('idle'), 3000);
                        }

                    } catch (err: any) {
                        setScanStatus('error');
                        setMessage('Database error during scan.');
                        setTimeout(() => setScanStatus('idle'), 3000);
                    }
                },
                () => {
                    setScanStatus('error');
                    setMessage('GPS Error: Please enable location services.');
                    setTimeout(() => setScanStatus('idle'), 3000);
                },
                { enableHighAccuracy: true }
            );
        }
    };

    const startNewRound = () => {
        setScannedIds([]);
        setRoundComplete(false);
        setScanStatus('idle');
        setMessage('Point camera at the QR code');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">

                {/* Header */}
                <div className="bg-ees-navy p-4 text-center border-b border-gray-700 relative">
                    <button onClick={() => navigate('/guard')} className="absolute top-4 left-4 text-gray-400 hover:text-white transition">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-xl font-bold text-white tracking-wider">PATROL ROUND</h2>
                </div>

                {/* SCANNER AREA */}
                <div className="relative aspect-square bg-black flex flex-col items-center justify-center border-b border-gray-700">
                    {isClockedIn === null ? (
                        <Loader2 className="h-12 w-12 text-gray-500 animate-spin" />
                    ) : isClockedIn === false ? (
                        <div className="flex flex-col items-center p-6 text-center">
                            <Lock className="h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-xl font-bold text-white mb-2">Scanner Locked</p>
                            <button onClick={() => navigate('/guard')} className="mt-6 bg-ees-red text-white px-6 py-3 rounded-xl font-bold">Go to Menu</button>
                        </div>
                    ) : roundComplete ? (
                        <div className="flex flex-col items-center animate-fade-in-up text-center p-6 bg-green-900/20 w-full h-full justify-center">
                            <CheckCircle className="h-24 w-24 mb-4 text-green-500" />
                            <p className="text-2xl font-black text-white uppercase tracking-widest">Round Complete</p>
                            <p className="text-gray-400 text-sm mt-2">All assigned checkpoints secured.</p>
                            <button onClick={startNewRound} className="mt-8 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 w-full">Start Next Round</button>
                        </div>
                    ) : scanStatus === 'idle' || scanStatus === 'processing' ? (
                        <>
                            {scanStatus === 'processing' && (
                                <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                    <Loader2 className="h-12 w-12 text-ees-red animate-spin mb-2" />
                                    <p className="font-bold tracking-widest uppercase text-sm">Verifying</p>
                                </div>
                            )}
                            <Scanner onScan={(res) => handleScan(res[0].rawValue)} scanDelay={1000} />
                        </>
                    ) : scanStatus === 'success' ? (
                        <div className="flex flex-col items-center animate-fade-in-up text-green-500">
                            <CheckCircle className="h-24 w-24 mb-4" />
                            <p className="text-xl font-bold text-white">Verified</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center animate-fade-in-up text-red-500 p-4 text-center">
                            <XCircle className="h-24 w-24 mb-4" />
                            <p className="text-xl font-bold text-white">Scan Failed</p>
                        </div>
                    )}
                </div>

                {/* --- NEW: THE TO-DO LIST (CHECKLIST) --- */}
                {isClockedIn && (
                    <div className="p-4 bg-gray-800 border-b border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-white font-bold flex items-center gap-2 text-sm"><ListTodo className="h-4 w-4 text-ees-red" /> Assigned Checkpoints</h3>
                            <span className="text-xs font-bold text-gray-400 bg-gray-700 px-2 py-1 rounded">{scannedIds.length} / {assignedCheckpoints.length} Scanned</span>
                        </div>

                        {assignedCheckpoints.length === 0 ? (
                            <p className="text-xs text-orange-400 text-center py-2">No checkpoints assigned to you for this site.</p>
                        ) : (
                            <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                {assignedCheckpoints.map(cp => {
                                    const isScanned = scannedIds.includes(cp.id);
                                    return (
                                        <div key={cp.id} className={`flex items-center justify-between p-2 rounded border ${isScanned ? 'bg-green-900/20 border-green-800' : 'bg-gray-700 border-gray-600'}`}>
                                            <span className={`text-sm font-semibold ${isScanned ? 'text-green-400 line-through' : 'text-gray-200'}`}>{cp.name}</span>
                                            {isScanned ? <CheckCircle className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border-2 border-gray-500" />}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Message Footer */}
                <div className="p-4 text-center bg-gray-900">
                    <p className={`text-sm font-bold tracking-wide ${scanStatus === 'success' || roundComplete ? 'text-green-400' : scanStatus === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                        {message}
                    </p>
                </div>

            </div>
        </div>
    );
}