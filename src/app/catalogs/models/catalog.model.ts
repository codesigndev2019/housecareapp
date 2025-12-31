export interface Catalog {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  lastModifiedBy: string;
  active: boolean;
}
