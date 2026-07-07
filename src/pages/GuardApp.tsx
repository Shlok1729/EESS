import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, Camera, QrCode, LogOut } from 'lucide-react';

export default function GuardApp() {
    const [guards, setGuards] = useState<any[]>([]);
    const [selectedGuard, setSelectedGuard] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGuards();
        // Check if a guard is already logged into this phone
        const savedGuard = localStorage.getItem('active_guard');
        if (savedGuard) setSelectedGuard(JSON.parse(savedGuard));
    }, []);

    const fetchGuards = async () => {
        const { data } = await supabase.from('guards').select('*').ilike('status', 'active');
        if (data) setGuards(data);
        setLoading(false);
    };

    const handleLogin = (guard: any) => {
        setSelectedGuard(guard);
        localStorage.setItem('active_guard', JSON.stringify(guard));
    };

    const handleLogout = () => {
        setSelectedGuard(null);
        localStorage.removeItem('active_guard');
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
                    {!selectedGuard ? (
                        <div className="animate-fade-in-up">
                            <h2 className="text-white text-lg font-bold mb-4 text-center">Select Your Profile</h2>

                            {guards.length === 0 ? (
                                <p className="text-red-400 text-center text-sm">No active guards found in database.</p>
                            ) : (
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                    {guards.map(guard => (
                                        <button
                                            key={guard.id}
                                            onClick={() => handleLogin(guard)}
                                            className="w-full bg-gray-700 hover:bg-ees-red text-white p-4 rounded-xl text-left font-bold transition-colors flex items-center gap-3"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl">
                                                {guard.name.charAt(0)}
                                            </div>
                                            {guard.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-fade-in-up flex flex-col gap-4">
                            <div className="bg-gray-700 p-4 rounded-xl flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase">Active Duty</p>
                                    <p className="text-white font-bold text-xl">{selectedGuard.name}</p>
                                </div>
                                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-2 transition">
                                    <LogOut className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <button
                                onClick={() => navigate('/guard/clock-in')}
                                className="w-full bg-ees-red hover:bg-red-700 text-white p-6 rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex flex-col items-center gap-3 border-2 border-red-800"
                            >
                                <Camera className="h-10 w-10" />
                                CLOCK IN (SELFIE)
                            </button>

                            <button
                                onClick={() => navigate('/guard/patrol')}
                                className="w-full bg-ees-navy hover:bg-blue-900 text-white p-6 rounded-2xl font-bold text-lg transition-all shadow-lg flex flex-col items-center gap-3 border-2 border-blue-900 mt-2"
                            >
                                <QrCode className="h-10 w-10" />
                                NIGHT PATROL (SCAN)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}