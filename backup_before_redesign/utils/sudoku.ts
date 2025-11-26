
import { Tier } from '../types';

// The set of letters used for Sudoku (A-I)
export const SUDOKU_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

// Check if placing a char at (row, col) is valid
const isValid = (board: string[][], row: number, col: number, char: string): boolean => {
    // Check Row
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === char) return false;
    }
    // Check Col
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === char) return false;
    }
    // Check 3x3 Subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[startRow + r][startCol + c] === char) return false;
        }
    }
    return true;
};

// Backtracking algorithm to generate a full valid board
const solveSudoku = (board: string[][]): boolean => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === '') {
                // Try random order of letters to generate diverse puzzles
                const shuffledLetters = [...SUDOKU_LETTERS].sort(() => Math.random() - 0.5);
                
                for (const char of shuffledLetters) {
                    if (isValid(board, row, col, char)) {
                        board[row][col] = char;
                        if (solveSudoku(board)) return true;
                        board[row][col] = ''; // Backtrack
                    }
                }
                return false;
            }
        }
    }
    return true;
};

export const generateSudokuPuzzle = (tier: Tier) => {
    // 1. Initialize empty board
    const solution: string[][] = Array.from({ length: 9 }, () => Array(9).fill(''));
    
    // 2. Generate full valid solution
    solveSudoku(solution);
    
    // 3. Create puzzle by removing cells based on difficulty
    // Beginner: Remove ~30 cells (Easy)
    // Master: Remove ~55 cells (Hard)
    let cellsToRemove = 30;
    switch (tier) {
        case Tier.BEGINNER: cellsToRemove = 30; break;
        case Tier.LEARNER: cellsToRemove = 36; break;
        case Tier.SKILLED: cellsToRemove = 42; break;
        case Tier.EXPERT: cellsToRemove = 48; break;
        case Tier.MASTER: cellsToRemove = 54; break;
    }

    const puzzle = solution.map(row => [...row]);
    let removed = 0;
    
    while (removed < cellsToRemove) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== '') {
            puzzle[r][c] = '';
            removed++;
        }
    }

    return {
        initialBoard: puzzle,
        solution: solution
    };
};
