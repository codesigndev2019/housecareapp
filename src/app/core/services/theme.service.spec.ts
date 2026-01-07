import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

// Mock matchMedia for tests
const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
});

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Clear localStorage and reset document before each test
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('light-theme', 'dark-theme');

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => mockMatchMedia(false))
    });

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('light-theme', 'dark-theme');
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have a current theme', () => {
      expect(['light', 'dark']).toContain(service.current);
    });

    it('should apply theme to document', () => {
      const theme = document.documentElement.getAttribute('data-theme');
      expect(['light', 'dark']).toContain(theme);
    });
  });

  describe('current', () => {
    it('should return the current theme', () => {
      const theme = service.current;
      expect(theme).toBeDefined();
      expect(['light', 'dark']).toContain(theme);
    });
  });

  describe('isDark', () => {
    it('should return true when theme is dark', () => {
      service.setTheme('dark');
      expect(service.isDark).toBe(true);
    });

    it('should return false when theme is light', () => {
      service.setTheme('light');
      expect(service.isDark).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', async () => {
      service.setTheme('light');
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();

      expect(service.current).toBe('light');
      expect(localStorage.getItem('app_theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.body.classList.contains('light-theme')).toBe(true);
    });

    it('should set theme to dark', async () => {
      service.setTheme('dark');
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();

      expect(service.current).toBe('dark');
      expect(localStorage.getItem('app_theme')).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.body.classList.contains('dark-theme')).toBe(true);
    });

    it('should persist theme preference in localStorage', () => {
      service.setTheme('dark');
      expect(localStorage.getItem('app_theme')).toBe('dark');

      service.setTheme('light');
      expect(localStorage.getItem('app_theme')).toBe('light');
    });

    it('should remove previous theme class when changing', async () => {
      service.setTheme('light');
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();
      expect(document.body.classList.contains('light-theme')).toBe(true);

      service.setTheme('dark');
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();
      expect(document.body.classList.contains('light-theme')).toBe(false);
      expect(document.body.classList.contains('dark-theme')).toBe(true);
    });
  });

  describe('toggle', () => {
    it('should toggle from light to dark', async () => {
      service.setTheme('light');
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();

      service.toggle();
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();

      expect(service.current).toBe('dark');
      expect(service.isDark).toBe(true);
    });

    it('should toggle from dark to light', async () => {
      service.setTheme('dark');
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();

      service.toggle();
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();

      expect(service.current).toBe('light');
      expect(service.isDark).toBe(false);
    });

    it('should update localStorage when toggling', async () => {
      service.setTheme('light');
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();

      service.toggle();
      vi.advanceTimersByTime(400);
      await vi.runAllTimersAsync();

      expect(localStorage.getItem('app_theme')).toBe('dark');
    });
  });

  describe('localStorage persistence', () => {
    it('should load saved theme from localStorage', () => {
      // Create a new service instance that should read from localStorage
      localStorage.setItem('app_theme', 'dark');
      
      // Recreate the service with mocked matchMedia
      TestBed.resetTestingModule();
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => mockMatchMedia(false))
      });
      
      TestBed.configureTestingModule({
        providers: [ThemeService]
      });
      
      const newService = TestBed.inject(ThemeService);
      expect(newService.current).toBe('dark');
    });
  });
});
