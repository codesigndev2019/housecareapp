import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * UI utility service following Single Responsibility Principle
 * Provides common UI operations and state management
 */
@Injectable({
  providedIn: 'root'
})
export class UiUtilsService {
  
  private loading$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.loading$.asObservable();
  
  /**
   * Set global loading state
   */
  setLoading(loading: boolean): void {
    this.loading$.next(loading);
  }
  
  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    
    // Format international numbers with + prefix
    if (cleaned.length > 10) {
      return `+${cleaned}`;
    }
    
    return phone;
  }
  
  /**
   * Format date for display
   */
  formatDate(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options: Intl.DateTimeFormatOptions = {
      'short': { year: 'numeric' as const, month: 'numeric' as const, day: 'numeric' as const },
      'medium': { year: 'numeric' as const, month: 'short' as const, day: 'numeric' as const },
      'long': { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const, weekday: 'long' as const }
    }[format];
    
    return dateObj.toLocaleDateString(undefined, options);
  }
  
  /**
   * Calculate age from birth date
   */
  calculateAge(birthDate: Date | string): number {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
  
  /**
   * Generate initials from full name
   */
  getInitials(fullName: string): string {
    if (!fullName) return '';
    
    return fullName
      .split(' ')
      .filter(name => name.length > 0)
      .map(name => name[0].toUpperCase())
      .slice(0, 2) // Max 2 initials
      .join('');
  }
  
  /**
   * Truncate text with ellipsis
   */
  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
  
  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  
  /**
   * Scroll to element with smooth animation
   */
  scrollToElement(elementId: string, offset: number = 0): void {
    const element = document.getElementById(elementId);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
  
  /**
   * Check if device is mobile
   */
  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
  
  /**
   * Check if device is tablet
   */
  isTablet(): boolean {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }
  
  /**
   * Check if device is desktop
   */
  isDesktop(): boolean {
    return window.innerWidth > 1024;
  }
  
  /**
   * Get readable file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Debounce function for search inputs
   */
  debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    }) as T;
  }
  
  /**
   * Generate a random ID
   */
  generateId(prefix: string = 'id'): string {
    return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Validate if string is a valid UUID
   */
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
  
  /**
   * Focus trap utility for modals/dialogs
   */
  setupFocusTrap(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
}