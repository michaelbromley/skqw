import {Injectable} from '@angular/core';
const path = require('path');
const nativeRequire = require;

export interface IVisualization {
    name: string;
    author: string;
    init: (skqw: any) => void,
    tick: (skqw: any, timestamp: number) => void,
    params: {
        [name: string]: {
            value: any;
            type: 'range' | 'boolean';
            min?: number;
            max?: number;
        }
    }
}

@Injectable()
export class Loader {

    private library: IVisualization[] = [];
    private currentVisualization: IVisualization;
    private visPath: string = __dirname;

    setPath(absolutePath: string) {
        this.visPath = absolutePath;
    }

    loadAll() {
        require("fs").readdirSync(this.visPath).forEach(file => {
            let visFactory = (<any> global).require(path.join(this.visPath, file));
            if (typeof visFactory === 'function') {
                // TODO: more validation of the object shape
                let vis = visFactory();
                if (vis.name) {
                    this.library.push(vis);
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
}
