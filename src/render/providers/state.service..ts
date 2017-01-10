import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export interface IState {
    library: { id: number; name: string; }[];
    libraryDir: string;
    inputDevices: { [id: number]: string };
    selectedInputId: number;
    settingsIconVisible: boolean;
    settingsExpanded: boolean;
    gain: number;
    sampleRate: number;
}

const initialState: IState = {
    library: [],
    libraryDir: '',
    inputDevices: {},
    selectedInputId: 0,
    settingsIconVisible: false,
    settingsExpanded: false,
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
    stateChanges$ = new BehaviorSubject<IState>(initialState);
    _state: IState = initialState;

    /**
     * Update a state value.
     */
    set(key: 'library', value: { id: number; name: string; }[]): void;
    set(key: 'libraryDir', value: string): void;
    set(key: 'gain', value: number): void;
    set(key: 'inputDevices', value: { [id: number]: string }): void;
    set(key: 'selectedInputId', value: number): void;
    set(key: 'settingsIconVisible', value: boolean): void;
    set(key: 'settingsExpanded', value: boolean): void;
    set(key: 'sampleRate', value: number): void;
    set(key: keyof IState, value: any): void;
    set(key: keyof IState, value: any): void {
        const forceNumeric = ['gain', 'sampleRate', 'selectedInputId'];
        if (-1 < forceNumeric.indexOf(key)) {
            value = +value;
        }
        this._state[key] = value;
        this.emitStateChange();
    }

    /**
     * Returns the current state.
     */
    getValue(): IState {
        return this.stateChanges$.getValue();
    }

    /**
     * Emit a clone of the current app state.
     */
    private emitStateChange(): void {
        this.stateChanges$.next({
            library: this.clone(this._state.library),
            libraryDir: this._state.libraryDir,
            inputDevices: this.clone(this._state.inputDevices),
            selectedInputId: this._state.selectedInputId,
            settingsIconVisible: this._state.settingsIconVisible,
            settingsExpanded: this._state.settingsExpanded,
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
