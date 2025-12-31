import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    const logger = this.injector.get(LoggerService);
    const snack = this.injector.get(MatSnackBar, null);

    logger.error('Unhandled error:', error);

    // show user friendly message
    if (snack) snack.open('Ha ocurrido un error. Revisa la consola para más detalles.', 'OK', { duration: 6000 });

    // rethrow if needed or swallow
    // throw error;
  }
}
