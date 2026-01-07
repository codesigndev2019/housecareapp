import { Component, Inject, signal, computed } from '@angular/core';
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
import { FileUploadComponent, FilePreview } from '../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-recipe-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    TranslatePipe,
    FileUploadComponent
  ],
  templateUrl: './recipe-edit-dialog.component.html',
  styleUrls: ['./recipe-edit-dialog.component.scss']
})
export class RecipeEditDialogComponent {
  form: FormGroup;
  isEdit = false;

  /** Existing images from the recipe being edited */
  existingImages = signal<string[]>([]);

  /** New file previews from FileUploadComponent */
  newFilePreviews = signal<FilePreview[]>([]);

  /** Computed total images count */
  totalImages = computed(() => this.existingImages().length + this.newFilePreviews().length);

  /** Computed validation - max 2 images */
  hasImageError = computed(() => this.totalImages() > 2);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RecipeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      ingredients: [''],
      preparation: [''],
      scheduleToggle: [false],
      scheduledAt: ['']
    });

    if (data?.recipe) {
      this.isEdit = true;
      const existingImgs = data.recipe.images || [];
      this.existingImages.set(existingImgs);

      this.form.patchValue({
        name: data.recipe.name,
        ingredients: data.recipe.ingredients || '',
        preparation: data.recipe.preparation || '',
        scheduleToggle: !!data.recipe.scheduledAt,
        scheduledAt: data.recipe.scheduledAt || ''
      });
    }
  }

  /**
   * Handle files changed from FileUploadComponent
   */
  onFilesChanged(previews: FilePreview[]): void {
    this.newFilePreviews.set(previews);
  }

  /**
   * Handle file removed (could be existing or new)
   */
  onFileRemoved(idOrUrl: string): void {
    // Check if it's an existing image URL
    const existing = this.existingImages();
    if (existing.includes(idOrUrl)) {
      this.existingImages.set(existing.filter(url => url !== idOrUrl));
    }
  }

  save(): void {
    if (this.form.value.scheduleToggle && !this.form.value.scheduledAt) {
      this.form.get('scheduledAt')?.setErrors({ required: true });
    }

    if (this.form.valid && !this.hasImageError()) {
      // Collect all images: existing + new (as data URLs)
      const allImages = [
        ...this.existingImages(),
        ...this.newFilePreviews().map(p => p.url)
      ];

      const payload = {
        ...this.form.value,
        images: allImages,
        scheduledAt: this.form.value.scheduleToggle ? this.form.value.scheduledAt : null
      };

      this.dialogRef.close(payload);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
