import { State } from "./state";
import { StateType } from "./stateTypes";
import { NUMBER_OF_LAPS } from "../constants/car.constants";
import { AbstractCar } from "../car/abstractCar";

export class ResultsState extends State {

    public initialize(): void { }

    public update(): void {
        for (const car of this._racingGame.cars) {
            if (car.raceProgressTracker.lapCount <= NUMBER_OF_LAPS) {
                this.pushLapTime(car);
                car.raceProgressTracker.isTimeLogged = true;
            }
        }
        if (this.isStateOver()) {
            this.advanceToNextState();
        }
    }

    private pushLapTime(car: AbstractCar): void {
        this._racingGame.getPlayerByUniqueId(car.uniqueid).pushLapTime(
            this._serviceLoader.gameTimeService.simulateRaceTime(
                car.raceProgressTracker,
                car.currentPosition,
                this._racingGame.gameScene.trackMesh.trackPoints.toVectors3,
                this._racingGame.gameScene.trackMesh.startLineWorldPosition
            )
        );
    }

    protected isStateOver(): boolean {
        return true;
    }

    protected advanceToNextState(): void {
        this._racingGame.setState(StateType.ResultsTable);
    }
}
