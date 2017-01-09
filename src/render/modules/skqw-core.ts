import {CanvasService} from '../providers/canvas.service';
import {ISample} from '../../common/models';
import {SAMPLE} from '../../common/constants';
import {Context} from 'vm';
const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const fs = require('fs');
const vm = require('vm');

let lastSample: ISample;
ipcRenderer.on(SAMPLE, (event, sample: ISample) => {
    lastSample = sample;
});

/**
 * For use by other internal modules.
 */
export function getSample(): ISample {
    return lastSample;
}

/**
 * Creates the module that is returned by calling `require('skqw-core')`. Provides the core API for
 * building a visualization.
 */
export function createCoreModule(canvasService: CanvasService, visPath: string, sandbox?: Context) {
    return {
        createCanvas(): HTMLCanvasElement {
            return canvasService.create();
        },
        getSample(): ISample {
            return lastSample
        },
        getDimensions() {
            return canvasService.getDimensions();
        },
        loadScript: function loadScript(filename: string) {
            let fullPath: string;

            if (filename.indexOf('vendor/three') === 0) {
                fullPath = path.join(__dirname, filename);
            } else {
                fullPath = path.join(visPath, filename);
            }
            let data = fs.readFileSync(fullPath);
            // TODO: try to enable this again once https://github.com/electron/electron/pull/7909 is merged
           /* if (vm.isContext(sandbox)) {
                vm.runInContext(data, sandbox, { filename });
            } else {*/
                vm.runInThisContext(data, {filename});
           // }
        }
    }
}
