import {Component, HostListener, Input, EventEmitter, Output} from '@angular/core';
import {AppState, State} from '../../providers/state.service.';
import {ParamUpdate, Visualization} from '../../../common/models';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

declare const VERSION: string;
let settingsIcon: string = require('!!svg-inline!../../../assets/icons/settings.svg');

@Component({
    selector: 'settings-panel',
    templateUrl: './settings-panel.component.html',
    styleUrls: ['./settings-panel.scss']
})
export class SettingsPanel {
    @Input() current: Visualization;
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() selectLibraryDir = new EventEmitter<boolean>();
    @Output() select = new EventEmitter<number>();
    @Output() setGain = new EventEmitter<number>();
    @Output() setSampleRate = new EventEmitter<number>();
    @Output() updateParam = new EventEmitter<ParamUpdate>();
    iconVisible: boolean = false;
    expanded: boolean = false;
    icon_settings: SafeHtml;
    version: string = VERSION;
    private hoverTimer: any;

    constructor(public state: State,
                sanitizer: DomSanitizer) {
        this.icon_settings = sanitizer.bypassSecurityTrustHtml(settingsIcon);
    }

    ngOnDestroy(): void {
        clearTimeout(this.hoverTimer);
    }

    @HostListener('document:mouseenter')
    onMouseOver(): void {
        this.displayUiElements();
    }

    @HostListener('document:mousemove')
    onMouseMove(): void {
        this.displayUiElements();
    }

    @HostListener('document:mouseleave')
    onMouseOut(): void {
        this.iconVisible = false;
    }

    /**
     * Display the UI controls (visualization selector, settings icons) and set a timeout
     * to hide them again after a delay.
     */
    displayUiElements(): void {
        this.iconVisible = true;

        clearTimeout(this.hoverTimer);
        this.hoverTimer = setTimeout(() => {
            if (!this.expanded) {
                this.iconVisible = false;
            }
        }, 3000);
    }
} 
