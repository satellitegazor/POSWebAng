// src/app/shared/components/toast/toast.component.ts
import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage, ToastType } from '../../services/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  imports: [CommonModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);

      // Auto-remove if duration is set
      if (toast.duration) {
        setTimeout(() => {
          this.remove(toast);
        }, toast.duration);
      }
    });
  }

  remove(toast: ToastMessage) {
    this.toasts = this.toasts.filter(t => t.id !== toast.id);
  }

  getToastClass(type: ToastType): string {
    switch (type) {
      case 'success':
      case 'info':
        return 'bg-success text-white';
      case 'warning':
        return 'bg-warning text-dark';
      case 'error':
        return 'bg-danger text-white';
      default:
        return 'bg-primary text-white';
    }
  }
}