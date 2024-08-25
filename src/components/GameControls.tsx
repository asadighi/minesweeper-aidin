import React from 'react';
import { GameDifficulty } from '../GameEngine/GameConfig';

interface GameControlsProps {
    tempRowCount: number;
    tempColCount: number;
    tempDifficulty: GameDifficulty;
    setTempRowCount: (value: number) => void;
    setTempColCount: (value: number) => void;
    setTempDifficulty: (value: GameDifficulty) => void;
    startNewGame: () => void;
    loading: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
    tempRowCount,
    tempColCount,
    tempDifficulty,
    setTempRowCount,
    setTempColCount,
    setTempDifficulty,
    startNewGame,
    loading
}) => (
    <div className="game-controls">
        <label>
            Rows:
            <input
                type="number"
                value={tempRowCount}
                onChange={(e) => setTempRowCount(Number(e.target.value))}
            />
        </label>
        <label>
            Columns:
            <input
                type="number"
                value={tempColCount}
                onChange={(e) => setTempColCount(Number(e.target.value))}
            />
        </label>
        <label>
            Difficulty:
            <select
                value={tempDifficulty}
                onChange={(e) => setTempDifficulty(e.target.value as GameDifficulty)}
            >
                <option value={GameDifficulty.Easy}>Easy</option>
                <option value={GameDifficulty.Intermediate}>Intermediate</option>
                <option value={GameDifficulty.Expert}>Expert</option>
            </select>
        </label>
        <button onClick={startNewGame} disabled={loading}>
            {loading ? 'Loading...' : 'Start A New Game'}
        </button>
    </div>
);
