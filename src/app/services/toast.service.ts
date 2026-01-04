// src/app/shared/services/toast.service.ts

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;  // if undefined → manual dismiss only (click to close)
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  private idCounter = 0;

  // Default: Auto-dismiss after 4 seconds
  show(message: string, type: ToastType = 'info') {
    this.toastSubject.next({
      id: ++this.idCounter,
      message,
      type,
      duration: 4000  // 4 seconds
    });
  }

  // Manual dismiss: Stays until user clicks it
  show_wClick(message: string, type: ToastType = 'info') {
    this.toastSubject.next({
      id: ++this.idCounter,
      message,
      type,
      duration: undefined  // No auto-dismiss → requires click
    });
  }

  // Convenience methods
  info(message: string) {
    this.show(message, 'info');
  }

  info_wClick(message: string) {
    this.show_wClick(message, 'info');
  }

  success(message: string) {
    this.show(message, 'success');
  }

  success_wClick(message: string) {
    this.show_wClick(message, 'success');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  warning_wClick(message: string) {
    this.show_wClick(message, 'warning');
  }

  error(message: string) {
    this.show_wClick(message, 'error'); // Errors usually stay until clicked
  }

  error_wClick(message: string) {
    this.show_wClick(message, 'error');
  }
}