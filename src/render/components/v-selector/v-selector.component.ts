import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {LibraryEntry} from '../../../common/models';
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
            this.state.update('lastPath', path.join(paths[0], '..'));
            paths.forEach(pathToScript => {
                try {
                    const vis = this.loader.loadFromPath(pathToScript);
                    if (vis) {
                        this.libraryService.addEntry(pathToScript, vis);
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
        e.stopPropagation();
    }
}
