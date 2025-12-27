// ApiService scaffold
// - Central HTTP wrapper over HttpClient
// - Should support options: { skeletonKey?, noLoading?, encrypt?: boolean }
// - Map errors to a common shape

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // TODO: configure baseUrl via environment
  private baseUrl = '/api';

  constructor(private http: HttpClient, private loading: LoadingService) {}

  request<T>(method: string, path: string, body?: any, options?: { headers?: HttpHeaders; noLoading?: boolean; skeletonKey?: string }): Observable<T> {
    // Integrate LoadingService via simple show/hide around the HTTP call
    const url = `${this.baseUrl}${path}`;
    const loadingKey = options?.skeletonKey || '__global__';
    const noLoading = options?.noLoading === true;

    const run = () => {
      switch (method.toLowerCase()) {
        case 'get':
          return this.http.get<T>(url, { headers: options?.headers });
        case 'post':
          return this.http.post<T>(url, body, { headers: options?.headers });
        case 'put':
          return this.http.put<T>(url, body, { headers: options?.headers });
        case 'delete':
          return this.http.delete<T>(url, { headers: options?.headers });
        default:
          throw new Error('Unsupported method');
      }
    };

    const obs = run();
    if (noLoading) return obs;

    this.loading.show(loadingKey);
    return (obs as Observable<T>).pipe(
      finalize(() => this.loading.hide(loadingKey))
    );
  }
}
