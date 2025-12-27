import { Component, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nTextDirective } from '../../core/i18n/i18n-text.directive';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FLAGS } from '../../shared/constants/flags';

@Component({
  selector: 'app-internal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule, MatSlideToggleModule, TranslatePipe, I18nTextDirective],
  templateUrl: './internal-layout.component.html',
  styleUrls: ['./internal-layout.component.scss']
})
export class InternalLayoutComponent {
  opened = true;
  FLAGS = FLAGS;

  private themeService = inject(ThemeService, { optional: true });
  private i18n = inject(I18nService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  isActive(path: string) {
    try {
      return this.router.isActive(path, false);
    } catch {
      return false;
    }
  }

  async setLanguage(lang: string) {
    await this.i18n.set(lang);
  }

  currentLanguage() {
    return this.i18n.getCurrent();
  }

  setTheme(kind: 'dark' | 'light') {
    if (this.themeService) {
      this.themeService.setTheme(kind);
    }
  }

  isDark() {
    return this.themeService?.isDark ?? false;
  }

  getFlagSvg(lang: string): SafeHtml {
    const svgString = FLAGS[lang as keyof typeof FLAGS] || '';
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }
}
