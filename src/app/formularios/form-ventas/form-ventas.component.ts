import { Component, OnInit } from '@angular/core';
import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import Swal from 'sweetalert2';
import { InventoryService } from '../../services/inventory.service';
import { OrderService } from '../../services/order.service';
import { SaleService } from '../../services/sale.service';
import { FormsModule } from '@angular/forms';
import { Sale } from '../../interfaces/sale';

@Component({
  selector: 'app-form-ventas',
  imports: [FormsModule],
  templateUrl: './form-ventas.component.html',
  styleUrl: './form-ventas.component.css'
})
export class FormVentasComponent implements OnChanges, OnInit {
  @Input() selectedSale: Sale | null = null; // Venta seleccionada para edición
  @Output() close = new EventEmitter<void>(); // Evento para cerrar el modal

  newSale: Sale = {
    _id: '',
    itemModel: 'Order', // Cambiar el valor predeterminado a 'Order'
    item: '',
    saleDate: '',
    unitCost: 0,
    quantity: 0,
    salePrice: 0,
    totalSale: 0,
    profitPercentage: 0
  };

  inventories: any[] = []; // Lista de inventarios
  orders: any[] = []; // Lista de pedidos
  items: any[] = []; // Lista dinámica basada en itemModel
  selectedCategoryName: string | undefined; // Nombre de la categoría seleccionada

