import { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { injectable, } from "inversify";
import { Grid } from "../../../common/crossword/grid";
import { WordFiller } from "./wordFiller";
import { BlackTiledGrid } from "./blackTiledGrid";
import { Difficulty } from "../../../common/crossword/difficulty";
import { SIZE_GRID_X, SIZE_GRID_Y } from "./configuration";

@injectable()
export class GridCreate {

    private _grid: Grid;
    private _difficulty: Difficulty;

    public gridCreate(req: Request, res: Response, next: NextFunction): void {
        this._difficulty = req.params.difficulty;
        this.newGrid().then(() => {
            for (const row of this._grid.boxes) {
                for (const box of row) {
                    box.eliminateConstraints();
                }
            }
            res.send(this._grid);
        }).catch((e: Error) => console.error(e.message));
    }

    private async newGrid(): Promise<void> {
        let isRestartNeeded: boolean;
        do {
            isRestartNeeded = false;
            const isValidGrid: boolean = false;
            while (!isValidGrid) {
                this._grid = new Grid();
                this._grid.difficulty = this._difficulty;
                const blackTiledGrid: BlackTiledGrid = new BlackTiledGrid(SIZE_GRID_X, SIZE_GRID_Y, this._grid.boxes);

                if (blackTiledGrid.words !== undefined) {
                    this._grid.words = blackTiledGrid.words;
                    break;
                }
            }
            const wordFiller: WordFiller =
                new WordFiller(SIZE_GRID_X, SIZE_GRID_Y, this._grid.difficulty, this._grid.boxes, this._grid.words);
            await wordFiller.wordFillControler().then(
                (hasPassed: boolean) => {
                    if (!hasPassed) {
                        isRestartNeeded = true;
                    }
                }).catch((e: Error) => console.error(e));
        } while (isRestartNeeded);

    }
}
