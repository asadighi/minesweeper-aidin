export enum GameDifficulty {
    Easy = "Easy",
    Intermediate = "Intermediate",
    Expert = "Expert",
}

export class GameConfig {

    static MinePercentagePerDifficulty: Record<GameDifficulty, number> = {
        [GameDifficulty.Easy]: 0.15,
        [GameDifficulty.Intermediate]: 0.2,
        [GameDifficulty.Expert]: 0.3,
    }

    rowCount: number;
    colCount: number;
    difficulty: GameDifficulty;

    constructor(rowCount: number = 10, colCount: number = 10, difficulty: GameDifficulty = GameDifficulty.Easy) {
        this.rowCount = rowCount;
        this.colCount = colCount;
        this.difficulty = difficulty;
    }

}