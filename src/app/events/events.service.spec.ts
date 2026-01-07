import { TestBed } from '@angular/core/testing';
import { EventsService } from './events.service';
import { firstValueFrom } from 'rxjs';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsService);
  });

  it('should create and list an event', async () => {
    const created = await firstValueFrom(
      service.create({ name: 'Test', date: '2023-01-01', time: '10:00' })
    );
    expect(created.name).toBe('Test');

    const list = await firstValueFrom(service.list());
    expect(list.some(i => i.id === created.id)).toBe(true);
  });
});
