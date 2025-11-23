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
    const [mode, setMode] = useState<'login' | 'register' | 'lang_select' | 'age_verify'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState<number>(0);
    const [language, setLanguage] = useState<'DE' | 'EN'>('DE');
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

        if (mode === 'lang_select') {
            setMode('age_verify');
            return;
        }

        if (mode === 'age_verify') {
            if (age < 12) {
                setError('Du musst mindestens 12 Jahre alt sein.');
                return;
            }
            setMode('register');
            return;
        }

        // Validation
        if (!username || !password) {
            setError('Bitte fülle alle Felder aus');
            return;
        }

        if (username.length < 3) {
            setError('Benutzername zu kurz (mindestens 3 Zeichen)');
            return;
        }

        if (username.length > 30) {
            setError('Benutzername zu lang (maximal 30 Zeichen)');
            return;
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            setError('Nur Buchstaben und Zahlen erlaubt (a-z, 0-9)');
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
        if (mode === 'login') {
            setMode('lang_select'); // Start registration flow
        } else {
            setMode('login');
        }
        resetForm();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? 'ANMELDEN' : mode === 'lang_select' ? 'SPRACHE' : mode === 'age_verify' ? 'ALTER' : 'REGISTRIEREN'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-400" />
                        <span className="text-sm text-red-300">{error}</span>
                    </div>
                )}

                {mode === 'lang_select' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setLanguage('DE')}
                            className={`p-6 rounded-2xl border-2 transition-all ${language === 'DE' ? 'border-lexi-fuchsia bg-lexi-fuchsia/20' : 'border-white/10 bg-gray-900'}`}
                        >
                            <span className="text-4xl block mb-2">🇩🇪</span>
                            <span className="font-bold text-white">Deutsch</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setLanguage('EN')}
                            className={`p-6 rounded-2xl border-2 transition-all ${language === 'EN' ? 'border-lexi-cyan bg-lexi-cyan/20' : 'border-white/10 bg-gray-900'}`}
                        >
                            <span className="text-4xl block mb-2">🇺🇸</span>
                            <span className="font-bold text-white">English</span>
                        </button>
                        <button
                            type="submit"
                            className="col-span-2 w-full py-4 bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all"
                        >
                            Weiter
                        </button>
                    </div>
                )}

                {mode === 'age_verify' && (
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Dein Alter</label>
                        <input
                            type="number"
                            value={age || ''}
                            onChange={(e) => setAge(parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white text-center font-bold text-xl focus:outline-none focus:border-lexi-fuchsia transition-colors"
                            placeholder="Alter eingeben"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">Mindestalter: 12 Jahre</p>
                        <button
                            type="submit"
                            disabled={!age}
                            className="w-full mt-4 py-4 bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            Weiter
                        </button>
                    </div>
                )}

                {(mode === 'login' || mode === 'register') && (
                    <>
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
                                    maxLength={30}
                                    autoFocus={mode === 'register'} 
                                />
                            </div>
                            {mode === 'register' && <p className="text-xs text-gray-500 mt-1 text-right">{username.length}/30 Zeichen</p>}
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
                    </>
                )}

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
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Lädt...' : 'Registrieren'}
                        </button>
                    </>
                )}

                {/* Login Button */}
                {mode === 'login' && (
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Lädt...' : 'Anmelden'}
                    </button>
                )}

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
