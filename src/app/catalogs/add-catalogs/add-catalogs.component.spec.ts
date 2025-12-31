import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddCatalogsComponent } from './add-catalogs.component';
import { CatalogsService } from '../catalogs.service';
import { of } from 'rxjs';

const mockData = [
  { id: '1', name: 'A', description: 'desc', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastModifiedBy: 'u1', active: true },
  { id: '2', name: 'B', description: 'desc', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastModifiedBy: 'u2', active: true }
];

describe('AddCatalogsComponent', () => {
  let svc: CatalogsService;
  let comp: AddCatalogsComponent;

  beforeEach(() => {
    svc = new CatalogsService();
    // override list to return known mock
    vi.spyOn(svc, 'list').mockReturnValue(of(mockData));
    comp = new AddCatalogsComponent(svc as any, { open: () => ({ afterClosed: () => of(null) }) } as any);
    comp.ngOnInit();
  });

  it('loads data on init', () => {
    expect(comp.dataSource.data.length).toBe(2);
    // default filter is empty
    expect(comp.dataSource.filteredData.length).toBe(2);
  });

  it('applyFilter filters by name', () => {
    comp.applyFilter('A');
    expect(comp.dataSource.filteredData.length).toBe(1);
    expect(comp.dataSource.filteredData[0].name).toBe('A');
  });

  it('openEdit triggers dialog and calls update when closed with data and shows snackbar', done => {
    const dialogRef = { afterClosed: () => of({ name: 'Changed', description: 'X' }) } as any;
    const mockDialog = { open: () => dialogRef } as any;
    const snack = { open: vi.fn() } as any;
    const spyUpdate = vi.spyOn(svc, 'update').mockReturnValue(of({ ...mockData[0], name: 'Changed' }));
    comp = new AddCatalogsComponent(svc as any, mockDialog as any, snack as any, { instant: (k: string, f?: string) => 'Catalog "Changed" updated.' } as any, { add: () => {} } as any);
    comp.openEdit(mockData[0] as any);
    setTimeout(() => {
      expect(spyUpdate).toHaveBeenCalled();
      expect(snack.open).toHaveBeenCalled();
      done();
    }, 10);
  });

  it('toggleActive deactivates with confirmation and allows undo', done => {
    // mock dialog confirm true
    const dialogRef = { afterClosed: () => of(true) } as any;
    const mockDialog = { open: () => dialogRef } as any;

    // mock snack open returns object with onAction
    const actionSubject: any = { sub: null };
    const onActionSub = { subscribe: (cb: any) => { actionSubject.sub = cb; return { unsubscribe() {} }; } };
    const snack = { open: vi.fn(() => ({ onAction: () => onActionSub })) } as any;

    const spyToggle = vi.spyOn(svc, 'toggleActive').mockReturnValueOnce(of({ ...mockData[0], active: false })).mockReturnValueOnce(of({ ...mockData[0], active: true }));

    comp = new AddCatalogsComponent(svc as any, mockDialog as any, snack as any, { instant: (k: string) => k } as any, { add: vi.fn() } as any);

    comp.toggleActive(mockData[0] as any);

    setTimeout(() => {
      expect(spyToggle).toHaveBeenCalled();
      expect(snack.open).toHaveBeenCalled();

      // simulate Undo pressed
      actionSubject.sub();

      setTimeout(() => {
        expect(spyToggle).toHaveBeenCalledTimes(2);
        done();
      }, 10);
    }, 10);
  });
});
