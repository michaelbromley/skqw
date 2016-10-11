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

/**
 * A state container for the entire app state, which exposes an
 * observable which emits the state on each change. State can only be changed
 * by explicitly changing the value with a setter.
 */
@Injectable()
export class State {
    stateChanges$ = new BehaviorSubject<IState>({
        library: [],
        libraryDir: '',
        inputDevices: {},
        selectedInputId: 0,
        settingsIconVisible: false,
        settingsExpanded: false,
        gain: 100,
        sampleRate: 60
    });

    private library: { id: number; name: string; }[] = [];
    private libraryDir: string = '';
    private inputDevices: { [id: number]: string } = {};
    private selectedInputId: number = 0;
    private settingsIconVisible: boolean = false;
    private settingsExpanded: boolean = false;
    private gain: number = 100;
    private sampleRate: number = 60;

    /**
     * Returns the current state.
     */
    getValue(): IState {
        return this.stateChanges$.getValue();
    }

    setLibrary(val: { id: number; name: string; }[]): void {
        this.library = val;
        this.emitStateChange();
    }
    
    setLibraryDir(val: string): void {
        this.libraryDir = val;
        this.emitStateChange();
    }
    
    setInputDevices(val: { [id: number]: string }): void {
        this.inputDevices = val;
        this.emitStateChange();
    }
    
    setSelectedInputId(val: number): void {
        this.selectedInputId = val;
        this.emitStateChange();
    }
    
    setSettingsIconVisible(val: boolean): void {
        this.settingsIconVisible = val;
        this.emitStateChange();
    }
    
    setSettingsExpanded(val: boolean): void {
        this.settingsExpanded = val;
        this.emitStateChange();
    }
    
    setGain(val: number): void {
        this.gain = +val;
        this.emitStateChange();
    }

    setSampleRate(val: number): void {
        this.sampleRate = +val;
        this.emitStateChange();
    }

    /**
     * Emit a clone of the current app state.
     */
    private emitStateChange(): void {
        this.stateChanges$.next({
            library: this.clone(this.library),
            libraryDir: this.libraryDir,
            inputDevices: this.clone(this.inputDevices),
            selectedInputId: this.selectedInputId,
            settingsIconVisible: this.settingsIconVisible,
            settingsExpanded: this.settingsExpanded,
            gain: this.gain,
            sampleRate: this.sampleRate
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
