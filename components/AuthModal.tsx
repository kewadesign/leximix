import React, { useState, useEffect } from 'react';
import { Modal } from './UI';
import { registerUser, loginUser } from '../utils/api';
import {
    IoMailSharp,
    IoPersonSharp,
    IoLockClosedSharp,
    IoWarningSharp,
    IoCalculatorSharp,
    IoCheckmarkCircleSharp,
    IoGlobeSharp,
    IoSettingsSharp
} from 'react-icons/io5';
import { TRANSLATIONS } from '../translations';
import { Language, UserState } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (username: string, userData?: UserState) => void;
    lang: Language;
    onLanguageChange: (lang: Language) => void;
    embedded?: boolean;
    initialMode?: 'login' | 'register' | 'age_verify' | 'language_select' | 'select_auth_type' | 'password_reset';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, lang, onLanguageChange, embedded = false, initialMode = 'select_auth_type' }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'age_verify' | 'language_select' | 'select_auth_type' | 'password_reset'>(initialMode);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [age, setAge] = useState<number>(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showVerificationSent, setShowVerificationSent] = useState(false);
    const [showPasswordResetSent, setShowPasswordResetSent] = useState(false);

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

        if (mode === 'password_reset') {
            return handlePasswordReset(e);
        }

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
                if (result.success && result.user) {
                    // Registration successful - directly logged in (no email verification needed)
                    onSuccess(result.user.username, result.userData as UserState);
                    onClose();
                } else {
                    setError(result.error || 'Registrierung fehlgeschlagen');
                }
            } else {
                const result = await loginUser(email, password);
                if (result.success && result.user) {
                    onSuccess(result.user.username, result.userData as UserState);
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

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Bitte gib deine E-Mail-Adresse ein');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Bitte gib eine gültige E-Mail-Adresse ein');
            return;
        }

        setLoading(true);
        try {
            const { requestPasswordReset } = await import('../utils/api');
            const result = await requestPasswordReset(email);
            if (result.success) {
                setShowPasswordResetSent(true);
            } else {
                setError(result.error || 'Fehler beim Senden');
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

    // Rainbow stripe component
    const RainbowStripe = () => (
        <div className="flex h-3 w-full">
            <div className="flex-1" style={{ background: '#FF006E' }}></div>
            <div className="flex-1" style={{ background: '#FF7F00' }}></div>
            <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
            <div className="flex-1" style={{ background: '#06FFA5' }}></div>
            <div className="flex-1" style={{ background: '#8338EC' }}></div>
        </div>
    );

    // If verification sent, show special view
    if (showVerificationSent) {
        const content = (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8" style={{ background: 'var(--color-bg)' }}>
                <RainbowStripe />
                <div className="flex flex-col items-center space-y-6 text-center max-w-md">
                    <div
                        className="p-6"
                        style={{
                            background: '#06FFA5',
                            border: '4px solid #000',
                            boxShadow: '8px 8px 0px #000',
                            transform: 'skew(-5deg)'
                        }}
                    >
                        <IoCheckmarkCircleSharp size={60} color="#000" />
                    </div>
                    <h3 className="text-4xl font-black uppercase" style={{ color: '#000', transform: 'skew(-5deg)' }}>Fast geschafft!</h3>
                    <p className="text-lg font-bold" style={{ color: '#4A4A4A' }}>
                        Wir haben dir eine Bestätigungs-E-Mail an <span style={{ color: '#FF006E' }}>{email}</span> gesendet.
                        Bitte klicke auf den Link in der E-Mail, um deinen Account zu aktivieren.
                    </p>
                    <button
                        onClick={() => {
                            setMode('login');
                            setShowVerificationSent(false);
                        }}
                        className="w-full py-4 px-8 font-black uppercase text-xl"
                        style={{
                            background: '#FF7F00',
                            color: '#000',
                            border: '4px solid #000',
                            boxShadow: '8px 8px 0px #000',
                            transform: 'skew(-5deg)',
                            transition: 'all 0.1s linear'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                            e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'skew(-5deg)';
                            e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                        }}
                    >
                        Zum Login
                    </button>
                </div>
            </div>
        );

        if (embedded) return content;
        return <Modal isOpen={isOpen} onClose={onClose} title="E-Mail bestätigen">{content}</Modal>;
    }

    // If password reset sent, show special view
    if (showPasswordResetSent) {
        const content = (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8" style={{ background: 'var(--color-bg)' }}>
                <RainbowStripe />
                <div className="flex flex-col items-center space-y-6 text-center max-w-md">
                    <div
                        className="p-6"
                        style={{
                            background: '#8338EC',
                            border: '4px solid #000',
                            boxShadow: '8px 8px 0px #000',
                            transform: 'skew(-5deg)'
                        }}
                    >
                        <IoCheckmarkCircleSharp size={60} color="#FFF" />
                    </div>
                    <h3 className="text-4xl font-black uppercase" style={{ color: '#000', transform: 'skew(-5deg)' }}>{t.resetEmailSent}</h3>
                    <p className="text-lg font-bold" style={{ color: '#4A4A4A' }}>
                        {t.checkEmail}
                    </p>
                    <button
                        onClick={() => {
                            setMode('login');
                            setShowPasswordResetSent(false);
                            resetForm();
                        }}
                        className="w-full py-4 px-8 font-black uppercase text-xl"
                        style={{
                            background: '#FF006E',
                            color: '#000',
                            border: '4px solid #000',
                            boxShadow: '8px 8px 0px #000',
                            transform: 'skew(-5deg)',
                            transition: 'all 0.1s linear'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                            e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'skew(-5deg)';
                            e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                        }}
                    >
                        {t.backToLogin}
                    </button>
                </div>
            </div>
        );

        if (embedded) return content;
        return <Modal isOpen={isOpen} onClose={onClose} title={t.resetPassword}>{content}</Modal>;
    }

    const formContent = (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
            <RainbowStripe />

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md space-y-6">
                    {/* Header Icon */}
                    {mode === 'select_auth_type' && (
                        <div className="flex justify-center mb-6">
                            <div
                                className="p-6"
                                style={{
                                    background: '#FFBE0B',
                                    border: '4px solid #000',
                                    boxShadow: '8px 8px 0px #000',
                                    transform: 'skew(-5deg)'
                                }}
                            >
                                <IoPersonSharp size={48} color="#000" />
                            </div>
                        </div>
                    )}
                    {mode === 'language_select' && (
                        <div className="flex justify-center mb-6">
                            <div
                                className="p-6"
                                style={{
                                    background: '#FFBE0B',
                                    border: '4px solid #000',
                                    boxShadow: '8px 8px 0px #000',
                                    transform: 'skew(-5deg)'
                                }}
                            >
                                <IoGlobeSharp size={48} color="#000" />
                            </div>
                        </div>
                    )}
                    {mode === 'age_verify' && (
                        <div className="flex justify-center mb-6">
                            <div
                                className="p-6"
                                style={{
                                    background: '#FF006E',
                                    border: '4px solid #000',
                                    boxShadow: '8px 8px 0px #000',
                                    transform: 'skew(-5deg)'
                                }}
                            >
                                <IoSettingsSharp size={48} color="#FFF" />
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div
                                className="p-4 flex items-center gap-3"
                                style={{
                                    background: '#FF006E',
                                    color: '#FFF',
                                    border: '4px solid #000',
                                    boxShadow: '4px 4px 0px #000'
                                }}
                            >
                                <IoWarningSharp size={24} color="#FFF" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        {mode === 'select_auth_type' && (
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black uppercase text-center mb-8" style={{ color: 'var(--color-text)' }}>
                                    Willkommen!
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="w-full py-5 px-8 font-black uppercase text-xl"
                                    style={{
                                        background: '#FF7F00',
                                        color: '#000',
                                        border: '4px solid #000',
                                        boxShadow: '8px 8px 0px #000',
                                        transform: 'skew(-5deg)',
                                        transition: 'all 0.1s linear'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg)';
                                        e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                                    }}
                                >
                                    {t.login}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('age_verify')}
                                    className="w-full py-5 px-8 font-black uppercase text-xl"
                                    style={{
                                        background: '#FF006E',
                                        color: '#000',
                                        border: '4px solid #000',
                                        boxShadow: '8px 8px 0px #000',
                                        transform: 'skew(-5deg)',
                                        transition: 'all 0.1s linear'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg)';
                                        e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                                    }}
                                >
                                    {t.register}
                                </button>
                            </div>
                        )}

                        {mode === 'language_select' && (
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black uppercase text-center mb-6" style={{ color: 'var(--color-text)' }}>
                                    Wähle deine Sprache
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => { onLanguageChange(Language.DE); setMode('select_auth_type'); }}
                                    className="w-full p-6 flex items-center justify-center gap-4 font-black uppercase text-xl"
                                    style={{
                                        background: '#FF006E',
                                        color: '#000',
                                        border: '4px solid #000',
                                        boxShadow: '8px 8px 0px #000',
                                        transform: 'skew(-5deg)',
                                        transition: 'all 0.1s linear'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg)';
                                        e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                                    }}
                                >
                                    <span className="text-5xl">🇩🇪</span>
                                    <span>DEUTSCH</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { onLanguageChange(Language.EN); setMode('select_auth_type'); }}
                                    className="w-full p-6 flex items-center justify-center gap-4 font-black uppercase text-xl"
                                    style={{
                                        background: '#FF7F00',
                                        color: '#000',
                                        border: '4px solid #000',
                                        boxShadow: '8px 8px 0px #000',
                                        transform: 'skew(-5deg)',
                                        transition: 'all 0.1s linear'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg)';
                                        e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                                    }}
                                >
                                    <span className="text-5xl">🇬🇧</span>
                                    <span>ENGLISH</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { onLanguageChange(Language.ES); setMode('select_auth_type'); }}
                                    className="w-full p-6 flex items-center justify-center gap-4 font-black uppercase text-xl"
                                    style={{
                                        background: '#8338EC',
                                        color: '#FFF',
                                        border: '4px solid #000',
                                        boxShadow: '8px 8px 0px #000',
                                        transform: 'skew(-5deg)',
                                        transition: 'all 0.1s linear'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg)';
                                        e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                                    }}
                                >
                                    <span className="text-5xl">🇪🇸</span>
                                    <span>ESPAÑOL</span>
                                </button>
                            </div>
                        )}

                        {mode === 'age_verify' && (
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black uppercase text-center mb-4" style={{ color: 'var(--color-text)' }}>
                                    {t.age}
                                </h2>
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
                                    className="w-full px-6 py-4 text-center font-black text-3xl"
                                    style={{
                                        background: 'var(--color-surface)',
                                        color: 'var(--color-text)',
                                        border: '4px solid #000',
                                        boxShadow: '4px 4px 0px #000'
                                    }}
                                    placeholder={t.age}
                                    autoFocus
                                />
                                <p className="text-sm font-bold text-center" style={{ color: '#4A4A4A' }}>{t.minAge}</p>
                                <button
                                    type="submit"
                                    disabled={!age}
                                    className="w-full py-5 px-8 font-black uppercase text-xl disabled:opacity-50"
                                    style={{
                                        background: age ? '#FF006E' : '#CCC',
                                        color: '#000',
                                        border: '4px solid #000',
                                        boxShadow: '8px 8px 0px #000',
                                        transform: 'skew(-5deg)',
                                        transition: 'all 0.1s linear'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (age) {
                                            e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'skew(-5deg)';
                                        e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                                    }}
                                >
                                    {TRANSLATIONS[lang].ONBOARDING.CONTINUE}
                                </button>
                            </div>
                        )}

                        {(mode === 'login' || mode === 'register' || mode === 'password_reset') && (
                            <>
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>E-MAIL</label>
                                    <div className="relative">
                                        <div
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2"
                                            style={{
                                                background: '#FFBE0B',
                                                border: '2px solid #000'
                                            }}
                                        >
                                            <IoMailSharp size={18} color="#000" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-20 pr-4 py-4 font-bold"
                                            style={{
                                                background: 'var(--color-surface)',
                                                color: 'var(--color-text)',
                                                border: '4px solid #000',
                                                boxShadow: '4px 4px 0px #000'
                                            }}
                                            placeholder="deine@email.com"
                                            disabled={loading}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Username - ONLY FOR REGISTER */}
                                {mode === 'register' && (
                                    <div>
                                        <label className="block text-sm font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>{t.username}</label>
                                        <div className="relative">
                                            <div
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2"
                                                style={{
                                                    background: '#FF006E',
                                                    border: '2px solid #000'
                                                }}
                                            >
                                                <IoPersonSharp size={18} color="#FFF" />
                                            </div>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                                                className="w-full pl-20 pr-4 py-4 font-bold"
                                                style={{
                                                    background: 'var(--color-surface)',
                                                    color: 'var(--color-text)',
                                                    border: '4px solid #000',
                                                    boxShadow: '4px 4px 0px #000'
                                                }}
                                                placeholder={t.username}
                                                disabled={loading}
                                                maxLength={30}
                                            />
                                        </div>
                                        <p className="text-xs font-bold text-right mt-1" style={{ color: '#4A4A4A' }}>{username.length}/30</p>
                                    </div>
                                )}

                                {/* Password */}
                                {(mode === 'login' || mode === 'register') && (
                                    <div>
                                        <label className="block text-sm font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>{t.password}</label>
                                        <div className="relative">
                                            <div
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2"
                                                style={{
                                                    background: '#8338EC',
                                                    border: '2px solid #000'
                                                }}
                                            >
                                                <IoLockClosedSharp size={18} color="#FFF" />
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-20 pr-4 py-4 font-bold"
                                                style={{
                                                    background: 'var(--color-surface)',
                                                    color: 'var(--color-text)',
                                                    border: '4px solid #000',
                                                    boxShadow: '4px 4px 0px #000'
                                                }}
                                                placeholder={t.password}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Confirm Password (only for register) */}
                                {mode === 'register' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>{t.confirmPassword}</label>
                                            <div className="relative">
                                                <div
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2"
                                                    style={{
                                                        background: '#06FFA5',
                                                        border: '2px solid #000'
                                                    }}
                                                >
                                                    <IoLockClosedSharp size={18} color="#000" />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-20 pr-4 py-4 font-bold"
                                                    style={{
                                                        background: 'var(--color-surface)',
                                                        color: 'var(--color-text)',
                                                        border: '4px solid #000',
                                                        boxShadow: '4px 4px 0px #000'
                                                    }}
                                                    placeholder={t.confirmPassword}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        {/* CAPTCHA */}
                                        <div
                                            className="p-4 space-y-3"
                                            style={{
                                                background: '#FFBE0B',
                                                border: '4px solid #000',
                                                boxShadow: '4px 4px 0px #000',
                                                transform: 'skew(-2deg)'
                                            }}
                                        >
                                            <label className="block text-sm font-black uppercase flex items-center gap-2" style={{ color: '#000' }}>
                                                <IoCalculatorSharp size={20} />
                                                {t.captcha}: {captcha.num1} + {captcha.num2} = ?
                                            </label>
                                            <input
                                                type="number"
                                                value={captchaInput}
                                                onChange={(e) => setCaptchaInput(e.target.value)}
                                                className="w-full px-4 py-3 text-center font-black text-2xl"
                                                style={{
                                                    background: 'var(--color-surface)',
                                                    color: 'var(--color-text)',
                                                    border: '4px solid #000',
                                                    boxShadow: '2px 2px 0px #000'
                                                }}
                                                placeholder={t.result}
                                                disabled={loading}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-5 px-8 font-black uppercase text-xl disabled:opacity-50"
                                            style={{
                                                background: loading ? '#CCC' : '#FF006E',
                                                color: '#000',
                                                border: '4px solid #000',
                                                boxShadow: '8px 8px 0px #000',
                                                transform: 'skew(-5deg)',
                                                transition: 'all 0.1s linear'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!loading) {
                                                    e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'skew(-5deg)';
                                                e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                                            }}
                                        >
                                            {loading ? t.loading : t.register}
                                        </button>
                                    </>
                                )}

                                {/* Login Button */}
                                {mode === 'login' && (
                                    <>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-5 px-8 font-black uppercase text-xl disabled:opacity-50"
                                            style={{
                                                background: loading ? '#CCC' : '#FF7F00',
                                                color: '#000',
                                                border: '4px solid #000',
                                                boxShadow: '8px 8px 0px #000',
                                                transform: 'skew(-5deg)',
                                                transition: 'all 0.1s linear'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!loading) {
                                                    e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'skew(-5deg)';
                                                e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                                            }}
                                        >
                                            {loading ? t.loading : t.login}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode('password_reset');
                                                resetForm();
                                            }}
                                            className="w-full text-sm font-bold uppercase hover:underline"
                                            style={{ color: '#8338EC' }}
                                        >
                                            {t.forgotPassword}
                                        </button>
                                    </>
                                )}

                                {/* Password Reset Form */}
                                {mode === 'password_reset' && (
                                    <button
                                        type="button"
                                        onClick={handlePasswordReset}
                                        disabled={loading}
                                        className="w-full py-5 px-8 font-black uppercase text-xl disabled:opacity-50"
                                        style={{
                                            background: loading ? '#CCC' : '#8338EC',
                                            color: '#FFF',
                                            border: '4px solid #000',
                                            boxShadow: '8px 8px 0px #000',
                                            transform: 'skew(-5deg)',
                                            transition: 'all 0.1s linear'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.currentTarget.style.transform = 'skew(-5deg) translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'skew(-5deg)';
                                            e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                                        }}
                                    >
                                        {loading ? t.loading : t.sendResetEmail}
                                    </button>
                                )}
                            </>
                        )}

                        {/* Back Button */}
                        {mode !== 'select_auth_type' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('select_auth_type');
                                    resetForm();
                                }}
                                className="w-full text-sm font-bold uppercase flex items-center justify-center gap-2 py-3"
                                style={{
                                    color: '#4A4A4A',
                                    border: '2px solid #4A4A4A'
                                }}
                            >
                                <span>←</span> {lang === 'DE' ? 'Zurück' : lang === 'ES' ? 'Atrás' : 'Back'}
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );

    if (embedded) return formContent;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? t.login : mode === 'age_verify' ? 'ALTER' : mode === 'language_select' ? 'LANGUAGE' : mode === 'register' ? t.register : 'WELCOME'}>
            {formContent}
        </Modal>
    );
};

