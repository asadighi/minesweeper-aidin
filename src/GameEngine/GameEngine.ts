import { GameConfig, GameDifficulty } from "./GameConfig";
import { GameState, GameStatus } from "./GameState";
// eslint-disable-next-line import/no-webpack-loader-syntax
import WorkerConstructor from 'worker-loader!./GridWorker.worker'; // Import using the correct worker-loader syntax

export class GameEngine {
    private worker: Worker | null = null;

    public async createGame(rowCount: number, colCount: number, difficulty: GameDifficulty): Promise<GameState> {
        if (!this.worker) {
            console.log('Initializing worker');
            this.worker = new WorkerConstructor(); // Directly instantiate the worker using the WorkerConstructor
        }

        console.log('Starting to create game with', { rowCount, colCount, difficulty });

        const totalCellCount = rowCount * colCount;
        const mineCount = Math.floor(GameConfig.MinePercentagePerDifficulty[difficulty] * totalCellCount);

        const indices = Array.from({ length: totalCellCount }, (_, index) => index);
        this.shuffleArray(indices);
        const selectedIndices = indices.slice(0, mineCount);

        return new Promise((resolve, reject) => {
            this.worker!.onmessage = function (event: MessageEvent<any>) {
                console.log('Received message from worker:', event.data);
                const { land } = event.data;

                resolve({
                    rowCount,
                    colCount,
                    difficulty,
                    mineCount,
                    status: GameStatus.InProgress,
                    land,
                });
            };

            this.worker!.onerror = function (error) {
                console.error('Worker error:', error);
                reject(`Worker error: ${error.message}`);
            };

            const workerInput = { rowCount, colCount, mineCount, indices: selectedIndices };
            console.log('Posting message to worker:', workerInput);
            this.worker!.postMessage(workerInput);
        });
    }

    private shuffleArray(array: number[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }
}
