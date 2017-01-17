import {Injectable} from '@angular/core';
import {Visualization, Parameter} from '../../common/models';
import {CanvasService} from './canvas.service';
import {SKQW_CORE_MODULE_NAME, SKQW_UTILS_MODULE_NAME} from '../../common/constants';
import {skqwUtils} from '../modules/skqw-utils';
import {createCoreModule} from '../modules/skqw-core';
import {Context} from 'vm';
import {LibraryService} from './library.service';
import {NotificationService} from './notification.service';

const path = require('path');
const fs = require('fs');
const vm = require('vm');
// Webpack patches the native Node require, so we need to use this instead.
const nativeRequire = (<any> global).require;

@Injectable()
export class Loader {

    constructor(private canvasService: CanvasService,
                private libraryService: LibraryService,
                private notification: NotificationService) {}

    /**
     * Load all visualizations in the library.
     * Visualizations should reside in their own folders, with the main entry point
     * named `index.js`.
     */
    loadFromPath(pathToIndexJs: string): Visualization {
        const fullPath = path.join(pathToIndexJs, 'index.js');

        try {
            if (!fs.statSync(fullPath).isFile()) {
                this.notification.notify(`Could not find "index.js" in path "${pathToIndexJs}"`);
                return;
            }

            let visualization = createSandbox(this.canvasService).run(pathToIndexJs);
            if (this.isValidVisualization(visualization)) {
                return visualization;
            } else {
                this.notification.notify(`Not a valid visualization script.`);
            }
        } catch (e) {
            console.error(`Failed to load index.js in path "${pathToIndexJs}":`);
            throw e;
        }
    }

    /**
     * Returns a visualization object given by the id (the index in the library array)
     */
    loadLibraryEntry(id: string, debugMode: boolean = false): Visualization {
        const entry = this.libraryService.getEntry(id);
        if (entry) {
            try {
                let vis = createSandbox(this.canvasService, debugMode).run(entry.path);
                return this.normalizeParams(vis);
            } catch (e) {
                this.notification.notify(e.toString());
                this.libraryService.setError(id);
            }
        } else {
            this.notification.notify(`Visualization at was not found`);
            this.libraryService.removeEntry(id);
        }
    }

    /**
     * Returns true is the candidate seems to satisfy the requirements for a Visualization.
     */
    private isValidVisualization(candidate: any): boolean {
        return (typeof candidate.name === 'string' &&
                typeof candidate.init === 'function' &&
                typeof candidate.tick === 'function');
    }

    /**
     * Ensure the parameters contain the expected data, and clone the object to eliminate
     * references when the user changes params.
     */
    private normalizeParams(vis: Visualization): Visualization {
        const params = Object.assign({}, vis.params);
        for(let paramName in params) {
            if (params.hasOwnProperty(paramName)) {
                params[paramName] = this.normalizeParam(params[paramName]);
            }
        }
        vis.params = params;
        return vis;
    }

    private normalizeParam(param: Parameter): Parameter {
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

/**
 * When we run a visualization script, we do not want to give that script access to same execution context as that
 * of the app itself. Therefore we run the script in a sandbox, which provides a limited set of global methods and
 * objects.
 */
export function createSandbox(canvasService: CanvasService, debugMode: boolean = false): { run: (filepath: string) => Visualization; } {

    return {
        run(visPath: string): Visualization {
            // return runInGlobalContext(canvasService, visPath);
            // This is the safer mode to run in, but is buggy.
            return runInVmSandbox(canvasService, visPath, debugMode);
        }
    };
}

/**
 * Runs the visualization script in a new Node vm context, to prevent scripts from polluting the global app scope.
 *
 * When debugMode === true, scripts are run the the app context (not in a sandbox) because it is not possible to use
 * the Chrome devtools to debug scripts in another context (see https://github.com/electron/electron/issues/7816).
 *
 * TODO: currently not possible to run in new context, see https://github.com/electron/electron/issues/7814
 */
function runInVmSandbox(canvasService: CanvasService, visPath: string, debugMode: boolean = false): Visualization {
    let filename = path.join(visPath, 'index.js');
    let options = {
        filename,
        timeout: 5000
    };

    let sandbox: Context;
    if (!debugMode) {
        const noop = () => {};
        sandbox = vm.createContext({
            console: {
                log: noop,
                warn: noop,
                error: noop,
                info: noop
            },
        });
    }

    let customRequire = (moduleName) => {
        if (isBuiltInModule(moduleName)) {
            console.warn(`Cannot require module "${moduleName}" from a visualization script. Access denied.`)
        } else if (moduleName === SKQW_UTILS_MODULE_NAME) {
            return skqwUtils;
        } else if (moduleName === SKQW_CORE_MODULE_NAME) {
            return createCoreModule(canvasService, visPath, sandbox);
        } else {
            let fullPath;
            if (moduleName.indexOf('vendor/three') === 0) {
                fullPath = path.join(__dirname, 'vendor/three/three');
            } else {
                fullPath = path.join(visPath, moduleName);
            }
            return nativeRequire(fullPath);
        }
    };
    let script = fs.readFileSync(filename).toString();
    let wrapped = moduleWrap(script);
    let dirname = path.dirname(filename);
    let module: any = { exports: {} };

    let compiledWrapper: any;
    // TODO: try to enable this again once https://github.com/electron/electron/pull/7909 is merged
    // if (debugMode) {
        compiledWrapper = vm.runInThisContext(wrapped, options);
    // } else {
    //    compiledWrapper = vm.runInContext(wrapped, sandbox, options);
    //}
    let args = [module.exports, customRequire, module, filename, dirname];


    try {
        compiledWrapper.apply(this, args);
    } catch (e) {
        console.error(e);
    }
    return module.exports;
}

function moduleWrap(script: string): string {
    let prefix = '(function (exports, require, module, __filename, __dirname) { ';
    let suffix = '\n});';
    return `${prefix} ${script} ${suffix}`;
}

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
