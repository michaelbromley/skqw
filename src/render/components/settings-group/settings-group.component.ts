import {Component, ElementRef, Input, ViewChild} from '@angular/core';

@Component({
    selector: 'settings-group',
    template: require('./settings-group.component.html'),
    styles: [require('./settings-group.scss').toString()]
})

export class SettingsGroup {
    @Input() groupTitle: string;
    @Input() visible: boolean = false;
    @ViewChild('wrapper') wrapper: ElementRef;
    private contentHeight: number = 0;
    private icon_caret = require('!!svg-inline!../../../assets/icons/keyboard_arrow_down.svg');

    ngAfterViewInit(): void {
        if (this.visible) {
            setTimeout(() => this.contentHeight = outerHeight(this.wrapper.nativeElement), 10);
        }
    }
    
    toggle(): void {
        if (this.visible) {
            this.contentHeight = 0;
            this.visible = false;
        } else {
            this.contentHeight = outerHeight(this.wrapper.nativeElement);
            this.visible = true;
        }
    }
}

/**
 * Returns the height of an element including padding and margins.
 */
function outerHeight(element: HTMLElement): number {
    let style = window.getComputedStyle(element);
    let height = element.offsetHeight;
    let margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    let padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    let border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    return height + margin + padding + border + 10;
}

