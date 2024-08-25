import { useState } from 'react';
import './App.css';
import { GameConfig } from './GameEngine/GameConfig';
import { GameStatus } from './GameEngine/GameState';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { useGame } from './hooks/useGame';

function App() {
  const initialConfig = new GameConfig();
    const {
        gameState, remainingMines, loading,
        startNewGame, tryAgain, handleCellClick, handleCellRightClick
    } = useGame(initialConfig);

    // Temporary state for new game config
    const [tempRowCount, setTempRowCount] = useState(initialConfig.rowCount);
    const [tempColCount, setTempColCount] = useState(initialConfig.colCount);
    const [tempDifficulty, setTempDifficulty] = useState(initialConfig.difficulty);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Minesweeper</h1>
                <GameControls
                    tempRowCount={tempRowCount}
                    tempColCount={tempColCount}
                    tempDifficulty={tempDifficulty}
                    setTempRowCount={setTempRowCount}
                    setTempColCount={setTempColCount}
                    setTempDifficulty={setTempDifficulty}
                    startNewGame={() => startNewGame(new GameConfig(tempRowCount, tempColCount, tempDifficulty))}
                    loading={loading}
                />
                <div className="mine-counter">
                    Mines Remaining: {remainingMines}
                </div>
                <div className="game-status">
                    {gameState?.status === GameStatus.Won && <p>You won!</p>}
                    {gameState?.status === GameStatus.Lost && <p>Game over!</p>}
                    {(gameState?.status === GameStatus.Won || gameState?.status === GameStatus.Lost) && (
                        <button onClick={tryAgain} disabled={loading}>
                            {loading ? 'Loading...' : 'Try Again'}
                        </button>
                    )}
                </div>
                <GameBoard
                    gameState={gameState}
                    handleCellClick={handleCellClick}
                    handleCellRightClick={handleCellRightClick}
                />
            </header>
        </div>
    );
}

export default App;
