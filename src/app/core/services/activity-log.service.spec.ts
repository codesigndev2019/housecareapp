import { describe, it, expect } from 'vitest';
import { ActivityLogService } from './activity-log.service';

describe('ActivityLogService', () => {
  it('adds and lists events', () => {
    const svc = new ActivityLogService();
    svc.clear();
    expect(svc.list().length).toBe(0);
    const ev = svc.add({ type: 'deactivate', user: 'u1', catalogId: 'c1', catalogName: 'C1' });
    expect(ev.id).toBeDefined();
    expect(svc.list().length).toBe(1);
  });
});