import {Injectable} from '@angular/core';
import {IVisualization, IParameter} from '../../common/models';
const path = require('path');
const fs = require("fs");

@Injectable()
export class Loader {

    private library: IVisualization[] = [];
    private visPath: string = __dirname;

    setPath(absolutePath: string) {
        this.visPath = absolutePath;
    }

    loadAll() {
        const isDir = p => fs.statSync(path.join(this.visPath, p)).isDirectory();
        const hasIndex = p => fs.statSync(path.join(this.visPath, p, 'index.js')).isFile();
        const isVisObject = v => v && v.name && v.init && v.tick;
        this.library = [];

        fs.readdirSync(this.visPath).forEach(p => {
            if (!isDir(p) || !hasIndex(p)) {
                return;
            }
            let vis = (<any> global).require(path.join(this.visPath, p, 'index.js'));
            if (isVisObject(vis)) {
                let normalized = this.normalizeParams(vis);
                this.library.push(normalized);
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
