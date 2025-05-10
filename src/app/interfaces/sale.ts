export interface Sale {
  _id: string;
  itemModel: 'Inventory' | 'Order';
  item: string;
  itemName?: string;
  orderDetails?: any; // Agregar esta línea para incluir los detalles del pedido
  saleDate: string;
  // month: string; // Comentado porque no es necesario
  unitCost: number;
  quantity: number;
  salePrice: number;
  totalSale: number;
  profitPercentage: number;
  createdAt?: string;
  updatedAt?: string;

  [key: string]: any; // Esta línea permite acceder a las propiedades usando un string
}
