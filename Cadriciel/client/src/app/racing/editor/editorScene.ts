import {
    Vector3, Scene, AmbientLight, Mesh, Line, SphereGeometry,
    MeshBasicMaterial, LineBasicMaterial, Geometry, BackSide
} from "three";
import { WHITE, PINK, BLUE } from "../constants";
import { CommonCoordinate } from "../../../../../common/commonCoordinate";
import { ConstraintValidator } from "./constraints/constraintValidator";

const RADIUS: number = 12;
const OUTLINE_TO_VERTEX_RATIO: number = 1.25;
export const VERTEX_GEOMETRY: SphereGeometry = new SphereGeometry(RADIUS, RADIUS, RADIUS);
export const SIMPLE_LINE_MATERIAL: LineBasicMaterial = new LineBasicMaterial({ color: WHITE });
export const START_VERTEX_MATERIAL: MeshBasicMaterial = new MeshBasicMaterial({ color: PINK });
export const SIMPLE_VERTEX_MATERIAL: MeshBasicMaterial = new MeshBasicMaterial({ color: BLUE });
const AMBIENT_LIGHT_OPACITY: number = 0.5;

export class EditorScene {
    private _scene: Scene;
    private _vertices: Array<Mesh>;
    private _connections: Array<Line>;

    private _firstVertex: Mesh;
    private _lastVertex: Mesh;
    private _selectedVertex: Mesh;
    private _isComplete: boolean = false;

    public constructor() {
        this._scene = new Scene();
        this._scene.add(new AmbientLight(WHITE, AMBIENT_LIGHT_OPACITY));
        this._vertices = new Array();
        this._connections = new Array();
    }

    public importTrackVertices(trackVertices: Array<CommonCoordinate>): void {
        this.clear();
        for (const entry of trackVertices) {
            this.addVertex(new Vector3(entry._x, entry._y, 0));
        }
        if (trackVertices.length !== 0) {
            this.completeTrack();
        }
    }

    private clear(): void {
        for (const entry of this._vertices) {
            this._scene.remove(entry);
        }
        for (const entry of this._connections) {
            this._scene.remove(entry);
        }
        this._vertices = [];
        this._connections = [];
    }

    public exportTrackVertices(): Array<CommonCoordinate> {
        const trackVertices: Array<CommonCoordinate> = new Array();
        for (const entry of this.vertices) {
            trackVertices.push(new CommonCoordinate(entry.position.x, entry.position.y));
        }

        return trackVertices;
    }

    public setSelectedVertex(vertexName: string): void {
        for (const entry of this._vertices) {
            if (entry.name === vertexName) {
                this._selectedVertex = entry;
            }
        }
    }

    public deselectVertex(): void {
        this._selectedVertex = undefined;
    }

    public get scene(): Scene {
        return this._scene;
    }

    public get isEmpty(): boolean {
        return this._vertices.length === 0;
    }

    public get firstVertex(): Mesh {
        return this._firstVertex;
    }

    public get selectedVertex(): Mesh {
        return this._selectedVertex;
    }

    public get vertices(): Array<Mesh> {
        return this._vertices;
    }

    public get connections(): Array<Line> {
        return this._connections;
    }

    public get isComplete(): boolean {
        return this._isComplete;
    }

    private createVertex(position: Vector3): Mesh {
        const vertex: Mesh = (this._vertices.length === 0) ?
            new Mesh(VERTEX_GEOMETRY, START_VERTEX_MATERIAL) :
            new Mesh(VERTEX_GEOMETRY, SIMPLE_VERTEX_MATERIAL);
        vertex.position.set(position.x, position.y, 0);
        vertex.name = (this._vertices.length) ? "vertex" + this._vertices.length : "Start";

        const outlineMaterial: MeshBasicMaterial = new MeshBasicMaterial({ color: WHITE, side: BackSide });
        const outlineMesh: Mesh = new Mesh(VERTEX_GEOMETRY, outlineMaterial);
        outlineMesh.scale.multiplyScalar(OUTLINE_TO_VERTEX_RATIO);
        vertex.add(outlineMesh);

        return vertex;
    }

    public addVertex(position: Vector3): void {
        const vertex: Mesh = this.createVertex(position);
        this._scene.add(vertex);
        this._vertices.push(vertex);
        if (this._vertices.length <= 1) {
            this._firstVertex = vertex;
        } else {
            this.addConnection(this._lastVertex, vertex);
        }
        this._lastVertex = vertex;
    }

