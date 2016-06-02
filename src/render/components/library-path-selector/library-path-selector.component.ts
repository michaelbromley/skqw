import {Component, Input, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'library-path-selector',
    template: require('./library-path-selector.component.html'),
    styles: [`:host { position: relative; }`, require('./library-path-selector.scss').toString()]
}) 
export class LibraryPathSelector {
    @Input() library: { id: number; name: string; }[];
    @Input() libraryDir: string;
    @Output() selectLibraryDir = new EventEmitter<boolean>();
}
  