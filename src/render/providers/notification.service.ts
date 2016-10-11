import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

/**
 * Service for displaying transient messages to the user.
 */
@Injectable()
export class NotificationService {

    messages$ = new Subject<string>();

    notify(message: string): void {
        this.messages$.next(message);
    }
}
