import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/do';
import {LibraryEntry} from '../../common/models';
import * as low from 'lowdb';
import {STATE_CHANGE} from '../../common/constants';
const {ipcRenderer} = require('electron');

const db = new low('db.json');

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

if (db.has(APP_STATE_KEY).value() === false) {
    // initialize the db with default values
    db.setState({
        [APP_STATE_KEY]: Object.keys(initialState).map(key => {
            const value = initialState[key];
            return {key, value};
        })
    });
}

/**
 * A state container for the entire app state, which exposes an
 * observable which emits the state on each change. State can only be changed
 * by explicitly changing the value with a setter.
 */
@Injectable()
export class State {

    private _state = {} as BehaviorSubjectify<AppState>;
    private id: string = Math.random().toString(36).substring(3);

    constructor() {
        // construct the state observables
        for (let key in initialState) {
            const storedValue = db.get(APP_STATE_KEY).find({ key }).value<{ key: string; value: any; }>().value;
            this._state[key] = new BehaviorSubject(storedValue || initialState[key]);
        }

        // listen to state updates from a remote instance of this StateService
        ipcRenderer.on(STATE_CHANGE, (event, change) => {
            if (change.id !== this.id) {
                this.setValue(change.key, change.value);
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
        // set and emit the value internally
        this.setValue(key as keyof AppState, value);
        // persist the value to the db
        db.get(APP_STATE_KEY).find({ key }).assign({ value }).value();
        // emit a state change event
        ipcRenderer.send(STATE_CHANGE, { id: this.id, key, value });
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

    ngOnDestroy(): void {
        ipcRenderer.removeAllListeners();
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
