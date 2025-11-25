import React, { useState } from 'react';
import { Modal, Button } from './UI';
import { Users, Copy, Check, Trash2, UserPlus, AlertTriangle } from 'lucide-react';
import { getUsernameByFriendCode, addFriendToFirebase, removeFriendFromFirebase } from '../utils/multiplayer';

interface FriendsManagerProps {
    isOpen: boolean;
    onClose: () => void;
    currentUsername: string;
    friendCode: string;
    friends: { code: string; username: string }[];
    onFriendsUpdate: (friends: { code: string; username: string }[]) => void;
}

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
            <div className="p-6 space-y-6">
                {/* Your Friend Code */}
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Dein Freundescode</h4>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-black/30 rounded-xl px-4 py-3 font-mono text-2xl font-black text-white tracking-widest">
                            {friendCode}
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
                        >
                            {copied ? <Check size={20} className="text-white" /> : <Copy size={20} className="text-white" />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Teile diesen Code mit Freunden, damit sie dich hinzufügen können</p>
                </div>

                {/* Add Friend */}
                <div>
                    <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <UserPlus size={16} /> Freund hinzufügen
                    </h4>
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
                            className="flex-1 bg-gray-900 border-2 border-gray-700 focus:border-purple-500 rounded-xl px-4 py-3 text-white font-mono uppercase focus:outline-none transition-colors"
                        />
                        <button
                            onClick={handleAddFriend}
                            disabled={isLoading}
                            className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 rounded-xl text-white font-bold transition-all disabled:opacity-50"
                        >
                            {isLoading ? '⏳' : '+'}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-2 text-red-400 text-sm flex items-center gap-2 animate-pulse">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-2 text-green-400 text-sm flex items-center gap-2">
                            <Check size={14} /> {success}
                        </div>
                    )}
                </div>

                {/* Friends List */}
                <div>
                    <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} /> Deine Freunde ({friends.length})
                    </h4>

                    {friends.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Noch keine Freunde hinzugefügt</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {friends.map((friend) => (
                                <div
                                    key={friend.code}
                                    className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-xl p-3 hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                            <Users size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{friend.username}</p>
                                            <p className="text-xs text-gray-500 font-mono">{friend.code}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFriend(friend.code, friend.username)}
                                        disabled={isLoading}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button fullWidth onClick={onClose} variant="secondary">
                    Schließen
                </Button>
            </div>
        </Modal>
    );
};
