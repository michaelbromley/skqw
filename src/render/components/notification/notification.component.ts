import {Component} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {NotificationService} from '../../providers/notification.service';

@Component({
    selector: 'notification',
    template: `<div class="notification-message" [class.visible]="visible">{{ message }}</div>`,
    styleUrls: ['./notification.scss']
})
export class Notification {
    visible: boolean = false;
    message: string = '';
    private sub: Subscription;
    private timer: any;

    constructor(private notificationService: NotificationService) {}

    ngOnInit(): void {
        this.sub = this.notificationService.messages$
            .subscribe((message: string) => {
                this.message = message;
                this.visible = true;
                clearTimeout(this.timer);
                this.timer = setTimeout(() => this.visible = false, 4000);
            });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}
