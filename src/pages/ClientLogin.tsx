import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Loader2 } from 'lucide-react';

export default function ClientLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/client/dashboard');
        });
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError('Invalid email or password.');
            setLoading(false);
        } else {
            navigate('/client/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200">
                <div className="bg-ees-light p-8 text-center border-b border-gray-200">
                    <img src="/logo.png" alt="Eagle Eye" className="h-16 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-ees-navy tracking-tight">CLIENT PORTAL</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Secure access to your site logs</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-5">
                    {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 text-center font-bold">{error}</p>}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Company Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input type="email" required className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-ees-red" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input type="password" required className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-ees-red" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-ees-navy hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-4">
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'SECURE LOGIN'}
                    </button>
                </form>
            </div>
        </div>
    );
}