import {Component, Input, EventEmitter, Output, SimpleChange} from '@angular/core';
import {IParameter, IParamUpdate} from '../../../common/models';

@Component({
    selector: 'parameter-controls',
    template: require('./parameter-controls.component.html')
})
export class ParameterControls {
    @Input() params: { [name: string]: IParameter };
    @Output() updateParam = new EventEmitter<IParamUpdate>();
    private paramsArray: { key: string; param: IParameter }[] = [];

    ngOnChanges(changes: { [name: string]: SimpleChange }): void {
        let newParams = changes['params'] && changes['params'].currentValue;
        if (newParams) {
            let keys = Object.keys(newParams);
            this.paramsArray = keys.map(key => ({key, param: newParams[key]}));
        }
    }  

    updateValue(paramKey: string, newValue: number | boolean): void {
        this.updateParam.emit({ paramKey, newValue });
    }
}
