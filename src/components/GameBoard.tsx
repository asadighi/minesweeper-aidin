import React from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { GameState } from '../GameEngine/GameState';

interface GameBoardProps {
    gameState: GameState | null;
    handleCellClick: (row: number, col: number) => void;
    handleCellRightClick: (event: React.MouseEvent, row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, handleCellClick, handleCellRightClick }) => {
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
