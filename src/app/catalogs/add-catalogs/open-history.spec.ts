import { describe, it, expect, vi } from 'vitest';
import { AddCatalogsComponent } from './add-catalogs.component';
import { CatalogsService } from '../catalogs.service';
import { of } from 'rxjs';

const mockData = [
  { id: '1', name: 'A', description: 'desc', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastModifiedBy: 'u1', active: true }
];

describe('AddCatalogsComponent - history open', () => {
  it('openHistory opens ActivityHistoryDialog', () => {
    const svc = new CatalogsService();
    vi.spyOn(svc, 'list').mockReturnValue(of(mockData));
    const mockDialog = { open: vi.fn() } as any;
    const comp = new AddCatalogsComponent(svc as any, mockDialog as any, { open: () => {} } as any, { instant: (k: string) => k } as any, { add: () => {} } as any);
    comp.openHistory();
    expect(mockDialog.open).toHaveBeenCalled();
  });
});