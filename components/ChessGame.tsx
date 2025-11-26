import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { FaChessPawn, FaChessRook, FaChessKnight, FaChessBishop, FaChessQueen, FaChessKing } from 'react-icons/fa6';
import { ArrowLeft, RotateCcw, Flag, Trophy, Users, User, Cpu, Coins, Lightbulb, Video, Clock } from 'lucide-react';
import { UserState, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ref, onValue, set, push, update } from 'firebase/database';
import { database } from '../utils/firebase';
import { calculateBestMove, getLevelConfig } from '../utils/chessAI';

interface ChessGameProps {
    language: Language;
    user: UserState;
    onGameEnd: (xp: number, coins: number) => void;
    onBack: () => void;
    multiplayerGameId?: string | null; // If present, we are in multiplayer mode
    opponentName?: string | null;
    isHost?: boolean; // Host plays White
    levelId?: number; // Singleplayer Level ID
}

// Piece Components Mapping
const PIECE_COMPONENTS: Record<string, any> = {
    'p': FaChessPawn,
    'r': FaChessRook,
    'n': FaChessKnight,
    'b': FaChessBishop,
    'q': FaChessQueen,
    'k': FaChessKing
};

export const ChessGame: React.FC<ChessGameProps> = ({
    language,
    user,
    onGameEnd,
    onBack,
    multiplayerGameId,
    opponentName,
    isHost,
    levelId = 1
}) => {
    const t = TRANSLATIONS[language];
    const [game, setGame] = useState(new Chess());
    const [board, setBoard] = useState(game.board());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
    const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'draw' | 'stalemate' | 'resigned'>('playing');
    const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
    const [orientation, setOrientation] = useState<'w' | 'b'>('w'); // Board orientation
    const [lastMove, setLastMove] = useState<{ from: string, to: string } | null>(null);

    const [showStartModal, setShowStartModal] = useState(true);
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    
    // Hints
    const [showHintModal, setShowHintModal] = useState(false);
    const [hintMove, setHintMove] = useState<{ from: string, to: string } | null>(null);
    const [hintCount, setHintCount] = useState(0);
    const [isCalculatingHint, setIsCalculatingHint] = useState(false);

    // Multiplayer State
    const isMultiplayer = !!multiplayerGameId;
    const myColor = isMultiplayer ? (isHost ? 'w' : 'b') : 'w'; // Singleplayer: User is always White for now
    const isMyTurn = game.turn() === myColor && gameStatus === 'playing';

    // AI State
    const [isAiThinking, setIsAiThinking] = useState(false);
    const aiDepth = isMultiplayer ? 1 : getLevelConfig(levelId).depth;

    // Update board state helper
    const updateBoard = useCallback((newGame: Chess) => {
        setGame(new Chess(newGame.fen())); // Clone to force re-render
        setBoard(newGame.board());
        setMoveHistory(newGame.history({ verbose: true }));
        setHintMove(null); // Clear hint on move
        
        // Check Game Over
        if (newGame.isGameOver()) {
            if (newGame.isCheckmate()) {
                setGameStatus('checkmate');
                setWinner(newGame.turn() === 'w' ? 'b' : 'w'); // Current turn lost
            } else if (newGame.isDraw() || newGame.isStalemate() || newGame.isThreefoldRepetition()) {
                setGameStatus('draw');
                setWinner('draw');
            }
        }
    }, []);

    // Initialize
    useEffect(() => {
        const newGame = new Chess();
        setGame(newGame);
        setBoard(newGame.board());
        setOrientation(myColor);
        setGameStatus('playing');
        setWinner(null);
        setLastMove(null);
        setHintCount(0);
    }, [multiplayerGameId, myColor, levelId]);

    // ... (Multiplayer Listener remains same)

    // AI Logic
    useEffect(() => {
        if (!isMultiplayer && game.turn() === 'b' && gameStatus === 'playing') {
            setIsAiThinking(true);
            // Small delay for realism
            setTimeout(() => {
                makeAiMove();
                setIsAiThinking(false);
            }, 500);
        }
    }, [game.fen(), gameStatus, isMultiplayer]);

    const makeAiMove = () => {
        const bestMove = calculateBestMove(game, aiDepth);
        if (bestMove) {
            game.move(bestMove);
            updateBoard(game);
            // Need to extract from/to from SAN or just use history
            const history = game.history({ verbose: true });
            const last = history[history.length - 1];
            setLastMove({ from: last.from, to: last.to });
        }
    };

    const getHint = () => {
        setIsCalculatingHint(true);
        setTimeout(() => {
            const bestMoveSan = calculateBestMove(game, 3); // Hint always decent depth
            if (bestMoveSan) {
                // Find move object to get from/to
                const moves = game.moves({ verbose: true });
                const move = moves.find(m => m.san === bestMoveSan);
                if (move) {
                    setHintMove({ from: move.from, to: move.to });
                    setHintCount(c => c + 1);
                }
            }
            setIsCalculatingHint(false);
            setShowHintModal(false);
        }, 100);
    };

    const handleSquareClick = (square: Square) => {
        // 1. If game over or not my turn (in MP), ignore
        if (gameStatus !== 'playing') return;
        if (isMultiplayer && !isMyTurn) return;
        if (!isMultiplayer && game.turn() !== 'w') return; // Wait for AI

        // 2. If selecting a piece
        const piece = game.get(square);
        const isMyPiece = piece && piece.color === myColor;

        if (isMyPiece) {
            // Select piece
            setSelectedSquare(square);
            const moves = game.moves({ square, verbose: true });
            setPossibleMoves(moves);
            return;
        }

        // 3. If trying to move to a square
        if (selectedSquare) {
            const move = possibleMoves.find(m => m.to === square);
            if (move) {
                // Execute move
                game.move(move.san);
                updateBoard(game);
                setLastMove({ from: selectedSquare, to: square });
                setSelectedSquare(null);
                setPossibleMoves([]);

                // Send to Firebase if multiplayer
                if (isMultiplayer && multiplayerGameId) {
                    update(ref(database, `games/${multiplayerGameId}`), {
                        fen: game.fen(),
                        lastMove: { from: selectedSquare, to: square },
                        turn: game.turn() // 'w' or 'b'
                    });
                }
            } else {
                // Deselect if clicking invalid empty square or enemy piece without capture
                setSelectedSquare(null);
                setPossibleMoves([]);
            }
        }
    };

    const handleResign = () => {
        if (confirm("Are you sure you want to resign?")) {
            const opponentColor = myColor === 'w' ? 'b' : 'w';
            setGameStatus('resigned');
            setWinner(opponentColor);
            
            if (isMultiplayer && multiplayerGameId) {
                update(ref(database, `games/${multiplayerGameId}`), {
                    status: 'resigned',
                    winner: opponentColor
                });
            }
        }
    };

    const getSquareColor = (r: number, c: number) => {
        const isDark = (r + c) % 2 === 1;
        // Brutalist Style: White & Pink/Black grid
        return isDark ? 'bg-[#FF006E]' : 'bg-white';
    };

    const getCoord = (index: number) => {
        // 0-7 mapping to rank/file based on orientation
        // White bottom: r0=8...r7=1, c0=a...c7=h
        // Black bottom: r0=1...r7=8, c0=h...c7=a
        // Actually standard loop 0..7 usually maps to visual top-down
        // Row 0 is top (Rank 8 for white)
        
        const row = Math.floor(index / 8);
        const col = index % 8;
        
        let rank = 8 - row; // 8, 7, 6...
        let file = col; // 0, 1, 2... (a, b, c...)

        if (orientation === 'b') {
            rank = row + 1; // 1, 2, 3...
            file = 7 - col; // h, g, f...
        }

        const fileChar = String.fromCharCode(97 + file); // 'a' + file
        return `${fileChar}${rank}` as Square;
    };

    const renderSquare = (i: number) => {
        const square = getCoord(i);
        const piece = board.flat()[i]; // Wait, board() returns 8x8 array. 
        // chess.js board(): [ [ {type: 'r', color: 'b'}, ... ], ... ]
        // Row 0 is Rank 8 (Black pieces start).
        // If orientation is White, we render Row 0 first.
        // If orientation is Black, we should reverse rows and cols.
        
        let actualPiece = null;
        let displayRow = Math.floor(i / 8);
        let displayCol = i % 8;

        if (orientation === 'w') {
            // Standard view: Row 0 is Rank 8
            actualPiece = board[displayRow][displayCol];
        } else {
            // Flipped view: Row 0 is Rank 1
            actualPiece = board[7 - displayRow][7 - displayCol];
        }

        const isSelected = selectedSquare === square;
        const isPossibleMove = possibleMoves.some(m => m.to === square);
        const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
        const isCheck = actualPiece?.type === 'k' && actualPiece.color === game.turn() && game.inCheck();
        const isHint = hintMove && (hintMove.from === square || hintMove.to === square);

        const r = Math.floor(i / 8);
        const c = i % 8;
        const isDark = (r + c) % 2 === 1;

        return (
            <div
                key={square}
                onClick={() => handleSquareClick(square)}
                className={`
                    w-full h-full flex items-center justify-center relative cursor-pointer
                    ${isDark ? 'bg-[#FF006E]' : 'bg-white'}
                    ${isSelected ? '!bg-[#FFBE0B]' : ''}
                    ${isLastMove && !isSelected ? '!bg-[#8338EC]/50' : ''}
                    ${isCheck ? '!bg-red-600 animate-pulse' : ''}
                    ${isHint && !isSelected ? '!bg-[#06FFA5] animate-pulse' : ''}
                `}
            >
                {/* Coordinate Labels (Only on edges) */}
                {c === 0 && (
                    <span className={`absolute top-0.5 left-0.5 text-[8px] md:text-[10px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {orientation === 'w' ? 8 - r : r + 1}
                    </span>
                )}
                {r === 7 && (
                    <span className={`absolute bottom-0 right-0.5 text-[8px] md:text-[10px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {String.fromCharCode(97 + (orientation === 'w' ? c : 7 - c)).toUpperCase()}
                    </span>
                )}

                {/* Possible Move Indicator */}
                {isPossibleMove && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className={`rounded-full ${actualPiece ? 'border-[4px] border-[#06FFA5] w-full h-full rounded-none' : 'bg-[#06FFA5] w-3 h-3 md:w-4 md:h-4'}`} />
                    </div>
                )}

                {/* Piece */}
                {actualPiece && (
                    <div className={`text-3xl md:text-4xl lg:text-5xl drop-shadow-md transition-transform ${isSelected ? '-translate-y-1' : ''}`}>
                        {React.createElement(PIECE_COMPONENTS[actualPiece.type], {
                            color: actualPiece.color === 'w' ? '#FFF' : '#000',
                            style: { 
                                stroke: '#000', 
                                strokeWidth: '15px', // Thick border for visibility
                                filter: 'drop-shadow(2px 2px 0 #000)'
                            }
                        })}
                    </div>
                )}
            </div>
        );
    };

    const handleEndGame = () => {
        let xp = 0;
        let coins = 0;

        if (winner === myColor) {
            xp = 50;
            coins = 20;
        } else if (winner === 'draw') {
            xp = 10;
            coins = 5;
        }

        onGameEnd(xp, coins);
    };

    const PIECE_NAMES: Record<string, Record<string, string>> = {
        'w': { 'p': 'Bauer', 'r': 'Turm', 'n': 'Springer', 'b': 'Läufer', 'q': 'Dame', 'k': 'König' },
        'b': { 'p': 'Pawn', 'r': 'Rook', 'n': 'Knight', 'b': 'Bishop', 'q': 'Queen', 'k': 'King' }
    }; // Simplified, should really use TRANSLATIONS but this works for now (DE defaultish)
    
    const getPieceName = (type: string) => {
        const lang = language === Language.DE ? 'w' : 'b'; // Hacky language check
        const names = {
            'p': language === Language.DE ? 'Bauer' : 'Pawn',
            'r': language === Language.DE ? 'Turm' : 'Rook',
            'n': language === Language.DE ? 'Springer' : 'Knight',
            'b': language === Language.DE ? 'Läufer' : 'Bishop',
            'q': language === Language.DE ? 'Dame' : 'Queen',
            'k': language === Language.DE ? 'König' : 'King'
        };
        return names[type as keyof typeof names];
    };

    const formatMove = (move: Move) => {
        const pieceName = getPieceName(move.piece);
        const to = move.to;
        
        const toText = language === Language.DE ? 'nach' : 'to';
        const capturesText = language === Language.DE ? 'schlägt' : 'captures';
        const onText = language === Language.DE ? 'auf' : 'on';

        if (move.flags.includes('c') || move.flags.includes('e')) { // Capture or En Passant
            const capturedPieceChar = move.captured || 'p'; // Default to pawn for en passant if undefined, though usually defined
            const capturedName = getPieceName(capturedPieceChar);
            return `${pieceName} ${capturesText} ${capturedName} ${onText} ${to}`;
        } else if (move.flags.includes('k') || move.flags.includes('q')) { // Castling
            return language === Language.DE ? 'Rochade' : 'Castling';
        } else {
            return `${pieceName} ${toText} ${to}`;
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#FFF8E7] overflow-hidden">
            {/* Start Info Modal */}
            {showStartModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border-4 border-black p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_#000] animate-scale-in">
                        <h2 className="text-2xl font-black uppercase mb-6 text-center border-b-4 border-black pb-2">
                            {language === Language.DE ? 'Schach: Anleitung' : 'Chess: Guide'}
                        </h2>

                        {/* Legend */}
                        <div className="mb-6">
                            <h3 className="font-black uppercase mb-3 bg-yellow-400 inline-block px-2 border-2 border-black">
                                {language === Language.DE ? 'Figuren' : 'Pieces'}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['k', 'q', 'r', 'b', 'n', 'p'].map(type => (
                                    <div key={type} className="flex items-center gap-3 bg-gray-100 p-2 border-2 border-black rounded-lg">
                                        <div className="text-3xl">
                                            {React.createElement(PIECE_COMPONENTS[type], { color: 'black' })}
                                        </div>
                                        <span className="font-bold uppercase text-sm">{getPieceName(type)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rules */}
                        <div className="mb-6">
                            <h3 className="font-black uppercase mb-3 bg-[#06FFA5] inline-block px-2 border-2 border-black">
                                {language === Language.DE ? 'Kurzregeln' : 'Rules'}
                            </h3>
                            <ul className="list-disc list-inside text-sm font-bold space-y-2 text-gray-700">
                                <li>{language === Language.DE ? 'Weiß zieht zuerst.' : 'White moves first.'}</li>
                                <li>{language === Language.DE ? 'Ziel: Setze den gegnerischen König Schachmatt.' : 'Goal: Checkmate the opponent\'s King.'}</li>
                                <li>{language === Language.DE ? 'Patt = Unentschieden (Kein legaler Zug möglich).' : 'Stalemate = Draw (No legal moves).'}</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => setShowStartModal(false)}
                            className="w-full py-4 bg-[#FF006E] text-white border-4 border-black font-black uppercase text-xl hover:translate-y-1 active:translate-y-2 transition-all shadow-[4px_4px_0px_#000]"
                        >
                            {language === Language.DE ? 'Spiel Starten' : 'Start Game'}
                        </button>
                    </div>
                </div>
            )}

            {/* Hint Modal */}
            {showHintModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border-4 border-black p-6 w-full max-w-sm shadow-[8px_8px_0px_#000] animate-scale-in text-center">
                        <div className="mx-auto w-16 h-16 bg-[#FFBE0B] border-4 border-black flex items-center justify-center mb-4 transform -rotate-3">
                            <Lightbulb size={32} className="text-black" />
                        </div>
                        
                        <h2 className="text-2xl font-black uppercase mb-2">{t.GAME.UNLOCK_HINT}</h2>
                        <p className="text-sm font-bold mb-6 text-gray-600">
                            {language === Language.DE ? 'Bekomme den besten Zug vorgeschlagen!' : 'Get the best move suggestion!'}
                        </p>

                        <div className="space-y-3">
                            {/* Option 1: Coins or Free Ad (First Hint) */}
                            {hintCount === 0 ? (
                                <>
                                    <button
                                        onClick={() => {
                                            // Watch Ad Mock
                                            alert(language === Language.DE ? 'Werbung läuft...' : 'Watching Ad...');
                                            getHint();
                                        }}
                                        className="w-full py-3 bg-[#06FFA5] border-4 border-black font-black uppercase flex items-center justify-center gap-2 hover:translate-y-1 active:translate-y-2 transition-all shadow-[4px_4px_0px_#000]"
                                    >
                                        <Video size={20} />
                                        {language === Language.DE ? 'Gratis (Werbung)' : 'Free (Watch Ad)'}
                                    </button>
                                    <div className="font-black text-xs uppercase text-gray-400">- ODER / OR -</div>
                                    <button
                                        onClick={() => {
                                            if (user.coins >= 50) {
                                                // Deduct coins logic would go here (need to update parent)
                                                // For now just show hint
                                                getHint();
                                            } else {
                                                alert(t.SHOP.INSUFFICIENT);
                                            }
                                        }}
                                        className="w-full py-3 bg-[#FFF] border-4 border-black font-black uppercase flex items-center justify-center gap-2 hover:translate-y-1 active:translate-y-2 transition-all shadow-[4px_4px_0px_#000]"
                                    >
                                        <Coins size={20} className="text-[#FFBE0B]" />
                                        50 {t.HOME.COINS}
                                    </button>
                                </>
                            ) : (
                                // Option 2: Coins AND Ad (Subsequent Hints)
                                <button
                                    onClick={() => {
                                        if (user.coins >= 100) {
                                            alert(language === Language.DE ? 'Werbung läuft...' : 'Watching Ad...');
                                            getHint();
                                        } else {
                                            alert(t.SHOP.INSUFFICIENT);
                                        }
                                    }}
                                    className="w-full py-3 bg-[#8338EC] text-white border-4 border-black font-black uppercase flex items-center justify-center gap-2 hover:translate-y-1 active:translate-y-2 transition-all shadow-[4px_4px_0px_#000]"
                                >
                                    <div className="flex flex-col items-center leading-none">
                                        <span className="flex items-center gap-1"><Coins size={14} /> 100 + <Video size={14} /></span>
                                    </div>
                                </button>
                            )}
                            
                            <button
                                onClick={() => setShowHintModal(false)}
                                className="text-xs font-bold uppercase underline mt-2"
                            >
                                {t.MAU_MAU.CANCEL}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-white border-b-4 border-black z-20 shrink-0">
                <button onClick={onBack} className="p-2 border-2 border-black hover:bg-gray-100 shadow-[2px_2px_0px_#000]">
                    <ArrowLeft size={24} />
                </button>

                {/* Hint Button (Singleplayer only) */}
                {!isMultiplayer && gameStatus === 'playing' && (
                    <button 
                        onClick={() => setShowHintModal(true)}
                        disabled={isCalculatingHint}
                        className="p-2 bg-[#FFBE0B] border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-1 transition-all disabled:opacity-50"
                    >
                        <Lightbulb size={24} className={isCalculatingHint ? 'animate-pulse' : ''} />
                    </button>
                )}

                <div className="flex items-center gap-2 px-4 py-2 bg-[#8338EC] border-2 border-black shadow-[2px_2px_0px_#000] text-white">
                    {isMultiplayer ? <Users size={20} /> : <Cpu size={20} />}
                    <span className="font-black uppercase hidden md:inline">{isMultiplayer ? 'Multiplayer' : 'Singleplayer'}</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                    <Coins size={20} className="text-[#FF006E]" />
                    <span className="font-mono font-black text-xl">{user.coins}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Move Log (Sidebar) */}
                <div className="hidden md:flex flex-col w-64 bg-white border-r-4 border-black overflow-hidden shrink-0">
                    <div className="p-3 bg-gray-100 border-b-4 border-black font-black uppercase text-center">
                        {language === Language.DE ? 'Spielprotokoll' : 'Move Log'}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
                        {moveHistory.reduce((acc: any[], move, i) => {
                            if (i % 2 === 0) acc.push([move]);
                            else acc[acc.length - 1].push(move);
                            return acc;
                        }, []).map((pair: Move[], i: number) => (
                            <div key={i} className="flex flex-col border-b border-gray-200 pb-2">
                                <div className="text-gray-500 font-black mb-1">Runde {i + 1}</div>
                                <div className="flex items-start gap-2">
                                    <div className="w-3 h-3 mt-0.5 rounded-full bg-white border border-black shrink-0"></div>
                                    <span className="font-bold text-gray-500 mr-1">{language === Language.DE ? 'Weiß:' : 'White:'}</span>
                                    <span className="font-bold">{formatMove(pair[0])}</span>
                                </div>
                                {pair[1] && (
                                    <div className="flex items-start gap-2 mt-1">
                                        <div className="w-3 h-3 mt-0.5 rounded-full bg-black border border-black shrink-0"></div>
                                        <span className="font-bold text-gray-500 mr-1">{language === Language.DE ? 'Schwarz:' : 'Black:'}</span>
                                        <span className="font-bold">{formatMove(pair[1])}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                    </div>
                </div>

                {/* Board Container */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Game Status */}
                    <div className="p-2 md:p-4 flex justify-center shrink-0">
                        <div className={`
                            px-4 md:px-6 py-2 md:py-3 border-4 border-black font-black text-sm md:text-xl uppercase shadow-[4px_4px_0px_#000] transform -skew-x-3
                            ${gameStatus === 'playing' 
                                ? (game.turn() === myColor ? 'bg-[#06FFA5]' : 'bg-white') 
                                : 'bg-[#FF006E] text-white'}
                        `}>
                            {gameStatus === 'playing' ? (
                                game.turn() === myColor ? t.CHESS.YOUR_TURN : t.CHESS.OPPONENT_TURN
                            ) : (
                                gameStatus === 'checkmate' ? t.CHESS.CHECKMATE : t.CHESS.GAME_OVER
                            )}
                        </div>
                    </div>

                    {/* Board */}
                    <div className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-hidden">
                        <div className="w-full max-w-[85vw] md:max-w-md aspect-square border-4 border-black bg-black shadow-[8px_8px_0px_#000]">
                            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                                {Array.from({ length: 64 }).map((_, i) => renderSquare(i))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Move Log (Small strip) */}
                    <div className="md:hidden h-16 bg-gray-100 border-t-4 border-black flex flex-col justify-center px-4 overflow-y-auto font-mono text-xs">
                       {moveHistory.length > 0 ? (
                           <div className="font-bold text-center">
                               {moveHistory.length % 2 === 0 ? (
                                   // Black just moved
                                   <>
                                     <span className="text-gray-500 mr-2">Schwarz:</span>
                                     {formatMove(moveHistory[moveHistory.length - 1])}
                                   </>
                               ) : (
                                   // White just moved
                                   <>
                                     <span className="text-gray-500 mr-2">Weiß:</span>
                                     {formatMove(moveHistory[moveHistory.length - 1])}
                                   </>
                               )}
                           </div>
                       ) : (
                           <div className="text-gray-400 text-center italic">Keine Züge</div>
                       )}
                    </div>

                    {/* Player Info */}
                    <div className="px-4 py-4 bg-[#FFF8E7] border-t-4 border-black flex justify-between items-end shrink-0">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 border-3 border-black bg-white overflow-hidden">
                                <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.avatarId}`} alt="You" />
                            </div>
                            <div>
                                <p className="font-black text-xs md:text-sm uppercase">{user.name}</p>
                                <p className="text-[10px] md:text-xs font-bold text-gray-500">{myColor === 'w' ? t.CHESS.WHITE : t.CHESS.BLACK}</p>
                            </div>
                        </div>

                        {isMultiplayer && (
                            <div className="flex items-center gap-2 md:gap-3 flex-row-reverse text-right">
                                <div className="w-10 h-10 md:w-12 md:h-12 border-3 border-black bg-white overflow-hidden">
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-black text-xs md:text-sm uppercase">{opponentName || t.CHESS.WAITING_OPPONENT}</p>
                                    <p className="text-[10px] md:text-xs font-bold text-gray-500">{myColor === 'w' ? t.CHESS.BLACK : t.CHESS.WHITE}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Game Over Modal */}
            {gameStatus !== 'playing' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white border-4 border-black p-8 w-full max-w-sm relative shadow-[8px_8px_0px_#000] animate-in zoom-in duration-200 text-center">
                        <h2 className="text-4xl font-black uppercase mb-2 italic transform -skew-x-6">
                            {winner === myColor ? t.CHESS.WIN : (winner === 'draw' ? t.CHESS.DRAW : t.CHESS.LOSS)}
                        </h2>
                        <p className="font-bold mb-8 text-gray-600">
                            {gameStatus === 'checkmate' ? t.CHESS.CHECKMATE : 
                             gameStatus === 'stalemate' ? t.CHESS.STALEMATE : 
                             gameStatus === 'draw' ? t.CHESS.DRAW : t.CHESS.GAME_OVER}
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleEndGame}
                                className="w-full py-4 bg-[#06FFA5] border-4 border-black font-black text-xl hover:translate-y-1 active:translate-y-2 transition-all shadow-[4px_4px_0px_#000]"
                            >
                                {t.CHESS.EXIT}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
