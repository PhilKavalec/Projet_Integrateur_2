import { Injectable } from "@angular/core";
import { Car } from "../car/car";
import { CommandController } from "../commandController";
import { GoFoward } from "../commands/carAICommands/goFoward";
import { TurnLeft } from "../commands/carAICommands/turnLeft";
import { TurnRight } from "../commands/carAICommands/turnRight";
import { Brake } from "../commands/carAICommands/brake";
import { ReleaseAccelerator } from "../commands/carAICommands/releaseAccelerator";
import { ReleaseSteering } from "../commands/carAICommands/releaseSteering";
import { RaceGame } from "../raceGame";

const ACCELERATE_KEYCODE: number = 87;  // w
const LEFT_KEYCODE: number = 65;        // a
const BRAKE_KEYCODE: number = 83;       // s
const RIGHT_KEYCODE: number = 68;       // d
const DAY_KEYCODE: number = 74;         // j
const NIGHT_KEYCODE: number = 78;       // n

@Injectable()
export class KeyboardEventHandlerService {

    private _carControl: CommandController;

    public constructor() { }

    public async initialize(): Promise<void> {
        this._carControl = new CommandController();
    }

    // tslint:disable-next-line:max-func-body-length
    public handleKeyDown(event: KeyboardEvent, raceGame: RaceGame): void {
        switch (event.keyCode) {
            case ACCELERATE_KEYCODE:
                this._carControl.setCommand(new GoFoward(raceGame.playerCar));
                this._carControl.execute();
                break;
            case LEFT_KEYCODE:
                this._carControl.setCommand(new TurnLeft(raceGame.playerCar));
                this._carControl.execute();
                break;
            case RIGHT_KEYCODE:
                this._carControl.setCommand(new TurnRight(raceGame.playerCar));
                this._carControl.execute();
                break;
            case BRAKE_KEYCODE:
                this._carControl.setCommand(new Brake(raceGame.playerCar));
                this._carControl.execute();
                break;
            case DAY_KEYCODE:
                raceGame.isDay = true;
                raceGame.playerCar.dettachLights();
                break;
            case NIGHT_KEYCODE:
                raceGame.isDay = false;
                raceGame.playerCar.attachLights();
                break;
            default:
                break;
        }
    }

    public handleKeyUp(event: KeyboardEvent, raceGame: RaceGame): void {
        switch (event.keyCode) {
            case ACCELERATE_KEYCODE:
                this._carControl.setCommand(new ReleaseAccelerator(raceGame.playerCar));
                this._carControl.execute();
                break;
            case LEFT_KEYCODE:
            case RIGHT_KEYCODE:
                this._carControl.setCommand(new ReleaseSteering(raceGame.playerCar));
                this._carControl.execute();
                break;
            case BRAKE_KEYCODE:
                this._carControl.setCommand(new Brake(raceGame.playerCar));
                this._carControl.execute();
                // this._playerCar.setBackLightColor(YELLOW);
                break;
            default:
                break;
        }
    }
}
