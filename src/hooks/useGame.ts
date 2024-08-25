import { useMemo, useState, useEffect } from 'react';
import { GameEngine } from '../GameEngine/GameEngine';
import { GameConfig } from '../GameEngine/GameConfig';
import { GameState, GameStatus } from '../GameEngine/GameState';
import { revealCells, revealAllCells, allNonMineCellsDiscovered } from '../utils/gameHelpers';

export const useGame = (initialConfig: GameConfig) => {
    const gameEngine = useMemo(() => new GameEngine(), []);
    const [gameConfig, setGameConfig] = useState(initialConfig);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [remainingMines, setRemainingMines] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (gameState) {
            const markedCells = gameState.land.flat().filter(cell => cell.isMarked).length;
            setRemainingMines(gameState.mineCount - markedCells);
        }
    }, [gameState]);

    const startNewGame = async (config: GameConfig) => {
        setLoading(true);
        const newState = await gameEngine.createGame(config.rowCount, config.colCount, config.difficulty);
        setGameConfig(config);
        setGameState(newState);
        setLoading(false);
    };

    const tryAgain = async () => {
        if (gameState) {
            setLoading(true);
            const newState = await gameEngine.createGame(gameState.rowCount, gameState.colCount, gameState.difficulty);
            setGameState(newState);
            setLoading(false);
        }
    };

    const handleCellClick = (row: number, col: number) => {
        if (!gameState || gameState.status !== GameStatus.InProgress) return;

        const cell = gameState.land[row][col];
        if (cell.isDiscovered || cell.isMarked) return;

        if (cell.hasMine) {
            cell.isDiscovered = true;
            gameState.status = GameStatus.Lost;
            revealAllCells(gameState);
        } else {
            revealCells(gameState, row, col);
            if (allNonMineCellsDiscovered(gameState)) {
                gameState.status = GameStatus.Won;
            }
        }

        setGameState({ ...gameState });
    };

    const handleCellRightClick = (event: React.MouseEvent, row: number, col: number) => {
        event.preventDefault();
        if (!gameState || gameState.status !== GameStatus.InProgress) return;

        const cell = gameState.land[row][col];
        if (cell.isDiscovered) return;

        cell.isMarked = !cell.isMarked;
        setGameState({ ...gameState });
    };

    return { gameConfig, gameState, remainingMines, loading, startNewGame, tryAgain, handleCellClick, handleCellRightClick };
};
