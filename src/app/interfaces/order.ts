import { Category } from './categorie';

export interface Order {
  _id: string;
  customer: string;
  item: string;
  orderDate: string;
  cost: number;
  quantity: number;
  salePrice: number;
  deposit: number;
  totalSale: number;
  status: string;
  sold?: number;
  deliveryDate: string;
  saleCost?: number;
  totalUnitCost?: number;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
  remainingAmount?: number;
  extrasUnity?: number;
  extrasSale?: number;
  infoExtra?: string;
}
