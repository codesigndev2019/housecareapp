import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BudgetMovement, BudgetSummary, Currency, CURRENCIES } from '../models/budget.model';
import { BudgetService } from '../budget.service';
import { BudgetDialogComponent, BudgetDialogData } from '../budget-dialog/budget-dialog.component';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { I18nService } from '../../core/i18n/i18n.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

/**
 * BudgetListComponent - Main budget management view
 * 
 * Features:
 * - Summary cards for income, expenses, and balance
 * - Modern data table with sorting and pagination
 * - CRUD operations via dialog
 * - Currency filtering
 */
@Component({
  selector: 'app-budget-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe,
    DecimalPipe
  ],
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.scss']
})
export class BudgetListComponent implements OnInit, AfterViewInit {
  /** Table columns */
  displayedColumns: string[] = ['name', 'description', 'movementType', 'currency', 'amount', 'isFixed', 'actions'];
  
  /** Table data source */
  dataSource = new MatTableDataSource<BudgetMovement>([]);
  
  /** Available currencies */
  readonly currencies = CURRENCIES;
  
  /** Selected currency for filtering/summary */
  selectedCurrency: Currency = 'USD';
  
  /** Budget summary observable */
  summary$!: Observable<BudgetSummary>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private budgetService: BudgetService, 
    private dialog: MatDialog, 
    private snack: MatSnackBar, 
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.updateSummary();

    // Filter predicate for search
    this.dataSource.filterPredicate = (row: BudgetMovement, filter: string) => {
      const searchStr = filter.trim().toLowerCase();
      return row.name.toLowerCase().includes(searchStr) || 
             row.description.toLowerCase().includes(searchStr);
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Load movements data
   */
  loadData(): void {
    this.budgetService.list().subscribe(data => {
      this.dataSource.data = data.filter(m => m.active);
      // Default sort by name
      setTimeout(() => {
        if (this.sort) {
          this.sort.active = 'name';
          this.sort.direction = 'asc';
        }
      });
    });
  }

  /**
   * Update summary based on selected currency
   */
  updateSummary(): void {
    this.summary$ = this.budgetService.getSummary(this.selectedCurrency);
  }

  /**
   * Handle currency change
   */
  onCurrencyChange(): void {
    this.updateSummary();
  }

  /**
   * Apply search filter
   */
  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Open create dialog
   */
  openCreate(): void {
    const data: BudgetDialogData = { mode: 'create' };
    const ref = this.dialog.open(BudgetDialogComponent, { data, width: '560px' });

    ref.afterClosed().subscribe(result => {
      if (result?.action === 'save') {
        this.budgetService.create(result.payload).subscribe(created => {
          this.loadData();
          this.updateSummary();
          const msg = this.i18n.instant('budget.messages.created', `Movement "${created.name}" created.`)
            .replace('{name}', created.name);
          this.snack.open(msg, '', { duration: 3000 });
        });
      }
    });
  }

  /**
   * Open view dialog
   */
  openView(row: BudgetMovement): void {
    const data: BudgetDialogData = { mode: 'view', movement: row };
    this.dialog.open(BudgetDialogComponent, { data, width: '560px' });
  }

  /**
   * Open edit dialog
   */
  openEdit(row: BudgetMovement): void {
    const data: BudgetDialogData = { mode: 'edit', movement: row };
    const ref = this.dialog.open(BudgetDialogComponent, { data, width: '560px' });

    ref.afterClosed().subscribe(result => {
      if (result?.action === 'save') {
        this.budgetService.update(row.id, result.payload).subscribe(updated => {
          if (updated) {
            this.loadData();
            this.updateSummary();
            const msg = this.i18n.instant('budget.messages.updated', `Movement "${updated.name}" updated.`)
              .replace('{name}', updated.name);
            this.snack.open(msg, '', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * Delete a movement with confirmation
   */
  onDelete(row: BudgetMovement): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.i18n.instant('budget.deleteConfirmTitle', 'Confirm Delete'),
        message: this.i18n.instant('budget.deleteConfirmMessage', `Are you sure you want to delete "${row.name}"?`)
          .replace('{name}', row.name),
        confirmText: this.i18n.instant('actions.delete', 'Delete'),
        cancelText: this.i18n.instant('actions.cancel', 'Cancel')
      },
      width: '420px'
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.budgetService.delete(row.id).subscribe(success => {
          if (success) {
            this.loadData();
            this.updateSummary();
            const msg = this.i18n.instant('budget.messages.deleted', `Movement "${row.name}" deleted.`)
              .replace('{name}', row.name);
            this.snack.open(msg, '', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: Currency): string {
    return CURRENCIES.find(c => c.value === currency)?.symbol || '$';
  }

  /**
   * Track by function for ngFor
   */
  trackById(index: number, item: BudgetMovement): string {
    return item.id;
  }
}
