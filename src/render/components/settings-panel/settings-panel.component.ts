import {Component, HostListener, Input, EventEmitter, Output} from '@angular/core';
import {InputSelector} from '../input-selector/input-selector.component';
import {SettingsModal} from '../settings-modal/settings-modal.component';
  
@Component({
    selector: 'settings-panel',
    template: require('./settings-panel.component.html'),
    styles: [require('./settings-panel.scss').toString()],
    directives: [SettingsModal, InputSelector]
})
export class SettingsPanel {
    @Input() inputDevices:  { [id: number]: string } = {}; 
    @Input() library: { id: number; name: string }[];
    @Input() libraryDir: string;
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() selectLibraryDir = new EventEmitter<boolean>();
    private iconsVisible: boolean = false;
    private modalVisible: boolean = false;
    private icon_inputs = require('../../../assets/icons/power-cord.svg');
    private icon_info = require('../../../assets/icons/info.svg');
    private icon_vol_mute = require('../../../assets/icons/volume-mute.svg');
    private icon_vol_low = require('../../../assets/icons/volume-low.svg');
    private icon_vol_medium = require('../../../assets/icons/volume-medium.svg');
    private icon_vol_high = require('../../../assets/icons/volume-high.svg');


    @HostListener('document:mouseover')
    showIcons(): void {
        if (!this.modalVisible && !this.iconsVisible) {
            this.iconsVisible = true;
        }
    }

    @HostListener('document:mouseout') 
    hideIcons(): void {
        if (this.iconsVisible) {
            this.iconsVisible = false;
        } 
    }

    showModal() {
        this.modalVisible = true;
        this.hideIcons();
    }

    hideModal() {
        this.modalVisible = false;
        this.showIcons();
    }

    getVolumeIcon(): string {
        return this.icon_vol_medium;
    }
} 
