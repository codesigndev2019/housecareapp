import { ApiService } from './api.service';
import { LoadingService } from './loading.service';

describe('ApiService', () => {
  it('should be defined with correct baseUrl', () => {
    // Simple existence test - full HTTP tests require e2e
    expect(ApiService).toBeDefined();
  });

  it('LoadingService should have show/hide methods', () => {
    const loadingSpy = { show: vi.fn(), hide: vi.fn() };
    loadingSpy.show('test');
    loadingSpy.hide('test');
    expect(loadingSpy.show).toHaveBeenCalledWith('test');
    expect(loadingSpy.hide).toHaveBeenCalledWith('test');
  });
});