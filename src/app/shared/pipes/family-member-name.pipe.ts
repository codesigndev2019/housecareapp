/**
 * FamilyMemberNamePipe - Transform family member ID to full name
 *
 * This pipe provides a declarative way to resolve member IDs to names in templates,
 * eliminating the need for component-level subscription logic.
 *
 * Usage:
 *   {{ memberId | familyMemberName }}
 *   {{ memberIds | familyMemberName }} (for arrays, returns comma-separated)
 *
 * Examples:
 *   <span>{{ chore.responsibleId | familyMemberName }}</span>
 *   <span>{{ event.participants | familyMemberName }}</span>
 */
import { Pipe, PipeTransform, inject } from '@angular/core';
import { FamilyResolverService } from '../services/family-resolver.service';

@Pipe({
  name: 'familyMemberName',
  standalone: true,
  pure: true
})
export class FamilyMemberNamePipe implements PipeTransform {
  private readonly resolver = inject(FamilyResolverService);

  /**
   * Transform member ID(s) to name(s)
   * @param value - Single ID or array of IDs
   * @param separator - Separator for multiple names (default: ', ')
   * @returns Resolved name(s) as string
   */
  transform(value: string | string[] | null | undefined, separator = ', '): string {
    if (!value) {
      return '';
    }

    // Handle array of IDs
    if (Array.isArray(value)) {
      const names = this.resolver.resolveNames(value);
      return names.filter(n => n).join(separator);
    }

    // Handle single ID
    return this.resolver.resolveName(value);
  }
}
