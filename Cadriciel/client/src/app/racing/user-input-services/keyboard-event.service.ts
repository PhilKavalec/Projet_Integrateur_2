import { Injectable } from "@angular/core";
import { InputNameService } from "../scoreboard/input-name/input-name.service";

@Injectable()
export class KeyboardEventService {
    private _keyDownFunctions: Map<number, (() => void)[]>;
    private _keyUpFunctions: Map<number, (() => void)[]>;

    public constructor(private _inputTimeService: InputNameService) { }

    public initialize(): void {
        this._keyDownFunctions = new Map();
        this._keyUpFunctions = new Map();
    }

    public bindFunctionToKeyDown(keyCode: number, functionToBind: () => void): void {
        if (this._keyDownFunctions.get(keyCode) === undefined) {
            this._keyDownFunctions.set(keyCode, []);
        }
        const lambdas: (() => void)[] = this._keyDownFunctions.get(keyCode);
        lambdas.push(functionToBind);
        this._keyDownFunctions.set(
            keyCode,
            lambdas
        );

    }

    public bindFunctionToKeyUp(keyCode: number, functionToBind: () => void): void {
        if (this._keyUpFunctions.get(keyCode) === undefined) {
            this._keyUpFunctions.set(keyCode, []);
        }
        this._keyUpFunctions.get(keyCode).push(functionToBind);
    }

    public unbindAllKeys(): void {
        this._keyUpFunctions.clear();
        this._keyDownFunctions.clear();
    }

    public handleKeyDown(keyCode: number): void {
        if (this._keyDownFunctions.get(keyCode) !== undefined && !this._inputTimeService.showInput) {
            const functionsToExecute: (() => void)[] = this._keyDownFunctions.get(keyCode);
            functionsToExecute.forEach((callback: () => void) => callback());
        }
    }

    public handleKeyUp(keyCode: number): void {
        if (this._keyUpFunctions.get(keyCode) !== undefined) {
            const functionsToExecute: (() => void)[] = this._keyUpFunctions.get(keyCode);
            functionsToExecute.forEach((callback: () => void) => callback());
        }
    }
}
