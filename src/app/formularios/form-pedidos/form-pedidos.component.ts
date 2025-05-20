import { Component, OnInit } from '@angular/core';
import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CategorieService } from '../../services/categorie.service';
import Swal from 'sweetalert2';
import { Category } from '../../interfaces/categorie';
import { Order } from '../../interfaces/order';
import { OrderService } from '../../services/order.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-pedidos',
  imports: [FormsModule],
  templateUrl: './form-pedidos.component.html',
  styleUrl: './form-pedidos.component.css'
})
export class FormPedidosComponent implements OnChanges, OnInit {

  @Input() selectedOrder: Order | null = null; // Pedido seleccionado para editar
  @Output() close = new EventEmitter<void>(); // Evento para cerrar el modal

  today: string = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD


  newOrder: Order = {
    _id: '',
    customer: '',
    item: '',
    orderDate: this.today,
    deliveryDate: this.today,
    cost: 0,
    quantity: 0,
    salePrice: 0,
    deposit: 0,
    totalSale: 0,
    status: 'Pendiente',
    category: undefined, // Inicializar la categoría
    extrasUnity: 0,
    extrasSale: 0,
    infoExtra: ''
  };

  categories: Category[] = []; // Lista de categorías

  constructor(private orderService: OrderService, private categorieService: CategorieService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedOrder'] && this.selectedOrder) {
      this.newOrder = { ...this.selectedOrder };

      // Convertir las fechas al formato correcto para los inputs de tipo date
      if (this.newOrder.orderDate) {
        this.newOrder.orderDate = new Date(this.newOrder.orderDate).toISOString().split('T')[0];
      }
      if (this.newOrder.deliveryDate) {
        this.newOrder.deliveryDate = new Date(this.newOrder.deliveryDate).toISOString().split('T')[0];
      }

      // Si la categoría es un objeto, extraer el _id
      if (this.newOrder.category && typeof this.newOrder.category === 'object') {
        this.newOrder.category._id = this.newOrder.category._id;
      }

    } else {
      this.resetForm();
    }
    this.updateTotalUnitCost();
    this.updateTotalSale();
    this.updateRemainingPayment();
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
       /*  console.log('Categorías cargadas:', this.categories); */

        // Si newOrder.category es un _id, buscar el objeto en la lista de categorías
        if (this.newOrder.category && typeof this.newOrder.category === 'string') {
          const foundCategory = this.categories.find(category => category._id === this.newOrder.category);
          /* console.log('Categoría encontrada después de cargar:', foundCategory); */

          this.newOrder.category = foundCategory || this.newOrder.category;
        }

      /*   console.log('Categoría final en newOrder:', this.newOrder.category); */
      },
      error: () => {
        Swal.fire('Error', 'Error al cargar las categorías.', 'error');
      }
    });
  }


  resetForm(): void {
    this.newOrder = {
      _id: '',
      customer: '',
      item: '',
      orderDate: this.today, // Inicializar con la fecha actual
      deliveryDate: this.today, // Inicializar con la fecha actual
      cost: 0,
      quantity: 0,
      salePrice: 0,
      deposit: 0,
      totalSale: 0,
      status: 'Pendiente',
      category: undefined // Resetear la categoría
    };
  }

  closeModal(): void {
    this.close.emit(); // Emitir evento para cerrar el modal
    document.body.style.overflow = 'auto';
  }

  saveOrder(): void {
    if (this.newOrder._id) {
      this.updateOrder();
    } else {
      this.createOrder();
    }
  }

  compareCategories(c1: Category, c2: Category): boolean {
    return c1 && c2 ? c1._id === c2._id : c1 === c2;
  }



  createOrder(): void {
    this.orderService.createOrder({
      ...this.newOrder
    }).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Pedido creado con éxito.', 'success');
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al crear el pedido.', 'error');
      }
    });
  }

  updateOrder(): void {
    this.orderService.updateOrder(this.newOrder._id, this.newOrder).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Pedido actualizado con éxito.', 'success');
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al actualizar el pedido.', 'error');
      }
    });
  }

  updateTotalUnitCost(): void {
    this.newOrder.totalUnitCost = this.newOrder.quantity * this.newOrder.cost;
  }

  updateTotalSale(): void {
    const extrasUnityValue = this.newOrder.extrasUnity || 0;
    const extrasSaleValue = this.newOrder.extrasSale || 0;

    // Actualizar el costo total unitario con extrasUnity
    this.newOrder.totalUnitCost = (this.newOrder.quantity * this.newOrder.cost) + extrasUnityValue;

    // Actualizar el total de precio de venta con extrasSale
    const totalSale = (this.newOrder.quantity * this.newOrder.salePrice) + extrasSaleValue;
    this.newOrder.totalSale = totalSale >= 0 ? totalSale : 0;

    this.updateRemainingPayment();
  }

  updateRemainingPayment(): void {
    const depositValue = this.newOrder.deposit || 0;
    const remaining = this.newOrder.totalSale - depositValue;
    this.newOrder.remainingAmount = remaining >= 0 ? remaining : 0;
  }
}

