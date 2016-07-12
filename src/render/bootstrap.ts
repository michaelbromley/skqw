import {bootstrap} from '@angular/platform-browser-dynamic';
import {App} from './app.component';
import {Loader} from './providers/loader.service';
import {State} from './providers/state.service.';
import {NotificationService} from './providers/notification.service';

bootstrap(App, [Loader, State, NotificationService]);