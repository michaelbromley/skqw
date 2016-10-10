import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'input-selector',
    templateUrl: './input-selector.component.html',
    styles: [`:host { display: block; } select { width: 100%; }`]
})
export class InputSelector {

    @Input() inputs: { [id: number]: string }; 
    @Input() selectedId: number;
    @Output() inputChange = new EventEmitter<number>(); 
    inputArray: { id: string; name: string; }[] = [];

    ngOnChanges(changes: any): void {
        if (this.inputArray.length === 0) {
            for (let id in this.inputs) {
                let name = this.inputs[id];
                this.inputArray.push({ id, name });
            }
        }
    }

    inputChanged(event: any): void {
        this.inputChange.emit(Number(event.target.value));
    }
}
