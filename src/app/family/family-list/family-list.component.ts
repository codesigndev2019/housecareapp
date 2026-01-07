import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FamilyService } from '../family.service';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FamilyMemberDialogComponent } from '../family-member-dialog/family-member-dialog.component';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { FamilyMember } from '../models/family-member.model';

@Component({
  selector: 'app-family-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule, MatDialogModule, MatTooltipModule, TranslatePipe],
  templateUrl: './family-list.component.html',
  styleUrls: ['./family-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FamilyListComponent implements OnInit {
  members$!: Observable<FamilyMember[]>;

  constructor(private family: FamilyService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.members$ = this.family.list();
  }

  openCreate() {
    const ref = this.dialog.open(FamilyMemberDialogComponent, { width: '520px', data: {} });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.family.create(result).subscribe();
      }
    });
  }

  edit(member: FamilyMember) {
    const ref = this.dialog.open(FamilyMemberDialogComponent, { width: '520px', data: { member } });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.family.update(member.id, result).subscribe();
      }
    });
  }

  deactivate(id: string) {
    this.family.deactivate(id).subscribe();
  }
  activate(id: string) {
    this.family.activate(id).subscribe();
  }
}
