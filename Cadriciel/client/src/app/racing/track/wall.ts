import {
    Shape, Vector3, Path, Mesh, MeshPhongMaterial, DoubleSide, SmoothShading, Texture, TextureLoader, RepeatWrapping,
    ExtrudeGeometry
} from "three";
import { TrackPointList } from "./trackPointList";
import { TrackPoint } from "./trackPoint";
import { HALF_TRACK_WIDTH, WALL_DISTANCE_TO_TRACK, WALL_WIDTH } from "../constants/scene.constants";
import { WALL_TEXTURE_PATH, WALL_TEXTURE_FACTOR } from "../constants/texture.constants";
import { EXTRUDE_SETTINGS } from "../constants/track.constants";

export class WallMesh extends Mesh {

    private _shapePoints: Vector3[];
    private _holePoints: Vector3[];
    private _wallShape: Shape;

    public static createInteriorWall(trackPoints: TrackPointList): WallMesh {
        return new WallMesh(true, trackPoints)
            .createWallShape()
            .extrudeShapeToGeometry()
            .loadMaterialWithTexture();
    }

    public static createExteriorWall(trackPoints: TrackPointList): WallMesh {
        return new WallMesh(false, trackPoints)
            .createWallShape()
            .extrudeShapeToGeometry()
            .loadMaterialWithTexture();
    }

    public constructor(isInterior: boolean, trackPoints: TrackPointList) {
        super();
        this._shapePoints = [];
        this._holePoints = [];
        this._wallShape = new Shape();
        isInterior ? this.findInteriorWallPoints(trackPoints) : this.findExteriorWallPoints(trackPoints);
    }

    private createWallShape(): WallMesh {
        this.drawExteriorShape();
        this.drillHoleInShape();

        return this;
    }

    private drawExteriorShape(): void {
        this._wallShape.moveTo(this._shapePoints[0].x, this._shapePoints[0].z);
        for (let i: number = 1; i < this._shapePoints.length; ++i) {
            this._wallShape.lineTo(this._shapePoints[i].x, this._shapePoints[i].z);
        }
        this._wallShape.lineTo(this._shapePoints[0].x, this._shapePoints[0].z);
    }

    private drillHoleInShape(): void {
        const holePath: Path = new Path();
        holePath.moveTo(this._holePoints[0].x, this._holePoints[0].z);
        for (let i: number = this._holePoints.length - 1; i > 0; --i) {
            holePath.lineTo(this._holePoints[i].x, this._holePoints[i].z);
        }
        holePath.lineTo(this._holePoints[0].x, this._holePoints[0].z);
        this._wallShape.holes.push(holePath);
    }

    private findInteriorWallPoints(trackPoints: TrackPointList): void {
        trackPoints.toTrackPoints.forEach((point: TrackPoint) => {
            this._shapePoints.push(point.coordinate.add(this.findVectorToInteriorWall(point)));
        });
        this.findInteriorWallWidthPoint(trackPoints);
    }

    private findInteriorWallWidthPoint(trackPoints: TrackPointList): void {
        trackPoints.toTrackPoints.forEach((point: TrackPoint) => {
            this._holePoints.push(point.coordinate.add(this.findVectorToInteriorWallWidth(point)));
        });
    }

    private findVectorToInteriorWall(trackPoint: TrackPoint): Vector3 {
        return trackPoint.vectorToInteriorPoint.normalize()
            .multiplyScalar(
                (HALF_TRACK_WIDTH + WALL_DISTANCE_TO_TRACK) / Math.sin(Math.abs(trackPoint.halfOfSmallAngle)));
    }

    private findVectorToInteriorWallWidth(trackPoint: TrackPoint): Vector3 {
        return trackPoint.vectorToInteriorPoint.normalize()
            .multiplyScalar(
                (HALF_TRACK_WIDTH + WALL_DISTANCE_TO_TRACK + WALL_WIDTH) / Math.sin(Math.abs(trackPoint.halfOfSmallAngle)));
    }

    private findExteriorWallPoints(trackPoints: TrackPointList): void {
        trackPoints.toTrackPoints.forEach((point: TrackPoint) => {
            this._holePoints.push(point.coordinate.add(this.findVectorToExteriorWall(point)));
        });
        this.findExteriorWallWidthPoint(trackPoints);
    }

    private findExteriorWallWidthPoint(trackPoints: TrackPointList): void {
        trackPoints.toTrackPoints.forEach((point: TrackPoint) => {
            this._shapePoints.push(point.coordinate.add(this.findVectorToExteriorWallWidth(point)));
        });
    }

    private findVectorToExteriorWall(trackPoint: TrackPoint): Vector3 {
        return trackPoint.vectorToInteriorPoint.normalize()
            .multiplyScalar(
                (HALF_TRACK_WIDTH + WALL_DISTANCE_TO_TRACK) / Math.sin(Math.abs(trackPoint.halfOfSmallAngle)))
            .negate();
    }

    private findVectorToExteriorWallWidth(trackPoint: TrackPoint): Vector3 {
        return trackPoint.vectorToInteriorPoint.normalize()
            .multiplyScalar(
                (HALF_TRACK_WIDTH + WALL_DISTANCE_TO_TRACK + WALL_WIDTH) / Math.sin(Math.abs(trackPoint.halfOfSmallAngle)))
            .negate();
    }

    private extrudeShapeToGeometry(): WallMesh {
        this.geometry = new ExtrudeGeometry(this._wallShape, EXTRUDE_SETTINGS);

        return this;
    }

    private loadMaterialWithTexture(): WallMesh {
        const texture: Texture = new TextureLoader().load(WALL_TEXTURE_PATH);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(WALL_TEXTURE_FACTOR, WALL_TEXTURE_FACTOR);

        this.material = new MeshPhongMaterial({
            side: DoubleSide,
            map: texture,
            shading: SmoothShading
        });

        return this;
    }

    public get shapePoints(): Vector3[] {
        return this._shapePoints;
    }

    public get holePoints(): Vector3[] {
        return this._holePoints;
    }
}
