import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getDistance } from 'geolib';
import { Camera, MapPin, CheckCircle, Loader2, LogOut, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GuardAttendance = () => {
    const [status, setStatus] = useState<'checking' | 'idle' | 'processing' | 'success' | 'error'>('checking');
    const [message, setMessage] = useState('Checking shift status...');
    const [activeShift, setActiveShift] = useState<any | null>(null);

    // NEW: Shift Window State
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [windowMessage, setWindowMessage] = useState('');

    const navigate = useNavigate();

    const activeGuard = JSON.parse(localStorage.getItem('active_guard') || '{}');
    const activeSite = JSON.parse(localStorage.getItem('active_site') || '{}');

    const GUARD_ID = activeGuard.id;
    const SITE_ID = activeSite.id;
    const SITE_LAT = activeSite.lat || 0;
    const SITE_LNG = activeSite.lng || 0;
    const ALLOWED_RADIUS_METERS = activeSite.radius_meters || 100;

    // Shift Rules
    const SHIFT_MODE = activeSite.shift_mode || 12; // 8 or 12
    const SHIFT_SLOT = activeSite.shift_slot || 'Day'; // Morning, Day, Night

    useEffect(() => {
        if (!GUARD_ID || !SITE_ID) {
            setStatus('error');
            setMessage('Session expired. Please log in again.');
            return;
        }
        initShiftCheck();
    }, []);

    const initShiftCheck = async () => {
        try {
            // Fetch the LATEST log, regardless of whether it's clocked in or out
            const { data } = await supabase
                .from('attendance_logs')
                .select('*')
                .eq('guard_id', GUARD_ID)
                .eq('site_id', SITE_ID)
                .order('clock_in_time', { ascending: false })
                .limit(1);

            const latestLog = data && data.length > 0 ? data[0] : null;

            // Separate them: Is it active? Or is it a completed past shift?
            const currentActive = latestLog?.status === 'clocked_in' ? latestLog : null;

            setActiveShift(currentActive);
            enforceTimeRules(currentActive, latestLog); // Pass both to the engine

            setStatus('idle');
        } catch (err) {
            setStatus('error');
            setMessage('Database connection error.');
        }
    };

    // --- THE STRICT TIME ENGINE (With Cooldown) ---
    const enforceTimeRules = (currentShift: any, latestLog: any) => {
        const now = new Date();
        const currentHour = now.getHours() + (now.getMinutes() / 60);

        let startH = 0; let endH = 0;

        if (SHIFT_MODE === 12) {
            if (SHIFT_SLOT === 'Day') { startH = 7; endH = 19; }
            if (SHIFT_SLOT === 'Night') { startH = 19; endH = 31; }
        } else if (SHIFT_MODE === 8) {
            if (SHIFT_SLOT === 'Morning') { startH = 3; endH = 11; }
            if (SHIFT_SLOT === 'Day') { startH = 11; endH = 19; }
            if (SHIFT_SLOT === 'Night') { startH = 19; endH = 27; }
        }

        let timeToCompare = currentHour;
        if (startH >= 12 && currentHour < 12) { timeToCompare += 24; }

        const formatTime = (h: number) => {
            let hr24 = Math.floor(h) % 24;
            const ampm = hr24 >= 12 ? 'PM' : 'AM';
            let hr12 = hr24 % 12;
            if (hr12 === 0) hr12 = 12;
            const mins = (h % 1) * 60 === 30 ? ':30' : ':00';
            return `${hr12}${mins} ${ampm}`;
        };

        if (!currentShift) {
            // --- SCENARIO A: GUARD NEEDS TO CLOCK IN ---

            // NEW RULE: Check for Cooldown! (Has it been less than 10 hours since they clocked out?)
            const COOLDOWN_HOURS = SHIFT_MODE === 12 ? 10 : 6;

            if (latestLog && (latestLog.status === 'clocked_out' || latestLog.status === 'auto_clocked_out')) {
                const lastOutTime = new Date(latestLog.clock_out_time).getTime();
                const hoursSinceLastShift = (now.getTime() - lastOutTime) / (1000 * 60 * 60);

                if (hoursSinceLastShift < COOLDOWN_HOURS) {
                    // FORCE LOCK: They already worked recently!
                    setIsWindowOpen(false);
                    setWindowMessage(`You have completed your shift. App unlocks after ${COOLDOWN_HOURS} hours of rest.`);
                    return;
                }
            }

            const clockInStart = startH - 0.5;

            if (timeToCompare >= clockInStart && timeToCompare < endH) {
                setIsWindowOpen(true);
                setMessage('Please clock in to start your shift.');
            } else {
                setIsWindowOpen(false);
                setWindowMessage(`Your ${SHIFT_SLOT} shift starts at ${formatTime(startH)}. Button unlocks 30 mins before.`);
            }
        } else {
            // --- SCENARIO B: GUARD IS ALREADY CLOCKED IN (Check Clock-Out Rules) ---
            const clockOutStart = endH - 0.5;
            const clockOutEnd = endH + 2;

            if (timeToCompare >= clockOutStart && timeToCompare < clockOutEnd) {
                setIsWindowOpen(true);
                setMessage('Shift complete. You may now clock out.');
            } else if (timeToCompare < clockOutStart) {
                setIsWindowOpen(false);
                setWindowMessage(`Shift in progress. Clock-out unlocks at ${formatTime(clockOutStart)}.`);
            } else {
                setIsWindowOpen(true);
                setMessage('You missed your checkout window. Please clock out now.');
            }
        }
    };
    const handleAttendanceAction = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('processing');
        setMessage('Verifying location and uploading photo...');

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const guardLat = position.coords.latitude;
                    const guardLng = position.coords.longitude;

                    const distance = getDistance(
                        { latitude: guardLat, longitude: guardLng },
                        { latitude: SITE_LAT, longitude: SITE_LNG }
                    );

                    if (distance > ALLOWED_RADIUS_METERS) {
                        setStatus('error');
                        setMessage(`Access Denied: You are ${distance} meters away from the site!`);
                        return;
                    }

                    try {
                        if (activeShift) {
                            // ==========================================
                            // CLOCK OUT LOGIC (AUTO-DELETE PHOTO)
                            // ==========================================

                            // 1. Extract filename and delete from Supabase Storage Bucket
                            if (activeShift.selfie_url) {
                                const fileName = activeShift.selfie_url.split('/').pop();
                                if (fileName) {
                                    await supabase.storage.from('selfies').remove([fileName]);
                                }
                            }

                            // 2. Update DB and set selfie_url to null
                            const { error: dbError } = await supabase.from('attendance_logs').update({
                                clock_out_time: new Date().toISOString(),
                                status: 'clocked_out',
                                selfie_url: null // Erases the image from the database
                            }).eq('id', activeShift.id);

                            if (dbError) throw dbError;

                            setStatus('success');
                            setMessage('Clock-Out Successful! Shift ended.');

                        } else {
                            // ==========================================
                            // CLOCK IN LOGIC (UPLOAD NEW PHOTO)
                            // ==========================================

                            const fileExt = file.name.split('.').pop();
                            const fileName = `${Date.now()}_guard_in.${fileExt}`;

                            const { error: uploadError } = await supabase.storage.from('selfies').upload(fileName, file);
                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage.from('selfies').getPublicUrl(fileName);

                            const { error: dbError } = await supabase.from('attendance_logs').insert([{
                                guard_id: GUARD_ID,
                                site_id: SITE_ID,
                                lat: guardLat,
                                lng: guardLng,
                                selfie_url: publicUrl,
                                status: 'clocked_in'
                            }]);

                            if (dbError) throw dbError;

                            setStatus('success');
                            setMessage('Clock-In Successful! Have a safe shift.');
                        }

                        // Auto-redirect
                        setTimeout(() => navigate('/guard'), 3000);

                    } catch (err: any) {
                        // ... keep your existing catch block here
                        setStatus('error');
                        setMessage('System Error. Please try again.');
                    }
                },
                () => {
                    setStatus('error');
                    setMessage('GPS Error: Please enable location services.');
                },
                { enableHighAccuracy: true }
            );
        }
    };
    const handleClockOutOnly = async () => {
        setStatus('processing');
        setMessage('Verifying GPS location for Clock-Out...');

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const guardLat = position.coords.latitude;
                    const guardLng = position.coords.longitude;

                    const distance = getDistance(
                        { latitude: guardLat, longitude: guardLng },
                        { latitude: SITE_LAT, longitude: SITE_LNG }
                    );

                    if (distance > ALLOWED_RADIUS_METERS) {
                        setStatus('error');
                        setMessage(`Access Denied: You are ${distance} meters away from the site!`);
                        return;
                    }

                    try {
                        // 1. Delete old selfie from storage
                        if (activeShift?.selfie_url) {
                            const fileName = activeShift.selfie_url.split('/').pop();
                            if (fileName) {
                                await supabase.storage.from('selfies').remove([fileName]);
                            }
                        }

                        // 2. Update database
                        const { error: dbError } = await supabase.from('attendance_logs').update({
                            clock_out_time: new Date().toISOString(),
                            status: 'clocked_out',
                            selfie_url: null
                        }).eq('id', activeShift.id);

                        if (dbError) throw dbError;

                        setStatus('success');
                        setMessage('Clock-Out Successful! Shift ended.');
                        setTimeout(() => navigate('/guard'), 3000);

                    } catch (err: any) {
                        setStatus('error');
                        setMessage('System Error. Please try again.');
                    }
                },
                () => {
                    setStatus('error');
                    setMessage('GPS Error: Please enable location services.');
                },
                { enableHighAccuracy: true }
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 p-6 text-center relative">

                <button onClick={() => navigate('/guard')} className="absolute top-6 left-6 text-gray-400 hover:text-white transition">
                    <ArrowLeft className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2 mt-2">Eagle Eye Command</h2>

                <div className="flex items-center justify-center gap-2 mb-6 mt-1">
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-gray-600">
                        {SHIFT_MODE}HR {SHIFT_SLOT} SHIFT
                    </span>
                </div>

                {status === 'checking' ? (
                    <div className="flex flex-col items-center py-10">
                        <Loader2 className="h-12 w-12 text-ees-red animate-spin mb-4" />
                        <p className="text-gray-400 font-bold tracking-widest uppercase">Syncing Data...</p>
                    </div>
                ) : status === 'success' ? (
                    <div className="flex flex-col items-center animate-fade-in-up py-6">
                        <CheckCircle className="h-24 w-24 mb-4 text-green-500" />
                        <p className="text-xl font-bold text-white">{activeShift ? 'Shift Ended' : 'Shift Started'}</p>
                    </div>
                ) : (
                    <div className="relative animate-fade-in-up">

                        {/* FIXED LOGIC: If window is closed, show lock NO MATTER WHAT */}
                        {!isWindowOpen ? (
                            <div className="flex flex-col items-center justify-center w-48 h-48 mx-auto rounded-full bg-gray-700 border-4 border-gray-600 shadow-inner opacity-70">
                                <Clock className="h-14 w-14 text-gray-400 mb-2" />
                                <span className="text-gray-400 font-extrabold tracking-widest text-lg">LOCKED</span>
                            </div>
                        ) : (
                            <>
                                <>
                                    {/* IF CLOCKED IN -> SHOW SIMPLE BUTTON (NO CAMERA) */}
                                    {activeShift ? (
                                        <button
                                            onClick={handleClockOutOnly}
                                            disabled={status === 'processing'}
                                            className={`flex flex-col items-center justify-center w-48 h-48 mx-auto rounded-full transition-all ${status === 'processing' ? 'bg-gray-700 border-gray-500' : 'bg-blue-600 hover:bg-blue-700 border-4 border-blue-900 shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                                                }`}
                                        >
                                            {status === 'processing' ? (
                                                <Loader2 className="h-16 w-16 text-white animate-spin" />
                                            ) : (
                                                <>
                                                    <LogOut className="h-14 w-14 text-white mb-2" />
                                                    <span className="text-white font-extrabold tracking-widest text-lg">CLOCK OUT</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        /* IF NOT CLOCKED IN -> SHOW FILE INPUT (FORCE CAMERA) */
                                        <>
                                            <input
                                                type="file" accept="image/*" capture="user" onChange={handleAttendanceAction}
                                                className="hidden" id="camera-input" disabled={status === 'processing'}
                                            />
                                            <label
                                                htmlFor="camera-input"
                                                className={`flex flex-col items-center justify-center w-48 h-48 mx-auto rounded-full cursor-pointer transition-all ${status === 'processing' ? 'bg-gray-700 border-gray-500' : 'bg-ees-red hover:bg-red-700 border-4 border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                                                    }`}
                                            >
                                                {status === 'processing' ? (
                                                    <Loader2 className="h-16 w-16 text-white animate-spin" />
                                                ) : (
                                                    <>
                                                        <Camera className="h-14 w-14 text-white mb-2" />
                                                        <span className="text-white font-extrabold tracking-widest text-lg">CLOCK IN</span>
                                                    </>
                                                )}
                                            </label>
                                        </>
                                    )}
                                </>
                            </>
                        )}

                    </div>
                )}

                {/* FIXED MESSAGE LOGIC */}
                <p className={`mt-8 font-medium ${status === 'success' ? 'text-green-400' :
                    status === 'error' ? 'text-red-400' :
                        !isWindowOpen ? 'text-orange-400 text-sm' : 'text-gray-300'
                    }`}>
                    {!isWindowOpen ? windowMessage : message}
                </p>

            </div>
        </div>
    );
};

export default GuardAttendance;