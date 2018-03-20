import { Component } from "@angular/core";
import { GridService } from "../grid.service";
import { ConfigurationService } from "../configuration.service";
import { CommonGrid } from "../../../../../common/crossword/commonGrid";
import { Difficulty } from "../../../../../common/crossword/difficulty";
import { MultiplayerCommunicationService } from "../multiplayer-communication.service";
import { SocketEvents } from "../../../../../common/communication/socketEvents";
import { MultiplayerCrosswordGame } from "../../../../../common/crossword/multiplayerCrosswordGame";

@Component({
    selector: "app-configuration",
    templateUrl: "./configuration.component.html",
    styleUrls: ["./configuration.component.css"]
})
export class ConfigurationComponent {
    public isNewGame: boolean = false;
    public isJoinGame: boolean = false;
    public difficulty: Difficulty;
    public choseGridDifficulty: boolean = false;
    private messages: string[] = [];
    private _hasSubscribed: boolean = false;
    public waitingForRoom: boolean = false;

    public constructor(
        private _gridService: GridService,
        public configurationService: ConfigurationService,
        private multiplayerCommunicationService: MultiplayerCommunicationService) {
    }

    public setNewGame(): void {
        this.isNewGame = true;
    }

    public setJoinGame(): void {
        this.isJoinGame = true;
        this.configurationService.isTwoPlayerGame = true;
        this.multiplayerCommunicationService.connectToSocket();
        this.subscribeToMessages();
        this.multiplayerCommunicationService.roomListQuery();
        this.configurationService.isSocketConnected = true;
    }

    public setGameType(isTwoPlayerGame: boolean): void {
        this.configurationService.isTwoPlayerGame = isTwoPlayerGame;
        if (isTwoPlayerGame) {
            this.multiplayerCommunicationService.connectToSocket();
        }
    }

    public subscribeToMessages(): void {
        if (!this._hasSubscribed) {
            this.multiplayerCommunicationService.getMessagesConfigurationComponent().subscribe((message: string) => {
                this.messages.push(message);
                console.log(message);
                if (message === SocketEvents.StartGame) {
                    this.configurationService.grid = this.multiplayerCommunicationService.grid;
                    this.configurationService.playerOne = this.multiplayerCommunicationService.currentGame.players[0];
                    this.configurationService.playerTwo = this.multiplayerCommunicationService.currentGame.players[1];
                    this.configurationService.lookingForPlayer = false;
                    this.configurationService.configurationDone = true;
                }
            });
            this._hasSubscribed = true;
        }
    }

    public onRoomSelect(room: MultiplayerCrosswordGame, playerName: string): void {
        this.waitingForRoom = true;
        this.configurationService.currentPlayerName = playerName;
        this.multiplayerCommunicationService.connectToRoom({ roomInfo: room, playerName: playerName });
    }

    public createGrid(): void {
        if (!this.configurationService.isTwoPlayerGame) {
            this._gridService.gridGet(this.difficulty).subscribe((grid: CommonGrid) => {
                this.configurationService.grid = grid;
            });
        }
    }

    private makeGrid(): void {
        this.choseGridDifficulty = true;
        this.createGrid();
    }

    public makeEasyGrid(): void {
        this.difficulty = Difficulty.Easy;
        this.makeGrid();
    }

    public makeMediumGrid(): void {
        this.difficulty = Difficulty.Medium;
        this.makeGrid();
    }

    public makeHardGrid(): void {
        this.difficulty = Difficulty.Hard;
        this.makeGrid();
    }

    public submitName(playerName: string): void {
        this.configurationService.playerOne = { name: playerName, color: "teal", score: 0 };
        this.configurationService.currentPlayerName = this.configurationService.playerOne.name;
        this.configurationService.configurationDone = true;
    }

    public createRoom(name: string): void {
        this.multiplayerCommunicationService.connectToSocket();
        this.configurationService.currentPlayerName = name;
        this.subscribeToMessages();
        this.multiplayerCommunicationService.createRoom(name, this.difficulty);
        this.configurationService.isSocketConnected = true;
    }

}
