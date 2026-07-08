import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check if already logged in
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/admin');
        });
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Invalid email or password. Access Denied.');
            setLoading(false);
        } else {
            navigate('/admin');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 animate-fade-in-up">

                <div className="bg-ees-navy p-8 text-center border-b border-gray-700 flex flex-col items-center">
                    <div className="bg-gray-800 p-4 rounded-full border-2 border-gray-600 mb-4">
                        <Shield className="h-12 w-12 text-ees-red" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-widest">EAGLE EYE</h1>
                    <p className="text-ees-red text-sm font-bold tracking-widest uppercase mt-1">Command Center</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && <p className="bg-red-900/30 text-red-400 text-sm p-3 rounded-lg border border-red-800 text-center font-semibold">{error}</p>}

                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Admin Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <input
                                type="email" required
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-ees-red transition"
                                placeholder="director@eagleeye.in"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Passcode</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <input
                                type="password" required
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-ees-red transition"
                                placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-ees-red hover:bg-red-700 text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'AUTHORIZE ACCESS'}
                    </button>
                </form>
            </div>
        </div>
    );
}