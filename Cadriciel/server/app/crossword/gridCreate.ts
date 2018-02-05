import { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { injectable, } from "inversify";
import { GridBox } from "../../../common/crossword/gridBox";
import { Word } from "../../../common/crossword/word";
import { Vec2 } from "../../../common/crossword/vec2";
import { WordFiller } from "./wordFiller";
import { BlackTiledGrid } from "./blackTiledGrid";

@injectable()
export class Grid {

    public readonly SIZE_GRID_X: number = 10;
    public readonly SIZE_GRID_Y: number = 10;
    private words: Word[];
    private grid: GridBox[][];

    public gridCreate(req: Request, res: Response, next: NextFunction): void {
        this.newGrid().then((result: boolean) => res.send(this.grid));
    }

    private async newGrid(): Promise<boolean> {
        const isValidGrid: boolean = false;
        while (!isValidGrid) {
            this.createEmptyArray();

            const blackTiledGrid: BlackTiledGrid = new BlackTiledGrid(this.SIZE_GRID_X, this.SIZE_GRID_Y, this.grid);

            if ( blackTiledGrid.$words !== undefined) {
                this.words = blackTiledGrid.$words;
                break;
            }
        }
        const wordFiller: WordFiller = new WordFiller(this.SIZE_GRID_X, this.SIZE_GRID_Y, this.grid, this.words);
        await wordFiller.wordFillControler();

        return true;
    }

    private createEmptyArray(): void {
        this.grid = new Array<Array<GridBox>>();
        for (let i: number = 0; i < this.SIZE_GRID_Y; i++) {
            const row: GridBox[] = new Array<GridBox>();
            for (let j: number = 0; j < this.SIZE_GRID_X; j++) {
                row.push(new GridBox(new Vec2(j, i), false));
            }
            this.grid.push(row);
        }
    }
}