import { TestBed } from "@angular/core/testing";
import { TrackPoint, TrackPointList } from "./trackPoint";
// import { Object3D } from "three";
// import assert = require("assert");
import { CommonCoordinate3D } from "../../../../../common/racing/commonCoordinate3D";
import { Vector3 } from "three";

// tslint:disable:no-magic-numbers
describe("TrackPoint", () => {
    let trackPoint: TrackPoint;
    let trackList: TrackPointList;
    beforeEach(() => {
        trackPoint = new TrackPoint(new Vector3(0, 0, 0));
        trackList = new TrackPointList(new Array<CommonCoordinate3D>());
        TestBed.configureTestingModule({
            providers: [TrackPoint]
        });
    });

    it("a track point should be created", () => {
        expect(trackPoint).toBeTruthy();
    });

    it("should find interior point", () => {
        trackPoint.previous = new TrackPoint(new Vector3(1, 0, 0));
        trackPoint.next = new TrackPoint(new Vector3(0, 0, 1));
        trackPoint.findInteriorExteriorPoints();
        // const intPoints: Vector3 = trackPoint.interior;

        expect(trackPoint.interior).toEqual(new Vector3(-10.000000000000002, 0, -10));
    });

    it("should find interior opposite point", () => {
        trackPoint.next = new TrackPoint(new Vector3(1, 0, 0));
        trackPoint.previous = new TrackPoint(new Vector3(0, 0, 1));
        trackPoint.findInteriorExteriorPoints();
        // const extPoints: Vector3 = trackPoint.exterior;
        expect(trackPoint.interior).toEqual(new Vector3(10, 0, 10.000000000000002));
    });

    it("should find exterior point", () => {
        trackPoint.previous = new TrackPoint(new Vector3(1, 0, 0));
        trackPoint.next = new TrackPoint(new Vector3(0, 0, 1));
        trackPoint.findInteriorExteriorPoints();
        // const intPoints: Vector3 = trackPoint.interior;

        expect(trackPoint.exterior).toEqual(new Vector3(10.000000000000002, 0, 10));
    });

    it("should find exterior opposite point", () => {
        trackPoint.next = new TrackPoint(new Vector3(1, 0, 0));
        trackPoint.previous = new TrackPoint(new Vector3(0, 0, 1));
        trackPoint.findInteriorExteriorPoints();
        // const extPoints: Vector3 = trackPoint.exterior;
        expect(trackPoint.exterior).toEqual(new Vector3(-10, 0, -10.000000000000002));
    });

    it("a track list of points should be created", () => {
        expect(trackList).toBeTruthy();
    });

    it("a track list of points should be created in the clock direction", () => {
        const points: CommonCoordinate3D[] = Array<CommonCoordinate3D>();
        const trackPoint1: Vector3 = new Vector3(0, 0, 0);
        const trackPoint2: Vector3 = new Vector3(1, 0, 0);
        const trackPoint3: Vector3 = new Vector3(0, 0, 1);
        points.push(trackPoint1);
        points.push(trackPoint2);
        points.push(trackPoint3);
        const newList: TrackPointList = new TrackPointList(points);
        expect(newList.points).toBeTruthy();
    });

    it("a track list of points should be created in the invert clock direction", () => {
        const points: CommonCoordinate3D[] = Array<CommonCoordinate3D>();
        const trackPoint1: Vector3 = new Vector3(0, 0, 0);
        const trackPoint2: Vector3 = new Vector3(1, 0, 0);
        const trackPoint3: Vector3 = new Vector3(0, 0, 1);
        points.push(trackPoint3);
        points.push(trackPoint2);
        points.push(trackPoint1);
        const newList: TrackPointList = new TrackPointList(points);
        expect(newList.points).toBeTruthy();
    });
});