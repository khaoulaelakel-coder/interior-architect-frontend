import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notifications = new BehaviorSubject<Notification[]>([]);
    public notifications$ = this.notifications.asObservable();
    private nextId = 1;

    showSuccess(message: string, duration: number = 5000) {
        this.addNotification({
            id: this.nextId++,
            type: 'success',
            message,
            duration
        });
    }

    showError(message: string, duration: number = 5000) {
        this.addNotification({
            id: this.nextId++,
            type: 'error',
            message,
            duration
        });
    }

    showInfo(message: string, duration: number = 5000) {
        this.addNotification({
            id: this.nextId++,
            type: 'info',
            message,
            duration
        });
    }

    showWarning(message: string, duration: number = 5000) {
        this.addNotification({
            id: this.nextId++,
            type: 'warning',
            message,
            duration
        });
    }

    private addNotification(notification: Notification) {
        const currentNotifications = this.notifications.value;
        this.notifications.next([...currentNotifications, notification]);

        // Auto-remove notification after duration
        if (notification.duration) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, notification.duration);
        }
    }

    removeNotification(id: number) {
        const currentNotifications = this.notifications.value;
        this.notifications.next(currentNotifications.filter(n => n.id !== id));
    }

    clearAll() {
        this.notifications.next([]);
    }
}
