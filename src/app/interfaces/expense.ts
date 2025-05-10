import { Day } from './day';

export interface Expense {
  _id: string;
  customer: string;
  item: string;
  date: string | Date;
  month?: string;
  cost: number;
  description?: string;
  salaryDetails?: Day[]; // Detalles de salario
  createdAt?: string;
  updatedAt?: string;
}
