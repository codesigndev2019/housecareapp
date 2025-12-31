import { describe, it, expect } from 'vitest';
import { CatalogsService } from './catalogs.service';

describe('CatalogsService', () => {
  it('list returns an array of catalogs', () => {
    const svc = new CatalogsService();
    svc.list().subscribe(data => {
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  it('update modifies a catalog', () => {
    const svc = new CatalogsService();
    svc.list().subscribe(list => {
      const item = list[0];
      svc.update(item.id, { name: 'Updated' }).subscribe(updated => {
        expect(updated.name).toBe('Updated');
      });
    });
  });

  it('toggleActive flips the active flag', () => {
    const svc = new CatalogsService();
    svc.list().subscribe(list => {
      const item = list[0];
      const initial = item.active;
      svc.toggleActive(item.id).subscribe(updated => {
        expect(updated.active).toBe(!initial);
      });
    });
  });
});
