import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Catalog } from '../models/catalog.model';
import { CatalogsService } from '../catalogs.service';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CatalogEditDialogComponent } from '../catalog-edit-dialog/catalog-edit-dialog.component';
import { CatalogViewDialogComponent } from '../catalog-view-dialog/catalog-view-dialog.component';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { ActivityLogService } from '../../core/services/activity-log.service';
import { ActivityHistoryDialogComponent } from '../../shared/dialogs/activity-history/dialog-history.component';

@Component({
  selector: 'app-add-catalogs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe,
    DatePipe
  ],
  templateUrl: './add-catalogs.component.html',
  styleUrls: ['./add-catalogs.component.scss']
})
export class AddCatalogsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'createdAt', 'updatedAt', 'lastModifiedBy', 'actions'];
  dataSource = new MatTableDataSource<Catalog>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private service: CatalogsService, private dialog: MatDialog, private snack: MatSnackBar, private i18n: I18nService, private log: ActivityLogService) {}

  ngOnInit(): void {
    this.load();

    // Filter by name only
    this.dataSource.filterPredicate = (row: Catalog, filter: string) => {
      return row.name.toLowerCase().includes(filter.trim().toLowerCase());
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load() {
    this.service.list().subscribe(data => {
      this.dataSource.data = data;
      // default sort by name ascending
      setTimeout(() => {
        if (this.sort) {
          this.sort.active = 'name';
          this.sort.direction = 'asc';
        }
      });
    });
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openView(row: Catalog) {
    this.dialog.open(CatalogViewDialogComponent, { data: { catalog: row }, width: '560px' });
  }

  openCreate() {
    const ref = this.dialog.open(CatalogEditDialogComponent, { data: { catalog: null }, width: '560px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.service.create({ name: result.name, description: result.description }).subscribe(created => {
          this.log.add({ type: 'create', user: 'system', catalogId: created.id, catalogName: created.name, meta: { created: true } });
          this.load();
          const msg = this.i18n.instant('messages.created', `Catalog "${created.name}" created.`).replace('{name}', created.name);
          this.snack.open(msg, '', { duration: 3000 });
        });
      }
    });
  }

  openEdit(row: Catalog) {
    const before = { name: row.name, description: row.description };
    const ref = this.dialog.open(CatalogEditDialogComponent, { data: { catalog: row }, width: '560px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.service.update(row.id, { name: result.name, description: result.description }).subscribe(updated => {
          // log with before/after
          this.log.add({ type: 'update', user: 'system', catalogId: updated.id, catalogName: updated.name, meta: { before, after: { name: updated.name, description: updated.description } } });

          this.load();
          const msg = this.i18n.instant('messages.updated', `Catalog \"${row.name}\" updated.`).replace('{name}', updated.name);
          this.snack.open(msg, '', { duration: 3000 });
        });
      }
    });
  }

  openHistory() {
    this.dialog.open(ActivityHistoryDialogComponent, { width: '900px' });
  }

  toggleActive(row: Catalog) {
    // only confirm when currently active (i.e., deactivation)
    if (row.active) {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirm',
          message: `Are you sure you want to deactivate "${row.name}"?`,
          confirmText: 'Deactivate',
          cancelText: 'Cancel'
        },
        width: '520px'
      });

      ref.afterClosed().subscribe(conf => {
        if (conf) {
          this.service.toggleActive(row.id).subscribe(updated => {
            this.load();
          this.log.add({ type: 'deactivate', user: 'system', catalogId: updated.id, catalogName: updated.name, meta: { before: { active: !updated.active }, after: { active: updated.active } } });

            const msg = this.i18n.instant('messages.deactivated', `Catalog "${updated.name}" deactivated.`).replace('{name}', updated.name);
            const ref = this.snack.open(msg, this.i18n.instant('actions.undo', 'Undo'), { duration: 5000 });

            // Undo action
              const sub = (ref as any).onAction ? (ref as any).onAction().subscribe(() => {
              this.service.toggleActive(updated.id).subscribe(rev => {
                this.load();
                this.log.add({ type: 'undo', user: 'system', catalogId: rev.id, catalogName: rev.name, meta: { reverted: true, before: { active: !rev.active }, after: { active: rev.active } } });
                const msg2 = this.i18n.instant('messages.reverted', `Catalog \"${rev.name}\" reactivated.`).replace('{name}', rev.name);
                this.snack.open(msg2, '', { duration: 3000 });
                sub.unsubscribe();
              });
            }) : null;
          });
        }
      });
    } else {
      this.service.toggleActive(row.id).subscribe(updated => {
        this.load();
        const msg = this.i18n.instant('messages.activated', `Catalog "${updated.name}" activated.`).replace('{name}', updated.name);
        this.snack.open(msg, '', { duration: 3000 });
      });
    }
  }
}
