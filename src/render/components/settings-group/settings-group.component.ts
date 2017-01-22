import {Component, ElementRef, Input, ViewChild} from '@angular/core';

@Component({
    selector: 'settings-group',
    templateUrl: './settings-group.component.html',
    styleUrls: ['./settings-group.scss']
})
export class SettingsGroup {
    @Input() groupTitle: string;
    @Input() visible: boolean = false;
    @ViewChild('wrapper') wrapper: ElementRef;

    toggle(): void {
        if (this.visible) {
            this.visible = false;
        } else {
            this.visible = true;
        }
    }
}
