import { AbstractScene } from "./abstractRacingScene";
import { Group, Vector3, Geometry, Line, Camera, LineBasicMaterial, PlaneGeometry, MeshBasicMaterial, DoubleSide, Mesh } from "three";
import { TrackType } from "../../../../../common/racing/trackType";
import { TrackLights } from "../render-service/light";
import { CHANGE_CAMERA_KEYCODE, YELLOW, DAY_KEYCODE, DEBUG_KEYCODE,
    ASPHALT_TEXTURE_PATH, ASPHALT_TEXTURE_FACTOR, PATH_TO_STATRINGLINE,
    START_LINE_WEIGHT, START_LINE_HEIGHT, START_LINE_WIDTH, START_CAR_DISTANCE } from "../constants";
import { Car } from "../car/car";
import { AIDebug } from "../artificial-intelligence/ai-debug";
import { KeyboardEventHandlerService } from "../event-handlers/keyboard-event-handler.service";
import { Track } from "../../../../../common/racing/track";
import { TrackMesh } from "../track/track";
import { TrackPoint } from "../track/trackPoint";

const LATHERAL_OFFSET: number = 2;
const VERTICAL_OFFSET: number = 5;

export class GameScene extends AbstractScene {

    private _trackMesh: TrackMesh;
    private _group: Group;
    private _lighting: TrackLights;
    private _centerLine: Group;
    private _debugMode: boolean;
    private _debugElements: Group;
    private _isDay: boolean;

    public constructor(private _keyBoardHandler: KeyboardEventHandlerService) {
        super();
        this._roadTexture = this.loadRepeatingTexture(ASPHALT_TEXTURE_PATH, ASPHALT_TEXTURE_FACTOR);
        this._skyBoxTextures = new Map();
        this._group = new Group();
        this._debugElements = new Group();
        this.add(this._group);
    }

    public loadTrack(track: Track): TrackMesh {
        if (this._trackMesh !== undefined) {
            this._group.remove(this._trackMesh);
        }
        this._isDay = track.type === TrackType.Default ? true : false;
        this._trackMesh = new TrackMesh(track, this._roadTexture);
        this._group.add(this._trackMesh);
        this.addGround();
        this.setSkyBox(track.type);
        this.loadLights(track.type);
        this.setCenterLine();

        return this._trackMesh;
    }

    public async loadCars(cars: Car[], carDebugs: AIDebug[], camera: Camera, trackType: TrackType): Promise<void> {
        const shuffledCars: Car[] = [];
        for (const car of cars) {
            shuffledCars.push(car);
        }
        this.shuffle(shuffledCars);
        for (let i: number = 0; i < cars.length; ++i) {
            await this.placeCarOnStartingGrid(shuffledCars[i], i);
            this._debugElements.add(carDebugs[i].debugGroup);
            if (!shuffledCars[i].isAI) {
                shuffledCars[i].attachCamera(camera);
            }
            this._group.add(shuffledCars[i]);
        }
        this.setTimeOfDay(cars, trackType);
    }

    public createStartingLine(startingLinePosition: Vector3, secondStartingLinePoint: Vector3): void {
        const geometry: PlaneGeometry = new PlaneGeometry(START_LINE_WEIGHT, START_LINE_WIDTH);
        const texture: MeshBasicMaterial = new MeshBasicMaterial({ side: DoubleSide,
                                                                   map: this.loadRepeatingTexture(PATH_TO_STATRINGLINE, 1) });
        const startingLine: Mesh = new Mesh( geometry, texture );
        const startingLineVector: Vector3 = secondStartingLinePoint.clone().sub(startingLinePosition).normalize();
        const startingLenght: number = secondStartingLinePoint.clone().sub(startingLinePosition).length() / 2;
        const position: Vector3 = startingLinePosition.clone().add(startingLineVector.clone().multiplyScalar(startingLenght));
        startingLine.position.set(position.x, START_LINE_HEIGHT, position.z);
        startingLine.rotateZ(Math.PI / 2);
        startingLine.setRotationFromAxisAngle(new Vector3(0, 1, 0), this.findFirstTrackSegmentAngle());
        startingLine.rotateX(Math.PI / 2);
        this.add(startingLine);
    }

