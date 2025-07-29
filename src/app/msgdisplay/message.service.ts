// src/app/message.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Message {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSubject = new Subject<Message | null>();

  // Observable for components to subscribe to
  message$: Observable<Message | null> = this.messageSubject.asObservable();

  constructor() { }

  /**
   * Displays an error message.
   * @param text The message text to display.
   */
  showError(text: string): void {
    this.messageSubject.next({ type: 'error', text });
    this.autoClearMessage(); // Automatically clear after a delay
  }

  /**
   * Displays a warning message.
   * @param text The message text to display.
   */
  showWarning(text: string): void {
    this.messageSubject.next({ type: 'warning', text });
    this.autoClearMessage(); // Automatically clear after a delay
  }

  /**
   * Clears the currently displayed message.
   */
  clear(): void {
    this.messageSubject.next(null);
  }

  /**
   * Automatically clears the message after a set duration.
   * You can adjust the delay as needed.
   */
  private autoClearMessage(): void {
    setTimeout(() => {
      this.clear();
    }, 5000); // Message disappears after 5 seconds
  }
}