import {bootstrap} from '@angular/platform-browser-dynamic';
import {App} from './app.component';
import {Loader} from './providers/loader.service';
import {State} from './providers/state.service.';

bootstrap(App, [Loader, State]); 