import { Component } from "@angular/core";
import { ConfigurationService } from "../configuration/configuration.service";
import { Difficulty } from "../../../../../common/crossword/difficulty";
import { MultiplayerCommunicationService } from "../multiplayer-communication.service";
import { SocketEvents } from "../../../../../common/communication/socketEvents";
import { MultiplayerCrosswordGame } from "../../../../../common/crossword/multiplayerCrosswordGame";
import { FIRST_PLAYER_COLOR } from "../crosswordConstants";

@Component({
    selector: "app-configuration",
    templateUrl: "./configuration.component.html",
    styleUrls: ["./configuration.component.css"]
})

export class ConfigurationComponent {
    public isNewGame: boolean;
    public isJoinGame: boolean;
    public choseGridDifficulty: boolean;
    public waitingForRoom: boolean;
    private _hasSubscribed: boolean;

    public constructor(
        public configurationService: ConfigurationService,
        public multiplayerCommunicationService: MultiplayerCommunicationService) {
        this.choseGridDifficulty = false;
        this.waitingForRoom = false;
        this._hasSubscribed = false;
    }

    public setNewGame(): void {
        this.isNewGame = true;
        this.isJoinGame = false;
    }

    public setJoinGame(): void {
        this.isJoinGame = true;
        this.isNewGame = false;
        this.configurationService.isTwoPlayerGame = true;
        this.multiplayerCommunicationService.connectToSocket();
        this.subscribeToMessages();
        this.multiplayerCommunicationService.roomListQuery();
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
                if (message === SocketEvents.StartGame) {
                    this.configurationService.handleGameStart(
                        this.multiplayerCommunicationService.grid,
                        this.multiplayerCommunicationService.currentGame.players);
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
            this.configurationService.createGrid();
        }
    }

    private makeGrid(): void {
        this.choseGridDifficulty = true;
        this.createGrid();
    }

    public makeEasyGrid(): void {
        this.configurationService.difficulty = Difficulty.Easy;
        this.makeGrid();
    }

    public makeMediumGrid(): void {
        this.configurationService.difficulty = Difficulty.Medium;
        this.makeGrid();
    }

    public makeHardGrid(): void {
        this.configurationService.difficulty = Difficulty.Hard;
        this.makeGrid();
    }

    public submitName(playerName: string): void {
        this.configurationService.playerOne = { name: playerName, color: FIRST_PLAYER_COLOR, score: 0 };
        this.configurationService.currentPlayerName = this.configurationService.playerOne.name;
        this.configurationService.configurationDone = true;
    }

    public createRoom(name: string): void {
        this.multiplayerCommunicationService.connectToSocket();
        this.configurationService.currentPlayerName = name;
        this.subscribeToMessages();
        this.multiplayerCommunicationService.createRoom(name, this.configurationService.difficulty);
    }

}
