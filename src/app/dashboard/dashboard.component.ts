import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { EventsService } from '../events/events.service';
import { RecipesService } from '../recipes/recipes.service';
import { ChoresService } from '../chores/chores.service';
import { Observable, map } from 'rxjs';
import { EventItem } from '../events/models/event.model';
import { Recipe } from '../recipes/models/recipe.model';
import { Chore } from '../chores/models/chore.model';
import { EventCardComponent } from '../events/event-card/event-card.component';
import { RecipeCardComponent } from '../recipes/recipe-card/recipe-card.component';
import { ChoreCardComponent } from '../chores/chore-card/chore-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
    EventCardComponent,
    RecipeCardComponent,
    ChoreCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  events$: Observable<EventItem[]>;
  recipes$: Observable<Recipe[]>;
  chores$: Observable<Chore[]>;

  constructor(
    private events: EventsService,
    private recipes: RecipesService,
    private choresService: ChoresService
  ) {
    const now = new Date();
    const startOfWeek = DashboardComponent.startOfWeek(now);
    const endOfWeek = DashboardComponent.endOfWeek(now);

    this.events$ = this.events.list().pipe(
      map(arr => arr.filter(e => {
        const dt = new Date(`${e.date}T${e.time || '00:00'}`);
        return dt >= startOfWeek && dt <= endOfWeek;
      }).slice(0, 5))
    );

    this.recipes$ = this.recipes.list().pipe(
      map(arr => arr.filter(r => {
        if (!r.scheduledAt) return false;
        const dt = new Date(r.scheduledAt);
        return dt >= startOfWeek && dt <= endOfWeek;
      }).slice(0, 5))
    );

    this.chores$ = this.choresService.list().pipe(
      map(arr => arr.filter(c => !c.completed).slice(0, 5))
    );
  }

  ngOnInit(): void {}

  onToggleChore(chore: Chore) {
    this.choresService.toggleCompleted(chore.id).subscribe();
  }

  static startOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  }

  static endOfWeek(date: Date) {
    const start = DashboardComponent.startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }
}