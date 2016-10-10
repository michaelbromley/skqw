import {Component, Input, EventEmitter, Output} from '@angular/core';

@Component({
    selector: 'library-path-selector',
    templateUrl: './library-path-selector.component.html',
    styleUrls: ['./library-path-selector.scss']
}) 
export class LibraryPathSelector { 
    @Input() library: { id: number; name: string; }[];
    @Input() libraryDir: string;
    @Output() selectLibraryDir = new EventEmitter<boolean>();
}
  