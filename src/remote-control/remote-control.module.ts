import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RemoteControlComponent} from './remote-control.component';
import {
    MdButtonModule, MdIconModule, MdListModule, MdMenuModule, MdSelectModule, MdSliderModule,
    MdSlideToggleModule
} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {VSelector} from '../render/components/v-selector/v-selector.component';
import {ParameterControls} from '../render/components/parameter-controls/parameter-controls.component';
import {SettingsGroup} from '../render/components/settings-group/settings-group.component';
import {InputSelector} from '../render/components/input-selector/input-selector.component';
import {State} from '../render/providers/state.service.';
import {Loader} from '../render/providers/loader.service';
import {CanvasService} from '../render/providers/canvas.service';
import {LibraryService} from '../render/providers/library.service';
import {NotificationService} from '../render/providers/notification.service';
import {VisualizationService} from '../render/providers/visualization.service';
import 'hammerjs';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MdSliderModule,
        MdButtonModule,
        MdSelectModule,
        MdListModule,
        MdIconModule,
        MdSlideToggleModule,
        MdMenuModule
    ],
    declarations: [
        RemoteControlComponent,
        VSelector,
        ParameterControls,
        SettingsGroup,
        InputSelector
    ],
    providers: [State, Loader, CanvasService, LibraryService, NotificationService, VisualizationService],
    bootstrap: [RemoteControlComponent]
})
export class RemoveControlModule {}
