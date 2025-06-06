import { Component } from '@angular/core';
import { OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Material } from '../interfaces/material';
import { MaterialService } from '../services/material.service';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormMaterialesComponent } from '../formularios/form-materiales/form-materiales.component';

@Component({
  selector: 'app-materiales',
  imports: [NgIf, NgFor, NgClass, CurrencyPipe, DatePipe, FormMaterialesComponent],
  templateUrl: './materiales.component.html',
  styleUrl: './materiales.component.css'
})
export class MaterialesComponent implements OnInit, AfterViewInit {
  materials: Material[] = [];
  filteredMaterials: Material[] = [];
  searchTerm: string = '';
  showModal = false;
  showCreateUserModal = false;
  selectedMaterial: Material | null = null;

  // Paginación: 8 elementos por página
  currentPage: number = 1;
  itemsPerPage: number = 8;

  sortedColumn: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  private subscriptions: Subscription = new Subscription();
  chartInstance: Chart | null = null;
  monthlyTotals: { month: string; total: number }[] = []; // Totales agrupados por mes
  selectedChartYear: number = new Date().getFullYear(); // Año seleccionado para el gráfico

  constructor(private materialService: MaterialService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadMaterials();
  }

  ngAfterViewInit() {
    this.createChart(); // Crear el gráfica después de que el DOM esté listo
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Cargar materiales desde el servicio
  loadMaterials(): void {
    Swal.fire({
      title: 'Cargando materiales...',
      text: 'Por favor, espera mientras se cargan los datos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar animación de carga
      }
    });

    const materialsSub = this.materialService.getAllMaterials().subscribe({
      next: (materials: Material[]) => {
        Swal.close(); // Cerrar el modal de carga
        this.materials = materials;
        this.filteredMaterials = materials;
        this.currentPage = 1; // Reinicia la paginación al cargar los datos
        this.calculateMonthlyTotals(); // Calcular totales por mes
        this.createChart();
      },
      error: (error: string) => {
        Swal.close(); // Cerrar el modal de carga
        Swal.fire('Error', error, 'error');
      }
    });
    this.subscriptions.add(materialsSub);
  }

  calculateMonthlyTotals(): void {
    const totalsByMonth: { [key: string]: number } = {};

    this.materials.forEach(material => {
      const month = new Date(material.purchaseDate || '').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      if (!totalsByMonth[month]) {
        totalsByMonth[month] = 0;
      }
      totalsByMonth[month] += material.total || 0;
    });

    this.monthlyTotals = Object.keys(totalsByMonth).map(month => ({
      month,
      total: totalsByMonth[month]
    }));
  }

  createChart(): void {
    const ctx = document.getElementById('comprasChart') as HTMLCanvasElement;

    if (!ctx) {
      console.error('No se encontró el elemento <canvas> con el ID "comprasChart".');
      return;
    }

    // Destruir la instancia del gráfico anterior si existe
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Datos de carga para la gráfica
    const labels = this.monthlyTotals.map(item => item.month);
    const data = this.monthlyTotals.map(item => item.total);


    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total por Mes',
          data: data,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createChartForYear(): void {
    const ctx = document.getElementById('comprasChart') as HTMLCanvasElement;

    if (!ctx) {
      console.error('No se encontró el elemento <canvas> con el ID "comprasChart".');
      return;
    }

    // Filtrar materiales por el año seleccionado
    const filteredMaterials = this.materials.filter(material => {
      const date = new Date(material.purchaseDate || '');
      return date.getFullYear() === this.selectedChartYear;
    });

    // Calcular totales por mes para el año seleccionado
    const totalsByMonth: { [key: string]: number } = {};
    filteredMaterials.forEach(material => {
      const month = new Date(material.purchaseDate || '').toLocaleDateString('es-ES', { month: 'long' });
      if (!totalsByMonth[month]) {
        totalsByMonth[month] = 0;
      }
      totalsByMonth[month] += material.total || 0;
    });

    const labels = Object.keys(totalsByMonth);
    const data = Object.values(totalsByMonth);

    // Destruir la instancia del gráfico anterior si existe
    if (this.chartInstance) {
      console.log('Destruyendo gráfico anterior...');
      this.chartInstance.destroy();
    }

    // Crear el gráfico para el año seleccionado
    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `Total por Mes (${this.selectedChartYear})`,
          data: data,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  previousYear(): void {
    this.selectedChartYear--;
    this.createChartForYear();
  }

  nextYear(): void {
    this.selectedChartYear++;
    this.createChartForYear();
  }

  // Filtrar la tabla de materiales
  filterTable(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredMaterials = this.materials;
      return;
    }
    this.filteredMaterials = this.materials.filter(material =>
      Object.values(material || {}).some(val =>
        String(val || '').toLowerCase().includes(term)
      )
    );
    this.currentPage = 1; // Reinicia la página al aplicar el filtro
  }

  updateMaterial(material: Material): void {
    this.selectedMaterial = { ...material }; // Clonar el material seleccionado
    this.showCreateUserModal = true;
    document.body.style.overflow = 'hidden';
  }


  deleteMaterial(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.materialService.deleteMaterial(id).subscribe({
          next: () => {
            this.materials = this.materials.filter(material => material._id !== id);
            this.filteredMaterials = this.filteredMaterials.filter(material => material._id !== id);
            Swal.fire('Eliminado', 'El material ha sido eliminado correctamente.', 'success');
            if (this.paginatedMaterials.length === 0 && this.currentPage > 1) {
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

  openCreateUserModal(): void {
    this.selectedMaterial = null; // Asegurarse de que no haya material seleccionado
    this.showCreateUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCreateUserModal(): void {
    this.showCreateUserModal = false;
    this.loadMaterials();
    document.body.style.overflow = 'auto';
  }

  sortBy(column: string): void {
    if (this.sortedColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortedColumn = column;
      this.sortOrder = 'asc';
    }

    this.filteredMaterials.sort((a, b) => {
      let aVal = (a as any)[column];
      let bVal = (b as any)[column];

      if (column === 'purchaseDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (['total'].includes(column)) {
        return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (column === 'monthlyFee') {
        return this.sortOrder === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }

      return this.sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    this.currentPage = 1; // Reinicia la paginación
  }

  // Devuelve la porción de materiales correspondiente a la página actual
  get paginatedMaterials(): Material[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMaterials.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calcula el total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredMaterials.length / this.itemsPerPage);
  }

  // Navega a la página siguiente (si existe)
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Navega a la página anterior (si existe)
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Ir a una página específica
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
