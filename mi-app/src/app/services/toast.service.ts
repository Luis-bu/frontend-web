import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
  leaving: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private counter = 0;

  success(message: string) { this.add(message, 'success'); }
  error(message: string)   { this.add(message, 'error');   }

  private add(message: string, type: 'success' | 'error') {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, message, type, leaving: false }]);
    setTimeout(() => this.remove(id), 3000);
  }

  remove(id: number) {
    this.toasts.update(list => list.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, 300);
  }
}
