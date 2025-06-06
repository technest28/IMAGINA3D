import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { Order } from '../interfaces/order';
import { OrderService } from '../services/order.service';
import { FormPedidosComponent } from '../formularios/form-pedidos/form-pedidos.component';


@Component({
  selector: 'app-pedidos',
  imports: [NgFor, NgIf, FormPedidosComponent, NgClass, DatePipe, CurrencyPipe],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  private subscriptions: Subscription = new Subscription();

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 8;

  selectedOrder: Order | null = null;
  showCreateOrderModal = false;

  sortedColumn: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';



  constructor(
    private orderService: OrderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    Swal.fire({
      title: 'Cargando pedidos...',
      text: 'Por favor, espera mientras se cargan los datos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar animación de carga
      }
    });

    const orderSub = this.orderService.getAllOrders().subscribe({
      next: (orders: Order[]) => {
        Swal.close(); // Cerrar el modal de carga
        this.orders = orders;
        this.filteredOrders = orders;
        this.currentPage = 1; // Reinicia la paginación al cargar los datos
      },
      error: (error: string) => {
        Swal.close(); // Cerrar el modal de carga
        Swal.fire('Error', error, 'error');
      }
    });
    this.subscriptions.add(orderSub);
  }

  sortBy(column: string): void {
    // Si se vuelve a hacer clic en la misma columna, se alterna el orden.
    if (this.sortedColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Si se selecciona una nueva columna, se establece en ascendente.
      this.sortedColumn = column;
      this.sortOrder = 'asc';
    }

    this.filteredOrders.sort((a, b) => {
      let aVal = (a as any)[column];
      let bVal = (b as any)[column];

      // Comparar fechas para 'orderDate' y 'deliveryDate'
      if (column === 'orderDate' || column === 'deliveryDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Comparar numéricamente para 'cost', 'quantity', 'totalSale' y 'remaining'
      if (['cost', 'quantity', 'totalSale', 'remaining'].includes(column)) {
        return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Comparar cadenas para 'status'
      if (column === 'status') {
        return this.sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Comparación genérica
      return this.sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    this.currentPage = 1; // Reinicia la paginación
  }

  addOrder(): void {
    this.selectedOrder = null;
    this.showCreateOrderModal = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  updateOrder(order: Order): void {
    this.selectedOrder = { ...order }; // Clona el pedido seleccionado
    this.showCreateOrderModal = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  deleteOrder(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.deleteOrder(id).subscribe({
          next: () => {
            // Actualiza ambas listas
            this.orders = this.orders.filter(order => order._id !== id);
            this.filteredOrders = this.filteredOrders.filter(order => order._id !== id);
            Swal.fire('Eliminado', 'La orden ha sido eliminada correctamente.', 'success');
            // Si la página actual queda sin elementos y no es la primera, retrocede una página
            if (this.paginatedOrders.length === 0 && this.currentPage > 1) {
              this.currentPage--;
            }
          },
          error: (error) => {
            Swal.fire('Error', error, 'error');
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Limpia las suscripciones
  }

  closeCreateOrderModal(): void {
    this.showCreateOrderModal = false;
    this.loadOrders(); // Recargar la lista de pedidos
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  // Devuelve los pedidos de la página actual
  get paginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calcula el total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  // Avanza a la siguiente página, si existe
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Retrocede a la página anterior, si existe
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Salta a una página específica
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
