// LoadingInterceptor scaffold
// - Auto-manage LoadingService counts for HTTP requests
// - Honor header X-No-Loading: true to suppress

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loading: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const noLoading = req.headers.get('X-No-Loading') === 'true';
    const key = req.headers.get('X-Loading-Key') || '__global__';
    if (!noLoading) this.loading.show(key);

    return next.handle(req).pipe(
      finalize(() => {
        if (!noLoading) this.loading.hide(key);
      })
    );
  }
}
