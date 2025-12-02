import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Circle, RotateCcw, Lightbulb, Coins, Play, Trophy, X, Gem, Target } from 'lucide-react';
import catDanceGif from '../assets/cat-dance.gif';
import { startGamePolling, makeGameMove } from '../utils/gamePolling';
import { Language, UserState, GameMode } from '../types';
import { TRANSLATIONS } from '../constants';

// Types
type PlayerColor = 'white' | 'black' | null;
type GamePhase = 'placing' | 'moving' | 'flying' | 'removing';

interface Position {
  x: number;
  y: number;
}

interface NineMensMorrisGameProps {
  language: Language;
  user: UserState;
  onGameEnd: (xp: number, coins: number) => void;
  onBack: () => void;
  multiplayerGameId?: string | null;
  opponentName?: string | null;
  isHost?: boolean;
  levelId?: number;
}

// Board positions - 24 valid positions on the board
// Represented as [ring][position] where ring is 0-2 (outer to inner)
// and position is 0-7 (corners and midpoints)
const POSITIONS: Position[] = [
  // Outer ring (ring 0)
  { x: 0, y: 0 }, { x: 3, y: 0 }, { x: 6, y: 0 },
  { x: 6, y: 3 }, { x: 6, y: 6 }, { x: 3, y: 6 },
  { x: 0, y: 6 }, { x: 0, y: 3 },
  // Middle ring (ring 1)
  { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 1 },
  { x: 5, y: 3 }, { x: 5, y: 5 }, { x: 3, y: 5 },
  { x: 1, y: 5 }, { x: 1, y: 3 },
  // Inner ring (ring 2)
  { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
  { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 3, y: 4 },
  { x: 2, y: 4 }, { x: 2, y: 3 }
];

// Valid connections between positions (adjacency)
const CONNECTIONS: [number, number][] = [
  // Outer ring
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  // Middle ring
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 8],
  // Inner ring
  [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 16],
  // Radial connections
  [1, 9], [9, 17],
  [3, 11], [11, 19],
  [5, 13], [13, 21],
  [7, 15], [15, 23]
];

// Mills - all possible combinations of 3 that form a mill
const MILLS: number[][] = [
  // Outer ring
  [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0],
  // Middle ring
  [8, 9, 10], [10, 11, 12], [12, 13, 14], [14, 15, 8],
  // Inner ring
  [16, 17, 18], [18, 19, 20], [20, 21, 22], [22, 23, 16],
  // Radial
  [1, 9, 17], [3, 11, 19], [5, 13, 21], [7, 15, 23]
];

// Get adjacent positions
const getAdjacentPositions = (posIndex: number): number[] => {
  const adjacent: number[] = [];
  for (const [a, b] of CONNECTIONS) {
    if (a === posIndex) adjacent.push(b);
    if (b === posIndex) adjacent.push(a);
  }
  return adjacent;
};

// Check if a position forms a mill with given board state
const checkMill = (board: PlayerColor[], posIndex: number, color: PlayerColor): boolean => {
  for (const mill of MILLS) {
    if (mill.includes(posIndex)) {
      if (mill.every(i => board[i] === color)) {
        return true;
      }
    }
  }
  return false;
};

// Check if all pieces of a color are in mills
const allInMills = (board: PlayerColor[], color: PlayerColor): boolean => {
  for (let i = 0; i < 24; i++) {
    if (board[i] === color && !checkMill(board, i, color)) {
      return false;
    }
  }
  return true;
};

// Count pieces
const countPieces = (board: PlayerColor[], color: PlayerColor): number => {
  return board.filter(p => p === color).length;
};

// Get valid moves for a piece
const getValidMoves = (board: PlayerColor[], fromIndex: number, canFly: boolean): number[] => {
  if (canFly) {
    // Can move to any empty position
    return board.map((p, i) => p === null ? i : -1).filter(i => i !== -1);
  }
  // Can only move to adjacent empty positions
  return getAdjacentPositions(fromIndex).filter(i => board[i] === null);
};

// AI Difficulty
const getAIStrength = (levelId: number): number => {
  if (levelId <= 10) return 1;
  if (levelId <= 30) return 2;
  if (levelId <= 60) return 3;
  return 4;
};

