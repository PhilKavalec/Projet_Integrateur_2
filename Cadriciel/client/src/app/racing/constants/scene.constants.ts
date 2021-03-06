import { SphereGeometry } from "three";

// track
export const TRACK_WIDTH: number = 20;
export const HALF_TRACK_WIDTH: number = TRACK_WIDTH / 2;
export const WALL_DISTANCE_TO_TRACK: number = 0;
export const WALL_WIDTH: number = 0.5;
export const STARTING_LINE_SEGMENT_MINIMAL_LENGTH: number = 50;
export const MINIMAL_SEGMENT_LENGTH: number = TRACK_WIDTH + WALL_DISTANCE_TO_TRACK + WALL_WIDTH;
export const MINIMAL_STARTING_LINE_SEGMENT_LENGTH: number = MINIMAL_SEGMENT_LENGTH + STARTING_LINE_SEGMENT_MINIMAL_LENGTH;
export const OFFSET: number = HALF_TRACK_WIDTH + WALL_DISTANCE_TO_TRACK + WALL_WIDTH;
export const START_LINE_WEIGHT: number = 20;
export const START_LINE_WIDTH: number = 6;
export const START_LINE_HEIGHT: number = -0.001;
export const START_CAR_DISTANCE: number = 12;
export const DEFAULT_TRACK_NAME: string = "track";
export const DEFAULT_GROUND_NAME: string = "ground";
export const LATERAL_CAR_OFFSET: number = 2;
export const VERTICAL_CAR_OFFSET: number = 5;
// editor
const RADIUS: number = 2.5;
export const OUTLINE_TO_VERTEX_RATIO: number = 1.25;
export const VERTEX_GEOMETRY: SphereGeometry = new SphereGeometry(RADIUS);
// preview
export const ROTATION_STEP: number = 0.01;
export const SCALE_FACTOR: number = 0.5;
// countdown
export const STARTING_TEXT: string = "START";
export const COUNTDOWN_INITIAL_TEXT: string = "3";
export const ONE_SECOND: number = 1000;
export const EDITOR_AMBIENT_LIGHT_OPACITY: number = 0.5;
export const START_SEQUENCE_LENGTH: number = 4;
// other
export const LOWER_GROUND: number = 0.01;
export const SKYBOX_SIZE: number = 700;
