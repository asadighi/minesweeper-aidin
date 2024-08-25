import React, { useMemo, useState, useEffect, CSSProperties } from 'react';
import './App.css';
import { GameEngine } from './GameEngine/GameEngine';
import { GameConfig, GameDifficulty } from './GameEngine/GameConfig';
import { GameState, GameStatus } from './GameEngine/GameState';
import { FixedSizeGrid as Grid } from 'react-window';

function App() {
  const gameEngine = useMemo(() => new GameEngine(), []);
  const [gameConfig, setGameConfig] = useState(new GameConfig());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [remainingMines, setRemainingMines] = useState(0);
  const [loading, setLoading] = useState(false);

  // Temporary state to hold input values before starting a new game
  const [tempRowCount, setTempRowCount] = useState(gameConfig.rowCount);
  const [tempColCount, setTempColCount] = useState(gameConfig.colCount);
  const [tempDifficulty, setTempDifficulty] = useState(gameConfig.difficulty);

  useEffect(() => {
    if (gameState) {
      const markedCells = gameState.land.flat().filter(cell => cell.isMarked).length;
      setRemainingMines(gameState.mineCount - markedCells);
    }
  }, [gameState]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameState || gameState.status !== GameStatus.InProgress || gameState.land[row][col].isDiscovered || gameState.land[row][col].isMarked) {
      return;
    }

    if (gameState.land[row][col].hasMine) {
      gameState.land[row][col].isDiscovered = true;
      gameState.status = GameStatus.Lost;
      revealAllCells();
    } else {
      revealCells(row, col);

      const allNonMineCellsDiscovered = gameState.land.every(row =>
        row.every(cell => cell.hasMine || cell.isDiscovered)
      );
      if (allNonMineCellsDiscovered) {
        gameState.status = GameStatus.Won;
      }
    }

    setGameState({ ...gameState });
  };

  const handleCellRightClick = (event: React.MouseEvent, row: number, col: number) => {
    event.preventDefault();
    if (!gameState || gameState.status !== GameStatus.InProgress || gameState.land[row][col].isDiscovered) {
      return;
    }

    gameState.land[row][col].isMarked = !gameState.land[row][col].isMarked;
    setGameState({ ...gameState });
  };

  const revealCells = (row: number, col: number) => {
    if (!gameState) return;

    const cell = gameState.land[row][col];
    if (cell.isDiscovered || cell.hasMine || cell.isMarked) {
      return;
    }

    cell.isDiscovered = true;

    if (cell.surroundingMineCount > 0) {
      return;
    }

    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
      const newRow = row + dx;
      const newCol = col + dy;
      if (newRow >= 0 && newRow < gameState.rowCount && newCol >= 0 && newCol < gameState.colCount) {
        revealCells(newRow, newCol);
      }
    });
  };

  const revealAllCells = () => {
    if (gameState) {
      gameState.land.forEach(row => {
        row.forEach(cell => {
          cell.isDiscovered = true;
        });
      });
    }
  };

  const startNewGame = async () => {
    setLoading(true);
    const newConfig = new GameConfig(tempRowCount, tempColCount, tempDifficulty);
    setGameConfig(newConfig);
    const newState = await gameEngine.createGame(newConfig.rowCount, newConfig.colCount, newConfig.difficulty);
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

  const renderBoard = () => {
    if (!gameState) return null;

    return (
      <div className="scroll-container">
        <Grid
          columnCount={gameState.colCount}
          columnWidth={30}
          height={600}
          rowCount={gameState.rowCount}
          rowHeight={30}
          width={800}
        >
          {({ columnIndex, rowIndex, style }) => (
            <button
              style={style}
              className={`cell ${gameState.land[rowIndex][columnIndex].isDiscovered ? (gameState.land[rowIndex][columnIndex].hasMine ? 'mine' : 'safe') : ''}`}
              onClick={() => handleCellClick(rowIndex, columnIndex)}
              onContextMenu={(e) => handleCellRightClick(e, rowIndex, columnIndex)}
              disabled={gameState.land[rowIndex][columnIndex].isDiscovered}
            >
              {gameState.land[rowIndex][columnIndex].isMarked && !gameState.land[rowIndex][columnIndex].isDiscovered ? '🚩' : ''}
              {gameState.land[rowIndex][columnIndex].isDiscovered && !gameState.land[rowIndex][columnIndex].hasMine ? (gameState.land[rowIndex][columnIndex].surroundingMineCount > 0 ? gameState.land[rowIndex][columnIndex].surroundingMineCount : '') : ''}
              {gameState.land[rowIndex][columnIndex].isDiscovered && gameState.land[rowIndex][columnIndex].hasMine ? '💣' : ''}
            </button>
          )}
        </Grid>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Minesweeper</h1>
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
        {renderBoard()}
      </header>
    </div>
  );
}

export default App;
