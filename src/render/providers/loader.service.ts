import {Injectable} from '@angular/core';
import {IVisualization, IParameter} from '../../common/models';
const path = require('path');

@Injectable()
export class Loader {

    private library: IVisualization[] = [];
    private visPath: string = __dirname;

    setPath(absolutePath: string) {
        this.visPath = absolutePath;
    }

    loadAll() {
        this.library = [];
        require("fs").readdirSync(this.visPath).forEach(file => {
            let visFactory = (<any> global).require(path.join(this.visPath, file));
            if (typeof visFactory === 'function') {
                // TODO: more validation of the object shape
                let vis = visFactory();
                let normalized = this.normalizeParams(vis);
                if (vis.name) {
                    this.library.push(normalized);
                }
            } 
        });
    }
    
    listAll(): { id: number, name: string }[] {
        return this.library.map((v, i) => ({ id: i, name: v.name }));
    }
    
    getVisualization(id: number): IVisualization {
        if (0 <= id && id < this.library.length) {
            return this.library[id];
        }
    }

    /**
     * Ensure the parameters contain the expected data.
     */
    private normalizeParams(vis: IVisualization): IVisualization {
        for(let paramName in vis.params) {
            if (vis.params.hasOwnProperty(paramName)) {
                vis.params[paramName] = this.normalizeParam(vis.params[paramName]);
            }
        }
        return vis;
    }
    
    private normalizeParam(param: IParameter): IParameter {
        if (param.type === 'range') {
            if (param.min === undefined) {
                param.min = 0;
            }
            if (param.max === undefined) {
                param.max = Math.round(<number>param.value * 2);
            }
        }
        return param;
    }
}
