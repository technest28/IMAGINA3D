import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../services/inventory.service';
import { Inventory } from '../interfaces/inventory';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Material } from '../interfaces/material';
import { MaterialService } from '../services/material.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormInventarioComponent } from '../formularios/form-inventario/form-inventario.component';


@Component({
  selector: 'app-inventario',
  imports: [FormsModule, NgFor, NgIf, FormInventarioComponent, ReactiveFormsModule, NgClass],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  inventories: Inventory[] = [];
  filteredInventories: Inventory[] = [];
  searchTerm: string = '';

  selectedInventory: Inventory | null = null;
  showCreateInventoryModal = false;

  materials: Material[] = [];

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 8;


  private subscriptions: Subscription = new Subscription();

  constructor(private inventoryService: InventoryService, private materialService: MaterialService) { }

  ngOnInit() {
    this.loadInventories();
    this.loadMaterials();
  }

  loadInventories(): void {
    Swal.fire({
      title: 'Cargando inventarios...',
      text: 'Por favor, espera mientras se cargan los datos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar animación de carga
      }
    });

    const invSub = this.inventoryService.getAllInventories().subscribe({
      next: (inventories: Inventory[]) => {
        Swal.close(); // Cerrar el modal de carga
        this.inventories = inventories;
        this.filteredInventories = inventories;
        this.currentPage = 1; // Reinicia la paginación al cargar los datos
      },
      error: (error: string) => {
        Swal.close(); // Cerrar el modal de carga
        Swal.fire('Error', error, 'error');
      }
    });
    this.subscriptions.add(invSub);
  }

  filterTable(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredInventories = this.inventories;
      return;
    }
    this.filteredInventories = this.inventories.filter(inventory =>
      Object.values(inventory).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );
    this.currentPage = 1; // Reinicia la página al aplicar el filtro
  }

  addInventory(): void {
    this.selectedInventory = null;
    this.showCreateInventoryModal = true;
    document.body.style.overflow = 'hidden';
  }


  updateInventory(inventory: Inventory): void {
    console.log(inventory);
    this.selectedInventory = { ...inventory }; // Clonar el inventario seleccionado
    this.showCreateInventoryModal = true;
    document.body.style.overflow = 'hidden';
  }

  deleteInventory(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.inventoryService.deleteInventory(id).subscribe({
          next: () => {
            this.inventories = this.inventories.filter(inv => inv._id !== id);
            this.filteredInventories = this.filteredInventories.filter(inv => inv._id !== id);
            Swal.fire('Eliminado', 'El inventario ha sido eliminado correctamente.', 'success');
            if (this.paginatedInventories.length === 0 && this.currentPage > 1) {
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



  loadMaterials(): void {
    this.materialService.getAllMaterials().subscribe({
      next: (materials: Material[]) => {
        this.materials = materials; // Lista de materiales disponible para el formulario
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los materiales.', 'error');
      }
    });
  }

  closeCreateInventoryModal(): void {
    this.showCreateInventoryModal = false;
    this.loadInventories(); // Recargar la lista de inventario
    document.body.style.overflow = 'auto';
  }


  // Devuelve los inventarios de la página actual
  get paginatedInventories(): Inventory[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredInventories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calcula el total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredInventories.length / this.itemsPerPage);
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

