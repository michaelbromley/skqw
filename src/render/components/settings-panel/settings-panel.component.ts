import {Component, HostListener, Input, EventEmitter, Output} from '@angular/core';
import {InputSelector} from '../input-selector/input-selector.component';
import {SettingsModal} from '../settings-modal/settings-modal.component';
import {LibraryPathSelector} from '../library-path-selector/library-path-selector.component';
import {IState} from '../../providers/state.service.';
  
@Component({
    selector: 'settings-panel',
    template: require('./settings-panel.component.html'),
    styles: [require('./settings-panel.scss').toString()],
    directives: [SettingsModal, InputSelector, LibraryPathSelector]
})
export class SettingsPanel {
    @Input() state: IState;
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() selectLibraryDir = new EventEmitter<boolean>();
    @Output() toggleModal = new EventEmitter<string>();
    private iconsVisible: boolean = false;
    
    private icon_settings = require('../../../assets/icons/settings.svg');
    private icon_info = require('../../../assets/icons/info_outline.svg');
    private icon_gain = require('../../../assets/icons/equalizer.svg');

    @HostListener('document:mouseover') 
    showIcons(): void {
        if (this.state.settingsModal === '' && !this.iconsVisible) {
            this.iconsVisible = true;
        }
    }
 
    @HostListener('document:mouseout') 
    hideIcons(): void {
        if (this.iconsVisible) {
            this.iconsVisible = false;
        } 
    }

    showModal(which: string) {
        this.hideIcons();
        this.toggleModal.emit(which);
    }

    hideModal() {
        this.showIcons();
        this.toggleModal.emit('');
    }
} 
