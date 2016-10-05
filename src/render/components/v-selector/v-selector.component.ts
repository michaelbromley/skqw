import {Component, HostListener, Input, EventEmitter, Output} from '@angular/core';
import {IVisualization} from '../../../common/models';
import {KEYCODE_RIGHT_ARROW, KEYCODE_LEFT_ARROW} from '../../../common/constants';
import {IState} from '../../providers/state.service.';
import {NotificationService} from '../../providers/notification.service';

@Component({
    selector: 'v-selector',
    template: require('./v-selector.component.html'),
    styles: [require('./v-selector.scss')],
    directives: []
})
export class VSelector {
    @Input() state: IState;
    @Input() current: IVisualization;
    @Output() select = new EventEmitter<number>();
    private icon_arrow = require('!!svg-inline!../../../assets/icons/play_arrow.svg');

    constructor(private notificationService: NotificationService) {}

    @HostListener('document:keydown', ['$event'])
    reloadVis(e: KeyboardEvent): void {
        if ((e.target as HTMLElement).tagName === 'INPUT') {
            return;
        }
        switch (e.which) {
            case KEYCODE_RIGHT_ARROW:
                this.selectNext();
                break; 
            case KEYCODE_LEFT_ARROW:
                this.selectPrev();
                break;
        }
    }

    /**
     * Select the next visualization in the library
     */
    selectNext(): void {
        let currentIndex = this.getCurrentIndex();
        if (currentIndex === -1) {
            return;
        }
        let nextIndex;
        if (currentIndex < this.state.library.length - 1) {
            nextIndex = currentIndex + 1;
        } else {
            nextIndex = 0;
        }
        this.select.emit(nextIndex);
        this.notificationService.notify(this.state.library[nextIndex].name);
    }

    /**
     * Select the previous visualization in the library
     */
    selectPrev(): void {
        let currentIndex = this.getCurrentIndex();
        if (currentIndex === -1) {
            return;
        }
        let nextIndex;
        if (currentIndex === 0) {
            nextIndex = this.state.library.length - 1;
        } else {
            nextIndex = currentIndex - 1;
        }
        this.select.emit(nextIndex);
        this.notificationService.notify(this.state.library[nextIndex].name);
    }

    private getCurrentIndex(): number {
        let library = this.state.library;
        if (library && library instanceof Array && this.current) {
            return library.map(v => v.name).indexOf(this.current.name);
        }
        return -1;
    }
}
