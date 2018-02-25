import { CommonCoordinate3D } from "./commonCoordinate3D";
import { TrackType } from "./trackType";

export type TrackMapElement = { "key": string, "value": Track };

export interface TrackDocument {
    _id: string;
    track: {
        name: string;
        description: string;
        vertices: Array<CommonCoordinate3D>;
        type: TrackType;
    };
}

export class Track {
    public name: string;
    public description: string;
    public vertices: Array<CommonCoordinate3D>;
    public type: TrackType;

    public constructor(rawTrack: TrackDocument) {
        this.name = rawTrack.track.name;
        this.description = rawTrack.track.description;
        this.vertices = rawTrack.track.vertices;
        this.type = rawTrack.track.type;
    };
}
