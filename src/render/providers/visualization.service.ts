import {Injectable} from '@angular/core';
import {ParamSettingsMap, State} from './state.service.';
import {ParamUpdate, Visualization} from '../../common/models';
import {Observable, Subject, Subscription} from 'rxjs';
import {RESET_TOKEN} from '../../common/constants';
import {Loader} from './loader.service';
import {LibraryService} from './library.service';

/**
 * Responsible for holding a reference to the currently-loaded visualization, and updating its parameters.
 */
@Injectable()
export class VisualizationService {

    current$: Observable<Visualization>;
    private debugMode: boolean = false;
    private reload$ = new Subject<string>();
    private subscriptions: Subscription[] = [];
    private visualization: Visualization;

    constructor(private state: State,
                private libraryService: LibraryService,
                private loader: Loader) {

        function isVis(input: any): input is Visualization {
            return input.hasOwnProperty('init');
        }

        this.current$ = this.state.activeId
            .map(id => id.toString())
            .filter(id => !!id)
            .distinctUntilChanged()
            .merge(this.reload$)
            .map(id => {
                if (id === RESET_TOKEN) {
                    return {};
                } else {
                    return this.loader.loadLibraryEntry(id, this.debugMode)
                }
            })
            .filter(vis => !!vis)
            .do(vis => {
                if (isVis(vis)) {
                    this.visualization = vis;
                }
            })
            .publishReplay(1)
            .refCount();

        this.subscriptions.push(
            this.state.paramSettings
                .startWith(this.state.paramSettings.getValue())
                .pairwise()
                .subscribe(([lastVal, val]) => {
                    this.updateChangedParams(lastVal, val)
                })
        );

        // Restore the save param settings, ensure enough time to the visialization to load and init.
        this.subscriptions.push(
            this.state.activeId
                .take(1)
                .delay(500)
                .subscribe(vis => this.restoreSaveParams())
        );

        // Restore the saved params when reloading a visualization.
        this.subscriptions.push(
            this.reload$
                .delay(200)
                .subscribe(vis => this.restoreSaveParams())
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    setDebugMode(value: boolean): void {
        this.debugMode = value;
    }

    reload(): void {
        const activeEntry = this.libraryService.getActive();
        if (activeEntry) {
            this.reload$.next(RESET_TOKEN);
            this.reload$.next(this.state.activeId.value);
        }
    }

    updateParam(paramUpdate: ParamUpdate): void {
        if (this.visualization && this.visualization.params) {
            let paramSettings = {};
            for (let name in this.visualization.params) {
                const currentValue = this.visualization.params[name].value;
                const value = (name === paramUpdate.paramKey) ? paramUpdate.newValue : currentValue;
                paramSettings[name] = value;
            }
            this.state.update('paramSettings', paramSettings);
        }
    }

    /**
     * Given the last two parameter maps, perform a diff over each key and update any which have changed.
     */
    private updateChangedParams(lastVal: ParamSettingsMap, val: ParamSettingsMap): void {
        if (this.visualization && this.visualization.params) {
            Object.keys(this.visualization.params).forEach(key => {
                if (val[key] === lastVal[key]) {
                    return;
                }
                const paramUpdate: ParamUpdate = {
                    paramKey: key,
                    newValue: val[key]
                };
                if (!this.visualization.params.hasOwnProperty(paramUpdate.paramKey)) {
                    return;
                }
                if (typeof this.visualization.paramChange === 'function') {
                    try {
                        this.visualization.paramChange(paramUpdate);
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    // if the paramChange hook is not defined, automatically update the parameter.
                    this.visualization.params[paramUpdate.paramKey].value = paramUpdate.newValue;
                }
            });
        }
    }

    private restoreSaveParams(): void {
        const paramSettings = this.state.paramSettings.value;
        for (let paramKey in paramSettings) {
            if (paramSettings.hasOwnProperty(paramKey)) {
                const newValue = paramSettings[paramKey];
                this.updateParam({paramKey, newValue});
            }
        }
    }
}