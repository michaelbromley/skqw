import {Injectable} from '@angular/core';
import {IVisualization, IParameter} from '../../common/models';
const path = require('path');
const fs = require("fs");
const nativeRequire = (<any> global).require;

@Injectable()
export class Loader {

    private library: IVisualization[] = [];
    private visPath: string = __dirname;

    /**
     * Set the path where the visualizations are located.
     */
    setPath(absolutePath: string) {
        this.visPath = absolutePath;
    }

    /**
     * Load all visualizations which reside in the folder specified by setPath().
     * Visualizations should reside in their own folders, with the main entry point
     * named `index.js`.
     */
    loadAll() {
        const isDir = p => fs.statSync(path.join(this.visPath, p)).isDirectory();
        const hasIndex = p => fs.statSync(path.join(this.visPath, p, 'index.js')).isFile();
        const isVisObject = v => v && v.name && v.init && v.tick;
        this.library = [];

        this.flushVisCache();

        fs.readdirSync(this.visPath).forEach(p => {
            if (!isDir(p) || !hasIndex(p)) {
                return;
            }
            let visPath = path.join(this.visPath, p, 'index.js');
            let vis = nativeRequire(visPath);
            if (isVisObject(vis)) {
                let normalized = this.normalizeParams(vis);
                // TODO: check for duplicate names and error if found.
                this.library.push(normalized);
            }
        }); 
    }

    /**
     * Get a list of the names and ids of all loaded visualizations.
     */
    listAll(): { id: number, name: string }[] {
        return this.library.map((v, i) => ({ id: i, name: v.name }));
    }

    /**
     * Returns a visualization object given by the id (the index in the library array)
     */
    getVisualization(id: number): IVisualization {
        if (0 <= id && id < this.library.length) {
            return this.library[id];
        }
    }

    /**
     * Delete the cached entries in the node "require" cache, so that the visualizations can be
     * refreshed on the fly without reloading the entire app.
     */
    private flushVisCache(): void {
        let cacheKeys = Object.keys(nativeRequire.cache).filter(k => -1 < k.indexOf(this.visPath));
        cacheKeys.forEach(key => delete nativeRequire.cache[key]);
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
