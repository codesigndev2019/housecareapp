import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MatButtonModule } from '@angular/material/button';
import { Recipe } from '../models/recipe.model';

@Component({
  selector: 'app-recipe-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe],
  templateUrl: './recipe-view-dialog.component.html',
  styleUrls: ['./recipe-view-dialog.component.scss']
})
export class RecipeViewDialogComponent {
  recipe: Recipe | null = null;

  constructor(
    private dialogRef: MatDialogRef<RecipeViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.recipe = this.data?.recipe;
  }

  close() { this.dialogRef.close(); }
}
