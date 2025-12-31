import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Catalog } from '../models/catalog.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-catalog-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe],
  templateUrl: './catalog-view-dialog.component.html',
  styleUrls: ['./catalog-view-dialog.component.scss']
})
export class CatalogViewDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { catalog: Catalog },
    private dialogRef: MatDialogRef<CatalogViewDialogComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
}
