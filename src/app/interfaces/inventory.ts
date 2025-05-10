import { Material } from "./material";

export interface Inventory {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  material: string | Material;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}
