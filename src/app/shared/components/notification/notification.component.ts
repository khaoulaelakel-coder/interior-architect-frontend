import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
    notifications: Notification[] = [];
    private subscription: Subscription;

    constructor(private notificationService: NotificationService) {
        this.subscription = this.notificationService.notifications$.subscribe(
            notifications => this.notifications = notifications
        );
    }

    ngOnInit(): void { }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    removeNotification(id: number): void {
        this.notificationService.removeNotification(id);
    }

    getNotificationClass(type: string): string {
        switch (type) {
            case 'success':
                return 'bg-green-500 border-green-600';
            case 'error':
                return 'bg-red-500 border-red-600';
            case 'warning':
                return 'bg-yellow-500 border-yellow-600';
            case 'info':
                return 'bg-blue-500 border-blue-600';
            default:
                return 'bg-gray-500 border-gray-600';
        }
    }

    getIcon(type: string): string {
        switch (type) {
            case 'success':
                return 'M5 13l4 4L19 7';
            case 'error':
                return 'M6 18L18 6M6 6l12 12';
            case 'warning':
                return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z';
            case 'info':
                return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
            default:
                return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        }
    }
}
