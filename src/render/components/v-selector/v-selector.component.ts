import {Component, ElementRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import {LibraryEntry} from '../../../common/models';
import {State} from '../../providers/state.service.';
import {NotificationService} from '../../providers/notification.service';
import {LibraryService} from '../../providers/library.service';
import {Loader} from '../../providers/loader.service';
import {RESET_TOKEN} from '../../../common/constants';
import * as Ps from 'perfect-scrollbar'
const {dialog} = require('electron').remote;
const path = require('path');
const fs = require('fs');


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
                private elementRef: ElementRef,
                private loader: Loader) {
        this.current$ = state.activeId.map(id => this.libraryService.getEntry(id));
    }

    ngAfterViewInit(): void {
        const container = this.elementRef.nativeElement.querySelector('md-nav-list');
        Ps.initialize(container);

        this.state.library.skip(1).take(1)
            .subscribe(library => {
                if (library.length === 0) {
                    this.loadDefaultLibrary();
                }
            });
    }

    /**
     * Display a dialog for selecting the library dir.
     */
    add() {
        dialog.showOpenDialog({
            title: 'Select Visualization Folder(s)',
            defaultPath: this.state.lastPath.value || DEFAULT_LIBRARY_PATH,
            properties: ['openDirectory', 'multiSelections']
        }, (paths: string[]) => {
            const entries = this.loadFromPaths(paths);
            if (0 < entries.length) {
                this.state.update('activeId', entries[0].id);
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
        } else {
            this.state.update('activeId', RESET_TOKEN);
        }
        e.stopPropagation();
        this.updateScrollbar();
    }

    private loadDefaultLibrary(): void {
        fs.readdir(DEFAULT_LIBRARY_PATH, (err, paths) => {
           if (err) {
               this.notificationService.notify(`Could not load default library: ${err.message}`);
           } else {
               const fullPaths = paths.map(p => path.join(DEFAULT_LIBRARY_PATH, p));
               const entries = this.loadFromPaths(fullPaths);
               if (0 < entries.length) {
                   this.state.update('activeId', entries[0].id);
               }
               this.updateScrollbar();
           }
        });
    }

    private loadFromPaths(paths: string[]): LibraryEntry[] {
        let entries: LibraryEntry[] = [];

        if (paths && 0 < paths.length) {
            this.state.update('lastPath', path.join(paths[0], '..'));
            paths.forEach(pathToScript => {
                try {
                    const vis = this.loader.loadFromPath(pathToScript);
                    if (vis) {
                        entries.push(this.libraryService.addEntry(pathToScript, vis));
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
        }
        return entries;
    }

    private updateScrollbar(): void {
        const container = this.elementRef.nativeElement.querySelector('md-nav-list');
        Ps.update(container);
    }
}
