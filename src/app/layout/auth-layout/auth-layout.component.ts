import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { I18nTextDirective } from '../../core/i18n/i18n-text.directive';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { FLAGS } from '../../shared/constants/flags';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    I18nTextDirective,
    TranslatePipe
  ],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent implements OnInit {
  private i18n = inject(I18nService);
  private themeService = inject(ThemeService);
  private sanitizer = inject(DomSanitizer);
  FLAGS = FLAGS;

  ngOnInit(): void {
    // No forzar idioma, respetar la selección del usuario en localStorage
  }

  async setLanguage(lang: string) {
    await this.i18n.set(lang);
  }

  currentLanguage() {
    return this.i18n.getCurrent();
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  get isDarkTheme() {
    return this.themeService.isDark;
  }

  getFlagSvg(lang: string): SafeHtml {
    const svgString = FLAGS[lang as keyof typeof FLAGS] || '';
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }
}