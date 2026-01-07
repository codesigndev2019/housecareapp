import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Recipe } from '../models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeCardComponent {
  /** The recipe to display */
  recipe = input.required<Recipe>();

  /** Whether to show action buttons */
  showActions = input<boolean>(true);

  /** Emits when view is requested */
  view = output<Recipe>();

  /** Emits when edit is requested */
  edit = output<Recipe>();

  /** Emits when toggle active is requested */
  toggleActive = output<Recipe>();

  onView(): void {
    this.view.emit(this.recipe());
  }

  onEdit(): void {
    this.edit.emit(this.recipe());
  }

  onToggleActive(): void {
    this.toggleActive.emit(this.recipe());
  }
}
