import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

let caretIcon: string = require('!!svg-inline!../../../assets/icons/keyboard_arrow_down.svg');

@Component({
    selector: 'settings-group',
    templateUrl: './settings-group.component.html',
    styleUrls: ['./settings-group.scss']
})
export class SettingsGroup {
    @Input() groupTitle: string;
    @Input() visible: boolean = false;
    @ViewChild('wrapper') wrapper: ElementRef;
    icon_caret: SafeHtml;

    constructor(sanitizer: DomSanitizer) {
        this.icon_caret = sanitizer.bypassSecurityTrustHtml(caretIcon);
    }
    
    toggle(): void {
        if (this.visible) {
            this.visible = false;
        } else {
            this.visible = true;
        }
    }
}
