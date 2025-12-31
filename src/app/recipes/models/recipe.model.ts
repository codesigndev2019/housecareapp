export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients?: string;
  preparation?: string;
  images?: string[]; // array of image URLs or base64 previews
  imageUrl?: string;
  scheduledAt?: string | null; // ISO date string when applicable
  active?: boolean;
}
