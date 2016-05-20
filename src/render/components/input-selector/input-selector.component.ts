import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'input-selector',
    template: require('./input-selector.component.html'),
    styles: [`:host { position: absolute; z-index: 100; }`]
})
export class InputSelector {

    @Input() inputs: { [id: number]: string };
    @Output() inputChange = new EventEmitter<number>();
    private inputArray: { id: string; name: string; }[] = [];

    ngOnChanges(): void {
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
