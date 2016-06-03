import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface IState {
    library: { id: number; name: string; }[];
    libraryDir: string;
    inputDevices: { [id: number]: string };
    selectedInputId: number;
    vSelectorVisible: boolean;
    settingsModal: string;
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
        vSelectorVisible: false,
        settingsModal: ''
    });

    private library: { id: number; name: string; }[] = [];
    private libraryDir: string = '';
    private inputDevices: { [id: number]: string } = {};
    private selectedInputId: number = 0;
    private vSelectorVisible: boolean = false;
    private settingsModal: string = '';

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
    
    setVSelectorVisible(val: boolean): void {
        this.vSelectorVisible = val;
        this.emitStateChange();
    }
    
    setSettingsModal(val: string): void {
        this.settingsModal = val;
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
            vSelectorVisible: this.vSelectorVisible,
            settingsModal: this.settingsModal
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
