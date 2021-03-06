import { Injectable } from "@angular/core";
import { AudioListener, AudioLoader, AudioBuffer, Audio } from "three";
import { AbstractCar } from "../car/abstractCar";
import { MUSIC_KEYCODE } from "../constants/keycode.constants";
import {
    MUSIC_PATH, VOLUME, ACCELERATION_PATH, CAR_COLLISION_PATH, WALL_COLLISION_PATH, START_SOUND_3_PATH, START_SOUND_2_PATH,
    START_SOUND_1_PATH, START_SOUND_GO_PATH
} from "../constants/sound.constants";
import { RPM_FACTOR } from "../constants/car.constants";
import { KeyboardEventService } from "../user-input-services/keyboard-event.service";
import { START_SEQUENCE_LENGTH } from "../constants/scene.constants";

@Injectable()
export class SoundService {

    private _music: Audio;
    private _accelerationSound: Audio;
    private _carCollisionSound: Audio;
    private _wallCollisionSound: Audio;
    private _startingSound: Audio[];
    private _startSequenceIndex: number;

    public constructor(private _keyBoardHandler: KeyboardEventService) {
        this._startSequenceIndex = 0;
        this._startingSound = [];
    }

    public async initialize(car: AbstractCar): Promise<void> {
        await this.createStartingSound(car);
        await this.createMusic(car);
        await this.createCarCollisionSound(car);
        await this.createAccelerationSound(car);
        await this.createWallCollisionSound(car);
    }

    public bindSoundKeys(): void {
        this._keyBoardHandler.bindFunctionToKeyDown(MUSIC_KEYCODE, () => {
            this._music.isPlaying ?
                this._music.stop() :
                this._music.play();
        });
    }

    public stopAllSounds(): void {
        if (this._music.isPlaying) { this._music.stop(); }
        if (this._accelerationSound.isPlaying) { this._accelerationSound.stop(); }
        if (this._carCollisionSound.isPlaying) { this._carCollisionSound.stop(); }
        if (this._wallCollisionSound.isPlaying) { this._wallCollisionSound.stop(); }
        this._startingSound.forEach((sound: Audio) => { if (sound.isPlaying) { sound.stop(); } });
    }

    private async createSound(soundPath: string): Promise<Audio> {
        const listener: AudioListener = new AudioListener();
        const sound: Audio = new Audio(listener);
        const loader: AudioLoader = new AudioLoader();

        return new Promise<Audio>((resolve, reject) => loader.load(
            soundPath,
            (audioBuffer: AudioBuffer) => {
                sound.setBuffer(audioBuffer);
                resolve(sound);
            },
            (xhr: XMLHttpRequest) => { },
            (err: Event) => reject()
        ));
    }

    private async createMusic(car: AbstractCar): Promise<void> {
        await this.createSound(MUSIC_PATH).then((sound: Audio) => this._music = sound);
        this._music.setVolume(VOLUME);
        this._music.setLoop(true);
        car.add(this._music);
    }

    private async createAccelerationSound(car: AbstractCar): Promise<void> {
        await this.createSound(ACCELERATION_PATH).then((sound: Audio) => this._accelerationSound = sound);
        this._accelerationSound.setLoop(true);
        car.add(this._accelerationSound);
    }

    private async createCarCollisionSound(car: AbstractCar): Promise<void> {
        await this.createSound(CAR_COLLISION_PATH).then((sound: Audio) => this._carCollisionSound = sound);
        this._carCollisionSound.onEnded = () => {
            this._carCollisionSound.stop();
        };
        car.add(this._carCollisionSound);
    }

    private async createWallCollisionSound(car: AbstractCar): Promise<void> {
        await this.createSound(WALL_COLLISION_PATH).then((sound: Audio) => this._wallCollisionSound = sound);
        this._wallCollisionSound.onEnded = () => {
            this._wallCollisionSound.stop();
        };
        car.add(this._wallCollisionSound);
    }

    private async createStartingSound(car: AbstractCar): Promise<void> {
        await this.createSound(START_SOUND_3_PATH).then((sound: Audio) => this._startingSound.push(sound));
        await this.createSound(START_SOUND_2_PATH).then((sound: Audio) => this._startingSound.push(sound));
        await this.createSound(START_SOUND_1_PATH).then((sound: Audio) => this._startingSound.push(sound));
        await this.createSound(START_SOUND_GO_PATH).then((sound: Audio) => this._startingSound.push(sound));
        for (let i: number = 0; i < START_SEQUENCE_LENGTH; i++) {
            car.add(this._startingSound[i]);
        }
    }

    public get accelerationSoundEffect(): Audio {
        return this._accelerationSound;
    }

    public playCurrentStartSequenceSound(): void {
        this._startingSound[this._startSequenceIndex++].play();
    }

    public get collisionSound(): Audio {
        return this._carCollisionSound;
    }

    public playCarCollision(): void {
        if (!this._carCollisionSound.isPlaying) {
            this._carCollisionSound.play();
        }
    }

    public playWallCollision(): void {
        if (!this._wallCollisionSound.isPlaying) {
            this._wallCollisionSound.play();
        }
    }

    public setAccelerationSound(car: AbstractCar): void {
        this._accelerationSound.setVolume(VOLUME * 2);
        this._accelerationSound.setPlaybackRate(this.calculateRate(car));
    }

    public playAccelerationSound(): void {
        this._accelerationSound.play();
    }

    private calculateRate(car: AbstractCar): number {
        return Math.max(1, car.rpm / RPM_FACTOR);
    }
}
