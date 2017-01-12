import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Loader} from '../../providers/loader.service';
import {LibraryService} from '../../providers/library.service';
import {State} from '../../providers/state.service.';
import {LibraryEntry} from '../../../common/models';
const {dialog} = require('electron').remote;
const path = require('path');

const DEFAULT_LIBRARY_PATH = path.join(__dirname, 'library');

@Component({
    selector: 'library-path-selector',
    templateUrl: './library-path-selector.component.html',
    styleUrls: ['./library-path-selector.scss']
}) 
export class LibraryPathSelector {

    library$: Observable<LibraryEntry[]>;

    constructor(private loader: Loader,
                private state: State,
                private libraryService: LibraryService) {

        this.library$ = state.stateChanges$.map(state => state.library);
    }

    /**
     * Display a dialog for selecting the library dir.
     */
    selectLibraryDir() {
        dialog.showOpenDialog({
            title: 'Select Visualization Library Folder',
            defaultPath: DEFAULT_LIBRARY_PATH,
            properties: ['openDirectory']
        }, (paths: string[]) => {
            if (paths && paths.length === 1) {
                const pathToScript = paths[0];
                const vis = this.loader.loadFromPath(pathToScript);
                this.libraryService.addEntry(pathToScript, vis);
            }
        });
    }
}
  