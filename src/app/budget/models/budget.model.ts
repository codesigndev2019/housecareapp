/**
 * Budget Movement Types
 * 'income' - Money coming in (salaries, freelance, etc.)
 * 'expense' - Money going out (bills, purchases, etc.)
 */
export type MovementType = 'income' | 'expense';

/**
 * Currency Types
 * Support for multiple currencies
 */
export type Currency = 'USD' | 'EUR' | 'MXN' | 'CRC';

/**
 * Budget Movement Interface
 * Represents a single financial movement (income or expense)
 */
export interface BudgetMovement {
  id: string;
  name: string;
  description: string;
  currency: Currency;
  amount: number;
  movementType: MovementType;
  categoryId: string; // Reference to catalog
  isFixed: boolean; // Whether it's a recurring fixed movement
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  active: boolean;
}

/**
 * Budget Summary Interface
 * Aggregated budget information
 */
export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currency: Currency;
}

/**
 * Available currencies with their symbols
 */
export const CURRENCIES: { value: Currency; symbol: string; name: string }[] = [
  { value: 'USD', symbol: '$', name: 'US Dollar' },
  { value: 'EUR', symbol: '€', name: 'Euro' },
  { value: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { value: 'CRC', symbol: '₡', name: 'Costa Rican Colón' }
];
