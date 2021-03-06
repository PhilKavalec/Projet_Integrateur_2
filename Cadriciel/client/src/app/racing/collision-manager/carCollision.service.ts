import { AbstractCar } from "../car/abstractCar";
import { Vector3 } from "three";
import { MINIMUM_CAR_DISTANCE } from "../constants/car.constants";
import { OVERLAP_CORRECTION_SCALAR, HALF } from "../constants/math.constants";
import { AICar } from "../car/aiCar";
import { Injectable } from "@angular/core";
import { SoundService } from "../sound-service/sound.service";

@Injectable()
export class CarCollisionService {

    private _collisionCarA: AbstractCar;
    private _collisionCarB: AbstractCar;
    private _collisionPoint: Vector3;
    private _overlapCorrection: Vector3;

    public update(cars: AbstractCar[], soundManager: SoundService): void {
        for (let firstCarIndex: number = 0; firstCarIndex < cars.length; ++firstCarIndex) {
            for (let secondCarIndex: number = firstCarIndex + 1; secondCarIndex < cars.length; ++secondCarIndex) {
                this.setCollisionCars(cars[firstCarIndex], cars[secondCarIndex]);
                if (this.checkIfCarsAreClose()) {
                    this.applyCollisionDetection(soundManager);
                }
            }
        }
    }

    private applyCollisionDetection(soundManager: SoundService): void {
        if (this.computeCollisionParameters()) {
            this.resolveHitboxOverlap();
            if (!this.carsInCollision()) {
                this.applyCollisionPhysics();
                if (!(this._collisionCarA instanceof AICar) || !(this._collisionCarB instanceof AICar)) {
                    soundManager.playCarCollision();
                }
            }
        } else {
            this.setCollisions(false);
        }
    }

    private applyCollisionPhysics(): void {
        this.setCollisions(true);
        this.computeResultingForces(
            this._collisionCarA,
            this._collisionCarB,
            this._collisionPoint.clone()
        );
    }

    private setCollisions(inCollision: boolean): void {
        this._collisionCarA.hitbox.inCollision = inCollision;
        this._collisionCarB.hitbox.inCollision = inCollision;
    }

    private carsInCollision(): boolean {
        return this._collisionCarA.hitbox.inCollision || this._collisionCarB.hitbox.inCollision;
    }

    private resolveHitboxOverlap(): void {
        this._collisionCarA.setCurrentPosition(
            this._collisionCarA.currentPosition.clone()
                .add(this._overlapCorrection.clone().multiplyScalar(OVERLAP_CORRECTION_SCALAR))
        );
        this._collisionCarB.setCurrentPosition(
            this._collisionCarB.currentPosition.clone()
                .add(this._overlapCorrection.clone().negate().multiplyScalar(OVERLAP_CORRECTION_SCALAR))
        );
    }

    private checkIfCarsAreClose(): boolean {
        return (this._collisionCarA.currentPosition.distanceTo(this._collisionCarB.currentPosition) < MINIMUM_CAR_DISTANCE);
    }

    private computeCollisionParameters(): boolean {
        this._overlapCorrection = new Vector3();
        let collisionDetected: boolean = false;
        for (const firstCarSphere of this._collisionCarA.hitbox.boundingSpheres) {
            for (const secondCarSphere of this._collisionCarB.hitbox.boundingSpheres) {
                if (firstCarSphere.intersectsSphere(secondCarSphere)) {
                    const closestFirstSphereVertex: Vector3 = firstCarSphere.clampPoint(secondCarSphere.center);
                    const closestSecondSphereVertex: Vector3 = secondCarSphere.clampPoint(firstCarSphere.center);
                    const firstToSecondVertex: Vector3 = closestSecondSphereVertex.clone().sub(closestFirstSphereVertex);
                    if (!collisionDetected) {
                        this.setCollisionPoint(closestFirstSphereVertex.clone().add(firstToSecondVertex.clone().multiplyScalar(HALF)));
                    }
                    this._overlapCorrection.add(closestSecondSphereVertex.clone().sub(closestFirstSphereVertex));
                    collisionDetected = true;
                }
            }
        }

        return collisionDetected;
    }

    private setCollisionPoint(collisionPoint: Vector3): void {
        this._collisionPoint = collisionPoint;
        this._collisionPoint.y = 0;
    }

    private setCollisionCars(firstCar: AbstractCar, secondCar: AbstractCar): void {
        this._collisionCarA = firstCar;
        this._collisionCarB = secondCar;
    }

    private computeResultingForces(movingCar: AbstractCar, motionlessCar: AbstractCar, collisionPoint: Vector3): void {
        const speedCarA: Vector3 = this.getCarSpeed(movingCar);
        const speedCarB: Vector3 = this.getCarSpeed(motionlessCar);
        const positionCarA: Vector3 = movingCar.currentPosition.clone();
        const positionCarB: Vector3 = motionlessCar.currentPosition.clone();
        const newSpeedCarA: Vector3 = this.createNewSpeedCar(speedCarA, speedCarB, positionCarA, positionCarB);
        const newSpeedCarB: Vector3 = this.createNewSpeedCar(speedCarB, speedCarA, positionCarB, positionCarA);
        this._collisionCarA.speed = this.findResultingSpeed(movingCar.direction.clone(), newSpeedCarA);
        this._collisionCarB.speed = this.findResultingSpeed(motionlessCar.direction.clone(), newSpeedCarB);
    }

    private createNewSpeedCar(speedCar1: Vector3, speedCar2: Vector3, positionCar1: Vector3, positionCar2: Vector3): Vector3 {
        return speedCar1.clone().sub(
            (positionCar1.clone().sub(positionCar2)).multiplyScalar(
                ((speedCar1.clone().sub(speedCar2)).dot(positionCar1.clone().sub(positionCar2))) /
                ((positionCar1.clone().sub(positionCar2)).lengthSq()))
        );
    }

    private findResultingSpeed(carDirection: Vector3, force: Vector3): Vector3 {
        const resultingSpeed: Vector3 = new Vector3(0, 0, 0);
        resultingSpeed.x = this.computeSpeedXComponent(force, carDirection);
        resultingSpeed.z = this.computeSpeedZComponent(force, carDirection);

        return resultingSpeed;
    }

    private computeSpeedXComponent(force: Vector3, carDirection: Vector3): number {
        const sign: number = Math.sign(force.clone().cross(carDirection).y);

        return force.clone().projectOnVector(this.orthogonalVector(carDirection)).length() * sign;
    }

    private computeSpeedZComponent(force: Vector3, carDirection: Vector3): number {
        const sign: number = -Math.sign(force.clone().dot(carDirection));

        return force.clone().projectOnVector(carDirection).length() * sign;
    }

    private getCarSpeed(movingCar: AbstractCar): Vector3 {
        const speed: Vector3 = new Vector3();
        speed.add(movingCar.direction.clone().normalize().multiplyScalar(Math.abs(movingCar.speed.z)));
        speed.add(this.orthogonalVector(movingCar.direction.clone().normalize()).multiplyScalar(Math.abs(movingCar.speed.x)));

        return speed;
    }

    private orthogonalVector(vector: Vector3): Vector3 {
        return new Vector3(vector.z, 0, - vector.x);
    }
}
