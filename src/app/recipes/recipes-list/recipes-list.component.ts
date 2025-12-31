import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Recipe } from '../models/recipe.model';
import { RecipeViewDialogComponent } from '../recipe-view-dialog/recipe-view-dialog.component';
import { RecipeEditDialogComponent } from '../recipe-edit-dialog/recipe-edit-dialog.component';
import { RecipesService } from '../recipes.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, TranslatePipe],
  templateUrl: './recipes-list.component.html',
  styleUrls: ['./recipes-list.component.scss']
})
export class RecipesListComponent {
  recipes$: Observable<Recipe[]>;

  constructor(private dialog: MatDialog, private service: RecipesService) {
    this.recipes$ = this.service.list();
  }

  openView(recipe: Recipe) {
    this.dialog.open(RecipeViewDialogComponent, { data: { recipe }, width: '720px' });
  }

  openEdit(recipe?: Recipe) {
    const ref = this.dialog.open(RecipeEditDialogComponent, { data: { recipe }, width: '720px' });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        if (recipe && recipe.id) {
          this.service.update(recipe.id, result).subscribe(() => {});
        } else {
          this.service.create(result).subscribe(() => {});
        }
      }
    });
  }

  toggleActive(recipe: Recipe) {
    this.service.toggleActive(recipe.id).subscribe();
  }
}
