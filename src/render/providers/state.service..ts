import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {LibraryEntry} from '../../common/models';
const storage = require('electron-json-storage');

const APP_STATE_KEY = 'appState';

interface AppState {
    library: LibraryEntry[];
    activeId: string;
    inputDevices: { [id: number]: string };
    selectedInputId: number;
    gain: number;
    sampleRate: number;
}

const initialState: AppState = {
    library: [],
    activeId: '',
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

    private _state: BehaviorSubjectify<AppState>;

    constructor() {
        // construct the state observables
        for (let key in initialState) {
            this._state[key] = new BehaviorSubject(initialState[key]);
        }


        // restore last state from local storage
        storage.get(APP_STATE_KEY, (err, data) => {
            if (!err && data) {
                for(let key in data) {
                   this.setValue(key as keyof AppState, data[key]);
                }
            }
        });
    }

    get library(): Observable<LibraryEntry[]> { return this._state.library; }
    get activeId(): Observable<string> { return this._state.activeId; }
    get gain(): Observable<number> { return this._state.gain; }
    get inputDevices(): Observable<{ [id: number]: string }> { return this._state.inputDevices; }
    get selectedInputId(): Observable<number> { return this._state.selectedInputId; }
    get sampleRate(): Observable<number> { return this._state.sampleRate; }


    /**
     * Update a state value.
     */
    update(key: 'library', value: LibraryEntry[]): void;
    update(key: 'activeId', value: string): void;
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
        this.setValue(key as keyof AppState, value);
        // TODO: is it possible to change just a key in the local storage, rather than the entire object?
        storage.set(APP_STATE_KEY, this.getValue());
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
