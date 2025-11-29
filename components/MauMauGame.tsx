import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { MauMauCard } from './MauMauCard';
import { MauMauGame, Card, CardCategory, ActionType } from '../utils/maumau';
import { initializeGame, playCard, drawCard, sayMau, MauMauAI, calculateRewards } from '../utils/maumauGame';
import { UserState } from '../types';

interface MauMauGameProps {
    user: UserState;
    onBack: () => void;
    onGameEnd: (coins: number, xp: number) => void;
}

export const MauMauGameComponent: React.FC<MauMauGameProps> = ({ user, onBack, onGameEnd }) => {
    const [game, setGame] = useState<MauMauGame | null>(null);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const [showWishSelector, setShowWishSelector] = useState(false);
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize game on mount
    useEffect(() => {
        const newGame = initializeGame('player1', user.name, 'AI', 'Easy AI', 'ai');
        setGame(newGame);
        setMessage(`Game started! You go ${newGame.currentPlayer === 1 ? 'first' : 'second'}.`);
    }, [user.name]);

    if (!game) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-cyan-900 flex items-center justify-center">
                <div className="text-white text-2xl">Loading game...</div>
            </div>
        );
    }

    const player = game.players.player1;
    const opponent = game.players.player2;
    const topCard = game.currentCard;
    const isPlayerTurn = game.currentPlayer === 1;

    const handleCardClick = (index: number) => {
        if (!isPlayerTurn || isProcessing || game.status === 'finished') return;

        const card = player.hand[index];
        if (selectedCardIndex === index) {
            // Deselect
            setSelectedCardIndex(null);
        } else {
            setSelectedCardIndex(index);
        }
    };

    const handlePlayCard = (wishCategory?: CardCategory) => {
        if (selectedCardIndex === null || !game || isProcessing) return;

        setIsProcessing(true);
        const card = player.hand[selectedCardIndex];

        const result = playCard(game, 1, selectedCardIndex, wishCategory);

        if (!result.success) {
            setMessage(result.error || 'Cannot play this card!');
            setIsProcessing(false);
            return;
        }

        setGame(result.game);
        setSelectedCardIndex(null);
        setShowWishSelector(false);

        if (result.game.status === 'finished') {
            const winner = result.game.winner === player.uid ? player : opponent;
            setMessage(`${winner.username} wins!`);
            const rewards = calculateRewards(result.game, result.game.winner!);
            setTimeout(() => onGameEnd(rewards.coins, rewards.xp), 2000);
        } else {
            setMessage(`Played ${card.letter}!`);
        }

        setIsProcessing(false);
    };

    const handlePlaySelectedCard = () => {
        if (selectedCardIndex === null) return;

        const card = player.hand[selectedCardIndex];

        // Check if it's a W (Wish) card - need category selection
        if (card.actionType === ActionType.WISH) {
            setShowWishSelector(true);
        } else {
            handlePlayCard();
        }
    };

    const handleDrawCard = () => {
        if (!isPlayerTurn || isProcessing || game.status === 'finished') return;

        setIsProcessing(true);
        const updatedGame = drawCard(game, 1);
        setGame(updatedGame);
        setMessage('Drew a card. Turn passed to opponent.');
        setIsProcessing(false);
    };

    const handleSayMau = () => {
        if (isProcessing || game.status === 'finished') return;

        const updatedGame = sayMau(game, 1);
        setGame(updatedGame);
        setMessage('Mau!');
    };

    // AI turn handler
    useEffect(() => {
        if (!game || game.status === 'finished' || isPlayerTurn || isProcessing) return;

        // Delay AI turn for better UX
        const timer = setTimeout(() => {
            setIsProcessing(true);
            setMessage('AI is thinking...');

            setTimeout(() => {
                const aiDecision = MauMauAI.playTurn(game);

                if (aiDecision.played && aiDecision.cardIndex !== undefined) {
                    const result = playCard(game, 2, aiDecision.cardIndex, aiDecision.wishCategory);
                    if (result.success) {
                        const playedCard = opponent.hand[aiDecision.cardIndex];
                        setGame(result.game);
                        setMessage(`AI played ${playedCard?.letter || 'a card'}!`);

                        if (result.game.status === 'finished') {
                            const rewards = calculateRewards(result.game, result.game.winner!);
                            setTimeout(() => onGameEnd(rewards.coins, rewards.xp), 2000);
                        }
                    }
                } else {
                    // AI draws
                    const drawnGame = drawCard(game, 2);
                    setGame(drawnGame);
                    setMessage('AI drew a card.');
                }

                setIsProcessing(false);
            }, 1000);
        }, 500);

        return () => clearTimeout(timer);
    }, [game, isPlayerTurn, isProcessing, opponent.hand, onGameEnd]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-cyan-900 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)]/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-[var(--color-surface)]/20 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="text-white text-center">
                    <div className="text-sm opacity-80">Letter Mau Mau</div>
                    <div className="text-lg font-bold">{isPlayerTurn ? 'Your Turn' : "Opponent's Turn"}</div>
                </div>

                <div className="w-24" /> {/* Spacer for centering */}
            </div>

            {/* Message */}
            {message && (
                <div className="text-center mb-4 px-4 py-2 bg-cyan-500/20 backdrop-blur-sm rounded-lg border border-cyan-500/50 text-cyan-100">
                    {message}
                </div>
            )}

            {/* Opponent Hand */}
            <div className="mb-8">
                <div className="text-white text-sm mb-2 text-center opacity-80">
                    {opponent.username} - {opponent.hand.length} cards
                    {opponent.saidMau && <Sparkles className="inline w-4 h-4 ml-2 text-yellow-400" />}
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                    {opponent.hand.map((_, index) => (
                        <MauMauCard key={index} card={{ letter: '?', category: 0, rarity: 0, points: 0, isAction: false }} hidden />
                    ))}
                </div>
            </div>

            {/* Draw Pile and Discard Pile */}
            <div className="flex justify-center gap-8 mb-8">
                {/* Draw Pile */}
                <div className="text-center">
                    <div className="text-white text-sm mb-2 opacity-80">Draw Pile</div>
                    <div className="relative">
                        <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-purple-900 to-pink-900 border-2 border-purple-500 flex items-center justify-center shadow-lg">
                            <div className="text-4xl">🎴</div>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {game.deck.length}
                        </div>
                    </div>
                </div>

                {/* Discard Pile */}
                <div className="text-center">
                    <div className="text-white text-sm mb-2 opacity-80">Current Card</div>
                    <MauMauCard card={topCard} disabled />
                    {game.wishCategory !== undefined && (
                        <div className="mt-2 text-xs text-cyan-300 font-bold">
                            Wished: {CardCategory[game.wishCategory]}
                        </div>
                    )}
                </div>
            </div>

            {/* Player Hand */}
            <div className="mb-4">
                <div className="text-white text-sm mb-2 text-center opacity-80">
                    Your Hand {player.saidMau && <Sparkles className="inline w-4 h-4 ml-2 text-yellow-400" />}
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                    {player.hand.map((card, index) => (
                        <MauMauCard
                            key={index}
                            card={card}
                            onClick={() => handleCardClick(index)}
                            disabled={!isPlayerTurn || isProcessing || game.status === 'finished'}
                            selected={selectedCardIndex === index}
                        />
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={handlePlaySelectedCard}
                    disabled={selectedCardIndex === null || !isPlayerTurn || isProcessing || game.status === 'finished'}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg"
                >
                    Play Card
                </button>

                <button
                    onClick={handleDrawCard}
                    disabled={!isPlayerTurn || isProcessing || game.status === 'finished'}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg"
                >
                    Draw Card
                </button>

                <button
                    onClick={handleSayMau}
                    disabled={player.hand.length !== 1 || player.saidMau || isProcessing || game.status === 'finished'}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg"
                >
                    Say Mau!
                </button>
            </div>

            {/* Category Wish Selector Modal */}
            {showWishSelector && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-purple-900 to-pink-900 p-6 rounded-lg border-2 border-cyan-500 shadow-2xl max-w-md">
                        <h3 className="text-white text-xl font-bold mb-4 text-center">Choose a Category</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[CardCategory.VOWEL, CardCategory.COMMON, CardCategory.MEDIUM, CardCategory.RARE].map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handlePlayCard(category)}
                                    className="px-6 py-4 bg-[var(--color-surface)]/10 hover:bg-[var(--color-surface)]/20 border-2 border-white/30 rounded-lg text-white font-bold transition-all hover:scale-105"
                                >
                                    {CardCategory[category]}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setShowWishSelector(false);
                                setSelectedCardIndex(null);
                            }}
                            className="mt-4 w-full px-4 py-2 bg-red-500/50 hover:bg-red-500/70 rounded-lg text-white transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
