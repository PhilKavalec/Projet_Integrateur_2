import * as requestPromise from "request-promise-native";
import { MultiplayerCrosswordGame } from "../../../common/crossword/multiplayerCrosswordGame";
import { Difficulty } from "../../../common/crossword/difficulty";
import { BASE_ROOM_NAME, FIRST_PLAYER_COLOR, SECOND_PLAYER_COLOR, GRID_GET_URL } from "./configuration";
import { CommonGrid } from "../../../common/crossword/commonGrid";

export class MultiplayerGameLogic {
    private static _numberOfRoom: number = 0;

    private _games: MultiplayerCrosswordGame[];

    public constructor() {
        this._games = [];
    }

    public get games(): MultiplayerCrosswordGame[] {
        return this._games;
    }

    public get numberOfGames(): number {
        return this._games.length;
    }

    public deleteGame(game: MultiplayerCrosswordGame): void {
        const index: number = this._games.indexOf(game, 0);
        if (index > -1) {
            this._games.splice(index, 1);
        } else {
            throw ReferenceError("Unable to find room");
        }
    }

    public handleRoomCreate(difficulty: Difficulty, creator: string): void {
        this.createRoom(difficulty);
        this.games[this.numberOfGames - 1].addPlayer({ name: creator, color: FIRST_PLAYER_COLOR, score: 0 });
    }

    private createRoom(difficulty: Difficulty): void {
        this._games.push(new MultiplayerCrosswordGame(BASE_ROOM_NAME + MultiplayerGameLogic._numberOfRoom++, difficulty));
    }

    public async startGame(game: MultiplayerCrosswordGame): Promise<MultiplayerCrosswordGame> {
        await this.gridCreateQuery(game);

        return game;
    }

    public getListOfEmptyRooms(): MultiplayerCrosswordGame[] {
        const emptyRooms: MultiplayerCrosswordGame[] = [];
        for (const rooms of this.games) {
            if (!rooms.isFull()) {
                emptyRooms.push(rooms);
            }
        }

        return emptyRooms;
    }

    public handleRoomConnect(roomInfo: MultiplayerCrosswordGame, playerName: string): MultiplayerCrosswordGame {
        for (const game of this.games) {
            const room: MultiplayerCrosswordGame = MultiplayerCrosswordGame.create(JSON.stringify(roomInfo));
            if (game.roomName === room.roomName) {
                return this.tryAddPlayer(game, room, playerName);
            }
        }
        throw ReferenceError("Unable to find room");
    }

    private tryAddPlayer(
        game: MultiplayerCrosswordGame, room: MultiplayerCrosswordGame, playerName: string): MultiplayerCrosswordGame {
        if (game.addPlayer({ name: playerName, color: SECOND_PLAYER_COLOR, score: 0 })) {
            return game;
        } else {
            throw RangeError("Unable to connect to room: " + room.roomName + " by " + playerName);
        }
    }

    public handleRestartGameWithSameConfig(roomName: string): boolean {
        const gameIndex: number = this.findGameIndexWithRoom(roomName);
        if (gameIndex >= 0) {
            return this.updateRestartCounter(gameIndex);
        } else {
            throw new ReferenceError("Game not found");
        }
    }

    private updateRestartCounter(gameIndex: number): boolean {
        const game: MultiplayerCrosswordGame = this.games[gameIndex];
        game.restartCounter++;

        return game.restartCounter >= MultiplayerCrosswordGame.MAX_PLAYER_NUMBER;
    }

    private findGameIndexWithRoom(room: string): number {
        for (let i: number = 0; i < this.numberOfGames; ++i) {
            if (this.games[i].roomName === room) {
                return i;
            }
        }

        return -1;
    }

    public tryRestartGame(game: MultiplayerCrosswordGame): boolean {
        if (this.shouldRestartGame(game)) {
            game.restartCounter = 0;

            return true;
        }

        return false;
    }

    public shouldStartGame(game: MultiplayerCrosswordGame): boolean {
        return game.isFull();
    }

    private shouldRestartGame(game: MultiplayerCrosswordGame): boolean {
        return game.restartCounter >= MultiplayerCrosswordGame.MAX_PLAYER_NUMBER;
    }

    public getCurrentGame(room: string): MultiplayerCrosswordGame {
        const index: number = this.findGameIndexWithRoom(room);

        return index >= 0 ? this._games[index] : undefined;
    }

    private async gridCreateQuery(game: MultiplayerCrosswordGame): Promise<void> {
        await requestPromise(GRID_GET_URL + game.difficulty).then(
            (result: CommonGrid) => {
                game.grid = JSON.parse(result.toString());
            }
        ).catch((e: Error) => {
            console.error(e);
        });
    }
}
