import {Component, Input, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'v-selector',
    template: require('./v-selector.component.html'),
    styles: [`:host { position: relative; }`, require('./v-selector.scss').toString()]
}) 
export class VSelector {
    @Input() library: { id: number; name: string; }[];
    @Input() libraryDir: string;
    @Output() selectLibraryDir = new EventEmitter<boolean>();
    @Output() select = new EventEmitter<number>();
    
    inputChanged(event: any): void { 
        this.select.emit(Number(event.target.value));
    }
}
