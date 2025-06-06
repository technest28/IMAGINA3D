import { Component } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import Swal from 'sweetalert2';
import { PredictionService } from '../services/prediction.service';
import { NgFor, NgIf } from '@angular/common';
import { FormModeloComponent } from '../formularios/form-modelo/form-modelo.component';


@Component({
  selector: 'app-modelo',
  imports: [NgIf, FormModeloComponent, NgFor],
  templateUrl: './modelo.component.html',
  styleUrl: './modelo.component.css'
})
export class ModeloComponent implements AfterViewInit {
  showCreateUserModal = false;
  selectedMaterial: any = null;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  chartInstance: Chart | null = null;

  constructor(private predictionService: PredictionService) {}

  ngAfterViewInit() {
    // Registrar los componentes necesarios
    Chart.register(...registerables);

    this.loadChartData();
  }

  loadChartData() {
    // Mostrar swal de carga
    Swal.fire({
      title: 'Cargando datos...',
      text: 'Por favor, espere.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.predictionService.getAllPredictions().subscribe(data => {
      /* console.log('Datos obtenidos:', data);  */
      this.totalPages = Math.ceil(data.length / this.itemsPerPage);
      this.updateChart(data);

      // Cerrar swal de carga
      Swal.close();
    }, error => {
      // Manejar errores y cerrar swal
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos. Intente nuevamente más tarde.'
      });
    });
  }

  updateChart(data: any[]) {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + this.itemsPerPage);

    const labels = paginatedData.map(item => `${item.Mes}/${item.Año}`);
    const demanda = paginatedData.map(item => item.Demanda);
    const demandaSugerida = paginatedData.map(item => item.DemandaSugerida);

    this.createChart(labels, demanda, demandaSugerida);
  }

  createChart(labels: string[], demanda: number[], demandaSugerida: number[]) {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    // Destruir la instancia del gráfico anterior si existe
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Demanda del mes',
            data: demanda,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Demanda sugerida para el proximo mes',
            data: demandaSugerida,
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1
          }
        ]
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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadChartData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadChartData();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadChartData();
    }
  }

  openCreateUserModal(): void {
    this.selectedMaterial = null; // Asegurarse de que no haya material seleccionado
    this.showCreateUserModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCreateUserModal(): void {
    this.showCreateUserModal = false;

    document.body.style.overflow = 'auto';
  }
}
