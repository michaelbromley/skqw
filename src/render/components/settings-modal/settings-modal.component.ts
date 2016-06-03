import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'settings-modal',
    template: require('./settings-modal.component.html'),
    styles: [
        `:host { position: absolute; }`,
        require('./settings-modal.scss').toString()
    ]
})
export class SettingsModal { 
    private icon_close = require('../../../assets/icons/cross.svg');
    @Input() visible: boolean;
    @Output() close = new EventEmitter<boolean>();
}

 