import React, { useEffect, useMemo, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { GameEngine } from './GameEngine/GameEngine';
import { GameConfig, GameDifficulty } from './GameEngine/GameConfig';
import { GameState, GameStatus } from './GameEngine/GameState';

function App() {

  const gameEngine = useMemo(() => new GameEngine(), []);
  const [gameConfig, setGameConfig] = useState(new GameConfig());
  const [gameState, setGameState] = useState<GameState>(gameEngine.createGame(gameConfig.rowCount, gameConfig.colCount, gameConfig.difficulty));
  const [remainingMines, setRemainingMines] = useState(gameState.mineCount);

  // Temporary state to hold input values before starting a new game
  const [tempRowCount, setTempRowCount] = useState(gameConfig.rowCount);
  const [tempColCount, setTempColCount] = useState(gameConfig.colCount);
  const [tempDifficulty, setTempDifficulty] = useState(gameConfig.difficulty);

  // Update remaining mines count when game state changes
  useEffect(() => {
    const markedCells = gameState.land.flat().filter(cell => cell.isMarked).length;
    setRemainingMines(gameState.mineCount - markedCells);
  }, [gameState]);

  // Function to handle cell click (left-click)
  const handleCellClick = (row: number, col: number) => {
    if (gameState.status !== GameStatus.InProgress || gameState.land[row][col].isDiscovered || gameState.land[row][col].isMarked) {
      return;
    }

    // If the clicked cell is a mine, the game is lost
    if (gameState.land[row][col].hasMine) {
      gameState.land[row][col].isDiscovered = true;
      gameState.status = GameStatus.Lost;
      revealAllCells(); // Reveal all cells on game loss
    } else {
      // Reveal the cell and all connected non-mine cells
      revealCells(row, col);

      // Check if all non-mine cells are discovered
      const allNonMineCellsDiscovered = gameState.land.every(row =>
        row.every(cell => cell.hasMine || cell.isDiscovered)
      );
      if (allNonMineCellsDiscovered) {
        gameState.status = GameStatus.Won;
      }
    }

    // Update the state
    setGameState({ ...gameState });
  };

  // Function to handle right-click (context menu) to mark or unmark a cell as a mine
  const handleCellRightClick = (event: React.MouseEvent, row: number, col: number) => {
    event.preventDefault();
    if (gameState.status !== GameStatus.InProgress || gameState.land[row][col].isDiscovered) {
      return;
    }

    // Toggle the marked state
    gameState.land[row][col].isMarked = !gameState.land[row][col].isMarked;

    // Update the state
    setGameState({ ...gameState });
  };

  // Function to reveal cells recursively
  const revealCells = (row: number, col: number) => {
    if (row < 0 || col < 0 || row >= gameState.rowCount || col >= gameState.colCount) {
      return;
    }

    const cell = gameState.land[row][col];
    if (cell.isDiscovered || cell.hasMine || cell.isMarked) {
      return;
    }

    // Mark the cell as discovered
    cell.isDiscovered = true;

    // If the cell has surrounding mines, stop recursion
    if (cell.surroundingMineCount > 0) {
      return;
    }

    // Recursively reveal surrounding cells
    revealCells(row - 1, col - 1); // Top-left
    revealCells(row - 1, col);     // Top
    revealCells(row - 1, col + 1); // Top-right
    revealCells(row, col - 1);     // Left
    revealCells(row, col + 1);     // Right
    revealCells(row + 1, col - 1); // Bottom-left
    revealCells(row + 1, col);     // Bottom
    revealCells(row + 1, col + 1); // Bottom-right
  };

  // Function to reveal all cells when the game is lost
  const revealAllCells = () => {
    gameState.land.forEach(row => {
      row.forEach(cell => {
        cell.isDiscovered = true;
      });
    });
  };

  // Function to start a new game with custom configuration
  const startNewGame = () => {
    const newConfig = new GameConfig(tempRowCount, tempColCount, tempDifficulty);
    setGameConfig(newConfig);
    setGameState(gameEngine.createGame(newConfig.rowCount, newConfig.colCount, newConfig.difficulty));
  };

  // Function to restart the game with the current configuration
  const tryAgain = () => {
    setGameState(gameEngine.createGame(gameConfig.rowCount, gameConfig.colCount, gameConfig.difficulty));
  };

  // Render the game board
  const renderBoard = () => {
    return (
      <div className="scroll-container">
        <div className="game-board">
          {gameState.land.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <button
                  key={colIndex}
                  className={`cell ${cell.isDiscovered ? (cell.hasMine ? 'mine' : 'safe') : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                  disabled={cell.isDiscovered}
                >
                  {cell.isMarked && !cell.isDiscovered ? '🚩' : ''}
                  {cell.isDiscovered && !cell.hasMine ? (cell.surroundingMineCount > 0 ? cell.surroundingMineCount : '') : ''}
                  {cell.isDiscovered && cell.hasMine ? '💣' : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
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
          <button onClick={startNewGame}>Start A New Game</button>
        </div>
        <div className="mine-counter">
          Mines Remaining: {remainingMines}
        </div>
        <div className="game-status">
          {gameState.status === GameStatus.Won && <p>You won!</p>}
          {gameState.status === GameStatus.Lost && <p>Game over!</p>}
          {(gameState.status === GameStatus.Won || gameState.status === GameStatus.Lost) && (
            <button onClick={tryAgain}>Try Again</button>
          )}
        </div>
        {renderBoard()}
      </header>
    </div>
  );
}

export default App;
