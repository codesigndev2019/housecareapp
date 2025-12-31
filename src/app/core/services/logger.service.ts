import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  debugEnabled = !!localStorage.getItem('debug');

  constructor(private snack?: MatSnackBar) {}

  log(...args: any[]) { if (this.debugEnabled) console.log(...args); }
  info(...args: any[]) { console.info(...args); }
  warn(...args: any[]) { console.warn(...args); }
  error(...args: any[]) { console.error(...args); }
  debug(...args: any[]) { if (this.debugEnabled) console.debug(...args); }

  notifyError(message: string) {
    if (this.snack) this.snack.open(message, 'OK', { duration: 6000 });
  }
}
