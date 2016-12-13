import {CanvasService} from '../providers/canvas.service';
import {ISample} from '../../common/models';
import {SAMPLE} from '../../common/constants';
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
export function createCoreModule(canvasService: CanvasService, visPath: string) {
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
            let data = fs.readFileSync(path.join(visPath, filename));
            vm.runInThisContext(data, { filename });
        }
    }
}