    private createConnection(start: Mesh, end: Mesh): Line {
        const LINE_GEOMETRY: Geometry = new Geometry();
        LINE_GEOMETRY.vertices.push(new Vector3(start.position.x, start.position.y, 0));
        LINE_GEOMETRY.vertices.push(new Vector3(end.position.x, end.position.y, 0));
        const connection: Line = (this._connections.length) ?
            new Line(LINE_GEOMETRY, SIMPLE_LINE_MATERIAL) :
            new Line(LINE_GEOMETRY, SIMPLE_LINE_MATERIAL);
        connection.name = "connection" + (this._connections.length);

        return connection;
    }

    public completeTrack(): void {
        this._isComplete = true;
        this.addConnection(this._lastVertex, this._firstVertex);
    }

    public addConnection(firstVertex: Mesh, secondVertex: Mesh): void {
        const connection: Line = this.createConnection(firstVertex, secondVertex);
        this._connections.push(connection);
        this._scene.add(connection);
        this.checkConstraints();
    }

    public removeLastVertex(): void {
        this._scene.remove(this._vertices.pop());
        this._scene.remove(this._connections.pop());
        this._lastVertex = (this._vertices.length === 0) ? undefined : this._vertices[this._vertices.length - 1];
        if (this._isComplete) {
            this._isComplete = false;
            this._scene.remove(this._connections.pop());
        }
        this.checkConstraints();
    }

    public moveSelectedVertex(newPosition: Vector3): void {
        this.setVertexPosition(this._selectedVertex, newPosition);
        this.updatePreviousConnection(this._selectedVertex);
        this.updateFollowingConnection(this._selectedVertex);
    }

    public setVertexPosition(vertex: Mesh, newPosition: Vector3): void {
        vertex.position.x = newPosition.x;
        vertex.position.y = newPosition.y;
    }

    public updateConnection(vertex1: Mesh, vertex2: Mesh): void {
        const LINE_GEOMETRY: Geometry = new Geometry();
        LINE_GEOMETRY.vertices.push(new Vector3(vertex1.position.x, vertex1.position.y, 0));
        LINE_GEOMETRY.vertices.push(new Vector3(vertex2.position.x, vertex2.position.y, 0));
        this._scene.remove(this._connections[this._vertices.indexOf(vertex1)]);
        this._connections[this._vertices.indexOf(vertex1)] = new Line(LINE_GEOMETRY, SIMPLE_LINE_MATERIAL);
        this._scene.add(this._connections[this._vertices.indexOf(vertex1)]);
        this.checkConstraints();
    }

    public updateFollowingConnection(entry: Mesh): void {
        if (this._isComplete && this._vertices.indexOf(entry) + 1 === this._vertices.length) {
            this.updateConnection(entry, this._firstVertex);
        } else if (this._vertices.indexOf(entry) + 1 !== this._vertices.length) {
            const nextVertex: Mesh = this._vertices[this._vertices.indexOf(entry) + 1];
            this.updateConnection(entry, nextVertex);
        }
    }

    public updatePreviousConnection(entry: Mesh): void {
        if (this._isComplete && entry === this._firstVertex) {
            this.updateConnection(this._lastVertex, entry);
        } else if (this._vertices.indexOf(entry) - 1 >= 0) {
            const previousVertex: Mesh = this._vertices[this._vertices.indexOf(entry) - 1];
            this.updateConnection(previousVertex, entry);
        }
    }

    private checkConstraints(): boolean {
        let constraintsPass: boolean = true;
        for (const connection of this._connections) {
            connection.material = SIMPLE_LINE_MATERIAL;
        }
        constraintsPass = ConstraintValidator.checkLength(this._connections);
        if (constraintsPass) {
            constraintsPass = ConstraintValidator.checkAngle(this._connections, this._isComplete);
        }
        if (constraintsPass) {
            constraintsPass = ConstraintValidator.checkIntersection(this._connections, this._isComplete);
        }
        if (constraintsPass) {
            constraintsPass = this._isComplete;
        }
        // TODO: Check the constranints with Charles to figure out a better way to talk with saveButton
        // constraintsPass ?
        //     (document.getElementById("saveButton") as HTMLInputElement).disabled = false :
        //     (document.getElementById("saveButton") as HTMLInputElement).disabled = true;

        return constraintsPass;
    }

}
