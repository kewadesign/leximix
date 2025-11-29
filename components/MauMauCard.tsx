import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card, CardSuit, CardRank, getSuitSymbol, getSuitColor, getRankName, getSuitName } from '../utils/maumau';
import { UserState, Language } from '../types';

interface PlayingCardProps {
    card?: Card;
    hidden?: boolean;
    onClick?: () => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    disabled?: boolean;
    selected?: boolean;
    index?: number;
    totalCards?: number;
    isDragging?: boolean;
    lang?: Language;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
    card,
    hidden = false,
    onClick,
    onDragStart,
    onDragEnd,
    disabled = false,
    selected = false,
    index = 0,
    totalCards = 1,
    isDragging = false,
    lang = Language.DE
}) => {
    if (hidden || !card) {
        // Card back
        return (
            <motion.div
                className="relative w-24 h-36 rounded-xl bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 border-4 border-blue-600 flex items-center justify-center shadow-2xl cursor-pointer"
                whileHover={{ scale: 1.05 }}
                style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
                }}
            >
                <div className="text-6xl opacity-30">🎴</div>
            </motion.div>
        );
    }

    const suitColor = getSuitColor(card.suit);
    const suitSymbol = getSuitSymbol(card.suit);
    const rankName = getRankName(card.rank, lang === Language.EN ? 'en' : lang === Language.ES ? 'es' : 'de');
    const isRed = card.suit === CardSuit.HEARTS || card.suit === CardSuit.DIAMONDS;

    return (
        <motion.div
            drag={!disabled && !isDragging}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            whileHover={!disabled ? { scale: 1.1, y: -10, zIndex: 50 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={disabled ? undefined : onClick}
            className={`
        relative w-24 h-36 rounded-xl border-4 flex flex-col items-center justify-between p-2 cursor-pointer shadow-2xl
        ${selected ? 'ring-4 ring-cyan-400 shadow-cyan-400/50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${card.isAction ? 'border-yellow-500 shadow-yellow-500/30' : isRed ? 'border-red-200' : 'border-gray-300'}
      `}
            style={{
                color: suitColor,
                background: 'var(--color-surface)',
            }}
            initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: -180 }}
            transition={{ duration: 0.3 }}
        >
            {/* Top corner */}
            <div className="flex flex-col items-center">
                <div className="text-2xl font-bold leading-none">{rankName}</div>
                <div className="text-3xl leading-none">{suitSymbol}</div>
            </div>

            {/* Center symbol */}
            <div className="text-6xl">{suitSymbol}</div>

            {/* Bottom corner (rotated) */}
            <div className="flex flex-col items-center rotate-180">
                <div className="text-2xl font-bold leading-none">{rankName}</div>
                <div className="text-3xl leading-none">{suitSymbol}</div>
            </div>

            {/* Action indicator */}
            {card.isAction && (
                <div className="absolute inset-0 bg-yellow-400/10 rounded-xl pointer-events-none animate-pulse" />
            )}
        </motion.div>
    );
};

interface CardHandProps {
    cards: Card[];
    onCardClick?: (index: number) => void;
    onCardDrag?: (index: number) => void;
    disabled?: boolean;
    selectedIndex?: number | null;
    lang?: Language;
}

export const CardHand: React.FC<CardHandProps> = ({
    cards,
    onCardClick,
    onCardDrag,
    disabled = false,
    selectedIndex = null,
    lang = Language.DE
}) => {
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    // Calculate fan layout
    const centerIndex = (cards.length - 1) / 2;
    const maxRotation = 15;
    const maxOffset = 30;

    return (
        <div className="relative h-48 w-full flex items-end justify-center">
            <AnimatePresence>
                {cards.map((card, index) => {
                    const offsetFromCenter = index - centerIndex;
                    const rotation = (offsetFromCenter / centerIndex) * maxRotation;
                    const xOffset = offsetFromCenter * maxOffset;
                    const yOffset = Math.abs(offsetFromCenter) * 5;

                    return (
                        <motion.div
                            key={card.id}
                            className="absolute"
                            style={{
                                zIndex: selectedIndex === index ? 100 : index,
                            }}
                            initial={{ x: 0, y: 100, opacity: 0 }}
                            animate={{
                                x: xOffset,
                                y: yOffset,
                                opacity: 1,
                                rotate: rotation,
                            }}
                            exit={{ y: -200, opacity: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <PlayingCard
                                card={card}
                                onClick={() => onCardClick?.(index)}
                                onDragStart={() => {
                                    setDraggingIndex(index);
                                    onCardDrag?.(index);
                                }}
                                onDragEnd={() => setDraggingIndex(null)}
                                disabled={disabled}
                                selected={selectedIndex === index}
                                isDragging={draggingIndex === index}
                                index={index}
                                totalCards={cards.length}
                                lang={lang}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

interface CardPileProps {
    cards: Card[];
    type: 'draw' | 'discard';
    topCard?: Card;
    onClick?: () => void;
    disabled?: boolean;
    lang?: Language;
}

export const CardPile: React.FC<CardPileProps> = ({
    cards,
    type,
    topCard,
    onClick,
    disabled = false,
    lang = Language.DE
}) => {
    return (
        <div className="relative flex flex-col items-center gap-2">
            <div className="text-white text-sm font-bold uppercase opacity-80">
                {type === 'draw' ? (lang === Language.DE ? 'Stapel' : lang === Language.EN ? 'Draw Pile' : 'Pila') : (lang === Language.DE ? 'Ablage' : lang === Language.EN ? 'Discard' : 'Descarte')}
            </div>

            <motion.div
                className="relative w-24 h-36"
                whileHover={type === 'draw' && !disabled ? { scale: 1.05 } : {}}
                onClick={disabled ? undefined : onClick}
            >
                {type === 'draw' ? (
                    <>
                        {/* Stack effect */}
                        {cards.length > 0 && (
                            <>
                                <div className="absolute inset-0 bg-blue-900/50 rounded-xl transform translate-x-1 translate-y-1 blur-sm" />
                                <div className="absolute inset-0 bg-blue-900/30 rounded-xl transform translate-x-2 translate-y-2 blur-md" />
                                <PlayingCard hidden onClick={onClick} disabled={disabled} />
                            </>
                        )}
                        {/* Count badge */}
                        <motion.div
                            className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        >
                            {cards.length}
                        </motion.div>
                    </>
                ) : (
                    <>
                        {topCard ? (
                            <motion.div
                                key={topCard.id}
                                initial={{ x: -100, rotateY: 180 }}
                                animate={{ x: 0, rotateY: 0 }}
                                transition={{ duration: 0.4, type: 'spring' }}
                            >
                                <PlayingCard card={topCard} disabled lang={lang} />
                            </motion.div>
                        ) : (
                            <div className="w-24 h-36 rounded-xl border-4 border-dashed border-white/30 flex items-center justify-center">
                                <div className="text-white/30 text-4xl">?</div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};
