import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { EventsService } from '../events/events.service';
import { RecipesService } from '../recipes/recipes.service';
import { ChoresService } from '../chores/chores.service';
import { BudgetService } from '../budget/budget.service';
import { Observable, map } from 'rxjs';
import { EventItem } from '../events/models/event.model';
import { Recipe } from '../recipes/models/recipe.model';
import { Chore } from '../chores/models/chore.model';
import { BudgetSummary, CURRENCIES } from '../budget/models/budget.model';
import { EventCardComponent } from '../events/event-card/event-card.component';
import { RecipeCardComponent } from '../recipes/recipe-card/recipe-card.component';
import { ChoreCardComponent } from '../chores/chore-card/chore-card.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { I18nService } from '../core/i18n/i18n.service';

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
    ChoreCardComponent,
    BaseChartDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly budgetService = inject(BudgetService);
  private readonly i18n = inject(I18nService);

  events$: Observable<EventItem[]>;
  recipes$: Observable<Recipe[]>;
  chores$: Observable<Chore[]>;
  budgetSummary$: Observable<BudgetSummary>;

  // Chart configuration
  readonly chartType = 'doughnut' as const;
  chartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#4caf50', '#f44336'],
      hoverBackgroundColor: ['#66bb6a', '#ef5350'],
      borderWidth: 0
    }]
  };
  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            return ` $${(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    cutout: '60%'
  };

  // Bar chart for detailed view
  readonly barChartType = 'bar' as const;
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return ` $${(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`
        }
      }
    }
  };

  constructor(
    private events: EventsService,
    private recipesService: RecipesService,
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

    this.recipes$ = this.recipesService.list().pipe(
      map(arr => arr.filter(r => {
        if (!r.scheduledAt) return false;
        const dt = new Date(r.scheduledAt);
        return dt >= startOfWeek && dt <= endOfWeek;
      }).slice(0, 5))
    );

    this.chores$ = this.choresService.list().pipe(
      map(arr => arr.filter(c => !c.completed).slice(0, 5))
    );

    this.budgetSummary$ = this.budgetService.getSummary('USD');
  }

  ngOnInit(): void {
    this.loadBudgetChart();
  }

  private loadBudgetChart(): void {
    this.budgetService.getSummary('USD').subscribe(summary => {
      const incomeLabel = this.i18n.instant('budget.income', 'Income');
      const expenseLabel = this.i18n.instant('budget.expense', 'Expenses');

      // Doughnut chart data
      this.chartData = {
        labels: [incomeLabel, expenseLabel],
        datasets: [{
          data: [summary.totalIncome, summary.totalExpenses],
          backgroundColor: ['#4caf50', '#f44336'],
          hoverBackgroundColor: ['#66bb6a', '#ef5350'],
          borderWidth: 0
        }]
      };

      // Bar chart data
      this.barChartData = {
        labels: [incomeLabel, expenseLabel],
        datasets: [{
          data: [summary.totalIncome, summary.totalExpenses],
          backgroundColor: ['#4caf50', '#f44336'],
          hoverBackgroundColor: ['#66bb6a', '#ef5350'],
          borderRadius: 8
        }]
      };
    });
  }

  onToggleChore(chore: Chore) {
    this.choresService.toggleCompleted(chore.id).subscribe();
  }

  getCurrencySymbol(): string {
    return CURRENCIES.find(c => c.value === 'USD')?.symbol || '$';
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