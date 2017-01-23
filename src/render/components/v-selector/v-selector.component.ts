import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {LibraryEntry, Visualization} from '../../../common/models';
import {State} from '../../providers/state.service.';
import {NotificationService} from '../../providers/notification.service';
import {LibraryService} from '../../providers/library.service';
import {Loader} from '../../providers/loader.service';
const {dialog} = require('electron').remote;
const path = require('path');

const DEFAULT_LIBRARY_PATH = path.join(__dirname, 'library');

@Component({
    selector: 'v-selector',
    templateUrl: './v-selector.component.html',
    styleUrls: ['./v-selector.scss']
})
export class VSelector {

    current$: Observable<LibraryEntry>;
    activeId: string;

    constructor(private notificationService: NotificationService,
                private state: State,
                private libraryService: LibraryService,
                private loader: Loader) {
        this.current$ = state.activeId.map(id => this.libraryService.getEntry(id));
    }

    /**
     * Display a dialog for selecting the library dir.
     */
    add() {
        dialog.showOpenDialog({
            title: 'Select Visualization Library Folder',
            defaultPath: this.state.lastPath.value || DEFAULT_LIBRARY_PATH,
            properties: ['openDirectory', 'multiSelections']
        }, (paths: string[]) => {
            if (paths && 0 < paths.length) {
                this.state.update('lastPath', path.join(paths[0], '..'));
                let firstEntry: LibraryEntry;
                paths.forEach(pathToScript => {
                    try {
                        const vis = this.loader.loadFromPath(pathToScript);
                        if (vis) {
                            const entry = this.libraryService.addEntry(pathToScript, vis);
                            if (!firstEntry) {
                                firstEntry = entry;
                            }
                        }
                    } catch (e) {
                        let message: string;
                        if (e.code === "ENOENT") {
                            message = `File not found: "${path.join(pathToScript, 'index.js')}"`
                        } else {
                            message = e.toString();
                        }
                        this.notificationService.notify(message);
                    }
                });
                if (firstEntry) {
                    this.state.update('activeId', firstEntry.id);
                }

            }
        });
    }

    select(entry: LibraryEntry): void {
        this.state.update('activeId', entry.id);
    }

    menuClick(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
    }

    remove(entry: LibraryEntry, e: MouseEvent): void {
        this.libraryService.removeEntry(entry.id);
        // load the first entry in the library
        const library = this.libraryService.getLibrary();
        if (0 < library.length) {
            this.state.update('activeId', library[0].id);
        }
        e.stopPropagation();
    }
}
