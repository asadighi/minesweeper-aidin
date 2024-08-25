import { GameConfig, GameDifficulty } from "./GameConfig";
import { GameState, GameStatus } from "./GameState";

export class GameEngine {



    public createGame(rowCount: number, colCount: number, difficulty: GameDifficulty): GameState {
        const state = {
            rowCount,
            colCount,
            difficulty,
            mineCount: 0,
            status: GameStatus.Uninitialized,
            land: Array.from({length: rowCount}, () => {
                return Array.from({ length: colCount }, () => {
                    return {
                        hasMine: false,
                        isDiscovered: false,
                        isMarked: false,
                        surroundingMineCount: 0
                    }
                })
            })
        };
        this.placeMines(state);
        this.fillSurroundingMineCountForAllCells(state);
        state.status = GameStatus.InProgress;
        return state;
    }

    private placeMines(state: GameState) {
        const totalCellCount = state.colCount * state.rowCount;
        state.mineCount = Math.floor(GameConfig.MinePercentagePerDifficulty[state.difficulty] * totalCellCount);
        let minesPlaced = 0;
        while (minesPlaced < state.mineCount) {
            // Generate random row and column indices
            const row = Math.floor(Math.random() * state.rowCount);
            const col = Math.floor(Math.random() * state.colCount);

            // If the cell does not already contain a mine, place a mine (e.g., -1 for a mine)
            if (!state.land[row][col].hasMine) {
                state.land[row][col].hasMine = true;
                minesPlaced++;
            }
        }
    }
    private fillSurroundingMineCountForAllCells(state: GameState) {
        // Now that we have populated our mines lets ensure we can ca
        // Directions to check for surrounding cells (8 possible directions)
        const directions = [
            [-1, -1], [-1, 0], [-1, 1], // top-left, top, top-right
            [0, -1], /*    */ [0, 1],   // left,        , right
            [1, -1], [1, 0], [1, 1]     // bottom-left, bottom, bottom-right
        ];
        for (let row = 0; row < state.rowCount; row++) {
            for (let col = 0; col < state.colCount; col++) {
                // If the current cell is a mine, skip it
                if (state.land[row][col].hasMine) {
                    continue;
                }
    
                // Check all surrounding cells
                let mineCount = 0;
                for (let [dx, dy] of directions) {
                    const newRow = row + dx;
                    const newCol = col + dy;
    
                    // Make sure the surrounding cell is within bounds
                    if (newRow >= 0 && newRow < state.rowCount && newCol >= 0 && newCol < state.colCount) {
                        if (state.land[newRow][newCol].hasMine) {
                            mineCount++;
                        }
                    }
                }
    
                // Store the count of surrounding mines in the corresponding cell
                state.land[row][col].surroundingMineCount = mineCount;
            }
        }
    }

}