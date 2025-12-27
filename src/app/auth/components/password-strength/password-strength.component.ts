import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import zxcvbn from 'zxcvbn';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './password-strength.component.html',
  styleUrls: ['./password-strength.component.scss']
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() password = '';
  
  score = signal(0);
  strengthLabel = signal('');
  strengthColor = signal('');

  private strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
  private strengthColors = ['warn', 'warn', 'accent', 'primary', 'primary'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password']) {
      this.evaluate(this.password);
    }
  }

  private evaluate(pw: string) {
    if (!pw) {
      this.score.set(0);
      this.strengthLabel.set('');
      this.strengthColor.set('');
      return;
    }

    const result = zxcvbn(pw);
    this.score.set(result.score);
    this.strengthLabel.set(this.strengthLabels[result.score]);
    this.strengthColor.set(this.strengthColors[result.score]);
  }

  getProgressValue(): number {
    return ((this.score() + 1) / 5) * 100;
  }
}
