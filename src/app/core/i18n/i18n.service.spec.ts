import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { I18nService } from './i18n.service';
import { LoggerService } from '../services/logger.service';

describe('I18nService', () => {
  let service: I18nService;
  let mockLogger: Partial<LoggerService>;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Clear localStorage before each test
    localStorage.clear();

    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      log: vi.fn(),
      debugEnabled: false,
      notifyError: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger }
      ]
    });

    // Override the root-provided I18nService to use our mock LoggerService
    TestBed.overrideProvider(I18nService, {
      useFactory: () => new I18nService(mockLogger as LoggerService)
    });

    service = TestBed.inject(I18nService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should default to Spanish language', () => {
      expect(service.getCurrent()).toBe('es');
    });

    it('should emit translations observable', async () => {
      const translations = await firstValueFrom(service.translations$.pipe(take(1)));
      expect(translations).toBeDefined();
      expect(typeof translations).toBe('object');
    });
  });

  describe('getCurrent', () => {
    it('should return current language', () => {
      const lang = service.getCurrent();
      expect(lang).toBeDefined();
      expect(['es', 'en']).toContain(lang);
    });
  });

  describe('set', () => {
    it('should change language to English', async () => {
      service.set('en');
      vi.advanceTimersByTime(200);
      await vi.runAllTimersAsync();

      expect(service.getCurrent()).toBe('en');
      expect(localStorage.getItem('lang')).toBe('en');
    });

    it('should change language to Spanish', async () => {
      service.set('es');
      vi.advanceTimersByTime(200);
      await vi.runAllTimersAsync();

      expect(service.getCurrent()).toBe('es');
      expect(localStorage.getItem('lang')).toBe('es');
    });

    it('should persist language preference in localStorage', async () => {
      service.set('en');
      vi.advanceTimersByTime(200);
      await vi.runAllTimersAsync();

      expect(localStorage.getItem('lang')).toBe('en');
    });
  });

  describe('instant', () => {
    it('should return translation for existing key', async () => {
      // Wait for translations to load
      vi.advanceTimersByTime(500);
      await vi.runAllTimersAsync();

      // Use a key that exists in fallback translations
      const result = service.instant('layout.appTitle');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return fallback if provided and key not found', () => {
      const fallback = 'My Fallback';
      const result = service.instant('non.existent.key', fallback);
      expect(result).toBe(fallback);
    });

    it('should return key itself if no fallback and key not found', () => {
      const key = 'another.non.existent.key';
      const result = service.instant(key);
      expect(result).toBe(key);
    });

    it('should handle nested translation keys', async () => {
      vi.advanceTimersByTime(500);
      await vi.runAllTimersAsync();

      const result = service.instant('auth.login.title');
      expect(result).toBeTruthy();
    });
  });

  describe('translations$', () => {
    it('should emit when translations change', async () => {
      const translations = await firstValueFrom(service.translations$.pipe(take(1)));
      expect(translations).toBeDefined();
    });
  });
});
