export interface Material {
  _id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  purchaseDate: Date | string;
  monthlyFee?: boolean;      // Indica si se sacó a meses
  monthlyFeeMonth?: number;  // Número de meses a los que se sacó el material
  monthlyPayment?: number;   // Pago mensual del material
  totalMonthlyFee?: number;  // Total de la mensualidad
  interest?: number;         // Interés aplicado
  total?: number;            // Total del precio por la cantidad
  supplier?: string;         // Proveedor del material
  createdAt?: string;
  updatedAt?: string;
}
