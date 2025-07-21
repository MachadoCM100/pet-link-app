import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private notificationIdCounter = 0;

  constructor() {}

  /**
   * Get observable of all notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Show success notification
   */
  showSuccess(message: string, duration: number = 5000): void {
    this.addNotification('success', message, duration);
  }

  /**
   * Show error notification
   */
  showError(message: string, duration: number = 7000): void {
    this.addNotification('error', message, duration);
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, duration: number = 6000): void {
    this.addNotification('warning', message, duration);
  }

  /**
   * Show info notification
   */
  showInfo(message: string, duration: number = 4000): void {
    this.addNotification('info', message, duration);
  }

  /**
   * Remove a specific notification
   */
  removeNotification(id: string): void {
    const current = this.notifications$.value;
    const updated = current.filter(n => n.id !== id);
    this.notifications$.next(updated);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications$.next([]);
  }

  private addNotification(type: Notification['type'], message: string, duration?: number): void {
    const notification: Notification = {
      id: (++this.notificationIdCounter).toString(),
      type,
      message,
      duration,
      timestamp: new Date()
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    // Auto-remove notification after duration
    if (duration && duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }
}
