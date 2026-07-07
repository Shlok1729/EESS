import { useEffect, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, MapPin, ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GuardPatrol = () => {
    const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('Point camera at the Checkpoint QR code');

    // NEW: State to block access if not clocked in
    const [isClockedIn, setIsClockedIn] = useState<boolean | null>(null);

    const navigate = useNavigate();

    // Get real data from LocalStorage
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
        verifyActiveShift();
    }, []);

    // --- GATEKEEPER LOGIC ---
    const verifyActiveShift = async () => {
        try {
            const { data } = await supabase
                .from('attendance_logs')
                .select('*')
                .eq('guard_id', GUARD_ID)
                .eq('site_id', SITE_ID)
                .eq('status', 'clocked_in')
                .limit(1);

            if (data && data.length > 0) {
                setIsClockedIn(true);
            } else {
                setIsClockedIn(false);
                setMessage('Access Denied: You must be Clocked-In to scan patrols.');
            }
        } catch (err) {
            setIsClockedIn(false);
            setMessage('Database error while verifying shift.');
        }
    };

    const handleScan = async (scannedText: string) => {
        if (scanStatus === 'processing' || scanStatus === 'success') return;

        setScanStatus('processing');
        setMessage('Verifying checkpoint...');

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    try {
                        // BONUS RULE: Ensure this QR code belongs to this specific site!
                        const { data: cpData, error: cpError } = await supabase
                            .from('checkpoints')
                            .select('site_id, name')
                            .eq('id', scannedText)
                            .single();

                        if (cpError || !cpData) {
                            throw new Error("Invalid QR Code: Not found in database.");
                        }

                        if (cpData.site_id !== SITE_ID) {
                            throw new Error("Invalid QR Code: This checkpoint belongs to a different site!");
                        }

                        // Insert the log into Supabase
                        const { error: insertError } = await supabase.from('patrol_logs').insert([
                            {
                                checkpoint_id: scannedText,
                                guard_id: GUARD_ID,
                                lat: lat,
                                lng: lng,
                                status: 'success'
                            }
                        ]);

                        if (insertError) throw insertError;

                        setScanStatus('success');
                        setMessage(`Verified: ${cpData.name}`);

                        // Reset scanner after 3 seconds for the next QR code
                        setTimeout(() => {
                            setScanStatus('idle');
                            setMessage('Scan next checkpoint');
                        }, 3000);

                    } catch (err: any) {
                        console.error(err);
                        setScanStatus('error');
                        setMessage(err.message || 'Verification Failed.');
                        setTimeout(() => {
                            setScanStatus('idle');
                            setMessage('Point camera at the Checkpoint QR code');
                        }, 3500);
                    }
                },
                (error) => {
                    setScanStatus('error');
                    setMessage('GPS Error: Please enable location services.');
                    setTimeout(() => setScanStatus('idle'), 3000);
                },
                { enableHighAccuracy: true } // Forces precise GPS
            );
        } else {
            setScanStatus('error');
            setMessage('Geolocation is not supported by this device.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">

                {/* Header */}
                <div className="bg-ees-navy p-4 text-center border-b border-gray-700 relative">
                    <button onClick={() => navigate('/guard')} className="absolute top-4 left-4 text-gray-400 hover:text-white transition">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-xl font-bold text-white tracking-wider">NIGHT PATROL</h2>
                    <div className="flex items-center justify-center gap-2 mt-2 text-ees-red text-xs font-bold uppercase tracking-widest">
                        <MapPin className="h-4 w-4" /> Live Tracking Active
                    </div>
                </div>

                {/* Scanner Area / Locked Area */}
                <div className="relative aspect-square bg-black flex flex-col items-center justify-center border-b border-gray-700">

                    {isClockedIn === null ? (
                        <Loader2 className="h-12 w-12 text-gray-500 animate-spin" />
                    ) : isClockedIn === false ? (
                        <div className="flex flex-col items-center animate-fade-in-up p-6 text-center">
                            <div className="bg-gray-800 p-4 rounded-full border-2 border-gray-600 mb-4">
                                <Lock className="h-16 w-16 text-gray-400" />
                            </div>
                            <p className="text-xl font-bold text-white mb-2">Scanner Locked</p>
                            <p className="text-gray-400 text-sm">You must clock in before starting your patrol rounds.</p>
                            <button
                                onClick={() => navigate('/guard/clock-in')}
                                className="mt-6 bg-ees-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
                            >
                                Go to Clock-In
                            </button>
                        </div>
                    ) : scanStatus === 'idle' || scanStatus === 'processing' ? (
                        <>
                            {scanStatus === 'processing' && (
                                <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                    <Loader2 className="h-12 w-12 text-ees-red animate-spin mb-2" />
                                    <p className="font-bold tracking-widest uppercase text-sm">Verifying</p>
                                </div>
                            )}
                            {/* NOTE: We are using the correct v3 Scanner prop: onScan */}
                            <Scanner
                                onScan={(result) => handleScan(result[0].rawValue)}
                                onError={(error) => console.log(error?.message)}
                                scanDelay={1000}
                            />
                        </>
                    ) : scanStatus === 'success' ? (
                        <div className="flex flex-col items-center animate-fade-in-up text-green-500">
                            <CheckCircle className="h-24 w-24 mb-4" />
                            <p className="text-xl font-bold text-white">Location Verified</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center animate-fade-in-up text-red-500 p-4 text-center">
                            <XCircle className="h-24 w-24 mb-4" />
                            <p className="text-xl font-bold text-white">Scan Rejected</p>
                        </div>
                    )}
                </div>

                {/* Status Message Footer */}
                <div className="p-6 text-center bg-gray-800">
                    <p className={`text-sm md:text-base font-bold tracking-wide ${scanStatus === 'success' ? 'text-green-400' :
                            scanStatus === 'error' || isClockedIn === false ? 'text-red-400' :
                                'text-gray-300'
                        }`}>
                        {message}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default GuardPatrol;