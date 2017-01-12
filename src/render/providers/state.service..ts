import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {LibraryEntry} from '../../common/models';
const storage = require('electron-json-storage');

const APP_STATE_KEY = 'appState';

export interface AppState {
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

/**
 * A state container for the entire app state, which exposes an
 * observable which emits the state on each change. State can only be changed
 * by explicitly changing the value with a setter.
 */
@Injectable()
export class State {
    stateChanges$ = new BehaviorSubject<AppState>(initialState);
    _state: AppState = initialState;

    constructor() {
        // restore last state from local storage
        storage.get(APP_STATE_KEY, (err, data) => {
            if (!err && data) {
                this._state = data;
            }
        });
    }

    /**
     * Update a state value.
     */
    set(key: 'library', value: { id: number; name: string; }[]): void;
    set(key: 'activeId', value: string): void;
    set(key: 'gain', value: number): void;
    set(key: 'inputDevices', value: { [id: number]: string }): void;
    set(key: 'selectedInputId', value: number): void;
    set(key: 'sampleRate', value: number): void;
    set(key: keyof AppState, value: any): void;
    set(key: keyof AppState, value: any): void {
        const forceNumeric = ['gain', 'sampleRate', 'selectedInputId'];
        if (-1 < forceNumeric.indexOf(key)) {
            value = +value;
        }
        this._state[key] = value;
        this.emitStateChange();
        storage.set(APP_STATE_KEY, this._state);
    }

    /**
     * Returns the current state.
     */
    getValue(): AppState {
        return this.stateChanges$.getValue();
    }

    /**
     * Emit a clone of the current app state.
     */
    private emitStateChange(): void {
        this.stateChanges$.next({
            library: this.clone(this._state.library),
            activeId: this._state.activeId,
            inputDevices: this.clone(this._state.inputDevices),
            selectedInputId: this._state.selectedInputId,
            gain: this._state.gain,
            sampleRate: this._state.sampleRate
        });
    }

    /**
     * Clone a simple array or object so that the exposed state
     * is immutable.
     */
    private clone(obj: any[] | any): any {
        if (Array.isArray(obj)) {
            return obj.slice(0);
        } else {
            return Object.assign({}, obj);
        }
    }
}
