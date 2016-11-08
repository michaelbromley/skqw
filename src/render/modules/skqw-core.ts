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
 * Creates the module that is returned by calling `require('skqw-core')`. Provides the core API for
 * building a visualization.
 */
export function createCoreModule(canvasService: CanvasService, pathDiff: string) {
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
            let data = fs.readFileSync(path.join(__dirname, pathDiff, filename));
            vm.runInThisContext(data, { filename });
        }
    }
}
