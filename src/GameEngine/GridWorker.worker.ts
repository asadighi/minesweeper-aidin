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

// Worker global context
// eslint-disable-next-line no-restricted-globals
const ctx: DedicatedWorkerGlobalScope = self as any;

ctx.onmessage = function (e: MessageEvent<GridWorkerInput>) {
    const { rowCount, colCount, indices } = e.data;

    // Initialize the land grid
    const land = Array.from({ length: rowCount }, () =>
        Array.from({ length: colCount }, () => ({
            hasMine: false,
            isDiscovered: false,
            isMarked: false,
            surroundingMineCount: 0,
        }))
    );

    // Precomputed directions array for neighboring cells
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1],
    ];

    let index = 0;
    const chunkSize = 1000; // Adjust chunk size for balancing performance and responsiveness

    // Function to process a chunk of mines
    function processChunk() {
        for (let i = 0; i < chunkSize && index < indices.length; i++, index++) {
            const row = Math.floor(indices[index] / colCount);
            const col = indices[index] % colCount;
            land[row][col].hasMine = true;

            // Update surrounding cells
            directions.forEach(([dx, dy]) => {
                const newRow = row + dx;
                const newCol = col + dy;

                if (newRow >= 0 && newRow < rowCount && newCol >= 0 && newCol < colCount) {
                    land[newRow][newCol].surroundingMineCount++;
                }
            });
        }

        // Continue processing if there are more mines
        if (index < indices.length) {
            setTimeout(processChunk, 0); // Yield control back to the event loop
        } else {
            // Post the final land grid back to the main thread
            ctx.postMessage({ land });
        }
    }

    processChunk(); // Start processing the first chunk
};
