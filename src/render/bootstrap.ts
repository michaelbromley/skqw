import {bootstrap} from '@angular/platform-browser-dynamic';
import {App} from './app.component';
import {Loader} from './providers/loader.service';

bootstrap(App, [Loader]); 