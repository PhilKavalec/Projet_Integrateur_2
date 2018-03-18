import * as sio from "socket.io";
import { SocketEvents } from "../../common/communication/socketEvents";
import * as http from "http";
import { CrosswordGame } from "../../common/crossword/crosswordGame";

export class ServerSockets {
    private static _numberOfRoom: number = 0;
    private readonly baseRoomName: string = "ROOM";

    private io: SocketIO.Server;
    private _httpServer: http.Server;
    private _games: CrosswordGame[] = [];

    public constructor(server: http.Server, initialize: boolean = false) {
        this._httpServer = server;
        if (initialize) {
            this.initSocket();
        }
    }

    // tslint:disable:no-console
    public initSocket(): void {
        this.io = sio(this._httpServer);
        this.io.on(SocketEvents.Connection, (socket: SocketIO.Socket) => {
            console.log("user connected");
            this.onNewMessage(socket);
            this.onDisconnect(socket);
            this.onRoomCreate(socket);
            this.onRoomsListQuery(socket);
            this.onRoomConnect(socket);
        });
    }

    private onNewMessage(socket: SocketIO.Socket): void {
        socket.on(SocketEvents.NewMessage, (message: string) => {
            console.log(message);
            this.io.to(this.getSocketRoom(socket)).emit(SocketEvents.NewMessage, message);
        });
    }

    private onDisconnect(socket: SocketIO.Socket): void {
        socket.on(SocketEvents.Disconnection, () => {
            console.log("user disconnected");
        });
    }

    private onRoomCreate(socket: SocketIO.Socket): void {
        socket.on(SocketEvents.RoomCreate, () => {
            console.log("Room creation");
            this.createRoom();
            console.log("Room name: " + this._games[ServerSockets._numberOfRoom - 1].roomName);
            socket.join(this._games[ServerSockets._numberOfRoom - 1].roomName);
            socket.emit(SocketEvents.RoomCreated, this._games[ServerSockets._numberOfRoom - 1].roomName);
        });
    }

    private onRoomsListQuery(socket: SocketIO.Socket): void {
        socket.on(SocketEvents.RoomsListQuery, () => {
            console.log("Room list query");
            const roomNames: string[] = [];
            for (const game of this._games) {
                roomNames.push(game.roomName);
            }
            socket.emit(SocketEvents.RoomsListQuery, roomNames);
        });
    }

    private onRoomConnect(socket: SocketIO.Socket): void {
        socket.on(SocketEvents.RoomConnect, (room: string) => {
            console.log("Connection to room");
            socket.join(room);
        });
    }
    // tslint:enable:no-console

    private createRoom(): void {
        this._games.push(new CrosswordGame(this.baseRoomName + ServerSockets._numberOfRoom++));
    }

    private getSocketRoom(socket: SocketIO.Socket): string {
        return Object.keys(socket.rooms).filter((room: string) => room !== socket.id)[0];
    }

}
