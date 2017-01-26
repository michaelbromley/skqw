import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {LibraryEntry} from '../../common/models';
const storage = require('electron-json-storage');

const APP_STATE_KEY = 'SKQW_app_state';

export type ParamSettingsMap = { [name: string]: number | boolean };

export interface AppState {
    library: LibraryEntry[];
    lastPath: string;
    activeId: string;
    paramSettings: ParamSettingsMap;
    inputDevices: { [id: number]: string };
    selectedInputId: number;
    gain: number;
    sampleRate: number;
}

const initialState: AppState = {
    library: [],
    lastPath: '',
    activeId: '',
    paramSettings: {},
    inputDevices: {},
    selectedInputId: 0,
    gain: 100,
    sampleRate: 60
};

// A type which turns an interface into a version where each type is a BehaviorSubject wrapping that type.
type BehaviorSubjectify<T> = {
    [P in keyof T]: BehaviorSubject<T[P]>;
}

/**
 * A state container for the entire app state, which exposes an
 * observable which emits the state on each change. State can only be changed
 * by explicitly changing the value with a setter.
 */
@Injectable()
export class State {

    private _state = {} as BehaviorSubjectify<AppState>;
    private loadedFromDisk: boolean = false;
    private deferredOperations: { key: keyof AppState; value: any }[] = [];

    constructor() {
        // construct the state observables
        for (let key in initialState) {
            this._state[key] = new BehaviorSubject(initialState[key]);
        }


        // restore last state from local storage
        storage.get(APP_STATE_KEY, (err, data) => {
            if (err) {
                console.error(`Error restoring last state:`, err);
                storage.clear(() => console.log('Cleared storage!'));
                this.loadedFromDisk = true;
            } else if (data) {
                for(let key in data) {
                   this.setValue(key as keyof AppState, data[key]);
                }

                this.loadedFromDisk = true;
                this.deferredOperations.forEach(operation => {
                    this.update(operation.key, operation.value);
                })
            }
        });
    }

    get library(): BehaviorSubject<LibraryEntry[]> { return this._state.library; }
    get lastPath(): BehaviorSubject<string> { return this._state.lastPath; }
    get activeId(): BehaviorSubject<string> { return this._state.activeId; }
    get paramSettings(): BehaviorSubject<ParamSettingsMap> { return this._state.paramSettings; }
    get gain(): BehaviorSubject<number> { return this._state.gain; }
    get inputDevices(): BehaviorSubject<{ [id: number]: string }> { return this._state.inputDevices; }
    get selectedInputId(): BehaviorSubject<number> { return this._state.selectedInputId; }
    get sampleRate(): BehaviorSubject<number> { return this._state.sampleRate; }


    /**
     * Update a state value.
     */
    update(key: 'library', value: LibraryEntry[]): void;
    update(key: 'lastPath', value: string): void;
    update(key: 'activeId', value: string): void;
    update(key: 'paramSettings', value: ParamSettingsMap): void;
    update(key: 'gain', value: number): void;
    update(key: 'inputDevices', value: { [id: number]: string }): void;
    update(key: 'selectedInputId', value: number): void;
    update(key: 'sampleRate', value: number): void;
    update(key: keyof AppState, value: any): void;
    update(key: keyof AppState, value: any): void {
        const forceNumeric = ['gain', 'sampleRate', 'selectedInputId'];
        if (-1 < forceNumeric.indexOf(key)) {
            value = +value;
        }

        if (this.loadedFromDisk) {
            this.setValue(key as keyof AppState, value);
            // TODO: is it possible to change just a key in the local storage, rather than the entire object?
            const stateObject = this.getValue();
            storage.set(APP_STATE_KEY, stateObject);
        } else {
            // If the last app state has not yet been loaded from the disk, we defer this update operation
            // until after we have loaded it, to prevent overwriting saved state.
            this.deferredOperations.push({ key, value });
        }
    }

    /**
     * Returns the complete app state value.
     */
    getValue(): AppState {
        let plainState = {} as AppState;
        for (let key in this._state) {
            plainState[key] = this._state[key].getValue();
        }
        return plainState;
    }

    /**
     * Emit the next value on the corresponding key, if it exists.
     */
    private setValue(key: keyof AppState, value: any): void {
        if (this._state[key]) {
            (this._state[key] as BehaviorSubject<any>).next(this.clone(value));
        }
    }

    /**
     * Returns a new version of the passed value, i.e. complex objects are cloned,
     * primitives are passed through.
     */
    private clone(obj: any[] | any): any {
        if (typeof obj === 'string' || typeof obj === 'number') {
            return obj;
        } else if (Array.isArray(obj)) {
            return obj.slice(0);
        } else {
            return Object.assign({}, obj);
        }
    }
}
