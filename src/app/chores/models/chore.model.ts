export type ChoreFrequency = 'daily' | 'twice-weekly' | 'weekly';

export interface Chore {
  id: string;
  name: string;
  responsibleId: string; // family member id
  frequency: ChoreFrequency;
  completed: boolean;
  active: boolean;
}
