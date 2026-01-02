import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ChoresService } from '../chores.service';
import { ChoreCardComponent } from '../chore-card/chore-card.component';
import { ChoreDialogComponent, ChoreDialogData } from '../chore-dialog/chore-dialog.component';
import { Chore } from '../models/chore.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chores-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TranslatePipe,
    ChoreCardComponent
  ],
  templateUrl: './chores-list.component.html',
  styleUrls: ['./chores-list.component.scss']
})
export class ChoresListComponent {
  chores$: Observable<Chore[]>;

  constructor(private choresService: ChoresService, private dialog: MatDialog) {
    this.chores$ = this.choresService.list();
  }

  openCreate() {
    const data: ChoreDialogData = { mode: 'create' };
    const ref = this.dialog.open(ChoreDialogComponent, { data, width: '500px' });

    ref.afterClosed().subscribe(result => {
      if (result?.action === 'save') {
        this.choresService.create(result.payload).subscribe();
      }
    });
  }

  openView(chore: Chore) {
    const data: ChoreDialogData = { mode: 'view', chore };
    this.dialog.open(ChoreDialogComponent, { data, width: '500px' });
  }

  openEdit(chore: Chore) {
    const data: ChoreDialogData = { mode: 'edit', chore };
    const ref = this.dialog.open(ChoreDialogComponent, { data, width: '500px' });

    ref.afterClosed().subscribe(result => {
      if (result?.action === 'save') {
        this.choresService.update(chore.id, result.payload).subscribe();
      }
    });
  }

  onDelete(chore: Chore) {
    this.choresService.delete(chore.id).subscribe();
  }

  onToggleCompleted(chore: Chore) {
    this.choresService.toggleCompleted(chore.id).subscribe();
  }
}
