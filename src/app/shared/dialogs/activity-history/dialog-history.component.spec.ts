import { describe, it, expect } from 'vitest';
import { ActivityHistoryDialogComponent } from './dialog-history.component';
import { ActivityLogService } from '../../../core/services/activity-log.service';

describe('ActivityHistoryDialogComponent', () => {
  it('shows events from log', () => {
    const log = new ActivityLogService();
    log.clear();
    log.add({ type: 'deactivate', user: 'u1', catalogId: 'c1', catalogName: 'C1', meta: { before: { active: true }, after: { active: false } } });
    const comp = new ActivityHistoryDialogComponent(log as any, { close: () => {} } as any);
    comp.ngOnInit();
    // data should reflect the added event
    expect(comp.data.length).toBeGreaterThan(0);
    expect(comp.data[0].type).toBe('deactivate');
  });
});