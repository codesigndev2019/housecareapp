import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { ActivityLogService, ActivityEvent } from '../../../core/services/activity-log.service';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-activity-history',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatPaginatorModule, MatIconModule, MatCardModule, TranslatePipe],
  templateUrl: './dialog-history.component.html',
  styleUrls: ['./dialog-history.component.scss']
})
export class ActivityHistoryDialogComponent implements OnInit {
  displayedColumns = ['timestamp', 'type', 'catalogName', 'user', 'before', 'after'];
  data: ActivityEvent[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private log: ActivityLogService, private dialogRef: MatDialogRef<ActivityHistoryDialogComponent>) {}

  ngOnInit(): void {
    this.log.allEvents().subscribe(events => {
      this.data = events;
    });
  }

  close() {
    this.dialogRef.close();
  }

  // helper to stringify before/after
  stringify(obj: any) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  }
}
