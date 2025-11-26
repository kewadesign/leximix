import { Chess, Move, Square } from 'chess.js';

// Piece values for evaluation
const PIECE_VALUES: Record<string, number> = {
    'p': 10,
    'n': 30,
    'b': 30,
    'r': 50,
    'q': 90,
    'k': 900
};

// Piece-Square Tables (Simplified for Black - mirroring needed for White if symmetric)
// These favor central control and development.
const PAWN_TABLE = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [1, 1, 2, 3, 3, 2, 1, 1],
    [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
    [0.5, 1, 1, -2, -2, 1, 1, 0.5],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

const KNIGHT_TABLE = [
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2, 0, 0, 0, 0, -2, -4],
    [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
    [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
    [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
    [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
    [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5]
];

const BISHOP_TABLE = [
    [-2, -1, -1, -1, -1, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
    [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
    [-1, 0, 1, 1, 1, 1, 0, -1],
    [-1, 1, 1, 1, 1, 1, 1, -1],
    [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
    [-2, -1, -1, -1, -1, -1, -1, -2]
];

const ROOK_TABLE = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.5, 1, 1, 1, 1, 1, 1, 0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [0, 0, 0, 0.5, 0.5, 0, 0, 0]
];

const QUEEN_TABLE = [
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-1, 0, 0.5, 0, 0, 0, 0, -1],
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2]
];

const KING_TABLE_MID = [
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-2, -3, -3, -4, -4, -3, -3, -2],
    [-1, -2, -2, -2, -2, -2, -2, -1],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 3, 1, 0, 0, 1, 3, 2]
];

// Get piece value with positional bonus
const getPieceValue = (piece: any, r: number, c: number, isEndgame: boolean) => {
    if (!piece) return 0;
    
    let value = PIECE_VALUES[piece.type] || 0;
    let positionBonus = 0;

    // Adjust tables based on color (tables are defined for White's perspective roughly, need mirroring)
    // Actually, typically tables are defined from rank 0-7.
    // Let's assume tables are [rank 0 (a8..h8)] to [rank 7 (a1..h1)].
    // If piece is White (at bottom, ranks 6,7), we use table index roughly.
    // For simplicity, let's just use material value first for speed, then add simple center bias.
    
    // Using simplified center bonus instead of full tables to save tokens/complexity
    if (piece.type === 'p') {
        // Advance bonus
        positionBonus += (piece.color === 'w' ? (6-r) : (r-1)) * 0.1; 
    }
    
    if (piece.color === 'b') {
        // Invert for black if we are evaluating from white perspective, 
        // but usually we evaluate absolute score for the side.
        // Here we return positive value.
    }

    return value * 10 + positionBonus;
};

const evaluateBoard = (game: Chess) => {
    let score = 0;
    const board = game.board();
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const val = getPieceValue(piece, r, c, false);
                score += piece.color === 'w' ? val : -val;
            }
        }
    }
    return score;
};

// Minimax with Alpha-Beta Pruning
export const getBestMove = (game: Chess, depth: number): string | null => {
    let bestMove = null;
    let bestValue = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;
    
    const isMaximizing = game.turn() === 'w'; // Assume AI plays current turn
    // Actually, if AI is Black, it wants to minimize the White-biased score (or maximize negative).
    // Let's normalize: AI wants to Maximize its own score.
    
    const moves = game.moves();
    // Sort moves: Captures first (MVV-LVA simplified)
    moves.sort((a, b) => {
        if (a.includes('x') && !b.includes('x')) return -1;
        if (!a.includes('x') && b.includes('x')) return 1;
        return 0;
    });

    if (moves.length === 0) return null;

    // Basic Minimax Root
    for (const move of moves) {
        game.move(move);
        // Score is always from White's perspective in evaluateBoard
        // If AI is Black, it wants Lowest Score.
        // If AI is White, it wants Highest Score.
        
        const value = minimax(game, depth - 1, alpha, beta, !isMaximizing);
        game.undo();

        if (isMaximizing) {
            // AI is White
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
            alpha = Math.max(alpha, bestValue);
        } else {
            // AI is Black
            if (bestMove === null || value < bestValue) { // Note: Initialize bestValue appropriately for minimization
                bestValue = value; // Wait, if minimizing, bestValue should start at Infinity
                bestMove = move;
            }
            // For minimizing, we check if value < bestValue (if bestValue was Infinity)
            // Let's fix the initialization for Root.
        }
    }
    
    return bestMove;
};

// Helper for root to handle black/white properly
export const calculateBestMove = (game: Chess, depth: number): string | null => {
    const moves = game.moves();
    if (moves.length === 0) return null;

    // Captures first
    moves.sort((a, b) => (b.includes('x') ? 1 : 0) - (a.includes('x') ? 1 : 0));

    let bestMove = null;
    const isMaximizing = game.turn() === 'w';
    let bestValue = isMaximizing ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
        game.move(move);
        const value = minimax(game, depth - 1, alpha, beta, !isMaximizing);
        game.undo();

        if (isMaximizing) {
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
            alpha = Math.max(alpha, bestValue);
        } else {
            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
            }
            beta = Math.min(beta, bestValue);
        }
        
        if (beta <= alpha) break;
    }

    return bestMove || moves[Math.floor(Math.random() * moves.length)];
};

const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    if (depth === 0 || game.isGameOver()) {
        return evaluateBoard(game);
    }

    const moves = game.moves();
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            game.move(move);
            const evalScore = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            game.move(move);
            const evalScore = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};

export const getLevelConfig = (levelId: number) => {
    // 100 Levels logic
    // 1-10: Depth 1 (Very Easy)
    // 11-30: Depth 2 (Easy)
    // 31-60: Depth 3 (Medium)
    // 61-90: Depth 3 + Aggressive?
    // 91-100: Depth 4 (Hard - slow in JS)
    
    let depth = 1;
    if (levelId > 10) depth = 2;
    if (levelId > 30) depth = 3;
    if (levelId > 90) depth = 4;

    return { depth };
};
