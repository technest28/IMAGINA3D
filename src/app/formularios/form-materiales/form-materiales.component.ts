import { Component } from '@angular/core';
import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import Swal from 'sweetalert2';
import { Inventory } from '../../interfaces/inventory';
import { Material } from '../../interfaces/material';
import { MaterialService } from '../../services/material.service';
import { ExpenseService } from '../../services/expense.service';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';


@Component({
  selector: 'app-form-materiales',
  imports: [FormsModule, NgIf],
  templateUrl: './form-materiales.component.html',
  styleUrl: './form-materiales.component.css'
})
export class FormMaterialesComponent implements OnChanges {
  @Output() close = new EventEmitter<void>();
  @Input() selectedMaterial: Material | null = null; // Material seleccionado para edición

  today: string = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

  newMaterial: Material = {
    _id: '',
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    purchaseDate: this.today, // Fecha actual por defecto
    monthlyFee: false,
    monthlyFeeMonth: 0,
    monthlyPayment: 0,
    totalMonthlyFee: 0,
    interest: 0,
    total: 0,
    supplier: ''
  };

  constructor(private materialService: MaterialService, private expenseService: ExpenseService) { }

  // Se ejecuta cuando `selectedMaterial` cambia
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedMaterial'] && this.selectedMaterial) {
      this.newMaterial = { ...this.selectedMaterial };

      // Convertir la fecha al formato YYYY-MM-DD si existe
      if (this.newMaterial.purchaseDate) {
        const date = new Date(this.newMaterial.purchaseDate);
        this.newMaterial.purchaseDate = date.toISOString().split('T')[0]; // Extrae solo la parte de la fecha
      }

      // Manejar proveedor
      this.newMaterial.supplier = this.selectedMaterial.supplier || '';
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.newMaterial = {
      _id: '',
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      purchaseDate: this.today, // Fecha actual por defecto
      monthlyFee: false,
      monthlyFeeMonth: 0,
      monthlyPayment: 0,
      totalMonthlyFee: 0,
      interest: 0,
      total: 0,
      supplier: '' // Proveedor del material
    };
  }

  closeModal() {
    this.close.emit();
    this.resetForm();
    document.body.style.overflow = 'auto';
  }

  saveMaterial(): void {
    if (this.newMaterial._id) {
      this.updateMaterial();
    } else {
      this.createMaterial();
    }
  }

  createMaterial(): void {
    this.materialService.createMaterial(this.newMaterial).subscribe({
      next: (material) => {
        Swal.fire('¡Éxito!', 'Material registrado con éxito.', 'success');
        this.expenseService.createExpenseFromMaterial(material).subscribe({
          next: () => {
            Swal.fire('¡Éxito!', 'Gasto registrado con éxito.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'Error al registrar el gasto.', 'error');
          }
        });
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al registrar el material.', 'error');
      }
    });
  }

  updateMaterial(): void {
    this.materialService.updateMaterial(this.newMaterial._id, this.newMaterial).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Material actualizado con éxito.', 'success');
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al actualizar el material.', 'error');
      }
    });
    this.resetForm();
  }

  calculateTotalMonthlyFee() {
    if (this.newMaterial.monthlyPayment !== undefined && this.newMaterial.monthlyFeeMonth !== undefined) {
      this.newMaterial.totalMonthlyFee = this.newMaterial.monthlyPayment * this.newMaterial.monthlyFeeMonth;
    }
  }

  calculateInterest() {
    if (this.newMaterial.monthlyFee) {
      if (this.newMaterial.total !== undefined && this.newMaterial.totalMonthlyFee !== undefined) {
        this.newMaterial.interest = this.newMaterial.totalMonthlyFee - this.newMaterial.total;
      }
    } else {
      this.newMaterial.interest = 0;
    }
  }

  calculateTotal() {
    if (this.newMaterial.price !== undefined && this.newMaterial.quantity !== undefined) {
      this.newMaterial.total = this.newMaterial.price * this.newMaterial.quantity;
      this.calculateInterest();
    }
  }
}
