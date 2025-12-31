import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Catalog } from '../models/catalog.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-catalog-edit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe],
  templateUrl: './catalog-edit-dialog.component.html',
  styleUrls: ['./catalog-edit-dialog.component.scss']
})
export class CatalogEditDialogComponent {
  form!: any;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CatalogEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { catalog: Catalog }
  ) {
    this.isEdit = !!data?.catalog;
    this.form = this.fb.group({ name: ['', Validators.required], description: [''] });
    if (data?.catalog) {
      this.form.patchValue({ name: data.catalog.name, description: data.catalog.description });
    }
  }

  save() {
    if (this.form.valid) {
      const updated = { ...this.data.catalog, ...this.form.value } as Catalog;
      this.dialogRef.close(updated);
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
