import { GameDifficulty } from "./GameConfig"

export enum GameStatus {
    Uninitialized = "Uninitialized",
    InProgress = "InProgress",
    Won = "Won",
    Lost = "Lost",
}

export interface Land {
    hasMine: boolean
    isDiscovered: boolean
    isMarked: boolean
    surroundingMineCount: number
}

export interface GameState {

    rowCount: number,
    colCount: number,
    mineCount: number,
    status: GameStatus,
    difficulty: GameDifficulty,
    land: Land[][]
}