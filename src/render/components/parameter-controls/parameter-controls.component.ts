import {Component, Input, EventEmitter, Output, SimpleChange} from '@angular/core';
import {IParameter, IParamUpdate} from '../../../common/models';

@Component({
    selector: 'parameter-controls',
    templateUrl: './parameter-controls.component.html',
    styleUrls: ['./parameter-controls.scss']
}) 
export class ParameterControls {
    @Input() params: { [name: string]: IParameter };
    @Output() updateParam = new EventEmitter<IParamUpdate>();
    paramsArray: { key: string; param: IParameter }[] = [];

    ngOnChanges(changes: { [name: string]: SimpleChange }): void {
        let newParams = changes['params'] && changes['params'].currentValue;
        if (newParams) {
            let keys = Object.keys(newParams);
            this.paramsArray = keys.map(key => ({key, param: newParams[key]}));
        } else {
            this.paramsArray = [];
        }
    }  

    updateValue(paramKey: string, newValue: number | boolean): void {
        // coerce the value into the correct type
        let coercedValue;
        switch (this.params[paramKey].type) {
            case 'range':
                coercedValue = +newValue;
                break;
            case 'boolean':
                coercedValue = !!newValue;
                break;
            default:
                coercedValue = newValue;
        }
        this.updateParam.emit({ paramKey, newValue: coercedValue });
    }
}
 