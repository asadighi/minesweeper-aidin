import { GameState } from '../GameEngine/GameState';

export const revealCells = (gameState: GameState, row: number, col: number) => {
    const cell = gameState.land[row][col];
    if (cell.isDiscovered || cell.hasMine || cell.isMarked) return;

    cell.isDiscovered = true;

    if (cell.surroundingMineCount > 0) return;

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < gameState.rowCount && newCol >= 0 && newCol < gameState.colCount) {
            revealCells(gameState, newRow, newCol);
        }
    });
};

export const revealAllCells = (gameState: GameState) => {
    gameState.land.forEach(row => {
        row.forEach(cell => {
            cell.isDiscovered = true;
        });
    });
};

export const allNonMineCellsDiscovered = (gameState: GameState): boolean => {
    return gameState.land.every(row => row.every(cell => cell.hasMine || cell.isDiscovered));
};