export const NineMensMorrisGame: React.FC<NineMensMorrisGameProps> = ({
  language,
  user,
  onGameEnd,
  onBack,
  multiplayerGameId,
  opponentName,
  isHost = true,
  levelId = 1
}) => {
  const t = TRANSLATIONS[language];
  const [board, setBoard] = useState<PlayerColor[]>(Array(24).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>('white');
  const [phase, setPhase] = useState<GamePhase>('placing');
  const [piecesToPlace, setPiecesToPlace] = useState({ white: 9, black: 9 });
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [mustRemove, setMustRemove] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [showStartModal, setShowStartModal] = useState(true);
  const [hintPosition, setHintPosition] = useState<number | null>(null);
  const [hintCost, setHintCost] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [adTimer, setAdTimer] = useState(5);

  const isMultiplayer = !!multiplayerGameId;
  const playerColor: PlayerColor = isHost ? 'white' : 'black';
  const aiColor: PlayerColor = 'black';
  const aiStrength = getAIStrength(levelId);

  // Get display position for rendering
  const getDisplayPos = (index: number): { left: string; top: string } => {
    const pos = POSITIONS[index];
    const cellSize = 100 / 6;
    return {
      left: `${pos.x * cellSize}%`,
      top: `${pos.y * cellSize}%`
    };
  };

  // Format move
  const formatMove = (action: string, color: PlayerColor): string => {
    return `${color === 'white' ? 'Weiß' : 'Schwarz'}: ${action}`;
  };

  // Multiplayer sync
  useEffect(() => {
    if (!isMultiplayer || !multiplayerGameId) return;

    const cleanup = startGamePolling(multiplayerGameId, (data: any) => {
      if (data.board) setBoard(data.board);
      if (data.currentPlayer) setCurrentPlayer(data.currentPlayer);
      if (data.phase) setPhase(data.phase);
      if (data.piecesToPlace) setPiecesToPlace(data.piecesToPlace);
      if (data.mustRemove !== undefined) setMustRemove(data.mustRemove);
      if (data.moveHistory) setMoveHistory(data.moveHistory);
      if (data.status && data.status !== 'playing') {
        setGameStatus(data.status === playerColor ? 'won' : 'lost');
      }
    });

    return cleanup;
  }, [isMultiplayer, multiplayerGameId, playerColor]);

  // Check for game over
  useEffect(() => {
    if (gameStatus !== 'playing' || showStartModal) return;

    // Check only after placing phase
    if (phase === 'placing') return;

    const whitePieces = countPieces(board, 'white');
    const blackPieces = countPieces(board, 'black');

    // Less than 3 pieces = loss
    if (whitePieces < 3) {
      setGameStatus(playerColor === 'white' ? 'lost' : 'won');
      onGameEnd(playerColor === 'white' ? 10 : 50 + levelId * 5, playerColor === 'white' ? 5 : 20 + levelId * 2);
    } else if (blackPieces < 3) {
      setGameStatus(playerColor === 'black' ? 'lost' : 'won');
      onGameEnd(playerColor === 'black' ? 10 : 50 + levelId * 5, playerColor === 'black' ? 5 : 20 + levelId * 2);
    }

    // Check if current player can move
    if (!mustRemove) {
      const canMove = board.some((piece, i) => {
        if (piece !== currentPlayer) return false;
        const pieceCount = countPieces(board, currentPlayer);
        const canFly = pieceCount === 3;
        return getValidMoves(board, i, canFly).length > 0;
      });

      if (!canMove && piecesToPlace[currentPlayer as 'white' | 'black'] === 0) {
        setGameStatus(currentPlayer === playerColor ? 'lost' : 'won');
        onGameEnd(currentPlayer === playerColor ? 10 : 50 + levelId * 5, currentPlayer === playerColor ? 5 : 20 + levelId * 2);
      }
    }
  }, [board, phase, currentPlayer, mustRemove, piecesToPlace]);

  // AI Move
  useEffect(() => {
    if (isMultiplayer || gameStatus !== 'playing' || showStartModal) return;
    if (currentPlayer !== aiColor) return;

    const timer = setTimeout(() => {
      makeAIMove();
    }, 700);

    return () => clearTimeout(timer);
  }, [currentPlayer, mustRemove, gameStatus, showStartModal, isMultiplayer, board, phase]);

  // AI Logic
  const makeAIMove = () => {
    if (mustRemove) {
      // Remove a piece
      const removable = board.map((p, i) => {
        if (p !== playerColor) return -1;
        if (allInMills(board, playerColor)) return i; // Can remove from mill
        return checkMill(board, i, playerColor) ? -1 : i;
      }).filter(i => i !== -1);

      if (removable.length > 0) {
        const toRemove = removable[Math.floor(Math.random() * removable.length)];
        removePiece(toRemove);
      }
      return;
    }

    if (phase === 'placing' && piecesToPlace.black > 0) {
      // Place a piece
      const emptyPositions = board.map((p, i) => p === null ? i : -1).filter(i => i !== -1);

      // Try to form a mill or block
      let bestPos = -1;

      // Check if we can form a mill
      for (const pos of emptyPositions) {
        const testBoard = [...board];
        testBoard[pos] = aiColor;
        if (checkMill(testBoard, pos, aiColor)) {
          bestPos = pos;
          break;
        }
      }

      // Check if we need to block
      if (bestPos === -1) {
        for (const pos of emptyPositions) {
          const testBoard = [...board];
          testBoard[pos] = playerColor;
          if (checkMill(testBoard, pos, playerColor)) {
            bestPos = pos;
            break;
          }
        }
      }

      // Random if no strategic move
      if (bestPos === -1) {
        bestPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      }

      placePiece(bestPos);
    } else {
      // Move a piece
      const aiPieces = board.map((p, i) => p === aiColor ? i : -1).filter(i => i !== -1);
      const pieceCount = countPieces(board, aiColor);
      const canFly = pieceCount === 3;

      let bestMove: { from: number; to: number } | null = null;

      for (const from of aiPieces) {
        const moves = getValidMoves(board, from, canFly);
        for (const to of moves) {
          const testBoard = [...board];
          testBoard[to] = aiColor;
          testBoard[from] = null;

          // Prioritize mill formation
          if (checkMill(testBoard, to, aiColor)) {
            bestMove = { from, to };
            break;
          }

          if (!bestMove) {
            bestMove = { from, to };
          }
        }
        if (bestMove && checkMill([...board].map((p, i) => i === bestMove!.to ? aiColor : (i === bestMove!.from ? null : p)), bestMove.to, aiColor)) {
          break;
        }
      }

      if (bestMove) {
        movePiece(bestMove.from, bestMove.to);
      }
    }
  };

  // Place piece
  const placePiece = (posIndex: number) => {
    if (board[posIndex] !== null) return;
    if (phase !== 'placing') return;

    const newBoard = [...board];
    newBoard[posIndex] = currentPlayer;

    const newPiecesToPlace = {
      ...piecesToPlace,
      [currentPlayer as 'white' | 'black']: piecesToPlace[currentPlayer as 'white' | 'black'] - 1
    };

    const mademill = checkMill(newBoard, posIndex, currentPlayer);
    const moveStr = formatMove(`Stein auf ${posIndex + 1} gesetzt`, currentPlayer);

    setBoard(newBoard);
    setPiecesToPlace(newPiecesToPlace);
    setMoveHistory(prev => [...prev, moveStr]);

    if (mademill) {
      setMustRemove(true);
    } else {
      nextTurn(newBoard, newPiecesToPlace);
    }

    syncMultiplayer(newBoard, newPiecesToPlace, mademill);
  };

  // Move piece
  const movePiece = (fromIndex: number, toIndex: number) => {
    const newBoard = [...board];
    newBoard[toIndex] = currentPlayer;
    newBoard[fromIndex] = null;

    const mademill = checkMill(newBoard, toIndex, currentPlayer);
    const moveStr = formatMove(`${fromIndex + 1} → ${toIndex + 1}`, currentPlayer);

    setBoard(newBoard);
    setSelectedPiece(null);
    setMoveHistory(prev => [...prev, moveStr]);

    if (mademill) {
      setMustRemove(true);
    } else {
      nextTurn(newBoard, piecesToPlace);
    }

    syncMultiplayer(newBoard, piecesToPlace, mademill);
  };

  // Remove opponent piece
  const removePiece = (posIndex: number) => {
    const opponentColor = currentPlayer === 'white' ? 'black' : 'white';
    if (board[posIndex] !== opponentColor) return;

    // Can't remove from mill unless all are in mills
    if (checkMill(board, posIndex, opponentColor) && !allInMills(board, opponentColor)) {
      return;
    }

    const newBoard = [...board];
    newBoard[posIndex] = null;

    const moveStr = formatMove(`Stein auf ${posIndex + 1} geschlagen`, currentPlayer);

    setBoard(newBoard);
    setMustRemove(false);
    setMoveHistory(prev => [...prev, moveStr]);

    nextTurn(newBoard, piecesToPlace);
    syncMultiplayer(newBoard, piecesToPlace, false);
  };

  // Next turn
  const nextTurn = (newBoard: PlayerColor[], newPiecesToPlace: { white: number; black: number }) => {
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    setCurrentPlayer(nextPlayer);

    // Check if placing phase is over
    if (newPiecesToPlace.white === 0 && newPiecesToPlace.black === 0 && phase === 'placing') {
      setPhase('moving');
    }
  };

  // Sync multiplayer - use update to preserve players info
  const syncMultiplayer = (newBoard: PlayerColor[], newPiecesToPlace: { white: number; black: number }, stillMustRemove: boolean) => {
    if (!isMultiplayer || !multiplayerGameId) return;

    const nextPlayer = stillMustRemove ? currentPlayer : (currentPlayer === 'white' ? 'black' : 'white');
    const newPhase = newPiecesToPlace.white === 0 && newPiecesToPlace.black === 0 ? 'moving' : phase;

    // Sync multiplayer via API
    makeGameMove(multiplayerGameId, {
      board: newBoard,
      currentPlayer: nextPlayer,
      phase: newPhase,
      piecesToPlace: newPiecesToPlace,
      mustRemove: stillMustRemove,
      moveHistory: [...moveHistory],
      lastActivity: Date.now()
    });
  };

  // Handle position click
  const handlePositionClick = (posIndex: number) => {
    if (gameStatus !== 'playing' || showStartModal) return;
    if (isMultiplayer && currentPlayer !== playerColor) return;
    if (!isMultiplayer && currentPlayer !== playerColor) return;

    const piece = board[posIndex];

    // Must remove mode
    if (mustRemove) {
      const opponentColor = currentPlayer === 'white' ? 'black' : 'white';
      if (piece === opponentColor) {
        // Check if can remove (not in mill or all in mills)
        if (!checkMill(board, posIndex, opponentColor) || allInMills(board, opponentColor)) {
          removePiece(posIndex);
        }
      }
      return;
    }

    // Placing phase
    if (phase === 'placing' && piecesToPlace[currentPlayer as 'white' | 'black'] > 0) {
      if (piece === null) {
        placePiece(posIndex);
      }
      return;
    }

    // Moving phase
    if (selectedPiece === null) {
      // Select a piece
      if (piece === currentPlayer) {
        const pieceCount = countPieces(board, currentPlayer);
        const canFly = pieceCount === 3;
        if (getValidMoves(board, posIndex, canFly).length > 0) {
          setSelectedPiece(posIndex);
        }
      }
    } else {
      // Move selected piece
      if (piece === null) {
        const pieceCount = countPieces(board, currentPlayer);
        const canFly = pieceCount === 3;
        const validMoves = getValidMoves(board, selectedPiece, canFly);

        if (validMoves.includes(posIndex)) {
          movePiece(selectedPiece, posIndex);
        }
      } else if (piece === currentPlayer) {
        // Select different piece
        setSelectedPiece(posIndex);
      }
    }
  };

  // Get hint - shows ad modal
  const getHint = () => {
    setAdTimer(5 + hintCost);
    setShowHintModal(true);
  };

  // Ad timer countdown
  useEffect(() => {
    if (!showHintModal || adTimer <= 0) return;
    const timer = setTimeout(() => setAdTimer(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [showHintModal, adTimer]);

  // Claim hint after watching ad
  const claimHint = () => {
    // Simple hint: suggest a position
    if (phase === 'placing') {
      const empty = board.map((p, i) => p === null ? i : -1).filter(i => i !== -1);
      if (empty.length > 0) {
        setHintPosition(empty[Math.floor(Math.random() * empty.length)]);
        setTimeout(() => setHintPosition(null), 3000);
      }
    } else if (selectedPiece !== null) {
      const pieceCount = countPieces(board, playerColor);
      const moves = getValidMoves(board, selectedPiece, pieceCount === 3);
      if (moves.length > 0) {
        setHintPosition(moves[0]);
        setTimeout(() => setHintPosition(null), 3000);
      }
    }
    setHintCost(prev => prev + 5);
    setShowHintModal(false);
  };

  // Restart
  const restartGame = () => {
    setBoard(Array(24).fill(null));
    setCurrentPlayer('white');
    setPhase('placing');
    setPiecesToPlace({ white: 9, black: 9 });
    setSelectedPiece(null);
    setMustRemove(false);
    setGameStatus('playing');
    setMoveHistory([]);
    setHintPosition(null);
  };

  // Game mode color
  const modeColor = '#D97706'; // Amber for Nine Men's Morris

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#FFF8E7' }}>
      <div className="min-h-full p-4 pb-32">
        {/* Rainbow Top Bar */}
        <div className="fixed top-0 left-0 right-0 flex h-3 w-full z-[60]">
          <div className="flex-1" style={{ background: '#FF006E' }}></div>
          <div className="flex-1" style={{ background: '#FF7F00' }}></div>
          <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
          <div className="flex-1" style={{ background: '#06FFA5' }}></div>
          <div className="flex-1" style={{ background: '#8338EC' }}></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-6">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center transition-all hover:-translate-y-1 active:translate-y-0"
            style={{ 
              background: modeColor, 
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000' 
            }}
          >
            <ArrowLeft size={24} className="text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 font-black" style={{ background: '#FFBE0B', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}>
              <Coins size={20} className="text-black" />
              <span className="text-black text-lg">{user.coins}</span>
            </div>

            {!isMultiplayer && (
              <div className="px-4 py-2 font-black text-white" style={{ background: '#8338EC', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}>
                LEVEL {levelId}
              </div>
            )}
          </div>
        </div>

        {/* Neo-Brutalist Game Container - Responsive */}
        <div
          className="max-w-2xl mx-auto p-4 md:p-6 lg:p-8"
          style={{
            background: 'var(--color-surface)',
            border: '4px solid var(--color-border)',
            boxShadow: '8px 8px 0px var(--color-border)'
          }}
        >
          {/* Title Bar */}
          <div
            className="flex items-center justify-between px-4 py-3 mb-6"
            style={{ background: modeColor, border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}
          >
            <div className="flex items-center gap-3">
              <Target size={24} className="text-white" />
              <span className="font-black text-white uppercase text-xl tracking-wider">MÜHLE</span>
            </div>
            <div
              className={`px-4 py-2 font-black text-sm uppercase transition-all ${currentPlayer === playerColor ? 'animate-pulse-subtle' : ''}`}
              style={{ 
                background: currentPlayer === playerColor ? '#06FFA5' : 'var(--color-surface)', 
                color: currentPlayer === playerColor ? '#000' : 'var(--color-text)',
                border: '3px solid var(--color-border)',
                boxShadow: '2px 2px 0px var(--color-border)'
              }}
            >
              {currentPlayer === playerColor ? 'DEIN ZUG' : (isMultiplayer ? opponentName?.toUpperCase() : 'KI DENKT')}
            </div>
          </div>

          {/* Status Bar */}
          <div className="mb-6 flex flex-wrap gap-3 justify-center">
            {mustRemove && (
              <div className="px-5 py-3 font-black uppercase animate-pulse text-white" style={{ background: '#FF006E', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}>
                🎯 STEIN ENTFERNEN!
              </div>
            )}

            {phase === 'placing' && (
              <div className="flex gap-4">
                <div className="px-4 py-3 font-black text-center" style={{ background: '#FFF', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-gray-400 mx-auto mb-1"></div>
                  <span className="text-black text-lg">{piecesToPlace.white}</span>
                </div>
                <div className="px-4 py-3 font-black text-center" style={{ background: '#1a1a2e', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 border-2 border-gray-950 mx-auto mb-1"></div>
                  <span className="text-white text-lg">{piecesToPlace.black}</span>
                </div>
              </div>
            )}
          </div>

          {/* Board Grid - RESPONSIVE DESIGN */}
          <div
            className="relative w-[min(85vw,400px)] aspect-square md:w-[min(70vw,550px)] lg:w-[min(50vw,600px)] mx-auto p-4 md:p-6"
            style={{
              background: '#D97706',
              border: '6px solid #000',
              boxShadow: '8px 8px 0px #000',
              borderRadius: '4px'
            }}
          >
            {/* Wood grain pattern overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 12px)'
            }}></div>

            {/* Draw lines - Improved SVG */}
            <svg className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)]" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.3))' }}>
              {/* Outer square */}
              <rect x="0" y="0" width="100" height="100" fill="none" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
              {/* Middle square */}
              <rect x="16.67" y="16.67" width="66.67" height="66.67" fill="none" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
              {/* Inner square */}
              <rect x="33.33" y="33.33" width="33.33" height="33.33" fill="none" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
              {/* Radial lines */}
              <line x1="50" y1="0" x2="50" y2="33.33" stroke="#000" strokeWidth="4" strokeLinecap="round" />
              <line x1="50" y1="66.67" x2="50" y2="100" stroke="#000" strokeWidth="4" strokeLinecap="round" />
              <line x1="0" y1="50" x2="33.33" y2="50" stroke="#000" strokeWidth="4" strokeLinecap="round" />
              <line x1="66.67" y1="50" x2="100" y2="50" stroke="#000" strokeWidth="4" strokeLinecap="round" />
            </svg>

            {/* Positions */}
            {POSITIONS.map((pos, index) => {
              const piece = board[index];
              const isSelected = selectedPiece === index;
              const isHint = hintPosition === index;
              const pieceCount = currentPlayer ? countPieces(board, currentPlayer) : 0;
              const canFly = pieceCount === 3;
              const isValidMove = selectedPiece !== null && getValidMoves(board, selectedPiece, canFly).includes(index);
              const canRemove = mustRemove && piece !== null && piece !== currentPlayer &&
                (!checkMill(board, index, piece) || allInMills(board, piece));

              // Calculate position within the padded area
              const leftPercent = 4 + (pos.x / 6) * 92; // 4% padding on each side
              const topPercent = 4 + (pos.y / 6) * 92;

              return (
                <div
                  key={index}
                  onClick={() => handlePositionClick(index)}
                  className="absolute cursor-pointer transition-all duration-150 flex items-center justify-center w-[10%] h-[10%] md:w-[9%] md:h-[9%]"
                  style={{
                    left: `calc(${leftPercent}% - 5%)`,
                    top: `calc(${topPercent}% - 5%)`,
                    background: piece ? 'transparent' : '#FFBE0B',
                    border: piece ? 'none' : '3px solid #000',
                    borderRadius: '50%',
                    boxShadow: piece ? 'none' : (isValidMove ? '0 0 0 4px #06FFA5, 3px 3px 0px #000' : '3px 3px 0px #000'),
                    transform: isSelected ? 'scale(1.15)' : (isValidMove ? 'scale(1.1)' : 'scale(1)'),
                    zIndex: isSelected ? 20 : 10
                  }}
                >
                  {piece && (
                    <div 
                      className="w-full h-full rounded-full transition-all duration-150"
                      style={{
                        background: piece === 'white' 
                          ? 'linear-gradient(135deg, #FFF 0%, #E5E5E5 50%, #CCC 100%)' 
                          : 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                        border: '3px solid #000',
                        boxShadow: isSelected 
                          ? '0 0 0 4px #FFBE0B, 4px 4px 0px #000' 
                          : canRemove 
                            ? '0 0 0 4px #FF006E, 4px 4px 0px #000' 
                            : '4px 4px 0px #000',
                        transform: isSelected ? 'translateY(-2px)' : 'none'
                      }}
                    />
                  )}
                  
                  {/* Hint indicator */}
                  {isHint && !piece && (
                    <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#06FFA5', opacity: 0.6 }}></div>
                  )}
                  
                  {/* Valid move indicator */}
                  {isValidMove && !piece && (
                    <div className="w-4 h-4 rounded-full" style={{ background: '#06FFA5', border: '2px solid #000' }}></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 justify-center flex-wrap">
            <button
              onClick={getHint}
              className="flex items-center gap-2 px-6 py-3 font-black uppercase transition-all hover:-translate-y-1 active:translate-y-0"
              style={{ 
                background: '#06FFA5', 
                color: '#000',
                border: '3px solid #000',
                boxShadow: '4px 4px 0px #000' 
              }}
            >
              <Lightbulb size={20} />
              HINWEIS
            </button>

            {!isMultiplayer && (
              <button
                onClick={restartGame}
                className="flex items-center gap-2 px-6 py-3 font-black uppercase transition-all hover:-translate-y-1 active:translate-y-0"
                style={{ 
                  background: '#FFF', 
                  color: '#000',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px #000' 
                }}
              >
                <RotateCcw size={20} />
                NEUSTART
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Start Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div
            className="p-6 md:p-8 max-w-md w-full animate-scale-in"
            style={{ 
              background: 'var(--color-surface)', 
              border: '6px solid var(--color-border)',
              boxShadow: '12px 12px 0px #D97706',
              transform: 'rotate(-1deg)'
            }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 md:p-4" style={{ background: '#D97706', border: '4px solid var(--color-border)', boxShadow: '4px 4px 0px var(--color-border)' }}>
                <Target size={28} className="text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider" style={{ color: 'var(--color-text)', textShadow: '2px 2px 0px #FFBE0B' }}>MÜHLE</h2>
            </div>

            <div className="p-4 md:p-5 mb-6" style={{ background: 'var(--color-bg)', border: '4px solid var(--color-border)', boxShadow: '4px 4px 0px var(--color-border)' }}>
              <h3 className="font-black text-base md:text-lg mb-3 uppercase inline-block px-3 py-1" style={{ background: '#D97706', color: '#FFF', border: '2px solid var(--color-border)' }}>Spielregeln</h3>
              <ul className="text-xs md:text-sm font-bold space-y-2 mt-3" style={{ color: 'var(--color-text)' }}>
                <li className="flex items-center gap-2"><div className="w-2 h-2" style={{ background: 'var(--color-text)' }}></div> Jeder Spieler hat 9 Steine</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2" style={{ background: 'var(--color-text)' }}></div> 3 Steine in einer Reihe = Mühle</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2" style={{ background: 'var(--color-text)' }}></div> Bei Mühle: Gegnerstein entfernen</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2" style={{ background: 'var(--color-text)' }}></div> Gewonnen bei &lt;3 Gegnersteinen</li>
              </ul>
            </div>

            <div className="flex gap-3 md:gap-4 mb-6">
              <div className="flex-1 p-3 md:p-4 text-center" style={{ background: 'var(--color-surface)', border: '3px solid var(--color-border)', boxShadow: '4px 4px 0px var(--color-border)' }}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #FFF, #CCC)', border: '3px solid var(--color-border)', boxShadow: '2px 2px 0px var(--color-border)' }}></div>
                <span className="text-xs md:text-sm font-black" style={{ color: 'var(--color-text)' }}>DU (WEISS)</span>
              </div>
              <div className="flex-1 p-3 md:p-4 text-center" style={{ background: '#1a1a2e', border: '3px solid var(--color-border)', boxShadow: '4px 4px 0px var(--color-border)' }}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #4a4a4a, #1a1a1a)', border: '3px solid var(--color-border)', boxShadow: '2px 2px 0px var(--color-border)' }}></div>
                <span className="text-xs md:text-sm font-black text-white">KI (SCHWARZ)</span>
              </div>
            </div>

            {!isMultiplayer && (
              <div className="text-center mb-6">
                <span className="px-5 md:px-6 py-2 font-black text-lg md:text-xl text-white" style={{ background: '#8338EC', border: '3px solid var(--color-border)', boxShadow: '4px 4px 0px var(--color-border)' }}>LEVEL {levelId}</span>
              </div>
            )}

            <button
              onClick={() => setShowStartModal(false)}
              className="w-full py-4 md:py-5 font-black uppercase text-xl md:text-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:translate-y-0 animate-hover-lift"
              style={{ 
                background: '#06FFA5', 
                color: '#000',
                border: '4px solid var(--color-border)',
                boxShadow: '6px 6px 0px var(--color-border)' 
              }}
            >
              <Play size={28} />
              SPIEL STARTEN
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameStatus !== 'playing' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div
            className="p-6 md:p-8 max-w-md w-full animate-scale-in"
            style={{ 
              background: 'var(--color-surface)', 
              border: '6px solid var(--color-border)',
              boxShadow: '12px 12px 0px var(--color-border)',
              transform: 'rotate(1deg)'
            }}
          >
            <div className="text-center">
              <div 
                className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 flex items-center justify-center animate-bounce-subtle"
                style={{ 
                  background: gameStatus === 'won' ? '#06FFA5' : '#FF006E', 
                  border: '4px solid var(--color-border)',
                  boxShadow: '6px 6px 0px var(--color-border)',
                  transform: 'rotate(-3deg)'
                }}
              >
                <Trophy size={40} className={gameStatus === 'won' ? 'text-black' : 'text-white'} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase mb-4" style={{ color: 'var(--color-text)', textShadow: '3px 3px 0px var(--color-surface)' }}>
                {gameStatus === 'won' ? 'GEWONNEN!' : 'VERLOREN!'}
              </h2>
              <div className="p-3 md:p-4 mb-6 md:mb-8 inline-block transform rotate-2" style={{ background: '#FFBE0B', border: '4px solid var(--color-border)', boxShadow: '4px 4px 0px var(--color-border)' }}>
                <p className="font-black text-lg md:text-xl" style={{ color: '#000' }}>
                  {gameStatus === 'won'
                    ? `+${50 + levelId * 5} XP • +${20 + levelId * 2} Münzen`
                    : '+10 XP • +5 Münzen'}
                </p>
              </div>

              <div className="flex gap-3 md:gap-4 justify-center flex-col sm:flex-row">
                <button
                  onClick={onBack}
                  className="px-6 md:px-8 py-3 md:py-4 font-black uppercase transition-all hover:-translate-y-1 animate-hover-lift"
                  style={{ 
                    background: 'var(--color-surface)', 
                    color: 'var(--color-text)',
                    border: '4px solid var(--color-border)',
                    boxShadow: '4px 4px 0px var(--color-border)' 
                  }}
                >
                  MENÜ
                </button>
                {!isMultiplayer && (
                  <button
                    onClick={restartGame}
                    className="px-6 md:px-8 py-3 md:py-4 font-black uppercase transition-all hover:-translate-y-1 animate-hover-lift"
                    style={{ 
                      background: '#06FFA5', 
                      color: '#000',
                      border: '4px solid var(--color-border)',
                      boxShadow: '4px 4px 0px var(--color-border)' 
                    }}
                  >
                    NOCHMAL
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad/Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="p-5 md:p-6 max-w-sm w-full animate-scale-in" style={{ background: 'var(--color-surface)', border: '6px solid var(--color-border)', boxShadow: '12px 12px 0px #8338EC', transform: 'rotate(-2deg)' }}>
            <h3 className="text-xl md:text-2xl font-black uppercase mb-6 text-center py-2" style={{ background: '#FFBE0B', color: '#000', border: '3px solid var(--color-border)', boxShadow: '4px 4px 0px var(--color-border)' }}>HINWEIS FREISCHALTEN</h3>

            {/* Ad with Cat Dance GIF */}
            <div className="w-full h-48 flex items-center justify-center relative overflow-hidden mb-6" style={{ background: '#000', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}>
              <img src={catDanceGif} alt="Ad" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl font-black font-mono text-white" style={{ textShadow: '4px 4px 0px #FF006E' }}>
                  {adTimer > 0 ? `${adTimer}` : 'GO!'}
                </div>
              </div>
              <div className="absolute top-2 right-2 px-3 py-1 text-xs font-black text-white rotate-3" style={{ background: '#FF006E', border: '2px solid #000' }}>AD</div>
            </div>

            {hintCost > 0 && (
              <div className="text-center mb-4">
                <span className="px-4 py-2 text-sm font-black text-white transform rotate-1 inline-block" style={{ background: '#FF006E', border: '3px solid #000' }}>+{hintCost}s Wartezeit</span>
              </div>
            )}

            {/* Skip Button */}
            {adTimer > 0 && (
              <button
                onClick={() => {
                  const skipCost = 30 + hintCost * 2;
                  if (user.coins >= skipCost) {
                    setAdTimer(0);
                  }
                }}
                className="w-full py-4 mb-3 font-black uppercase text-sm flex items-center justify-center gap-2 transition-transform active:translate-y-1"
                style={{ 
                  background: '#FFBE0B', 
                  color: '#000',
                  border: '4px solid #000',
                  boxShadow: '6px 6px 0px #000',
                  opacity: user.coins >= (30 + hintCost * 2) ? 1 : 0.5 
                }}
              >
                <Gem size={20} /> SKIP ({30 + hintCost * 2} Coins)
              </button>
            )}

            <button
              disabled={adTimer > 0}
              onClick={claimHint}
              className="w-full py-4 font-black uppercase text-lg"
              style={{
                background: adTimer > 0 ? '#E5E5E5' : '#06FFA5',
                color: adTimer > 0 ? '#999' : '#000',
                border: '4px solid #000',
                boxShadow: adTimer > 0 ? 'none' : '6px 6px 0px #000',
                cursor: adTimer > 0 ? 'not-allowed' : 'pointer',
                transform: adTimer > 0 ? 'none' : 'translateY(-2px)'
              }}
            >
              {adTimer > 0 ? 'BITTE WARTEN...' : 'HINWEIS ANSEHEN'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NineMensMorrisGame;
