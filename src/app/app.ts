import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private i18n = inject(I18nService);

  ngOnInit() {
    console.log('App component initialized, I18nService current language:', this.i18n.getCurrent());
  }
}