    private shuffle(array: Car[]): void {
        for (let i: number = array.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    private async placeCarOnStartingGrid(car: Car, index: number): Promise<void> {;
        const offset: Vector3 = new Vector3(0, 0, 0);
        offset.x = (index < 2) ? -LATHERAL_OFFSET : LATHERAL_OFFSET;
        offset.z = (index % 2 === 0) ? -VERTICAL_OFFSET : VERTICAL_OFFSET;

        offset.applyAxisAngle(new Vector3(0, 1, 0), this.findFirstTrackSegmentAngle());
        const startingVector: Vector3 = this._trackMesh.trackPoints.points[1].coordinate.clone().
                                                sub(this._trackMesh.trackPoints.points[0].coordinate.clone());
        const startingLenght: number = startingVector.length() / 2 - START_CAR_DISTANCE;
        startingVector.normalize();
        const position: Vector3 = this._trackMesh.trackPoints.points[0].coordinate.clone().
                                    add(startingVector.clone().multiplyScalar(startingLenght));
        position.add(offset);
        await car.init(position, this.findFirstTrackSegmentAngle());
    }

    private setTimeOfDay(cars: Car[], trackType: TrackType): void {
        switch (trackType) {
            case TrackType.Night:
                this.setNight(cars);
                break;
            case TrackType.Default:
            default:
                this.setDay(cars);
                break;
        }
    }

    public bindGameSceneKeys(cars: Car[]): void {
        this._keyBoardHandler.bindFunctionToKeyDown(DAY_KEYCODE, () => this.changeTimeOfDay(cars));
        this._keyBoardHandler.bindFunctionToKeyDown(DEBUG_KEYCODE, () => this.changeDebugMode());
    }

    private loadLights(trackType: TrackType): void {
        this._lighting = new TrackLights(trackType);
        this._keyBoardHandler.bindFunctionToKeyDown(CHANGE_CAMERA_KEYCODE, () => this._lighting.changePerspective());
        this._group.add(this._lighting);
    }

    private findFirstTrackSegmentAngle(): number {
        const carfinalFacingVector: Vector3 = this._trackMesh.trackPoints.points[1].coordinate.clone()
            .sub(this._trackMesh.trackPoints.points[0].coordinate)
            .normalize();

        return new Vector3(0, 0, -1).cross(carfinalFacingVector).y > 0 ?
            new Vector3(0, 0, -1).angleTo(carfinalFacingVector) :
            - new Vector3(0, 0, -1).angleTo(carfinalFacingVector);
    }

    private setCenterLine(): void {
        const material: LineBasicMaterial = new LineBasicMaterial({ color: YELLOW, linewidth: 3 });
        this._centerLine = new Group();

        this._trackMesh.trackPoints.points.forEach((currentPoint: TrackPoint) => {
            this._centerLine.add(this.drawLine(material, currentPoint.coordinate, currentPoint.next.coordinate, 2));
        });
    }

    // https://stackoverflow.com/questions/21067461/workaround-for-lack-of-line-width-on-windows-when-using-three-js
    private drawLine(
        lineMaterial: LineBasicMaterial,
        currentPoint: Vector3,
        nextPoint: Vector3,
        thickness: number): Group {
        const dashedLine: Group = new Group();
        const LINE_OFFSET: number = 64;

        for (let i: number = 0; i < thickness * 2; i++) {
            const routerLineGeometry: Geometry = new Geometry();
            const offset: number = i / LINE_OFFSET + i / LINE_OFFSET;

            routerLineGeometry.vertices.push(new Vector3(currentPoint.x + offset, currentPoint.y, currentPoint.z + offset));
            routerLineGeometry.vertices.push(new Vector3(nextPoint.x + offset, nextPoint.y, nextPoint.z + offset));

            dashedLine.add(new Line(routerLineGeometry, lineMaterial));
        }

        for (let i: number = 0; i < thickness * 2; i++) {
            const routerLineGeometry: Geometry = new Geometry();
            const offset: number = i / LINE_OFFSET + i / LINE_OFFSET + i / LINE_OFFSET;

            routerLineGeometry.vertices.push(new Vector3(currentPoint.x + offset, currentPoint.y, currentPoint.z + offset));
            routerLineGeometry.vertices.push(new Vector3(nextPoint.x + offset, nextPoint.y, nextPoint.z + offset));

            dashedLine.add(new Line(routerLineGeometry, lineMaterial));
        }

        return dashedLine;
    }

    public changeTimeOfDay(cars: Car[]): void {
        this._isDay = !this._isDay;
        this._isDay ? this.setDay(cars) : this.setNight(cars);
    }

    private setDay(cars: Car[]): void {
        this.setSkyBox(TrackType.Default);
        this._lighting.updateLightsToTrackType(TrackType.Default);
        cars.forEach((car: Car) => car.turnLightsOff());
    }

    private setNight(cars: Car[]): void {
        this.setSkyBox(TrackType.Night);
        this._lighting.updateLightsToTrackType(TrackType.Night);
        cars.forEach((car: Car) => car.turnLightsOn());
    }

    public changeDebugMode(): void {
        this._debugMode = !this._debugMode;
        this._debugMode ? this.enableDebugMode() : this.disableDebugMode();
    }

    private enableDebugMode(): void {
        this.add(this._debugElements);
        this.add(this._centerLine);
    }

    private disableDebugMode(): void {
        this.remove(this._debugElements);
        this.remove(this._centerLine);
    }

    public get debugMode(): boolean {
        return this._debugMode;
    }
}
