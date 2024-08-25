import { GameConfig, GameDifficulty } from "./GameConfig";
import { GameState, GameStatus } from "./GameState";

export class GameEngine {
    public async createGame(rowCount: number, colCount: number, difficulty: GameDifficulty): Promise<GameState> {
        const state: GameState = {
            rowCount,
            colCount,
            difficulty,
            mineCount: 0,
            status: GameStatus.Uninitialized,
            land: Array.from({ length: rowCount }, () => 
                Array.from({ length: colCount }, () => ({
                    hasMine: false,
                    isDiscovered: false,
                    isMarked: false,
                    surroundingMineCount: 0
                }))
            )
        };

        await this.placeMines(state);
        state.status = GameStatus.InProgress;
        return state;
    }

    private async placeMines(state: GameState): Promise<void> {
        const totalCellCount = state.colCount * state.rowCount;
        state.mineCount = Math.floor(GameConfig.MinePercentagePerDifficulty[state.difficulty] * totalCellCount);

        // Generate an array of all possible cell indices
        const indices = Array.from({ length: totalCellCount }, (_, index) => index);
        // Shuffle the indices array
        this.shuffleArray(indices);

        // Process mines placement in chunks using requestAnimationFrame
        const promises = indices.slice(0, state.mineCount).map(index => {
            return new Promise<void>(resolve => {
                requestAnimationFrame(() => {
                    const row = Math.floor(index / state.colCount);
                    const col = index % state.colCount;

                    state.land[row][col].hasMine = true;
                    this.incrementSurroundingMineCount(state, row, col);
                    resolve();
                });
            });
        });

        await Promise.all(promises);
    }

    private incrementSurroundingMineCount(state: GameState, row: number, col: number) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],          [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;

            if (newRow >= 0 && newRow < state.rowCount && newCol >= 0 && newCol < state.colCount) {
                state.land[newRow][newCol].surroundingMineCount++;
            }
        }
    }

    private shuffleArray(array: number[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }
}
