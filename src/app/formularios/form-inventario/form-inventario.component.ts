import { Component } from '@angular/core';
import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MaterialService } from '../../services/material.service';
import Swal from 'sweetalert2';
import { Inventory } from '../../interfaces/inventory';
import { Material } from '../../interfaces/material';
import { InventoryService } from '../../services/inventory.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-inventario',
  imports: [FormsModule],
  templateUrl: './form-inventario.component.html',
  styleUrl: './form-inventario.component.css'
})
export class FormInventarioComponent implements OnChanges {

  @Input() selectedInventory: Inventory | null = null; // Producto seleccionado para editar
  @Output() close = new EventEmitter<void>(); // Evento para cerrar el modal

  newInventory: Inventory = {
    _id: '',
    name: '',
    category: '',
    quantity: 0,
    material: '',
    status: true,
    createdAt: '',
    updatedAt: ''
  };

  materials: Material[] = [];

  constructor(private inventoryService: InventoryService, private materialService: MaterialService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedInventory'] && this.selectedInventory) {
      this.newInventory = { ...this.selectedInventory };

      // Convertir fechas al formato correcto para visualización en inputs tipo date (si se usa en el futuro)
      if (this.newInventory.createdAt) {
        const createdDate = new Date(this.newInventory.createdAt);
        this.newInventory.createdAt = createdDate.toISOString().split('T')[0];
      }

      if (this.newInventory.updatedAt) {
        const updatedDate = new Date(this.newInventory.updatedAt);
        this.newInventory.updatedAt = updatedDate.toISOString().split('T')[0];
      }

      if (this.newInventory.material && typeof this.newInventory.material === 'object') {
        this.newInventory.material = this.newInventory.material._id;
      }

    } else {
      this.resetForm();
    }
  }
  ngOnInit(): void {
    this.loadMaterials(); // Cargar materiales al iniciar el formulario
  }

  resetForm(): void {
    this.newInventory = {
      _id: '',
      name: '',
      category: '',
      quantity: 0,
      material: '',
      status: true,
      createdAt: '',
      updatedAt: ''
    };
  }

  closeModal(): void {
    this.close.emit(); // Emitir evento para cerrar el modal
    document.body.style.overflow = 'auto';
  }

  // Cargar la lista de materiales disponibles
  loadMaterials(): void {
    this.materialService.getAllMaterials().subscribe({
      next: (materials: Material[]) => {
        this.materials = materials;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los materiales', 'error');
      }
    });
  }

  saveInventory(): void {
    if (this.newInventory._id) {
      this.updateInventory();
    } else {
      this.createInventory();
    }
  }

  createInventory(): void {
    this.inventoryService.createInventory(this.newInventory).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Producto agregado al inventario con éxito.', 'success');
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al agregar el producto al inventario.', 'error');
      }
    });
  }

  updateInventory(): void {

    this.inventoryService.updateInventory(this.newInventory._id, this.newInventory).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Inventario actualizado con éxito.', 'success');
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al actualizar el inventario.', 'error');
      }
    });
  }
}
