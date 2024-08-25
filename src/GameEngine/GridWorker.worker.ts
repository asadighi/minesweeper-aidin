/// <reference lib="webworker" />

export interface GridWorkerInput {
    rowCount: number;
    colCount: number;
    mineCount: number;
    indices: number[];
}

export interface GridWorkerOutput {
    land: {
        hasMine: boolean;
        isDiscovered: boolean;
        isMarked: boolean;
        surroundingMineCount: number;
    }[][];
}

// eslint-disable-next-line no-restricted-globals
const ctx: DedicatedWorkerGlobalScope = self as any;

console.log('Worker script loaded'); // Ensure this runs when the worker is instantiated

ctx.onmessage = function (e: MessageEvent<GridWorkerInput>) {
    console.log('Worker received message:', e.data); // Log message receipt

    const { rowCount, colCount, indices } = e.data;

    const land = Array.from({ length: rowCount }, () =>
        Array.from({ length: colCount }, () => ({
            hasMine: false,
            isDiscovered: false,
            isMarked: false,
            surroundingMineCount: 0,
        }))
    );

    indices.forEach((index) => {
        const row = Math.floor(index / colCount);
        const col = index % colCount;
        land[row][col].hasMine = true;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1],
        ];

        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;

            if (newRow >= 0 && newRow < rowCount && newCol >= 0 && newCol < colCount) {
                land[newRow][newCol].surroundingMineCount++;
            }
        });
    });

    const output: GridWorkerOutput = { land };
    console.log('Worker posting message back to main thread'); // Log when sending data back
    ctx.postMessage(output);
};
