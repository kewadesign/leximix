import React, { useState } from 'react';
import { Modal } from './UI';
import { Users, Copy, Check, Trash2, UserPlus, AlertTriangle, Sparkles, Star, Heart } from 'lucide-react';
import { getUsernameByFriendCode, addFriendToFirebase, removeFriendFromFirebase } from '../utils/multiplayer';

interface FriendsManagerProps {
    isOpen: boolean;
    onClose: () => void;
    currentUsername: string;
    friendCode: string;
    friends: { code: string; username: string }[];
    onFriendsUpdate: (friends: { code: string; username: string }[]) => void;
}

// Friend colors for variety
const friendColors = ['#FF006E', '#FF7F00', '#FFBE0B', '#06FFA5', '#0096FF', '#8338EC'];

export const FriendsManager: React.FC<FriendsManagerProps> = ({
    isOpen,
    onClose,
    currentUsername,
    friendCode,
    friends,
    onFriendsUpdate
}) => {
    const [friendCodeInput, setFriendCodeInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(friendCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddFriend = async () => {
        const code = friendCodeInput.trim().toUpperCase();

        if (!code) {
            setError('Bitte gib einen Freundescode ein');
            return;
        }

        if (code === friendCode) {
            setError('Du kannst dich nicht selbst hinzufügen');
            return;
        }

        if (friends.some(f => f.code === code)) {
            setError('Dieser Freund ist bereits in deiner Liste');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const username = await getUsernameByFriendCode(code);

            if (!username) {
                setError('Freundescode nicht gefunden');
                setIsLoading(false);
                return;
            }

            const added = await addFriendToFirebase(currentUsername, friendCode, code, username);

            if (added) {
                const newFriends = [...friends, { code, username }];
                onFriendsUpdate(newFriends);
                setSuccess(`${username} wurde hinzugefügt!`);
                setFriendCodeInput('');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Fehler beim Hinzufügen');
            }
        } catch (err) {
            setError('Verbindungsfehler');
        }

        setIsLoading(false);
    };

    const handleRemoveFriend = async (code: string, username: string) => {
        setIsLoading(true);

        try {
            const removed = await removeFriendFromFirebase(currentUsername, friendCode, code, username);

            if (removed) {
                const newFriends = friends.filter(f => f.code !== code);
                onFriendsUpdate(newFriends);
            }
        } catch (err) {
            console.error('Error removing friend:', err);
        }

        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Freunde">
            <div className="space-y-5">
                {/* Header Icon */}
                <div className="text-center">
                    <div 
                        className="w-16 h-16 mx-auto flex items-center justify-center mb-3 relative"
                        style={{ 
                            background: 'linear-gradient(135deg, #8338EC, #FF006E)', 
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(131,56,236,0.4)'
                        }}
                    >
                        <Users size={32} style={{ color: '#FFF' }} />
                        <div className="absolute -top-1 -right-1">
                            <Heart size={14} fill="#FF006E" style={{ color: '#FF006E' }} />
                        </div>
                    </div>
                </div>

                {/* Your Friend Code Card */}
                <div 
                    className="p-4 relative overflow-hidden"
                    style={{ 
                        background: 'var(--color-surface)',
                        border: '3px solid #000',
                        borderRadius: '16px',
                        boxShadow: '6px 6px 0px #8338EC'
                    }}
                >
                    {/* Rainbow top bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 flex" style={{ borderRadius: '13px 13px 0 0', overflow: 'hidden' }}>
                        <div className="flex-1" style={{ background: '#FF006E' }}></div>
                        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
                        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
                        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
                        <div className="flex-1" style={{ background: '#0096FF' }}></div>
                        <div className="flex-1" style={{ background: '#8338EC' }}></div>
                    </div>
                    
                    {/* Decorative */}
                    <div className="absolute top-3 right-3 opacity-20">
                        <Sparkles size={20} style={{ color: '#8338EC' }} />
                    </div>
                    
                    <p className="text-xs font-black uppercase tracking-wider mt-2 mb-2" style={{ color: '#8338EC' }}>
                        Dein Freundescode
                    </p>
                    <div className="flex items-center gap-2">
                        <div 
                            className="flex-1 px-4 py-3 font-mono text-xl font-black tracking-widest"
                            style={{ 
                                background: '#F5F5F5', 
                                color: '#1a1a2e',
                                borderRadius: '10px'
                            }}
                        >
                            {friendCode}
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className="p-3 transition-all active:scale-95"
                            style={{ 
                                background: copied ? 'linear-gradient(135deg, #06FFA5, #00D68F)' : 'linear-gradient(135deg, #8338EC, #6B21A8)', 
                                borderRadius: '10px',
                                boxShadow: copied ? '0 4px 12px rgba(6,255,165,0.3)' : '0 4px 12px rgba(131,56,236,0.3)'
                            }}
                        >
                            {copied ? <Check size={20} style={{ color: '#FFF' }} /> : <Copy size={20} style={{ color: '#FFF' }} />}
                        </button>
                    </div>
                    <p className="text-[11px] mt-2" style={{ color: '#999' }}>
                        Teile diesen Code mit Freunden
                    </p>
                </div>

                {/* Add Friend */}
                <div 
                    className="p-4"
                    style={{ 
                        background: 'var(--color-surface)',
                        border: '3px solid #000',
                        borderRadius: '16px',
                        boxShadow: '6px 6px 0px #06FFA5'
                    }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div 
                            className="p-1.5"
                            style={{ background: '#06FFA520', borderRadius: '8px' }}
                        >
                            <UserPlus size={16} style={{ color: '#06FFA5' }} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#1a1a2e' }}>
                            Freund hinzufügen
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={friendCodeInput}
                            onChange={(e) => {
                                setFriendCodeInput(e.target.value.toUpperCase());
                                setError('');
                            }}
                            placeholder="CODE EINGEBEN"
                            maxLength={8}
                            className="flex-1 px-4 py-3 font-mono uppercase focus:outline-none"
                            style={{ 
                                background: '#F5F5F5', 
                                color: '#1a1a2e',
                                borderRadius: '10px',
                                border: '2px solid transparent'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid #06FFA5'}
                            onBlur={(e) => e.currentTarget.style.border = '2px solid transparent'}
                        />
                        <button
                            onClick={handleAddFriend}
                            disabled={isLoading}
                            className="px-5 font-black text-lg transition-all active:scale-95 disabled:opacity-50"
                            style={{ 
                                background: 'linear-gradient(135deg, #06FFA5, #00D68F)', 
                                color: '#000',
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(6,255,165,0.3)'
                            }}
                        >
                            {isLoading ? '...' : '+'}
                        </button>
                    </div>

                    {error && (
                        <div 
                            className="mt-3 p-2 text-sm flex items-center gap-2 font-bold"
                            style={{ background: '#FF006E20', color: '#FF006E', borderRadius: '8px' }}
                        >
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    {success && (
                        <div 
                            className="mt-3 p-2 text-sm flex items-center gap-2 font-bold"
                            style={{ background: '#06FFA520', color: '#00A86B', borderRadius: '8px' }}
                        >
                            <Check size={14} /> {success}
                        </div>
                    )}
                </div>

                {/* Friends List */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Users size={16} style={{ color: '#8338EC' }} />
                        <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#1a1a2e' }}>
                            Deine Freunde ({friends.length})
                        </p>
                    </div>

                    {friends.length === 0 ? (
                        <div 
                            className="text-center py-8"
                            style={{ 
                                background: '#F5F5F5',
                                borderRadius: '16px'
                            }}
                        >
                            <Users size={40} style={{ color: '#CCC' }} className="mx-auto mb-2" />
                            <p className="text-sm font-bold" style={{ color: '#999' }}>Noch keine Freunde</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {friends.map((friend, index) => {
                                const color = friendColors[index % friendColors.length];
                                return (
                                    <div
                                        key={friend.code}
                                        className="flex items-center justify-between p-3 transition-all"
                                        style={{ 
                                            background: 'var(--color-surface)',
                                            border: '2px solid #000',
                                            borderRadius: '12px',
                                            boxShadow: `4px 4px 0px ${color}`
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-10 h-10 flex items-center justify-center"
                                                style={{ 
                                                    background: color,
                                                    borderRadius: '10px'
                                                }}
                                            >
                                                <Star size={18} fill="#FFF" style={{ color: '#FFF' }} />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm" style={{ color: '#1a1a2e' }}>{friend.username}</p>
                                                <p className="text-[10px] font-mono" style={{ color: '#999' }}>{friend.code}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFriend(friend.code, friend.username)}
                                            disabled={isLoading}
                                            className="p-2 transition-all active:scale-95 disabled:opacity-50"
                                            style={{ 
                                                background: '#FF006E20',
                                                borderRadius: '8px'
                                            }}
                                        >
                                            <Trash2 size={16} style={{ color: '#FF006E' }} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 font-black uppercase text-sm transition-all active:scale-98"
                    style={{ 
                        background: 'linear-gradient(135deg, #8338EC, #6B21A8)', 
                        color: '#FFF',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(131,56,236,0.3)'
                    }}
                >
                    Schließen
                </button>
            </div>
        </Modal>
    );
};
