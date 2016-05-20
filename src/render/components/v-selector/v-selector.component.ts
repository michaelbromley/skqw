import {Component, Input, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'v-selector',
    template: require('./v-selector.component.html'),
    styles: [`:host { position: relative; }`]
}) 
export class VSelector {
    @Input() library: { id: number; name: string; }[];
    @Output() select = new EventEmitter<number>();
    
    inputChanged(event: any): void {
        this.select.emit(Number(event.target.value));
    }
}
