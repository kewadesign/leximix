import React, { useState, useEffect } from 'react';
import { Modal, Button } from './UI';
import { Users, Send, X, Check, UserPlus, Clock } from 'lucide-react';
import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from '../utils/firebase';
import { initializeMultiplayerGame } from '../utils/multiplayerGame';
import { generateDeck, shuffleDeck, drawCards } from '../utils/maumau';

interface MultiplayerLobbyProps {
    isOpen: boolean;
    onClose: () => void;
    currentUsername: string;
    friends: { code: string; username: string }[];
    onStartGame: (opponentUsername: string, gameId: string) => void;
    onInviteSent?: (to: string, gameId: string) => void;
}

interface GameInvite {
    from: string;
    to: string;
    gameId: string;
    timestamp: number;
    status: 'pending' | 'accepted' | 'declined';
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
    isOpen,
    onClose,
    currentUsername,
    friends,
    onStartGame,
    onInviteSent
}) => {
    const [pendingInvites, setPendingInvites] = useState<GameInvite[]>([]);
    const [sentInvites, setSentInvites] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(false);

    // Listen for incoming invites
    useEffect(() => {
        if (!isOpen || !currentUsername) return;

        const invitesRef = ref(database, `gameInvites/${currentUsername}`);

        const unsubscribe = onValue(invitesRef, (snapshot) => {
            if (snapshot.exists()) {
                const invitesData = snapshot.val();
                const invites: GameInvite[] = Object.values(invitesData);
                setPendingInvites(invites.filter(inv => inv.status === 'pending'));
            } else {
                setPendingInvites([]);
            }
        });

        return () => {
            off(invitesRef);
        };
    }, [isOpen, currentUsername]);

    // Listen for game acceptance (for sent invites)
    // When the guest accepts, they create a game - host needs to detect this
    useEffect(() => {
        if (!isOpen || !currentUsername || sentInvites.size === 0) return;

        const listeners: (() => void)[] = [];

        sentInvites.forEach((gameId, friendUsername) => {
            const gameRef = ref(database, `games/${gameId}`);
            
            const unsubscribe = onValue(gameRef, (snapshot) => {
                if (snapshot.exists()) {
                    const gameData = snapshot.val();
                    // Game exists and is playing - guest has accepted and initialized the game!
                    if (gameData.status === 'playing' && gameData.players?.host === currentUsername) {
                        console.log('[Multiplayer] Game accepted by guest, starting game for host');
                        // Clear the sent invite
                        setSentInvites(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(friendUsername);
                            return newMap;
                        });
                        // Start game for host
                        onStartGame(friendUsername, gameId);
                        onClose();
                    }
                }
            });

            listeners.push(() => off(gameRef));
        });

        return () => {
            listeners.forEach(unsub => unsub());
        };
    }, [isOpen, currentUsername, sentInvites, onStartGame, onClose]);

    const sendInvite = async (friendUsername: string) => {
        if (sentInvites.has(friendUsername)) return;

        setIsLoading(true);
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            const invite: GameInvite = {
                from: currentUsername,
                to: friendUsername,
                gameId,
                timestamp: Date.now(),
                status: 'pending'
            };

            // Save invite to recipient's inbox
            await set(ref(database, `gameInvites/${friendUsername}/${gameId}`), invite);

            setSentInvites(prev => new Map(prev).set(friendUsername, gameId));

            // Notify parent to set up global listener
            if (onInviteSent) {
                onInviteSent(friendUsername, gameId);
            }

            // Auto-remove after 60 seconds if not accepted
            setTimeout(() => {
                setSentInvites(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(friendUsername);
                    return newMap;
                });
            }, 60000);

        } catch (error) {
            console.error('Error sending invite:', error);
        }

        setIsLoading(false);
    };

    const acceptInvite = async (invite: GameInvite) => {
        setIsLoading(true);

        try {
            // Update invite status
            await set(ref(database, `gameInvites/${currentUsername}/${invite.gameId}/status`), 'accepted');

            // Generate and shuffle deck
            let deck = generateDeck();
            deck = shuffleDeck(deck);

            // Deal cards (5 each)
            const hostHandResult = drawCards(deck, 5);
            const hostHand = hostHandResult.drawn;
            deck = hostHandResult.remaining;

            const guestHandResult = drawCards(deck, 5);
            const guestHand = guestHandResult.drawn;
            deck = guestHandResult.remaining;

            // Draw first card for discard pile
            const firstCardResult = drawCards(deck, 1);
            const discardPile = firstCardResult.drawn;
            deck = firstCardResult.remaining;

            // Initialize full game state with cards
            await initializeMultiplayerGame(
                invite.gameId,
                invite.from,      // host
                currentUsername,  // guest
                deck,
                discardPile,
                hostHand,
                guestHand
            );

            // Remove from pending
            setPendingInvites(prev => prev.filter(inv => inv.gameId !== invite.gameId));

            // Start game
            onStartGame(invite.from, invite.gameId);
            onClose();

        } catch (error) {
            console.error('Error accepting invite:', error);
        }

        setIsLoading(false);
    };

    const declineInvite = async (invite: GameInvite) => {
        try {
            await set(ref(database, `gameInvites/${currentUsername}/${invite.gameId}/status`), 'declined');
            setPendingInvites(prev => prev.filter(inv => inv.gameId !== invite.gameId));
        } catch (error) {
            console.error('Error declining invite:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Multiplayer Lobby">
            <div className="p-6 space-y-6">

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-yellow-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={16} /> Einladungen ({pendingInvites.length})
                        </h4>
                        <div className="space-y-2">
                            {pendingInvites.map((invite) => (
                                <div
                                    key={invite.gameId}
                                    className="flex items-center justify-between bg-yellow-900/20 border-2 border-yellow-500/50 rounded-xl p-3 animate-pulse"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center">
                                            <Users size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{invite.from}</p>
                                            <p className="text-xs text-gray-400">möchte gegen dich spielen</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => acceptInvite(invite)}
                                            disabled={isLoading}
                                            className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Check size={18} className="text-white" />
                                        </button>
                                        <button
                                            onClick={() => declineInvite(invite)}
                                            disabled={isLoading}
                                            className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <X size={18} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Friends List */}
                <div>
                    <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} /> Freunde einladen
                    </h4>

                    {friends.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <UserPlus size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Keine Freunde hinzugefügt</p>
                            <p className="text-xs mt-1">Füge Freunde über deinen Profil hinzu</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {friends.map((friend) => {
                                const inviteSent = sentInvites.has(friend.username);

                                return (
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
                                                <p className="text-xs text-gray-500">Online</p>
                                            </div>
                                        </div>

                                        {inviteSent ? (
                                            <div className="text-xs text-yellow-400 font-bold flex items-center gap-2">
                                                <Clock size={14} /> Gesendet...
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => sendInvite(friend.username)}
                                                disabled={isLoading}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 rounded-lg text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <Send size={14} /> Einladen
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
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
