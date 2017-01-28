import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
    selector: 'settings-group',
    templateUrl: './settings-group.component.html',
    styleUrls: ['./settings-group.scss']
})
export class SettingsGroup {
    @Input() groupTitle: string;
    @Input() visible: boolean = false;
    @Output() toggle = new EventEmitter<boolean>();
    @ViewChild('wrapper') wrapper: ElementRef;

    onToggle(): void {
        this.visible = !this.visible;
        this.toggle.emit(this.visible);
    }
}
