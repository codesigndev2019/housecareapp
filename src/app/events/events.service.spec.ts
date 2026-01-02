import { TestBed } from '@angular/core/testing';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsService);
  });

  it('should create and list an event', (done) => {
    service.create({ name: 'Test', date: '2023-01-01', time: '10:00' }).subscribe(created => {
      expect(created.name).toBe('Test');
      service.list().subscribe(list => {
        expect(list.some(i => i.id === created.id)).toBeTrue();
        done();
      });
    });
  });
});
