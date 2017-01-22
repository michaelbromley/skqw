import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'input-selector',
    templateUrl: './input-selector.component.html',
    styleUrls: ['./input-selector.scss']
})
export class InputSelector {

    @Input() inputs: { [id: number]: string }; 
    @Input() selectedId: number;
    @Output() inputChange = new EventEmitter<number>(); 
    inputArray: { id: string; name: string; }[] = [];
    selectControl = new FormControl();
    subscription: Subscription;

    ngOnInit(): void {
        this.subscription = this.selectControl.valueChanges
            .subscribe(value => {
                this.inputChange.emit(Number(value));
            })
    }

    ngOnChanges(changes: any): void {
        if (this.inputArray.length === 0) {
            for (let id in this.inputs) {
                let name = this.inputs[id];
                this.inputArray.push({ id, name });
            }
            this.selectControl.setValue(this.selectedId.toString());
        }
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

}