  constructor(
    private saleService: SaleService,
    private inventoryService: InventoryService,
    private orderService: OrderService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedSale'] && this.selectedSale) {
      this.newSale = { ...this.selectedSale };

      // Convertir la fecha al formato ISO para los inputs tipo `date`
      if (this.newSale.saleDate) {
        const saleDate = new Date(this.newSale.saleDate);
        this.newSale.saleDate = saleDate.toISOString().split('T')[0];
      }

      this.loadItems(); // Cargar la lista de artículos correspondiente

      // Actualizar los cálculos de la venta seleccionada
      this.calculateTotals();
    } else {
      this.resetForm();
    }
  }

  ngOnInit(): void {
    this.loadInventories();
    this.calculateTotals();
    this.loadOrders();
    this.loadItems(); // Inicializar la lista de artículos con el modelo por defecto
  }

  resetForm(): void {
    this.newSale = {
      _id: '',
      itemModel: 'Order', // Cambiar el valor predeterminado a 'Order'
      item: '',
      saleDate: '',
      unitCost: 0,
      quantity: 0,
      salePrice: 0,
      totalSale: 0,
      profitPercentage: 0
    };
  }

  closeModal(): void {
    this.calculateTotals();
    this.close.emit(); // Emitir evento para cerrar el modal
    document.body.style.overflow = 'auto';
  }

  saveSale(): void {
    if (this.newSale._id) {
      this.updateSale();
      this.calculateTotals();
    } else {
      this.createSale();
      this.calculateTotals();
    }
  }

  createSale(): void {
    console.log('ID del producto vendido:', this.newSale.item);

    // Incluir los detalles del pedido en el objeto newSale
    if (this.newSale.itemModel === 'Order') {
      const selectedOrder = this.orders.find(order => order._id === this.newSale.item);
      if (selectedOrder) {
        this.newSale.orderDetails = selectedOrder;
      }
    }

    this.saleService.createSale(this.newSale).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Venta creada con éxito.', 'success');
        if (this.newSale.itemModel === 'Inventory') {
          this.updateInventoryQuantity(this.newSale.quantity);
        } else if (this.newSale.itemModel === 'Order') {
          this.updateOrderSold();
        }
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al crear la venta.', 'error');
      }
    });
  }

  updateSale(): void {
    console.log('ID del producto vendido:', this.newSale.item);
    this.saleService.updateSale(this.newSale._id, this.newSale).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Venta actualizada con éxito.', 'success');
        this.updateInventoryQuantity(this.newSale.quantity); // Actualizar la cantidad del inventario
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al actualizar la venta.', 'error');
      }
    });
  }

  calculateTotals(): void {
    if (this.newSale.unitCost > 0 && this.newSale.quantity > 0 && this.newSale.salePrice > 0) {
      this.newSale.totalSale = this.newSale.quantity * this.newSale.salePrice;

      const totalCost = this.newSale.quantity * this.newSale.unitCost;

      const profit = this.newSale.totalSale - totalCost;

      this.newSale.profitPercentage = totalCost > 0
        ? parseFloat(((profit / totalCost) * 100).toFixed(2))
        : 0;
    } else {
      this.newSale.totalSale = 111;
      this.newSale.profitPercentage = 888;
    }
  }

  loadInventories(): void {
    this.inventoryService.getAllInventories().subscribe({
      next: (inventories) => {
        this.inventories = inventories;
        this.loadItems();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los inventarios', 'error');
      }
    });
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadItems();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
      }
    });
  }

  loadItems(): void {
    if (this.newSale.itemModel === 'Order') {
      this.items = this.orders.filter(order => order.status === 'Terminado' || order.status === 'Pendiente');
    }
    // Imprimir datos del artículo seleccionado
    const selectedItem = this.items.find(item => item._id === this.newSale.item);
    if (selectedItem) {
      this.selectedCategoryName = selectedItem.category?.name;
    }
  }

  // Método para actualizar la cantidad del inventario
  updateInventoryQuantity(soldQuantity: number): void {
    // Solo se actualiza si el modelo es 'Inventory'
    if (this.newSale.itemModel === 'Inventory') {
      const inventoryId = this.newSale.item;
      // Buscar el inventario correspondiente en la lista ya cargada
      const inventoryItem = this.inventories.find(inv => inv._id === inventoryId);
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity - soldQuantity;
        if (newQuantity < 0) {
          console.error('No hay suficiente stock para realizar la venta');
          return;
        }

        this.inventoryService.updateInventory(inventoryId, { ...inventoryItem, quantity: newQuantity }).subscribe({
          next: (updatedInventory) => {
            console.log('Inventario actualizado:', updatedInventory);
          },
          error: (err) => {
            console.error('Error al actualizar el inventario:', err);
          }
        });
      } else {
        console.error('Inventario no encontrado para id:', inventoryId);
      }
    }
  }

  updateOrderQuantity(soldQuantity: number): void {
    // Verifica que el modelo seleccionado sea 'Order'
    if (this.newSale.itemModel === 'Order') {
      // Se asume que newSale.item contiene el _id del pedido
      const orderId = this.newSale.item;
      // Busca el pedido en la lista de orders cargados
      const orderItem = this.orders.find(order => order._id === orderId);
      if (orderItem) {
        // Calcula la nueva cantidad asegurando que no sea negativa
        const newQuantity = orderItem.quantity - soldQuantity;
        if (newQuantity < 0) {
          console.error('No hay suficiente stock en el pedido para realizar la venta');
          return;
        }
        // Actualiza el pedido con la nueva cantidad
        this.orderService.updateOrder(orderId, { ...orderItem, quantity: newQuantity }).subscribe({
          next: (updatedOrder) => {
            console.log('Pedido actualizado:', updatedOrder);
          },
          error: (err) => {
            console.error('Error al actualizar el pedido:', err);
          }
        });
      } else {
        console.error('Pedido no encontrado para id:', orderId);
      }
    }
  }

  onItemChange(): void {
    // Si se está seleccionando un pedido
    if (this.newSale.itemModel === 'Order') {
      // Buscar en la lista de pedidos el que coincida con el id seleccionado
      const selectedOrder = this.orders.find(order => order._id === this.newSale.item);
      if (selectedOrder) {
        // Asignar el costo y el precio de venta del pedido a la venta actual
        this.newSale.unitCost = selectedOrder.cost;
        this.newSale.salePrice = selectedOrder.salePrice;
        // También asignar la cantidad (quantity) del pedido
        this.newSale.quantity = selectedOrder.quantity;
        // Asignar el nombre de la categoría del pedido a la venta actual
        this.selectedCategoryName = selectedOrder.category?.name;
        // Recalcular totales para actualizar el total de la venta y el porcentaje de ganancia
        this.calculateTotals();
      }
    }
  }

  updateOrderSold(): void {
    const orderId = this.newSale.item;
    const orderItem = this.orders.find(order => order._id === orderId);
    if (orderItem) {
      const updatedOrder = { ...orderItem, sold: true };
      this.orderService.updateOrder(orderId, updatedOrder).subscribe({
        next: (updatedOrderResult) => {
          console.log('Pedido actualizado con sold=true:', updatedOrderResult);
        },
        error: (err) => {
          console.error('Error al actualizar el campo sold en el pedido:', err);
        }
      });
    } else {
      console.error('Pedido no encontrado para id:', orderId);
    }
  }
}


