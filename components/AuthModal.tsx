import React, { useState, useEffect } from 'react';
import { Modal } from './UI';
import { registerUser, loginUser } from '../utils/firebase';
import { User, Lock, AlertCircle, Calculator } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (username: string) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // CAPTCHA State
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
    const [captchaInput, setCaptchaInput] = useState('');

    const generateCaptcha = () => {
        setCaptcha({
            num1: Math.floor(Math.random() * 10) + 1,
            num2: Math.floor(Math.random() * 10) + 1
        });
        setCaptchaInput('');
    };

    useEffect(() => {
        if (isOpen && mode === 'register') {
            generateCaptcha();
        }
    }, [isOpen, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!username || !password) {
            setError('Bitte fülle alle Felder aus');
            return;
        }

        if (username.length < 3) {
            setError('Benutzername muss mindestens 3 Zeichen lang sein');
            return;
        }

        if (password.length < 6) {
            setError('Passwort muss mindestens 6 Zeichen lang sein');
            return;
        }

        if (mode === 'register') {
            if (password !== confirmPassword) {
                setError('Passwörter stimmen nicht überein');
                return;
            }

            // CAPTCHA Validation
            const sum = captcha.num1 + captcha.num2;
            if (parseInt(captchaInput) !== sum) {
                setError('Falsches Ergebnis bei der Rechenaufgabe');
                generateCaptcha(); // Reset on fail
                return;
            }
        }

        setLoading(true);

        try {
            if (mode === 'register') {
                const result = await registerUser(username, password);
                if (result.success) {
                    onSuccess(username);
                    onClose();
                } else {
                    setError(result.error || 'Registrierung fehlgeschlagen');
                }
            } else {
                const result = await loginUser(username, password);
                if (result.success) {
                    onSuccess(username);
                    onClose();
                } else {
                    setError(result.error || 'Login fehlgeschlagen');
                }
            }
        } catch (err) {
            setError('Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setCaptchaInput('');
        setError('');
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        resetForm();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'ANMELDEN' : 'REGISTRIEREN'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-400" />
                        <span className="text-sm text-red-300">{error}</span>
                    </div>
                )}

                {/* Username */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Benutzername</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lexi-fuchsia transition-colors"
                            placeholder="Dein Benutzername"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Passwort</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lexi-fuchsia transition-colors"
                            placeholder="Dein Passwort"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Confirm Password (only for register) */}
                {mode === 'register' && (
                    <>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Passwort bestätigen</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3 text-gray-500" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lexi-fuchsia transition-colors"
                                    placeholder="Passwort wiederholen"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* CAPTCHA */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <label className="block text-sm font-bold text-lexi-fuchsia mb-2 uppercase flex items-center gap-2">
                                <Calculator size={16} />
                                Sicherheitsfrage: {captcha.num1} + {captcha.num2} = ?
                            </label>
                            <input
                                type="number"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lexi-fuchsia transition-colors text-center font-bold text-lg"
                                placeholder="Ergebnis"
                                disabled={loading}
                            />
                        </div>
                    </>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {loading ? 'Lädt...' : mode === 'login' ? 'Anmelden' : 'Registrieren'}
                </button>

                {/* Mode Switch */}
                <button
                    type="button"
                    onClick={switchMode}
                    className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                >
                    {mode === 'login' ? (
                        <>Noch kein Account? <span className="text-lexi-fuchsia font-bold">Jetzt registrieren</span></>
                    ) : (
                        <>Schon einen Account? <span className="text-lexi-fuchsia font-bold">Jetzt anmelden</span></>
                    )}
                </button>
            </form>
        </Modal>
    );
};
