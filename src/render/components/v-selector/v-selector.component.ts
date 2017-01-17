import {Component, HostListener} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Visualization, LibraryEntry} from '../../../common/models';
import {KEYCODE_RIGHT_ARROW, KEYCODE_LEFT_ARROW} from '../../../common/constants';
import {State} from '../../providers/state.service.';
import {NotificationService} from '../../providers/notification.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {LibraryService} from '../../providers/library.service';
import {Loader} from '../../providers/loader.service';
const {dialog} = require('electron').remote;
const path = require('path');

const DEFAULT_LIBRARY_PATH = path.join(__dirname, 'library');

let arrowIcon: string = require('!!svg-inline!../../../assets/icons/play_arrow.svg');

@Component({
    selector: 'v-selector',
    templateUrl: './v-selector.component.html',
    styleUrls: ['./v-selector.scss']
})
export class VSelector {

    current$: Observable<LibraryEntry>;
    icon_arrow: SafeHtml;
    activeId: string;

    constructor(private notificationService: NotificationService,
                private state: State,
                private libraryService: LibraryService,
                private loader: Loader,
                sanitizer: DomSanitizer) {
        this.icon_arrow = sanitizer.bypassSecurityTrustHtml(arrowIcon);

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

    remove(entry: LibraryEntry, e: MouseEvent): void {
        this.libraryService.removeEntry(entry.id);
        e.stopPropagation();
    }
}
