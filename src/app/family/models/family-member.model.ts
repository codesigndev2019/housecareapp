export interface FamilyMember {
  id: string;
  fullName: string;
  birthday?: string; // ISO date
  relation?: string;
  phone?: string;
  email?: string;
  accountType: 'editor' | 'read';
  active: boolean;
}
