// Enhanced ThemeService with modern theme management
// - Smooth theme transitions
// - Persist preference in localStorage  
// - Proper CSS variable handling
// - System theme detection

import { Injectable, signal } from '@angular/core';

const THEME_KEY = 'app_theme';
type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme = signal<Theme>('light');

  constructor() {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.currentTheme.set(initialTheme);
    this.applyTheme(initialTheme);
  }

  get current(): Theme {
    return this.currentTheme();
  }

  get isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  toggle(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(THEME_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    // Remove any existing theme classes/attributes
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // Apply new theme
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add(`${theme}-theme`);
    
    // Add smooth transition for theme change
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Remove transition after animation completes
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 300);
  }
}
