/**
 * FileUploadComponent - Reusable file upload with drag & drop support
 *
 * Features:
 * - Drag and drop file upload
 * - Click to browse files
 * - File type validation
 * - File size validation
 * - Multiple files support
 * - Image preview
 * - Configurable via inputs
 * - i18n support
 * - Theme-aware styling
 *
 * Usage:
 *   <app-file-upload
 *     [acceptTypes]="'image/png,image/jpeg'"
 *     [maxFiles]="5"
 *     [maxSizeMb]="5"
 *     [multiple]="true"
 *     [showPreviews]="true"
 *     (filesChanged)="onFilesChanged($event)">
 *   </app-file-upload>
 */
import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

/** Represents a file with its preview data */
export interface FilePreview {
  /** Unique identifier */
  id: string;
  /** Original file name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** Data URL for preview (images) */
  url: string;
  /** Original File object */
  file: File;
}

/** Validation result for file operations */
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TranslatePipe
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  // Configuration inputs
  /** Accepted MIME types (comma-separated) */
  acceptTypes = input<string>('image/png,image/jpeg,image/webp');

  /** Maximum number of files allowed */
  maxFiles = input<number>(5);

  /** Maximum file size in MB */
  maxSizeMb = input<number>(5);

  /** Allow multiple file selection */
  multiple = input<boolean>(true);

  /** Show image previews */
  showPreviews = input<boolean>(true);

  /** Existing files (for edit mode) */
  existingFiles = input<string[]>([]);

  // Outputs
  /** Emits when files are selected */
  filesSelected = output<File[]>();

  /** Emits when file previews change */
  filesChanged = output<FilePreview[]>();

  /** Emits when a file is removed */
  fileRemoved = output<string>();

  // Internal state
  /** Current file previews */
  previews = signal<FilePreview[]>([]);

  /** Validation errors */
  errors = signal<string[]>([]);

  /** Drag over state */
  dragOver = signal(false);

  /** Loading state */
  loading = signal(false);

  /** Computed total files count */
  totalFiles = computed(() => this.previews().length + this.existingFiles().length);

  /** Computed remaining slots */
  remainingSlots = computed(() => this.maxFiles() - this.totalFiles());

  /** Computed can add more files */
  canAddMore = computed(() => this.remainingSlots() > 0);

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  /**
   * Handle drop event
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }

  /**
   * Handle file input change
   */
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.processFiles(files);
    // Reset input to allow selecting same file again
    input.value = '';
  }

  /**
   * Process selected files
   */
  private async processFiles(files: File[]): Promise<void> {
    this.errors.set([]);

    // Limit files to remaining slots
    const filesToProcess = files.slice(0, this.remainingSlots());

    const validation = this.validateFiles(filesToProcess);
    if (!validation.valid) {
      this.errors.set(validation.errors);
      return;
    }

    this.loading.set(true);

    try {
      const newPreviews: FilePreview[] = [];

      for (const file of filesToProcess) {
        const preview = await this.createPreview(file);
        newPreviews.push(preview);
      }

      this.previews.update(current => [...current, ...newPreviews]);
      this.filesSelected.emit(filesToProcess);
      this.filesChanged.emit(this.previews());
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Validate files against configured constraints
   */
  private validateFiles(files: File[]): ValidationResult {
    const errors: string[] = [];

    // Check if adding these files would exceed max
    if (this.totalFiles() + files.length > this.maxFiles()) {
      errors.push('upload.tooManyFiles');
    }

    // Check file types
    const invalidTypes = files.filter(f => !this.isValidType(f));
    if (invalidTypes.length > 0) {
      errors.push('upload.invalidType');
    }

    // Check file sizes
    const maxBytes = this.maxSizeMb() * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxBytes);
    if (oversizedFiles.length > 0) {
      errors.push('upload.fileTooLarge');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if file type is valid
   */
  private isValidType(file: File): boolean {
    const acceptedTypes = this.acceptTypes()
      .split(',')
      .map(t => t.trim().toLowerCase());

    return acceptedTypes.some(type => {
      // Handle wildcard types like "image/*"
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '');
        return file.type.toLowerCase().startsWith(category);
      }
      return file.type.toLowerCase() === type;
    });
  }

  /**
   * Create a preview for a file
   */
  private createPreview(file: File): Promise<FilePreview> {
    return new Promise((resolve) => {
      const preview: FilePreview = {
        id: this.generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        file
      };

      // Generate preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          preview.url = reader.result as string;
          resolve(preview);
        };
        reader.onerror = () => resolve(preview);
        reader.readAsDataURL(file);
      } else {
        resolve(preview);
      }
    });
  }

  /**
   * Remove a file preview
   */
  removeFile(id: string): void {
    this.previews.update(current => current.filter(p => p.id !== id));
    this.fileRemoved.emit(id);
    this.filesChanged.emit(this.previews());
  }

  /**
   * Remove an existing file
   */
  removeExistingFile(url: string): void {
    this.fileRemoved.emit(url);
  }

  /**
   * Clear all files
   */
  clearAll(): void {
    this.previews.set([]);
    this.errors.set([]);
    this.filesChanged.emit([]);
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Handle keyboard activation of dropzone
   */
  onKeyDown(event: KeyboardEvent, fileInput: HTMLInputElement): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  }
}
