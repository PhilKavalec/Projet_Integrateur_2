import { AbstractCar } from "./abstractCar";
import { Personality } from "../artificial-intelligence/ai-config";
import { CarStructure } from "./carStructure";
import { CarControls } from "./carControls";

export class AICar extends AbstractCar {

    public constructor(
        _id: number,
        private _aiPersonality: Personality = Personality.Curly,
        public trackPortionIndex: number = 0,
        _carStructure: CarStructure = new CarStructure(),
        _carControls: CarControls = new CarControls(),
        lapCounter: number = 0) {
        super(_id, _carStructure, _carControls, lapCounter);
        this.trackPortionIndex = 0;
    }

    public get aiPersonality(): Personality {
        return this._aiPersonality;
    }

}