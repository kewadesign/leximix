import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Crown, Circle, RotateCcw, Lightbulb, Coins, Play, X, Trophy, Gem } from 'lucide-react';
import { ref, onValue, set, off } from 'firebase/database';
import { database } from '../utils/firebase';
import { Language, UserState, GameMode } from '../types';
import { TRANSLATIONS } from '../constants';
import catDanceGif from '../assets/cat-dance.gif';

// Types
type PieceColor = 'red' | 'black' | null;
type PieceType = 'normal' | 'king' | null;

interface Piece {
  color: PieceColor;
  type: PieceType;
}

interface Position {
  row: number;
  col: number;
}

interface Move {
  from: Position;
  to: Position;
  captured?: Position[];
  isJump: boolean;
}

interface CheckersGameProps {
  language: Language;
  user: UserState;
  onGameEnd: (xp: number, coins: number) => void;
  onBack: () => void;
  multiplayerGameId?: string | null;
  opponentName?: string | null;
  isHost?: boolean;
  levelId?: number;
}

// AI difficulty based on level
const getAIDepth = (levelId: number): number => {
  if (levelId <= 10) return 1;
  if (levelId <= 30) return 2;
  if (levelId <= 60) return 3;
  if (levelId <= 90) return 4;
  return 5;
};

// Initialize empty 8x8 board
const createInitialBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Place black pieces (top - rows 0-2)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', type: 'normal' };
      }
    }
  }

  // Place red pieces (bottom - rows 5-7)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', type: 'normal' };
      }
    }
  }

  return board;
};

// Deep clone board
const cloneBoard = (board: (Piece | null)[][]): (Piece | null)[][] => {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
};

// Check if position is valid
const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// Get all valid moves for a piece
const getValidMoves = (board: (Piece | null)[][], row: number, col: number, mustJump: boolean = false): Move[] => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: Move[] = [];
  const directions: number[] = piece.type === 'king' ? [-1, 1] : (piece.color === 'red' ? [-1] : [1]);

  // Check jumps first
  const jumpMoves = getJumpMoves(board, row, col, piece, directions);

  if (jumpMoves.length > 0) {
    return jumpMoves;
  }

  if (mustJump) return [];

  // Regular moves (only if no jumps available)
  for (const dRow of directions) {
    for (const dCol of [-1, 1]) {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
        moves.push({
          from: { row, col },
          to: { row: newRow, col: newCol },
          isJump: false
        });
      }
    }
  }

  return moves;
};

// Get jump moves (captures)
const getJumpMoves = (board: (Piece | null)[][], row: number, col: number, piece: Piece, directions: number[]): Move[] => {
  const moves: Move[] = [];

  for (const dRow of directions) {
    for (const dCol of [-1, 1]) {
      const midRow = row + dRow;
      const midCol = col + dCol;
      const endRow = row + 2 * dRow;
      const endCol = col + 2 * dCol;

      if (isValidPosition(endRow, endCol)) {
        const midPiece = board[midRow][midCol];
        const endCell = board[endRow][endCol];

        if (midPiece && midPiece.color !== piece.color && !endCell) {
          moves.push({
            from: { row, col },
            to: { row: endRow, col: endCol },
            captured: [{ row: midRow, col: midCol }],
            isJump: true
          });
        }
      }
    }
  }

  return moves;
};

// Check if any piece can jump
const canAnyPieceJump = (board: (Piece | null)[][], color: PieceColor): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const directions = piece.type === 'king' ? [-1, 1] : (piece.color === 'red' ? [-1] : [1]);
        if (getJumpMoves(board, row, col, piece, directions).length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

// Get all valid moves for a color
const getAllValidMoves = (board: (Piece | null)[][], color: PieceColor): Move[] => {
  const allMoves: Move[] = [];
  const mustJump = canAnyPieceJump(board, color);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        allMoves.push(...getValidMoves(board, row, col, mustJump));
      }
    }
  }

  return allMoves;
};

