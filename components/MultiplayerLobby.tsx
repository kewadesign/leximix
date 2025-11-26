import React, { useState, useEffect } from 'react';
import { Modal, Button } from './UI';
import { Users, Send, X, Check, UserPlus, Clock, Play } from 'lucide-react';
import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from '../utils/firebase';
import { initializeMultiplayerGame, initializeChessGame } from '../utils/multiplayerGame';
import { generateDeck, shuffleDeck, drawCards } from '../utils/maumau';
import { GameMode } from '../types';

interface MultiplayerLobbyProps {
    isOpen: boolean;
    onClose: () => void;
    currentUsername: string;
    friends: { code: string; username: string }[];
    onStartGame: (opponentUsername: string, gameId: string) => void;
    onInviteSent?: (to: string, gameId: string) => void;
    mode?: GameMode; // Mode to invite for (default Mau Mau if undefined)
}

interface GameInvite {
    from: string;
    to: string;
    gameId: string;
    timestamp: number;
    status: 'pending' | 'accepted' | 'declined';
    mode?: GameMode; // Added mode to invite
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
    isOpen,
    onClose,
    currentUsername,
    friends,
    onStartGame,
    onInviteSent,
    mode = GameMode.SKAT_MAU_MAU // Default to Mau Mau
}) => {
    const [pendingInvites, setPendingInvites] = useState<GameInvite[]>([]);
    const [sentInvites, setSentInvites] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTime, setSearchTime] = useState(0);

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

    // Matchmaking Logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isSearching) {
            timer = setInterval(() => {
                setSearchTime(prev => prev + 1);

                // Periodically try to find a match
                if (searchTime % 2 === 0) { // Check every 2 seconds
                    import('../utils/matchmaking').then(({ findMatch }) => {
                        findMatch(mode, currentUsername, currentUsername);
                    });
                }
            }, 1000);
        } else {
            setSearchTime(0);
        }
        return () => clearInterval(timer);
    }, [isSearching, mode, currentUsername, searchTime]);

    const startMatchmaking = async () => {
        setIsSearching(true);
        try {
            const { joinMatchmakingQueue, listenForMatch, leaveMatchmakingQueue } = await import('../utils/matchmaking');

            // 1. Join Queue
            await joinMatchmakingQueue(mode, currentUsername, currentUsername, 'EN'); // Default to EN for now, should get from user profile

            // 2. Listen for match
            const unsubscribe = listenForMatch(currentUsername, async (matchData) => {
                if (matchData.mode === mode) {
                    setIsSearching(false);

                    // If we are the one who found the match (we created the gameId), we might need to initialize it
                    // But for simplicity, let's assume the "finder" initializes.
                    // Actually, both need to know who is host.
                    // The matchData should probably contain who is host.
                    // For now, let's assume the person who created the match (finder) is host.
                    // But wait, the `findMatch` logic creates the gameId.

                    // Let's check if the game exists, if not initialize it.
                    // This is a bit race-condition prone.
                    // Better: The `findMatch` function should initialize the game.
                    // But `findMatch` is client side.

                    // Let's rely on the `initializeMultiplayerGame` being called by the person who found the match?
                    // Or let's just have the "finder" be the host.

                    // In `findMatch`:
                    // Finder (Host) -> Creates Game -> Sets Match Signal

                    // So if I am the finder, I should initialize.
                    // But `listenForMatch` is passive.

                    // Let's handle initialization in `findMatch` inside the loop or here?
                    // It's cleaner if `findMatch` does it.

                    // For this prototype:
                    // If I receive a match signal, I just join.
                    // The finder (who ran findMatch) should have initialized it.

                    // Wait, `findMatch` in my utils just returns the ID. It doesn't initialize the game data (deck etc).
                    // I need to update `findMatch` or handle it here.

                    // Let's handle it here:
                    // If I am the one who found it (I called findMatch), I initialize.
                    // But `listenForMatch` triggers for BOTH.

                    // Let's add a check:
                    // The match signal contains `opponentId`.
                    // If `gameId` exists in `games/`, join.
                    // If not, and I am the host (lexicographically first? or random?), initialize.

                    // Actually, let's make `findMatch` do the initialization if successful.
                    // I will update `utils/matchmaking.ts` to import game init logic.
                    // But for now, let's just assume the game is ready or we init it.

                    // Let's keep it simple:
                    // The person who *found* the match (active searcher) initializes.
                    // The person who was *waiting* (passive) just joins.

                    // But both are searching!
                    // Whoever's `findMatch` call succeeds is the "finder".

                    // The `listenForMatch` callback doesn't know if *this* client was the finder.
                    // However, `findMatch` returns the match data to the caller.

                    // So:
                    // 1. `findMatch` returns match.
                    // 2. Caller (Finder) initializes game.
                    // 3. Caller sets match signal.
                    // 4. Both receive match signal (Finder receives it too).

                    // So we need to ignore the signal if we already handled it via `findMatch` return?
                    // Or just let the signal handle redirection for both.

                    // Let's make the signal handle redirection.
                    // But someone needs to initialize.

                    // Let's update `findMatch` to initialize the game BEFORE setting the match signal.
                    // I will do that in a separate step.

                    // For now, let's just redirect.

                    onStartGame(matchData.opponentName, matchData.gameId);
                    onClose();
                }
            });

            // Store unsubscribe to clean up? 
            // The useEffect cleanup will handle it if we store it in a ref or state, 
            // but here it's inside a function.
            // We need a way to unsubscribe when cancelling search.
            // Let's use a ref for the listener.
            (window as any).matchListener = unsubscribe;

        } catch (error) {
            console.error("Error starting matchmaking:", error);
            setIsSearching(false);
        }
    };

    const cancelMatchmaking = async () => {
        setIsSearching(false);
        try {
            const { leaveMatchmakingQueue } = await import('../utils/matchmaking');
            await leaveMatchmakingQueue(mode, currentUsername);

            if ((window as any).matchListener) {
                (window as any).matchListener();
            }
        } catch (error) {
            console.error("Error leaving queue:", error);
        }
    };

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
                status: 'pending',
                mode: mode // Include current mode in invite
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

            // Initialize Game based on Mode
            const inviteMode = invite.mode || GameMode.SKAT_MAU_MAU; // Default to Mau Mau for legacy invites

            if (inviteMode === GameMode.CHESS) {
                // Initialize Chess Game
                await initializeChessGame(
                    invite.gameId,
                    invite.from,     // host
                    currentUsername  // guest
                );
            } else {
                // Initialize Mau Mau Game (Legacy logic)
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
            }

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
        <Modal isOpen={isOpen} onClose={onClose} title={`Lobby: ${mode === GameMode.CHESS ? 'CHESS' : 'MAU MAU'}`}>
            <div className="p-6 space-y-6">

                {/* Matchmaking Section */}
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-indigo-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <Users size={16} /> Zufälliger Gegner
                    </h4>

                    {isSearching ? (
                        <div className="text-center py-4">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                            <p className="text-white font-bold animate-pulse">Suche Gegner...</p>
                            <p className="text-xs text-indigo-400 mt-1">{searchTime}s</p>
                            <button
                                onClick={cancelMatchmaking}
                                className="mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg text-xs font-bold transition-colors"
                            >
                                Abbrechen
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={startMatchmaking}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold shadow-lg shadow-indigo-900/50 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Users className="group-hover:scale-110 transition-transform" />
                            Gegner finden
                        </button>
                    )}
                </div>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase">ODER</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                </div>

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
                                            {invite.mode === GameMode.CHESS ? <Play size={20} className="text-white" /> : <Users size={20} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{invite.from}</p>
                                            <p className="text-xs text-gray-400">
                                                {invite.mode === GameMode.CHESS ? 'Schach' : 'Mau Mau'} Einladung
                                            </p>
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
