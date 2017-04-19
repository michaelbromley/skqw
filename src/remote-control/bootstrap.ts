import 'reflect-metadata';
import 'zone.js';

import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {RemoveControlModule} from './remote-control.module';

enableProdMode();
platformBrowserDynamic().bootstrapModule(RemoveControlModule);
