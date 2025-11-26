// Classic Mau Mau Game Component - with Animations
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card, CardSuit, getSuitSymbol, getSuitName } from '../utils/maumau';
import { MauMauGame, initializeGame, playCard, drawCard, sayMau, MauMauAI, AIDifficulty, calculateRewards } from '../utils/maumauGame';
import { PlayingCard, CardHand, CardPile } from './MauMauCard';
import { Language } from '../types';

interface Props {
    playerUid: string;
    playerUsername: string;
    onExit: () => void;
    onGameEnd: (coins: number, xp: number) => void;
    language?: Language;
}

export const LetterMauMauGame: React.FC<Props> = ({
    playerUid,
    playerUsername,
    onExit,
    onGameEnd,
    language = Language.DE
}) => {
    const [difficulty, setDifficulty] = useState<AIDifficulty | null>(null);
    const [game, setGame] = useState<MauMauGame | null>(null);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const [showWishMenu, setShowWishMenu] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [isAiTurn, setIsAiTurn] = useState(false);

    // Start game with selected difficulty
    const startGame = (diff: AIDifficulty) => {
        setDifficulty(diff);
        const newGame = initializeGame(playerUid, playerUsername, 'AI', 'KI Bot', 'ai');
        setGame(newGame);
    };

    // AI Turn Logic
    useEffect(() => {
        if (!game || !difficulty) return;

        if (game.currentPlayer === 2 && game.status === 'active' && !isAiTurn) {
            setIsAiTurn(true);
            setMessage(language === Language.DE ? 'KI denkt nach...' : language === Language.EN ? 'AI is thinking...' : 'IA está pensando...');

            setTimeout(() => {
                const aiMove = MauMauAI.playTurn(game, difficulty);

                if (aiMove.played && aiMove.cardIndex !== undefined) {
                    const result = playCard(game, 2, aiMove.cardIndex, aiMove.wishedSuit);
                    if (result.success) {
                        setGame(result.game);
                        if (result.game.status === 'finished') {
                            handleGameEnd(result.game);
                        }
                    }
                } else {
                    // AI draws card
                    const newGame = drawCard(game, 2);
                    setGame(newGame);
                }

                setMessage('');
                setIsAiTurn(false);
            }, 1000);
        }
    }, [game, difficulty, isAiTurn, language]);

    const handlePlayCard = (cardIndex: number) => {
        if (!game) return;

        const card = game.players.player1.hand[cardIndex];

        // Check if wish card (Jack)
        if (card.rank === 11) { // Jack
            setSelectedCardIndex(cardIndex);
            setShowWishMenu(true);
            return;
        }

        const result = playCard(game, 1, cardIndex);
        if (result.success) {
            setGame(result.game);
            setMessage('');
            setSelectedCardIndex(null);
            if (result.game.status === 'finished') {
                handleGameEnd(result.game);
            }
        } else {
            setMessage(result.error || (language === Language.DE ? 'Ungültige Karte!' : language === Language.EN ? 'Invalid card!' : '¡Carta inválida!'));
            setTimeout(() => setMessage(''), 2000);
        }
    };

    const handleWishSuit = (suit: CardSuit) => {
        if (selectedCardIndex === null || !game) return;

        const result = playCard(game, 1, selectedCardIndex, suit);
        if (result.success) {
            setGame(result.game);
            setShowWishMenu(false);
            setSelectedCardIndex(null);
            if (result.game.status === 'finished') {
                handleGameEnd(result.game);
            }
        }
    };

    const handleDraw = () => {
        if (!game) return;

        const newGame = drawCard(game, 1);
        setGame(newGame);
        setMessage(language === Language.DE ? 'Karte gezogen' : language === Language.EN ? 'Drew a card' : 'Carta tomada');
        setTimeout(() => setMessage(''), 1500);
    };

    const handleSayMau = () => {
        if (!game) return;

        const newGame = sayMau(game, 1);
        setGame(newGame);
        setMessage('MAU!');
        setTimeout(() => setMessage(''), 1500);
    };

    const handleGameEnd = (finishedGame: MauMauGame) => {
        const rewards = calculateRewards(finishedGame, finishedGame.winner!);
        setTimeout(() => {
            onGameEnd(rewards.coins, rewards.xp);
        }, 2000);
    };

    // Difficulty selection screen
    if (!game || !difficulty) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
                <button onClick={onExit} className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-lg">
                    <ArrowLeft className="text-white" size={24} />
                </button>

                <motion.div
                    className="text-center space-y-8 max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-5xl font-black text-white mb-2">
                        {language === Language.DE ? 'MAU MAU' : language === Language.EN ? 'MAU MAU' : 'MAU MAU'}
                    </h1>
                    <p className="text-gray-300 text-lg">
                        {language === Language.DE ? 'Schwierigkeit wählen' : language === Language.EN ? 'Select Difficulty' : 'Seleccionar Dificultad'}
                    </p>

                    <div className="space-y-4">
                        <motion.button
                            onClick={() => startGame('easy')}
                            className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl text-xl shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🌱 {language === Language.DE ? 'Leicht' : language === Language.EN ? 'Easy' : 'Fácil'}
                        </motion.button>

                        <motion.button
                            onClick={() => startGame('medium')}
                            className="w-full py-4 px-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl text-xl shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ⚡ {language === Language.DE ? 'Mittel' : language === Language.EN ? 'Medium' : 'Medio'}
                        </motion.button>

                        <motion.button
                            onClick={() => startGame('hard')}
                            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-xl shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🔥 {language === Language.DE ? 'Schwer' : language === Language.EN ? 'Hard' : 'Difícil'}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const player1 = game.players.player1;
    const player2 = game.players.player2;

    // Game over screen
    if (game.status === 'finished') {
        const isWinner = game.winner === playerUid;
        return (
            <motion.div
                className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    className="text-center space-y-6"
                    initial={{ scale: 0.5, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                >
                    <div className="text-8xl">{isWinner ? '🎉' : '😔'}</div>
                    <h1 className="text-6xl font-black text-white">
                        {isWinner ? 'MAU MAU!' : (language === Language.DE ? 'Verloren' : language === Language.EN ? 'Lost' : 'Perdido')}
                    </h1>
                    <p className="text-3xl text-gray-300">
                        {isWinner
                            ? (language === Language.DE ? 'Du hast gewonnen!' : language === Language.EN ? 'You won!' : '¡Ganaste!')
                            : (language === Language.DE ? 'KI Bot hat gewonnen!' : language === Language.EN ? 'AI Bot won!' : '¡El bot ganó!')}
                    </p>
                    <motion.button
                        onClick={onExit}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl text-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {language === Language.DE ? 'Zurück' : language === Language.EN ? 'Back' : 'Volver'}
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm border-b border-white/10 z-10">
                <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <ArrowLeft className="text-white" size={24} />
                </button>
                <h1 className="text-2xl font-black text-white uppercase tracking-wider">Mau Mau</h1>
                <div className="w-10"></div>
            </div>

            {/* Message */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/90 px-8 py-4 rounded-xl text-white font-bold z-50 shadow-2xl border-2 border-cyan-400"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Opponent */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white">
                            🤖
                        </div>
                        <div>
                            <span className="text-white font-bold text-lg">{player2.username}</span>
                            <div className="text-gray-400 text-sm">
                                {player2.hand.length} {language === Language.DE ? 'Karten' : language === Language.EN ? 'cards' : 'cartas'}
                            </div>
                        </div>
                    </div>
                    {game.currentPlayer === 2 && (
                        <motion.div
                            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-full text-sm"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            🟢 {language === Language.DE ? 'Am Zug' : language === Language.EN ? 'Turn' : 'Turno'}
                        </motion.div>
                    )}
                </div>

                {/* Opponent cards (face down) */}
                <div className="flex gap-2 justify-center flex-wrap">
                    <AnimatePresence>
                        {player2.hand.map((_, i) => (
                            <motion.div
                                key={`opponent-${i}`}
                                initial={{ x: 0, y: -100, opacity: 0, rotateY: 180 }}
                                animate={{ x: i * -2, y: 0, opacity: 1, rotateY: 0 }}
                                exit={{ y: -100, opacity: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <PlayingCard hidden />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 flex items-center justify-center gap-12 p-4">
                {/* Discard Pile */}
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    <CardPile type="discard" cards={game.discardPile} topCard={game.currentCard} lang={language} />
                    {game.wishedSuit !== undefined && (
                        <motion.div
                            className="px-4 py-2 bg-cyan-500 text-white font-bold rounded-xl text-sm shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' }}
                        >
                            {language === Language.DE ? 'Gewünscht' : language === Language.EN ? 'Wished' : 'Deseado'}: {getSuitSymbol(game.wishedSuit)}
                        </motion.div>
                    )}
                </motion.div>

                {/* Draw Pile */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    <CardPile
                        type="draw"
                        cards={game.deck}
                        onClick={handleDraw}
                        disabled={game.currentPlayer !== 1}
                        lang={language}
                    />
                </motion.div>
            </div>

            {/* Player Hand */}
            <div className="p-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-lg">{player1.username}</span>
                        {player1.hand.length === 1 && !player1.saidMau && (
                            <motion.button
                                onClick={handleSayMau}
                                className="px-4 py-2 bg-yellow-500 text-black font-black rounded-lg text-sm shadow-lg"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                MAU!
                            </motion.button>
                        )}
                    </div>
                    {game.currentPlayer === 1 ? (
                        <span className="text-green-400 font-bold flex items-center gap-2">
                            🟢 {language === Language.DE ? 'Dein Zug' : language === Language.EN ? 'Your Turn' : 'Tu Turno'}
                        </span>
                    ) : (
                        <span className="text-gray-400 font-bold flex items-center gap-2">
                            ⏳ {language === Language.DE ? 'Warte...' : language === Language.EN ? 'Wait...' : 'Espera...'}
                        </span>
                    )}
                </div>

                <CardHand
                    cards={player1.hand}
                    onCardClick={handlePlayCard}
                    disabled={game.currentPlayer !== 1}
                    selectedIndex={selectedCardIndex}
                    lang={language}
                />
            </div>

            {/* Wish Menu */}
            <AnimatePresence>
                {showWishMenu && (
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border-4 border-cyan-500/50 max-w-md shadow-2xl"
                            initial={{ scale: 0.5, rotateY: 180 }}
                            animate={{ scale: 1, rotateY: 0 }}
                            exit={{ scale: 0.5, rotateY: -180 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                        >
                            <h3 className="text-3xl font-black text-white mb-6 text-center">
                                {language === Language.DE ? 'Farbe wählen' : language === Language.EN ? 'Choose Suit' : 'Elige Palo'}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[CardSuit.SPADES, CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS].map(suit => (
                                    <motion.button
                                        key={suit}
                                        onClick={() => handleWishSuit(suit)}
                                        className="p-6 rounded-2xl border-4 font-bold text-white hover:scale-105 transition-all shadow-lg"
                                        style={{
                                            borderColor: suit === CardSuit.HEARTS || suit === CardSuit.DIAMONDS ? '#DC143C' : '#000',
                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="text-6xl mb-2">{getSuitSymbol(suit)}</div>
                                        <div className="text-sm">{getSuitName(suit, language === Language.EN ? 'en' : language === Language.ES ? 'es' : 'de')}</div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
