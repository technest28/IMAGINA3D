import { Component, OnInit } from '@angular/core';
import { CategorieService } from '../services/categorie.service';
import { Category } from '../interfaces/categorie';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormCategoriasComponent } from '../formularios/form-categorias/form-categorias.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-categorias',
  imports: [FormsModule, ReactiveFormsModule, FormCategoriasComponent, NgIf, NgFor],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent implements OnInit {
  categorias: Category[] = [];
  filteredCategorias: Category[] = [];
  searchTerm: string = '';

  selectedCategory: Category | null = null;
  showCreateModal = false;

  private subscriptions: Subscription = new Subscription();

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 8;

  constructor(private categorieService: CategorieService) { }

  ngOnInit() {
    this.loadCategories();
  }

  // Cargar categorías desde el servicio
  loadCategories(): void {
    Swal.fire({
      title: 'Cargando categorías...',
      text: 'Por favor, espera mientras se cargan los datos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar animación de carga
      }
    });

    const categoriesSub = this.categorieService.getAllCategories().subscribe({
      next: (categories: Category[]) => {
        Swal.close(); // Cerrar el modal de carga
        this.categorias = categories;
        this.filteredCategorias = categories;
        this.currentPage = 1; // Reinicia la paginación al cargar nuevos datos
      },
      error: (error: string) => {
        Swal.close(); // Cerrar el modal de carga
        Swal.fire('Error', error, 'error');
      }
    });
    this.subscriptions.add(categoriesSub);
  }

  // Filtrar la tabla de categorías
  filterTable(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredCategorias = this.categorias;
    } else {
      this.filteredCategorias = this.categorias.filter(category =>
        Object.values(category).some(val =>
          String(val).toLowerCase().includes(term)
        )
      );
    }
    this.currentPage = 1; // Reinicia la página al aplicar el filtro
  }

  openCreateModal(): void {
    this.selectedCategory = null;
    this.showCreateModal = true;
    document.body.style.overflow = 'hidden';
  }

  updateCategory(category: Category): void {
    this.selectedCategory = { ...category }; // Clonar la categoría seleccionada
    this.showCreateModal = true; // Mostrar el modal del formulario
    document.body.style.overflow = 'hidden';
  }

  deleteCategory(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categorieService.deleteCategorie(id).subscribe({
          next: () => {
            // Actualiza ambas listas
            this.categorias = this.categorias.filter(category => category._id !== id);
            this.filteredCategorias = this.filteredCategorias.filter(category => category._id !== id);
            Swal.fire('Eliminado', 'La categoría ha sido eliminada correctamente.', 'success');
            // Si la página actual queda sin elementos y no es la primera, retrocede una página
            if (this.paginatedCategories.length === 0 && this.currentPage > 1) {
              this.currentPage--;
            }
          },
          error: (error) => {
            Swal.fire('Error', 'Error al eliminar la categoría.', 'error');
            console.error(error);
          }
        });
      }
    });
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.loadCategories(); // Recargar la lista de categorías
    document.body.style.overflow = 'auto';
  }

  // Devuelve las categorías de la página actual
  get paginatedCategories(): Category[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategorias.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calcula el total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredCategorias.length / this.itemsPerPage);
  }

  // Cambia a la página siguiente (si existe)
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Cambia a la página anterior (si existe)
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

