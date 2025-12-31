import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-recipe-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatSlideToggleModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, TranslatePipe],
  templateUrl: './recipe-edit-dialog.component.html',
  styleUrls: ['./recipe-edit-dialog.component.scss']
})
export class RecipeEditDialogComponent {
  form: FormGroup;

  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RecipeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      ingredients: [''],
      preparation: [''],
      images: [[]], // array of data URLs or urls
      scheduleToggle: [false],
      scheduledAt: ['']
    });

    if (data?.recipe) {
      this.isEdit = true;
      const existingImages = data.recipe.images || [];
      // map recipe fields
      this.form.patchValue({
        name: data.recipe.name,
        ingredients: data.recipe.ingredients || '',
        preparation: data.recipe.preparation || '',
        images: existingImages,
        scheduleToggle: !!data.recipe.scheduledAt,
        scheduledAt: data.recipe.scheduledAt || ''
      });
      // Sync previews with existing images
      this.previews = [...existingImages];
    }
  }

  imageErrors: string[] = [];
  previews: string[] = [];

  save() {
    // validate images count
    this.imageErrors = [];
    const imgs: string[] = this.form.value.images || [];

    if (imgs.length > 2) {
      this.imageErrors.push('recipes.imagesTooMany');
    }

    if (this.form.value.scheduleToggle && !this.form.value.scheduledAt) {
      // invalid schedule
      this.form.get('scheduledAt')?.setErrors({ required: true });
    }

    if (this.form.valid && this.imageErrors.length === 0) {
      const payload = { ...this.form.value };
      // normalize scheduledAt
      if (!payload.scheduleToggle) payload.scheduledAt = null;
      this.dialogRef.close(payload);
    }
  }

  close() { this.dialogRef.close(); }

  onFilesSelected(ev: Event) {
    this.imageErrors = [];
    const input = ev.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    if (files.length > 2) {
      this.imageErrors.push('recipes.imagesTooMany');
      return;
    }

    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    const readers: Promise<string>[] = [];

    for (const f of files) {
      if (!allowed.includes(f.type)) {
        this.imageErrors.push('recipes.imagesInvalidType');
        continue;
      }
      readers.push(new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as string);
        fr.onerror = rej;
        fr.readAsDataURL(f);
      }));
    }

    Promise.all(readers).then((dataUrls) => {
      this.previews = dataUrls;
      this.form.patchValue({ images: dataUrls });
    }).catch(() => {
      this.imageErrors.push('recipes.imagesReadError');
    });
  }

  removePreview(i: number) {
    const arr: string[] = this.form.value.images || [];
    arr.splice(i, 1);
    this.previews.splice(i, 1);
    this.form.patchValue({ images: arr });
  }
}
