import {Injectable} from '@angular/core';
import {IVisualization, IParameter} from '../../common/models';
import {defaultVis} from '../components/visualizer/defaultVisualization';
import {SKQW_UTILS_MODULE_NAME} from '../../common/constants';
import {skqwUtils} from './skqw-utils';
const path = require('path');
const fs = require('fs');
const vm = require('vm');
// Webpack patches the native Node require, so we need to use this instead.
const nativeRequire = (<any> global).require;

/**
 * Returns true is the module is a built-in, e.g. "path" or "fs".
 */
function isBuiltInModule(name: string): boolean {
    let isBuiltIn: boolean;
    try {
        isBuiltIn = nativeRequire.resolve(name).indexOf('/') <= 0;
    } catch (e) {
        isBuiltIn = false;
    }
    return isBuiltIn;
}

/**
 * When we run a visualization script, we do not want to give that script access to same execution context as that
 * of the app itself. Therefore we run the script in a sandbox, which provides a limited set of global methods and
 * objects.
 */
function runInSandbox(visPath: string): IVisualization {
    let pathDiff = path.relative(__dirname, visPath);
    let sandbox = {
        /**
         * User scripts may not require built-in Node modules for security reasons, but may be used to load local
         * scripts and also the skqw-utils library module.
         */
        require: (moduleName) => {
            if (isBuiltInModule(moduleName)) {
                console.warn(`Cannot require module ${moduleName} from a visualization script.`)
            } else if (moduleName === SKQW_UTILS_MODULE_NAME) {
                return skqwUtils;
            } else {
                return nativeRequire(path.join(pathDiff, moduleName));
            }
        },
        console: {
            log: (message: any, ...args: any[]) => console.log(message, ...args),
            warn: (message: any, ...args: any[]) => console.warn(message, ...args),
            error: (message: any, ...args: any[]) => console.error(message, ...args),
        },
        module: {}
    };
    let filename = path.join(visPath, 'index.js');
    let options = {
        filename,
        timeout: 5000
    };
    let data = fs.readFileSync(filename);
    return vm.runInNewContext(data, sandbox, options);
}

@Injectable()
export class Loader {

    private library: {
        name: string;
        path: string;
        // TODO: implement a hash for use in presets etc.
        hash?: string;
    }[] = [];
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
        this.library = [{
            name: defaultVis.name,
            path: ''
        }];

        this.flushVisCache();

        fs.readdirSync(this.visPath).forEach(p => {
            try {
                if (!isDir(p) || !hasIndex(p)) {
                    return;
                }
                let visPath = path.join(this.visPath, p);
                let vis = runInSandbox(visPath);
                if (isVisObject(vis)) {
                    // TODO: check for duplicate names and error if found.
                    this.library.push({
                        name: vis.name,
                        path: visPath
                    });
                }
            } catch (e) {
                console.error(`Failed to load index.js in folder "${p}":`);
                console.error(e);
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
        if (id === 0) {
            return defaultVis;
        } else if (1 <= id && id < this.library.length) {
            let vis = runInSandbox(this.library[id].path);
            return this.normalizeParams(vis);
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
     * Ensure the parameters contain the expected data, and clone the object to eliminate
     * references when the user changes params.
     */
    private normalizeParams(vis: IVisualization): IVisualization {
        const params = Object.assign({}, vis.params);
        for(let paramName in params) {
            if (params.hasOwnProperty(paramName)) {
                params[paramName] = this.normalizeParam(params[paramName]);
            }
        }
        vis.params = params;
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
            if (param.step === undefined) {
                param.step = 1;
            }
        }
        return param;
    }
}
