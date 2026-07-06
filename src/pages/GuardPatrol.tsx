"use client";
import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, MapPin } from 'lucide-react';

const GuardPatrol = () => {
    const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('Point camera at the Checkpoint QR code');

    // Hardcoded for testing right now (We will dynamically fetch these when we build the Clock-In system)
    const DUMMY_GUARD_ID = null; // We can leave this null in the DB for our first test

    const handleScan = async (scannedText: string) => {
        if (scanStatus === 'processing' || scanStatus === 'success') return;

        setScanStatus('processing');
        setMessage('Getting GPS location...');

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setMessage('Verifying checkpoint...');

                    try {
                        // Insert the log into Supabase
                        // The scannedText IS the checkpoint_id we generated in the DB
                        const { error } = await supabase.from('patrol_logs').insert([
                            {
                                checkpoint_id: scannedText,
                                guard_id: DUMMY_GUARD_ID,
                                lat: lat,
                                lng: lng,
                                status: 'success'
                            }
                        ]);

                        if (error) throw error;

                        setScanStatus('success');
                        setMessage('Checkpoint Verified Successfully!');

                        // Reset scanner after 3 seconds for the next QR code
                        setTimeout(() => {
                            setScanStatus('idle');
                            setMessage('Scan next checkpoint');
                        }, 3000);

                    } catch (err) {
                        console.error(err);
                        setScanStatus('error');
                        setMessage('Invalid QR Code or Database Error.');
                        setTimeout(() => setScanStatus('idle'), 3000);
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
            <div className="w-full max-w-md bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">

                {/* Header */}
                <div className="bg-ees-navy p-4 text-center border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white tracking-wider">EAGLE EYE PATROL</h2>
                    <div className="flex items-center justify-center gap-2 mt-2 text-ees-red text-sm font-semibold">
                        <MapPin className="h-4 w-4" /> Live GPS Tracking Active
                    </div>
                </div>

                {/* Scanner Area */}
                <div className="relative aspect-square bg-black flex items-center justify-center">
                    {scanStatus === 'idle' || scanStatus === 'processing' ? (
                        <Scanner
                            onScan={(result) => handleScan(result[0].rawValue)}
                            onError={(error) => console.log(error?.message)}
                            scanDelay={1000}
                        />
                    ) : scanStatus === 'success' ? (
                        <div className="flex flex-col items-center animate-fade-in-up text-green-500">
                            <CheckCircle className="h-24 w-24 mb-4" />
                            <p className="text-xl font-bold text-white">Verified</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center animate-fade-in-up text-red-500">
                            <XCircle className="h-24 w-24 mb-4" />
                            <p className="text-xl font-bold text-white">Scan Failed</p>
                        </div>
                    )}
                </div>

                {/* Status Message Footer */}
                <div className="p-6 text-center">
                    <p className={`text-lg font-medium ${scanStatus === 'success' ? 'text-green-400' :
                        scanStatus === 'error' ? 'text-red-400' :
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