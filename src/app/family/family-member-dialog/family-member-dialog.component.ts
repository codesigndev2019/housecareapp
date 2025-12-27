import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-family-member-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, TranslatePipe],
  templateUrl: './family-member-dialog.component.html',
  styleUrls: ['./family-member-dialog.component.scss']
})
export class FamilyMemberDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FamilyMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const member = data?.member || {};
    this.form = this.fb.group({
      fullName: [member.fullName || '', Validators.required],
      birthday: [member.birthday || null],
      relation: [member.relation || ''],
      phone: [member.phone || ''],
      email: [member.email || '', Validators.email],
      accountType: [member.accountType || 'read', Validators.required]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
