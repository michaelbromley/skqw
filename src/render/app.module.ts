import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {GainSelector} from './components/gain-selector/gain-selector.component';
import {InputSelector} from './components/input-selector/input-selector.component';
import {LibraryPathSelector} from './components/library-path-selector/library-path-selector.component';
import {Notification} from './components/notification/notification.component';
import {ParameterControls} from './components/parameter-controls/parameter-controls.component';
import {SettingsGroup} from './components/settings-group/settings-group.component';
import {SettingsPanel} from './components/settings-panel/settings-panel.component';
import {VSelector} from './components/v-selector/v-selector.component';
import {Visualizer} from './components/visualizer/visualizer.component';
import {App} from './app.component';
import {NotificationService} from './providers/notification.service';
import {State} from './providers/state.service.';
import {Loader} from './providers/loader.service';
import {CanvasService} from './providers/canvas.service';

@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [
        App,
        GainSelector,
        InputSelector,
        LibraryPathSelector,
        Notification,
        ParameterControls,
        SettingsGroup,
        SettingsPanel,
        VSelector,
        Visualizer,
    ],
    providers: [
        Loader,
        State,
        NotificationService,
        CanvasService
    ],
    bootstrap: [App]
})
export class AppModule {}
