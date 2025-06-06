import { Component } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { SaleService } from '../services/sale.service';
import Swal from 'sweetalert2';
import { Sale } from '../interfaces/sale';
import { Subscription } from 'rxjs';
import { InventoryService } from '../services/inventory.service';
import { OrderService } from '../services/order.service';
import { Chart, registerables } from 'chart.js';
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormVentasComponent } from '../formularios/form-ventas/form-ventas.component';


@Component({
  selector: 'app-ventas',
  imports: [NgIf, NgFor, FormVentasComponent, NgClass, CurrencyPipe, DatePipe],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit, OnDestroy {
  sales: Sale[] = [];
  // Usaremos esta propiedad para guardar el listado filtrado completo.
  private allFilteredSales: Sale[] = [];

  searchTerm: string = '';
  private subscriptions: Subscription = new Subscription();

  selectedSale: Sale | null = null;
  showSaleModal: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 8;

  sortedColumn: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  get filteredSales(): Sale[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.allFilteredSales.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.allFilteredSales.length / this.itemsPerPage);
  }

  // Variable para la navegación del gráfico (por año)
  selectedChartYear: number = new Date().getFullYear();
  chartInstance: Chart | null = null;
  chartNoDataMessage: string = '';

  constructor(
    private saleService: SaleService,
    private inventoryService: InventoryService,
    private orderService: OrderService
  ) {
    Chart.register(...registerables); // Registrar todos los componentes de Chart.js
  }

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    Swal.fire({
      title: 'Cargando ventas...',
      text: 'Por favor, espera mientras se cargan los datos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar animación de carga
      }
    });

    const saleSub = this.saleService.getAllSales().subscribe({
      next: (sales: Sale[]) => {
        Swal.close(); // Cerrar el modal de carga
        this.sales = sales;
        this.allFilteredSales = sales;
        this.populateItemNames(); // Llenar los nombres de los artículos
        this.currentPage = 1; // Reinicia la paginación
        this.createChartForYear(); // Crear la gráfica para el año seleccionado
      },
      error: (error: string) => {
        Swal.close(); // Cerrar el modal de carga
        Swal.fire('Error', error, 'error');
      }
    });
    this.subscriptions.add(saleSub);
  }

  sortBy(column: string): void {
    // Si se vuelve a hacer clic en la misma columna, se alterna el orden.
    if (this.sortedColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Si se selecciona otra columna, se establece en ascendente por defecto.
      this.sortedColumn = column;
      this.sortOrder = 'asc';
    }

    this.allFilteredSales.sort((a, b) => {
      let aVal = (a as any)[column];
      let bVal = (b as any)[column];

      // Si la columna es 'saleDate', se convierte a timestamp para comparar numéricamente.
      if (column === 'saleDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      // Comparación numérica
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Comparación de strings
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return this.sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Para otros casos, convierte a string y compara
      return this.sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    // Reinicia la paginación para mostrar la primera página de los resultados ordenados
    this.currentPage = 1;
  }

  createSale(sale: Sale): void {
    this.selectedSale = { ...sale };
    this.showSaleModal = true;
    document.body.style.overflow = 'hidden';
  }

  updateSale(sale: Sale): void {
    this.selectedSale = { ...sale }; // Clonar la venta seleccionada
    this.showSaleModal = true;
    document.body.style.overflow = 'hidden';
  }

  deleteSale(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.saleService.deleteSale(id).subscribe({
          next: () => {
            this.sales = this.sales.filter(sale => sale._id !== id);
            this.allFilteredSales = this.allFilteredSales.filter(sale => sale._id !== id);
            Swal.fire('Eliminado', 'La venta ha sido eliminada correctamente.', 'success');

            if (this.filteredSales.length === 0 && this.currentPage > 1) {
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

  // Método para obtener los nombres de los artículos según el modelo
  populateItemNames(): void {
    this.sales.forEach((sale) => {
      if (sale.itemModel === 'Inventory') {
        this.inventoryService.getInventoryById(sale.item).subscribe({
          next: (inventory) => {
            // Extrae el name y lo asigna a una propiedad adicional
            sale.itemName = inventory.name;
          },
          error: () => {
            sale.itemName = 'Nombre no encontrado';
          }
        });
      } else if (sale.itemModel === 'Order') {
        this.orderService.getOrderById(sale.item).subscribe({
          next: (order) => {
            sale.itemName = `${order.customer} - ${order.item}`;
          },
          error: () => {
            sale.itemName = 'Nombre no encontrado';
          }
        });
      }
    });
  }

  openCreateSaleModal(): void {
    this.selectedSale = null; // Limpiar selección previa
    this.showSaleModal = true;
    document.body.style.overflow = 'hidden';
  }

  openEditSaleModal(sale: Sale): void {
    this.selectedSale = { ...sale };
    this.showSaleModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeSaleModal(): void {
    this.showSaleModal = false;
    this.loadSales(); // Recarga las ventas después de cerrar el modal
    document.body.style.overflow = 'auto';
  }

  // MÉTODOS DE PAGINACIÓN
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Método para crear la gráfica agrupada por mes para el año seleccionado
  createChartForYear(): void {
    // Filtrar las ventas del año seleccionado
    const filteredSales = this.sales.filter(sale => {
      const date = new Date(sale.saleDate);
      return date.getFullYear() === this.selectedChartYear;
    });

    // Inicializar objeto para los 12 meses (0 = enero, 11 = diciembre)
    const monthlyData: { [month: number]: { totalSale: number, totalProfit: number } } = {};
    for (let m = 0; m < 12; m++) {
      monthlyData[m] = { totalSale: 0, totalProfit: 0 };
    }

    // Agrupar ventas por mes
    filteredSales.forEach(sale => {
      const date = new Date(sale.saleDate);
      const month = date.getMonth();
      monthlyData[month].totalSale += sale.totalSale;
      monthlyData[month].totalProfit += sale.totalSale * (sale.profitPercentage / 100);
    });

    // Preparar etiquetas y datos para el gráfico
    const labels: string[] = [];
    const salesData: number[] = [];
    const profitPercentageData: number[] = [];
    for (let m = 0; m < 12; m++) {
      const date = new Date(this.selectedChartYear, m);
      labels.push(date.toLocaleDateString('es-ES', { month: 'long' }));
      const totSale = monthlyData[m].totalSale;
      salesData.push(totSale);
      profitPercentageData.push(totSale > 0 ? (monthlyData[m].totalProfit / totSale) * 100 : 0);
    }

    // Destruir la gráfica anterior si existe
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Crear la gráfica mixta
    const ctx = document.getElementById('ventasChart') as HTMLCanvasElement;
    this.chartInstance = new Chart(ctx, {
      data: {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: 'Ventas Totales (pesos)',
            data: salesData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y1'
          },
          // {
          //   type: 'line',
          //   label: 'Ganancia (%)',
          //   data: profitPercentageData,
          //   backgroundColor: 'rgba(153, 102, 255, 0.2)',
          //   borderColor: 'rgba(153, 102, 255, 1)',
          //   borderWidth: 2,
          //   fill: false,
          //   yAxisID: 'y2'
          // }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y1: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Venta (pesos)'
            }
          },
          // y2: {
          //   type: 'linear',
          //   position: 'right',
          //   beginAtZero: true,
          //   title: {
          //     display: true,
          //     text: 'Ganancia (%)'
          //   },
          //   grid: {
          //     drawOnChartArea: false
          //   }
          // }
        }
      }
    });
  }


  // Métodos para la navegación del gráfico por año
  previousYear(): void {
    this.selectedChartYear--;
    this.createChartForYear();
  }

  nextYear(): void {
    this.selectedChartYear++;
    this.createChartForYear();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
