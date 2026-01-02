import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Input() showActions = true;

  @Output() view = new EventEmitter<Recipe>();
  @Output() edit = new EventEmitter<Recipe>();
  @Output() toggleActive = new EventEmitter<Recipe>();

  onView() {
    this.view.emit(this.recipe);
  }

  onEdit() {
    this.edit.emit(this.recipe);
  }

  onToggleActive() {
    this.toggleActive.emit(this.recipe);
  }
}
