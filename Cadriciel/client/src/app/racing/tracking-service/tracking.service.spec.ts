// tslint:disable:no-magic-numbers
import { TestBed, inject } from "@angular/core/testing";
import { RaceProgressTracker } from "./raceProgressTracker";
import { Vector3, Sphere } from "three";
import { CarTrackingService } from "./tracking.service";

describe("CarTrackingManagerService", () => {
    const raceProgressTracker: RaceProgressTracker = new RaceProgressTracker();
    const trackingManager: CarTrackingService = new CarTrackingService();
    const MOCK_TRACK: Vector3[] = [
        new Vector3(0, 0, 0),
        new Vector3(100, 0, 0),
        new Vector3(100, 0, 100),
        new Vector3(0, 0, 100),
    ];
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CarTrackingService]
        });
    });

    it("should be created", inject([CarTrackingService], (service: CarTrackingService) => {
        expect(service).toBeTruthy();
    }));

    it("should be at finish line", () => {
        trackingManager.initialize(MOCK_TRACK, new Vector3(50, 0, 1), new Vector3(0, 0, 0));
        expect(trackingManager["isAtFinishLine"](new Vector3(50, 0, 1), raceProgressTracker)).toEqual(true);
    });

    it("shouldn't be at finish line", () => {
        trackingManager.initialize(MOCK_TRACK, new Vector3(50, 0, 1), new Vector3(2, 0, 5));
        expect(trackingManager["isAtFinishLine"](new Vector3(0, 0, 0), raceProgressTracker)).toEqual(false);
    });

    it("should contains the car", () => {
        const trackingSphere: Sphere = new Sphere(new Vector3(1, 0, 0));
        expect(trackingManager["sphereContainsCar"](trackingSphere, new Vector3(1, 0, 0))).toEqual(true);
    });

    it("shouldn't contains the car", () => {
        const trackingSphere: Sphere = new Sphere(new Vector3(1, 0, 0));
        expect(trackingManager["sphereContainsCar"](trackingSphere, new Vector3(10, 0, 30))).toEqual(false);
    });

    it("should update the race segment correctly", () => {
        trackingManager.update(new Vector3(0, 0, 0), raceProgressTracker);
        expect(raceProgressTracker.segmentCounted).toEqual(0);
    });

    it("should update the race correctly to notCompleted", () => {
        trackingManager.update(new Vector3(0, 0, 0), raceProgressTracker);
        expect(raceProgressTracker.isRaceCompleted).toEqual(false);
    });

    it("should update the race correctly to Completed", () => {
        trackingManager.initialize(MOCK_TRACK, new Vector3(50, 0, 1), new Vector3(0, 0, 0));
        raceProgressTracker["_lapCount"] = 4;
        raceProgressTracker["_segmentCounted"] = 16 * 3;
        trackingManager.isLapComplete(new Vector3(50, 0, 1), raceProgressTracker);
        expect(raceProgressTracker.isRaceCompleted).toEqual(true);
    });

    it("should complete the lap", () => {
        trackingManager.initialize(MOCK_TRACK, new Vector3(50, 0, 1), new Vector3(0, 0, 0));
        raceProgressTracker["_segmentCounted"] = 16;
        raceProgressTracker["_lapCount"] = 1;
        expect(trackingManager.isLapComplete(new Vector3(50, 0, 1), raceProgressTracker)).toEqual(true);
    });

    it("should not complete the lap", () => {
        trackingManager.initialize(MOCK_TRACK, new Vector3(50, 0, 1), new Vector3(0, 0, 0));
        raceProgressTracker["_segmentCounted"] = 16;
        raceProgressTracker["_lapCount"] = 2;
        expect(trackingManager.isLapComplete(new Vector3(0, 0, 1), raceProgressTracker)).toEqual(false);
    });
});
