import { TrackMesh } from "../track/track";
import { WallPlane } from "../track/plane";
import { AbstractCar } from "../car/abstractCar";
import { Sphere, Vector3 } from "three";
import { SoundManagerService } from "../sound-service/sound-manager.service";
import { POS_Y_AXIS, NEG_Y_AXIS } from "../constants/global.constants";
import { PI_OVER_2 } from "../constants/math.constants";
import { AICar } from "../car/aiCar";

export class WallCollisionManager {
    private static readonly SLOW_DOWN_FACTOR: number = 0.985;
    private static readonly ROTATION_FACTOR: number = 0.001;
    private static _track: TrackMesh;
    private static _projectedPointOnPlane: Vector3;

    public static set track(track: TrackMesh) {
        this._track = track;
    }

    public static update(cars: AbstractCar[], soundManager: SoundManagerService): void {
        cars.forEach((car: AbstractCar) => {
            this._track.interiorPlanes.forEach((plane: WallPlane) => {
                this.manageCollisionWithWall(car, plane, true, soundManager);
            });
            this._track.exteriorPlanes.forEach((plane: WallPlane) => {
                this.manageCollisionWithWall(car, plane, false, soundManager);
            });
        });
    }

    private static manageCollisionWithWall(
        car: AbstractCar, plane: WallPlane, isInteriorWall: boolean,
        soundManager: SoundManagerService): void {
        car.hitbox.boundingSpheres.forEach((sphere: Sphere) => {
            if (this.isSphereIntersectingWallPlane(sphere, plane)) {
                this.moveCarAwayFromWall(car, sphere, plane, isInteriorWall);
                this.rotateCar(car, plane, isInteriorWall);
                car.speed = car.speed.multiplyScalar(this.SLOW_DOWN_FACTOR);
                if (!(car instanceof AICar)) {
                    soundManager.playWallCollision();
                }
            }
        });
    }

    private static moveCarAwayFromWall(car: AbstractCar, sphere: Sphere, plane: WallPlane, isInteriorWall: boolean): void {
        const vectorFromCenterToWall: Vector3 = this._projectedPointOnPlane.clone().sub(sphere.center);

        const unitVectorFromCenterToWall: Vector3 = this.sphereIsOtherSideOfWall(vectorFromCenterToWall, plane, isInteriorWall) ?
            vectorFromCenterToWall.clone().normalize().negate() :
            vectorFromCenterToWall.clone().normalize();

        const vectorFromPointOnSphereToCenter: Vector3 = unitVectorFromCenterToWall.clone()
            .multiplyScalar(sphere.radius)
            .negate();
        const overlapCorrection: Vector3 = vectorFromPointOnSphereToCenter.add(vectorFromCenterToWall);

        car.setCurrentPosition(car.currentPosition.clone().add(overlapCorrection));
    }

    private static rotateCar(car: AbstractCar, plane: WallPlane, isInteriorWall: boolean): void {
        const angleBetweenWallAndCar: number = car.direction.clone().angleTo(plane.directorVector);
        car.rotateMesh(
            isInteriorWall === angleBetweenWallAndCar < PI_OVER_2 ? POS_Y_AXIS : NEG_Y_AXIS,
            this.calculateRotationAngle(car, angleBetweenWallAndCar)
        );
    }

    private static calculateRotationAngle(car: AbstractCar, angleBetweenWallAndCar: number): number {
        return (car.speed.length() * this.ROTATION_FACTOR) * (Math.cos(angleBetweenWallAndCar * 2) + 1);
    }

    private static sphereIsOtherSideOfWall(vectorFromCenterToWall: Vector3, plane: WallPlane, isInteriorWall: boolean): boolean {
        if (isInteriorWall) {
            return vectorFromCenterToWall.clone().cross(plane.directorVector).y < 0;
        } else {
            return vectorFromCenterToWall.clone().cross(plane.directorVector).y > 0;
        }
    }

    private static isSphereIntersectingWallPlane(sphere: Sphere, plane: WallPlane): boolean {
        if (!sphere.intersectsPlane(plane)) {
            return false;
        }
        this._projectedPointOnPlane = plane.projectPoint(sphere.center.clone());

        return plane.isPointBetweenWallLimits(this._projectedPointOnPlane);
    }
}
