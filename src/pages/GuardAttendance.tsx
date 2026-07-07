import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getDistance } from 'geolib';
import { Camera, MapPin, CheckCircle, Loader2 } from 'lucide-react';

const GuardAttendance = () => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('Please clock in to start your shift.');

    // DUMMY DATA FOR TESTING
    const activeGuard = JSON.parse(localStorage.getItem('active_guard') || '{}');
    const GUARD_ID = activeGuard.id || null;
    const DUMMY_SITE_ID = null;
    // Let's assume the "Factory" is roughly near your current city coordinates
    const SITE_LAT = 28.8386; // Moradabad Lat
    const SITE_LNG = 78.7733; // Moradabad Lng
    const ALLOWED_RADIUS_METERS = 50000; // 50km for testing. Change to 50 later!

    const handleClockIn = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('processing');
        setMessage('Verifying location and uploading photo...');

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const guardLat = position.coords.latitude;
                    const guardLng = position.coords.longitude;

                    // 1. Check Distance (Geo-Fencing)
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
                        // 2. Upload Selfie to Supabase Storage
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}_guard.${fileExt}`;

                        const { error: uploadError, data: uploadData } = await supabase.storage
                            .from('selfies')
                            .upload(fileName, file);

                        if (uploadError) throw uploadError;

                        // Get the public URL of the uploaded photo
                        const { data: { publicUrl } } = supabase.storage
                            .from('selfies')
                            .getPublicUrl(fileName);

                        // 3. Save to Database
                        const { error: dbError } = await supabase.from('attendance_logs').insert([
                            {
                                guard_id: GUARD_ID,
                                site_id: DUMMY_SITE_ID,
                                lat: guardLat,
                                lng: guardLng,
                                selfie_url: publicUrl,
                                status: 'clocked_in'
                            }
                        ]);

                        if (dbError) throw dbError;

                        setStatus('success');
                        setMessage('Clock-In Successful! Have a safe shift.');

                    } catch (err: any) {
                        console.error(err);
                        setStatus('error');
                        setMessage('System Error: ' + err.message);
                    }
                },
                (error) => {
                    setStatus('error');
                    setMessage('GPS Error: Please enable location services.');
                },
                { enableHighAccuracy: true }
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 p-6 text-center">

                <h2 className="text-2xl font-bold text-white mb-2">Eagle Eye Command</h2>
                <div className="flex items-center justify-center gap-2 mb-8 text-ees-red text-sm font-semibold">
                    <MapPin className="h-4 w-4" /> Geo-Fenced Zone Active
                </div>

                {status === 'success' ? (
                    <div className="flex flex-col items-center animate-fade-in-up">
                        <CheckCircle className="h-24 w-24 mb-4 text-green-500" />
                        <p className="text-xl font-bold text-white">Shift Started</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* The hidden file input that opens the front camera */}
                        <input
                            type="file"
                            accept="image/*"
                            capture="user"
                            onChange={handleClockIn}
                            className="hidden"
                            id="camera-input"
                            disabled={status === 'processing'}
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
                                    <Camera className="h-16 w-16 text-white mb-2" />
                                    <span className="text-white font-bold tracking-wider">CLOCK IN</span>
                                </>
                            )}
                        </label>
                    </div>
                )}

                <p className={`mt-8 text-lg font-medium ${status === 'success' ? 'text-green-400' :
                    status === 'error' ? 'text-red-400' :
                        'text-gray-300'
                    }`}>
                    {message}
                </p>

            </div>
        </div>
    );
};

export default GuardAttendance;