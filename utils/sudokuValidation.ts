  export const validateSudoku = (grid: string[][], solution: string[][]) => {
    const status = Array(9).fill(null).map(() => Array(9).fill(null));
    if (!grid || !solution) return status;

    const setStatus = (r: number, c: number, s: string) => {
        if (status[r][c] === 'error') return; // Error takes precedence
        status[r][c] = s;
    };

    // Rows
    for (let r = 0; r < 9; r++) {
        const row = grid[r];
        if (row.every((cell) => cell)) { // Full
            const isCorrect = row.every((cell, c) => cell === solution[r][c]);
            const s = isCorrect ? 'correct' : 'error';
            for (let c = 0; c < 9; c++) setStatus(r, c, s);
        }
    }

    // Cols
    for (let c = 0; c < 9; c++) {
        const col = grid.map(row => row[c]);
        if (col.every((cell) => cell)) { // Full
            const isCorrect = col.every((cell, r) => cell === solution[r][c]);
            const s = isCorrect ? 'correct' : 'error';
            for (let r = 0; r < 9; r++) setStatus(r, c, s);
        }
    }

    // Boxes
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            let isFull = true;
            const cells = [];
            for (let r = br * 3; r < br * 3 + 3; r++) {
                for (let c = bc * 3; c < bc * 3 + 3; c++) {
                    if (!grid[r][c]) isFull = false;
                    cells.push({ r, c, val: grid[r][c] });
                }
            }
            if (isFull) {
                const isCorrect = cells.every(item => item.val === solution[item.r][item.c]);
                const s = isCorrect ? 'correct' : 'error';
                cells.forEach(item => setStatus(item.r, item.c, s));
            }
        }
    }
    return status;
  };
