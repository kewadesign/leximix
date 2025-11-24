import React, { useState, useEffect } from 'react';
import { Modal } from './UI';
import { registerUser, loginUser } from '../utils/firebase';
import { User, Lock, AlertCircle, Calculator, Mail, CheckCircle } from 'lucide-react';
import { TRANSLATIONS } from '../translations';
import { Language } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (username: string) => void;
    lang: Language;
    onLanguageChange: (lang: Language) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, lang, onLanguageChange }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'age_verify' | 'language_select' | 'select_auth_type'>('select_auth_type');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState<number>(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showVerificationSent, setShowVerificationSent] = useState(false);

    const t = TRANSLATIONS[lang].auth;

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

        if (mode === 'age_verify') {
            if (age < 12 || age > 120) {
                setError('Das Alter muss zwischen 12 und 120 Jahren liegen.');
                return;
            }
            setMode('register');
            return;
        }

        // Validation
        if (!email || !password) {
            setError('Bitte fülle alle Felder aus');
            return;
        }
        
        if (mode === 'register' && !username) {
            setError('Bitte wähle einen Benutzernamen');
            return;
        }

        // Basic Email validation
        if (!/\S+@\S+\.\S+/.test(email)) {
             setError('Bitte gib eine gültige E-Mail-Adresse ein');
             return;
        }

        if (mode === 'register') {
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
                const result = await registerUser(email, password, username, { language: lang, age });
                if (result.success) {
                    setShowVerificationSent(true);
                } else {
                    setError(result.error || 'Registrierung fehlgeschlagen');
                }
            } else {
                const result = await loginUser(email, password);
                if (result.success && result.username) {
                    onSuccess(result.username);
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
        setEmail('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setCaptchaInput('');
        setError('');
        setShowVerificationSent(false);
    };

    // If verification sent, show special view
    if (showVerificationSent) {
        return (
             <Modal isOpen={isOpen} onClose={onClose} title="E-Mail bestätigen">
                <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Mail size={40} className="text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Fast geschafft!</h3>
                    <p className="text-gray-300">
                        Wir haben dir eine Bestätigungs-E-Mail an <span className="text-lexi-fuchsia font-bold">{email}</span> gesendet.
                        Bitte klicke auf den Link in der E-Mail, um deinen Account zu aktivieren.
                    </p>
                    <button
                        onClick={() => {
                            setMode('login');
                            setShowVerificationSent(false);
                        }}
                        className="w-full py-4 bg-gray-800 border border-white/10 rounded-xl text-white font-bold hover:bg-gray-700 transition-all"
                    >
                        Zum Login
                    </button>
                </div>
             </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? t.login : mode === 'age_verify' ? 'ALTER' : mode === 'language_select' ? 'LANGUAGE' : mode === 'register' ? t.register : 'WELCOME'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-400" />
                        <span className="text-sm text-red-300">{error}</span>
                    </div>
                )}

                {mode === 'select_auth_type' && (
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="w-full py-4 bg-gray-800 border border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-700 transition-all group"
                        >
                            <span className="font-bold text-white text-lg group-hover:text-lexi-fuchsia transition-colors">{t.login}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('language_select')}
                            className="w-full py-4 bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all shadow-lg"
                        >
                            {t.register}
                        </button>
                    </div>
                )}

                {mode === 'language_select' && (
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            type="button"
                            onClick={() => { onLanguageChange(Language.DE); setMode('age_verify'); }}
                            className="p-4 bg-gray-800 border border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-700 transition-all group"
                        >
                            <span className="text-2xl">🇩🇪</span>
                            <span className="font-bold text-white group-hover:text-lexi-fuchsia transition-colors">DEUTSCH</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { onLanguageChange(Language.EN); setMode('age_verify'); }}
                            className="p-4 bg-gray-800 border border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-700 transition-all group"
                        >
                            <span className="text-2xl">🇬🇧</span>
                            <span className="font-bold text-white group-hover:text-lexi-fuchsia transition-colors">ENGLISH</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { onLanguageChange(Language.ES); setMode('age_verify'); }}
                            className="p-4 bg-gray-800 border border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-700 transition-all group"
                        >
                            <span className="text-2xl">🇪🇸</span>
                            <span className="font-bold text-white group-hover:text-lexi-fuchsia transition-colors">ESPAÑOL</span>
                        </button>
                    </div>
                )}

                {mode === 'age_verify' && (
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">{t.age}</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={age || ''}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                const num = parseInt(val);
                                if (!val || num <= 120) {
                                    setAge(val ? num : 0);
                                }
                            }}
                            className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white text-center font-bold text-xl focus:outline-none focus:border-lexi-fuchsia transition-colors"
                            placeholder={t.age}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">{t.minAge}</p>
                        <button
                            type="submit"
                            disabled={!age}
                            className="w-full mt-4 py-4 bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            {TRANSLATIONS[lang].ONBOARDING.CONTINUE}
                        </button>
                    </div>
                )}

                {(mode === 'login' || mode === 'register') && (
                    <>
                        {/* Email */}
                         <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">E-MAIL</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-3 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lexi-fuchsia transition-colors"
                                    placeholder="deine@email.com"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Username - ONLY FOR REGISTER */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">{t.username}</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-3 text-gray-500" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lexi-fuchsia transition-colors"
                                        placeholder={t.username}
                                        disabled={loading}
                                        maxLength={30}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">{username.length}/30</p>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">{t.password}</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lexi-fuchsia transition-colors"
                                    placeholder={t.password}
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
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">{t.confirmPassword}</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3 text-gray-500" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lexi-fuchsia transition-colors"
                                    placeholder={t.confirmPassword}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* CAPTCHA */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <label className="block text-sm font-bold text-lexi-fuchsia mb-2 uppercase flex items-center gap-2">
                                <Calculator size={16} />
                                {t.captcha}: {captcha.num1} + {captcha.num2} = ?
                            </label>
                            <input
                                type="number"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lexi-fuchsia transition-colors text-center font-bold text-lg"
                                placeholder={t.result}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? t.loading : t.register}
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
                        {loading ? t.loading : t.login}
                    </button>
                )}

                {/* Back Button */}
                {mode !== 'select_auth_type' && (
                    <button
                        type="button"
                        onClick={() => {
                            setMode('select_auth_type');
                            resetForm();
                        }}
                        className="w-full text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <span>←</span> {lang === 'DE' ? 'Zurück' : lang === 'ES' ? 'Atrás' : 'Back'}
                    </button>
                )}
            </form>
        </Modal>
    );
};

