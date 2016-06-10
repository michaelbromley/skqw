import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface IState {
    library: { id: number; name: string; }[];
    libraryDir: string;
    inputDevices: { [id: number]: string };
    selectedInputId: number;
    settingsIconsVisible: boolean;
    vSelectorVisible: boolean;
    vSelectorExpanded: boolean;
    settingsModal: string;
    gain: number;
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
        settingsIconsVisible: false,
        vSelectorVisible: false,
        vSelectorExpanded: false,
        settingsModal: '',
        gain: 100
    });

    private library: { id: number; name: string; }[] = [];
    private libraryDir: string = '';
    private inputDevices: { [id: number]: string } = {};
    private selectedInputId: number = 0;
    private settingsIconsVisible: boolean = false;
    private vSelectorVisible: boolean = false;
    private vSelectorExpanded: boolean = false;
    private settingsModal: string = '';
    private gain: number = 100;

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
    
    setSettingsIconsVisible(val: boolean): void {
        this.settingsIconsVisible = val;
        this.emitStateChange();
    }
    
    setVSelectorVisible(val: boolean): void {
        this.vSelectorVisible = val;
        this.emitStateChange();
    }

    setVSelectorExpanded(val: boolean): void {
        this.vSelectorExpanded = val;
        this.emitStateChange();
    }
    
    setSettingsModal(val: string): void {
        this.settingsModal = val;
        this.emitStateChange();
    }
    
    setGain(val: number): void {
        this.gain = val;
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
            settingsIconsVisible: this.settingsIconsVisible,
            vSelectorVisible: this.vSelectorVisible,
            vSelectorExpanded: this.vSelectorExpanded,
            settingsModal: this.settingsModal,
            gain: this.gain
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
