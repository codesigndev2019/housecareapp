import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    service = new LoadingService();
  });

  it('should toggle loading for a key', () => {
    const key = 'test-key';
    const values: boolean[] = [];
    const sub = service.isLoading$(key).subscribe(v => values.push(v));

    service.show(key);
    service.hide(key);

    expect(values).toContain(true);
    expect(values).toContain(false);
    sub.unsubscribe();
  });

  it('should manage global loading', () => {
    service.show();
    let loading = false;
    service.isLoading$().subscribe(v => loading = v);
    expect(loading).toBe(true);
    service.hide();
  });
});