// Apply move to board
const applyMove = (board: (Piece | null)[][], move: Move): (Piece | null)[][] => {
  const newBoard = cloneBoard(board);
  const piece = newBoard[move.from.row][move.from.col];

  if (!piece) return newBoard;

  // Move piece
  newBoard[move.to.row][move.to.col] = piece;
  newBoard[move.from.row][move.from.col] = null;

  // Remove captured pieces
  if (move.captured) {
    for (const cap of move.captured) {
      newBoard[cap.row][cap.col] = null;
    }
  }

  // Promote to king
  if ((piece.color === 'red' && move.to.row === 0) || (piece.color === 'black' && move.to.row === 7)) {
    newBoard[move.to.row][move.to.col] = { ...piece, type: 'king' };
  }

  return newBoard;
};

// Evaluate board for AI
const evaluateBoard = (board: (Piece | null)[][], aiColor: PieceColor): number => {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = piece.type === 'king' ? 3 : 1;
        const positionBonus = piece.type !== 'king' ? (piece.color === 'black' ? row * 0.1 : (7 - row) * 0.1) : 0;

        if (piece.color === aiColor) {
          score += value + positionBonus;
        } else {
          score -= value + positionBonus;
        }
      }
    }
  }

  return score;
};

// Minimax AI
const minimax = (
  board: (Piece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PieceColor,
  playerColor: PieceColor
): number => {
  const currentColor = isMaximizing ? aiColor : playerColor;
  const moves = getAllValidMoves(board, currentColor);

  if (depth === 0 || moves.length === 0) {
    return evaluateBoard(board, aiColor);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, aiColor, playerColor);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, aiColor, playerColor);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

// Get best AI move
const getBestMove = (board: (Piece | null)[][], aiColor: PieceColor, playerColor: PieceColor, depth: number): Move | null => {
  const moves = getAllValidMoves(board, aiColor);
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newBoard = applyMove(board, move);
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, aiColor, playerColor);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

export const CheckersGame: React.FC<CheckersGameProps> = ({
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
  const [board, setBoard] = useState<(Piece | null)[][]>(createInitialBoard);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('red');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [showStartModal, setShowStartModal] = useState(true);
  const [hintMove, setHintMove] = useState<Move | null>(null);
  const [hintCost, setHintCost] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [adTimer, setAdTimer] = useState(5);

  const isMultiplayer = !!multiplayerGameId;
  const playerColor: PieceColor = isHost ? 'red' : 'black';
  const aiColor: PieceColor = 'black';
  const aiDepth = getAIDepth(levelId);

  // Format move for display
  const formatMove = (move: Move, color: PieceColor): string => {
    const fromCol = String.fromCharCode(65 + move.from.col);
    const toCol = String.fromCharCode(65 + move.to.col);
    const colorName = color === 'red' ? 'Rot' : 'Schwarz';

    if (move.isJump) {
      return `${colorName}: ${fromCol}${8 - move.from.row} schlägt ${toCol}${8 - move.to.row}`;
    }
    return `${colorName}: ${fromCol}${8 - move.from.row} → ${toCol}${8 - move.to.row}`;
  };

  // Multiplayer sync
  useEffect(() => {
    if (!isMultiplayer || !multiplayerGameId) return;

    const gameRef = ref(database, `games/${multiplayerGameId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.board) {
          setBoard(data.board);
        }
        if (data.currentPlayer) {
          setCurrentPlayer(data.currentPlayer);
        }
        if (data.gameStatus && data.gameStatus !== 'playing') {
          setGameStatus(data.gameStatus === playerColor ? 'won' : 'lost');
        }
        if (data.moveHistory) {
          setMoveHistory(data.moveHistory);
        }
      }
    });

    return () => off(gameRef);
  }, [isMultiplayer, multiplayerGameId, playerColor]);

  // AI Move
  useEffect(() => {
    if (isMultiplayer || gameStatus !== 'playing' || showStartModal) return;
    if (currentPlayer !== aiColor) return;

    const timer = setTimeout(() => {
      const bestMove = getBestMove(board, aiColor, playerColor, aiDepth);
      if (bestMove) {
        executeMove(bestMove);
      } else {
        // AI has no moves - player wins
        setGameStatus('won');
        onGameEnd(50 + levelId * 5, 20 + levelId * 2);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPlayer, board, gameStatus, showStartModal, isMultiplayer]);

  // Check for game over
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const playerMoves = getAllValidMoves(board, playerColor);
    const opponentMoves = getAllValidMoves(board, aiColor);

    if (playerMoves.length === 0 && currentPlayer === playerColor) {
      setGameStatus('lost');
      onGameEnd(10, 5);
    } else if (opponentMoves.length === 0 && currentPlayer === aiColor) {
      setGameStatus('won');
      onGameEnd(50 + levelId * 5, 20 + levelId * 2);
    }
  }, [board, currentPlayer]);

  // Execute move
  const executeMove = useCallback((move: Move) => {
    const newBoard = applyMove(board, move);
    const moveStr = formatMove(move, currentPlayer);
    const newHistory = [...moveHistory, moveStr];

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setSelectedPiece(null);
    setValidMoves([]);
    setHintMove(null);

    // Check for multi-jump
    const piece = newBoard[move.to.row][move.to.col];
    if (move.isJump && piece) {
      const directions = piece.type === 'king' ? [-1, 1] : (piece.color === 'red' ? [-1] : [1]);
      const additionalJumps = getJumpMoves(newBoard, move.to.row, move.to.col, piece, directions);

      if (additionalJumps.length > 0) {
        // Must continue jumping
        setSelectedPiece({ row: move.to.row, col: move.to.col });
        setValidMoves(additionalJumps);
        return;
      }
    }

    // Switch player
    const nextPlayer = currentPlayer === 'red' ? 'black' : 'red';
    setCurrentPlayer(nextPlayer);

    // Sync multiplayer
    if (isMultiplayer && multiplayerGameId) {
      set(ref(database, `games/${multiplayerGameId}`), {
        board: newBoard,
        currentPlayer: nextPlayer,
        moveHistory: newHistory,
        lastUpdate: Date.now()
      });
    }
  }, [board, currentPlayer, moveHistory, isMultiplayer, multiplayerGameId]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== 'playing' || showStartModal) return;
    if (isMultiplayer && currentPlayer !== playerColor) return;
    if (!isMultiplayer && currentPlayer !== playerColor) return;

    const piece = board[row][col];

    // If clicking on a valid move destination
    if (selectedPiece) {
      const move = validMoves.find(m => m.to.row === row && m.to.col === col);
      if (move) {
        executeMove(move);
        return;
      }
    }

    // Select a piece
    if (piece && piece.color === playerColor) {
      const mustJump = canAnyPieceJump(board, playerColor);
      const moves = getValidMoves(board, row, col, mustJump);

      if (moves.length > 0) {
        setSelectedPiece({ row, col });
        setValidMoves(moves);
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
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
    const bestMove = getBestMove(board, playerColor, aiColor, Math.min(aiDepth + 1, 5));
    if (bestMove) {
      setHintMove(bestMove);
      setTimeout(() => setHintMove(null), 3000);
    }
    setHintCost(prev => prev + 5);
    setShowHintModal(false);
  };

  // Restart game
  const restartGame = () => {
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setValidMoves([]);
    setCurrentPlayer('red');
    setGameStatus('playing');
    setMoveHistory([]);
    setHintMove(null);
  };

  // Render piece
  // Render checker piece - Neo-Brutalist flat design
  const renderPiece = (piece: Piece) => {
    const isKing = piece.type === 'king';
    const isRed = piece.color === 'red';

    return (
      <div
        className="relative transition-transform hover:scale-110 cursor-pointer"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isRed ? '#FF006E' : '#000',
          border: '3px solid var(--color-border)',
          boxShadow: '3px 3px 0px #000'
        }}
      >
        {/* Inner circle */}
        <div
          className="absolute rounded-full"
          style={{
            top: '6px',
            left: '6px',
            right: '6px',
            bottom: '6px',
            border: `2px solid ${isRed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}`
          }}
        />
        {isKing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Crown size={20} className="text-[#FFBE0B]" strokeWidth={3} />
          </div>
        )}
      </div>
    );
  };

  // Game mode color
  const modeColor = '#DC2626'; // Red for Checkers

  return (
    <div className="min-h-screen p-4 geo-pattern">
      {/* Header - Neo Brutal with Gradient */}
      <div 
        className="flex items-center justify-between mb-4 p-3"
        style={{
          background: 'linear-gradient(135deg, #06FFA5 0%, #0096FF 100%)',
          border: '4px solid var(--color-border)',
          boxShadow: '6px 6px 0px var(--color-border)',
          transform: 'skewX(-2deg)'
        }}
      >
        <button
          onClick={onBack}
          className="p-2 transition-all hover:-translate-y-1"
          style={{ 
            background: 'var(--color-surface)', 
            border: '3px solid var(--color-border)', 
            boxShadow: '3px 3px 0px var(--color-border)',
            transform: 'skewX(2deg) rotate(-3deg)'
          }}
        >
          <ArrowLeft size={22} />
        </button>

        <h2 
          className="text-xl font-black uppercase tracking-wider"
          style={{ color: '#000', textShadow: '1px 1px 0px rgba(255,255,255,0.5)', transform: 'skewX(2deg)' }}
        >
          Dame
        </h2>

        <div className="flex items-center gap-2" style={{ transform: 'skewX(2deg)' }}>
          <div 
            className="flex items-center gap-2 px-3 py-2 font-black"
            style={{ background: '#FFBE0B', border: '3px solid var(--color-border)', boxShadow: '3px 3px 0px var(--color-border)', transform: 'rotate(2deg)' }}
          >
            <Coins size={18} className="text-[#000]" />
            <span className="text-black text-lg">{user.coins}</span>
          </div>

          {!isMultiplayer && (
            <div 
              className="px-3 py-2 font-black text-white text-sm"
              style={{ background: '#8338EC', border: '3px solid var(--color-border)', boxShadow: '3px 3px 0px var(--color-border)', transform: 'rotate(-2deg)' }}
            >
              LVL {levelId}
            </div>
          )}
        </div>
      </div>

      {/* Neo-Brutalist Game Container */}
      <div
        className="max-w-lg mx-auto mt-4"
        style={{
          background: 'var(--color-bg)',
          border: '4px solid var(--color-border)',
          boxShadow: '8px 8px 0px var(--color-border)'
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b-4 border-[var(--color-border)]"
          style={{ background: modeColor }}
        >
          <div className="flex items-center gap-3">
            <Circle size={24} className="text-white" fill="white" />
            <span className="font-black text-white uppercase text-lg">Dame</span>
          </div>
          <div
            className={`px-4 py-2 font-black text-sm uppercase border-2 border-[var(--color-border)] ${currentPlayer === playerColor ? 'bg-[#06FFA5] text-[var(--color-text)]' : 'bg-[var(--color-surface)] text-[var(--color-text)]'
              }`}
          >
            {currentPlayer === playerColor ? 'DEIN ZUG' : (isMultiplayer ? opponentName?.toUpperCase() : 'KI DENKT')}
          </div>
        </div>

        {/* Board Area */}
        <div className="p-5 md:p-6">
          {/* Score/Info Bar */}
          <div className="flex justify-between items-center mb-5 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF006E] border-3 border-[var(--color-border)]" style={{ boxShadow: '2px 2px 0px #000' }}></div>
              <span className="font-black text-[var(--color-text)] text-lg">DU</span>
            </div>
            <div className="px-4 py-2 bg-black text-white font-black text-sm">
              VS
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black text-[var(--color-text)] text-lg">{isMultiplayer ? opponentName?.toUpperCase() : 'KI'}</span>
              <div className="w-8 h-8 rounded-full bg-[#1F2937] border-3 border-[var(--color-border)]" style={{ boxShadow: '2px 2px 0px #000' }}></div>
            </div>
          </div>

          {/* Board Grid - Neo-Brutalist */}
          <div
            className="mx-auto border-4 border-[var(--color-border)]"
            style={{ boxShadow: '6px 6px 0px #000' }}
          >
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => {
                  const isDark = (rowIndex + colIndex) % 2 === 1;
                  const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
                  const isValidMove = validMoves.some(m => m.to.row === rowIndex && m.to.col === colIndex);
                  const isHint = hintMove && (
                    (hintMove.from.row === rowIndex && hintMove.from.col === colIndex) ||
                    (hintMove.to.row === rowIndex && hintMove.to.col === colIndex)
                  );

                  return (
                    <div
                      key={colIndex}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`flex items-center justify-center cursor-pointer transition-all relative
                        ${isSelected ? 'ring-4 ring-[#FFBE0B] ring-inset' : ''}
                        ${isHint ? 'ring-4 ring-[#06FFA5] ring-inset animate-pulse' : ''}
                      `}
                      style={{
                        width: '52px',
                        height: '52px',
                        background: isDark ? '#D4A574' : 'var(--color-bg)',
                        borderRight: colIndex < 7 ? '1px solid rgba(0,0,0,0.2)' : 'none',
                        borderBottom: rowIndex < 7 ? '1px solid rgba(0,0,0,0.2)' : 'none'
                      }}
                    >
                      {cell && renderPiece(cell)}
                      {isValidMove && (
                        <div
                          className="absolute rounded-full animate-pulse border-2 border-[var(--color-border)]"
                          style={{
                            width: '24px',
                            height: '24px',
                            background: validMoves.find(m => m.to.row === rowIndex && m.to.col === colIndex)?.isJump
                              ? 'rgba(239,68,68,0.7)'
                              : 'rgba(6,255,165,0.7)',
                            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4 justify-center flex-wrap">
            <button
              onClick={getHint}
              className="flex items-center gap-2 px-5 py-3 bg-[#FFBE0B] hover:bg-yellow-400 text-[var(--color-text)] font-black uppercase border-3 border-[var(--color-border)] transition-all hover:-translate-y-1"
              style={{ boxShadow: '4px 4px 0px var(--color-border)' }}
            >
              <Lightbulb size={20} />
              HINWEIS
            </button>

            {!isMultiplayer && (
              <button
                onClick={restartGame}
                className="flex items-center gap-2 px-5 py-3 bg-[var(--color-surface)] hover:bg-gray-100 text-[var(--color-text)] font-black uppercase border-3 border-[var(--color-border)] transition-all hover:-translate-y-1"
                style={{ boxShadow: '4px 4px 0px var(--color-border)' }}
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[var(--color-bg)] p-6 max-w-md w-full border-4 border-[var(--color-border)]"
            style={{ boxShadow: '10px 10px 0px #000' }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-[#DC2626] border-3 border-[var(--color-border)]" style={{ boxShadow: '3px 3px 0px #000' }}>
                <Circle size={28} className="text-white" />
              </div>
              <h2 className="text-3xl font-black uppercase text-[var(--color-text)]">DAME</h2>
            </div>

            <div className="bg-[var(--color-surface)] p-4 border-3 border-[var(--color-border)] mb-4" style={{ boxShadow: '4px 4px 0px var(--color-border)' }}>
              <h3 className="font-black text-sm mb-2 text-[var(--color-text)] uppercase">Spielregeln</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Steine ziehen diagonal vorwärts</li>
                <li>• Gegnerische Steine überspringen zum Schlagen</li>
                <li>• Mehrfach-Sprünge möglich</li>
                <li>• Am Ende wird der Stein zur Dame</li>
              </ul>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-red-100 p-3 border-3 border-[var(--color-border)] text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-3 border-red-800 mx-auto mb-2"></div>
                <span className="text-xs font-black text-[var(--color-text)]">DU (ROT)</span>
              </div>
              <div className="flex-1 bg-gray-100 p-3 border-3 border-[var(--color-border)] text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 border-3 border-gray-800 mx-auto mb-2"></div>
                <span className="text-xs font-black text-[var(--color-text)]">KI (SCHWARZ)</span>
              </div>
            </div>

            {!isMultiplayer && (
              <div className="text-center mb-4">
                <span className="bg-[#8338EC] text-white px-4 py-2 border-3 border-[var(--color-border)] font-black" style={{ boxShadow: '3px 3px 0px #000' }}>LEVEL {levelId}</span>
              </div>
            )}

            <button
              onClick={() => setShowStartModal(false)}
              className="w-full py-4 bg-[#06FFA5] hover:bg-emerald-300 text-[var(--color-text)] font-black uppercase text-xl border-4 border-[var(--color-border)] transition-all flex items-center justify-center gap-3"
              style={{ boxShadow: '6px 6px 0px #000' }}
            >
              <Play size={28} />
              SPIEL STARTEN
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameStatus !== 'playing' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[var(--color-bg)] p-6 max-w-md w-full border-4 border-[var(--color-border)]"
            style={{ boxShadow: '10px 10px 0px #000' }}
          >
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center border-4 border-[var(--color-border)] ${gameStatus === 'won' ? 'bg-[#06FFA5]' : 'bg-red-400'}`}>
                <Trophy size={40} className={gameStatus === 'won' ? 'text-[var(--color-text)]' : 'text-white'} />
              </div>
              <h2 className="text-3xl font-black uppercase mb-2 text-[var(--color-text)]">
                {gameStatus === 'won' ? 'GEWONNEN!' : 'VERLOREN!'}
              </h2>
              <div className="bg-[var(--color-surface)] p-3 border-3 border-[var(--color-border)] mb-4 inline-block" style={{ boxShadow: '3px 3px 0px #000' }}>
                <p className="text-[var(--color-text)] font-bold">
                  {gameStatus === 'won'
                    ? `+${50 + levelId * 5} XP, +${20 + levelId * 2} Münzen`
                    : '+10 XP, +5 Münzen'}
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-[var(--color-surface)] hover:bg-gray-100 text-[var(--color-text)] font-black uppercase border-3 border-[var(--color-border)]"
                  style={{ boxShadow: '4px 4px 0px var(--color-border)' }}
                >
                  MENÜ
                </button>
                {!isMultiplayer && (
                  <button
                    onClick={restartGame}
                    className="px-6 py-3 bg-[#06FFA5] hover:bg-emerald-300 text-[var(--color-text)] font-black uppercase border-3 border-[var(--color-border)]"
                    style={{ boxShadow: '4px 4px 0px var(--color-border)' }}
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] p-6 border-4 border-[var(--color-border)] max-w-sm w-full relative" style={{ boxShadow: '8px 8px 0px var(--color-border)' }}>
            {/* Close Button */}
            <button
              onClick={() => setShowHintModal(false)}
              className="absolute top-2 right-2 p-1 bg-[var(--color-surface)] border-2 border-[var(--color-border)] hover:bg-gray-100"
              style={{ boxShadow: '2px 2px 0px #000' }}
            >
              <X size={16} className="text-[var(--color-text)]" />
            </button>

            <h3 className="text-xl font-black uppercase mb-4 text-[var(--color-text)] text-center">HINWEIS FREISCHALTEN</h3>

            {/* Ad with Cat Dance GIF */}
            <div className="w-full h-40 bg-black flex items-center justify-center relative overflow-hidden border-4 border-[var(--color-border)] mb-4" style={{ boxShadow: '4px 4px 0px var(--color-border)' }}>
              <img src={catDanceGif} alt="Ad" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl font-black font-mono text-white drop-shadow-[4px_4px_0px_#000]">
                  {adTimer > 0 ? `${adTimer}s` : 'FERTIG'}
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-[#FF006E] px-2 py-1 text-[10px] font-black text-white border-2 border-[var(--color-border)]">AD</div>
            </div>

            {hintCost > 0 && (
              <div className="text-center mb-3">
                <span className="bg-[#FF006E] text-white px-3 py-1 text-xs font-black border-2 border-[var(--color-border)]">+{hintCost}s Wartezeit</span>
              </div>
            )}

            {/* Skip Button */}
            {adTimer > 0 && (
              <button
                onClick={() => {
                  const skipCost = 30 + hintCost * 2;
                  if (user.coins >= skipCost) {
                    // Note: Coins would be deducted by parent via onGameEnd or similar
                    // For now just skip the timer
                    setAdTimer(0);
                  }
                }}
                disabled={user.coins < (30 + hintCost * 2)}
                className="w-full py-3 mb-2 font-black uppercase text-sm flex items-center justify-center gap-2 border-3 border-[var(--color-border)] transition-all hover:scale-[1.02]"
                style={{
                  background: user.coins >= (30 + hintCost * 2) ? '#FFBE0B' : '#E5E5E5',
                  color: user.coins >= (30 + hintCost * 2) ? '#000' : '#999',
                  boxShadow: user.coins >= (30 + hintCost * 2) ? '4px 4px 0px #000' : 'none',
                  cursor: user.coins >= (30 + hintCost * 2) ? 'pointer' : 'not-allowed'
                }}
              >
                <Gem size={16} /> SKIP ({30 + hintCost * 2} Coins)
              </button>
            )}

            <button
              disabled={adTimer > 0}
              onClick={claimHint}
              className="w-full py-3 font-black uppercase text-sm border-3 border-[var(--color-border)]"
              style={{
                background: adTimer > 0 ? '#E5E5E5' : '#06FFA5',
                color: adTimer > 0 ? '#999' : '#000',
                boxShadow: adTimer > 0 ? 'none' : '4px 4px 0px #000',
                cursor: adTimer > 0 ? 'not-allowed' : 'pointer'
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

export default CheckersGame;
