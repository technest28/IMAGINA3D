import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import Swal from 'sweetalert2';
import { Day } from '../../interfaces/day';
import { Expense } from '../../interfaces/expense';



@Component({
  selector: 'app-form-gastos',
  imports: [ FormsModule ],
  templateUrl: './form-gastos.component.html',
  styleUrl: './form-gastos.component.css'
})
export class FormGastosComponent implements OnChanges {

  @Output() close = new EventEmitter<void>();
  @Input() selectedExpense: Expense | null = null; // Recibe el egreso a editar

  daysOfWeek: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  closeModal() {
    this.close.emit();
    document.body.style.overflow = 'auto';
  }

  day: Day[] = [];
  newExpense: Expense = {
    _id: '',
    customer: '',
    item: '',
    date: '',
    // month: '',
    cost: 0,
    description: '',
    salaryDetails: this.initializeSalaryDetails(),
    /*  weeklySalary: 0 */
  };

  constructor(private expenseService: ExpenseService) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedExpense'] && this.selectedExpense) {
      this.newExpense = { ...this.selectedExpense };
      if (this.newExpense.date) {
        const date = new Date(this.newExpense.date);
        this.newExpense.date = date.toISOString().split('T')[0]; // Extrae solo la parte de la fecha
      }
    } else {
      this.resetForm();
    }
    this.updateTotalCost();
  }

  resetForm(): void {
    this.newExpense = {
      _id: '',
      customer: '',
      item: '',
      date: '',
      // month: '',
      cost: 0,
      description: '',
      salaryDetails: this.initializeSalaryDetails(),
      /* weeklySalary: 0 */
    };
  }

  // Se ejecuta cuando `selectedExpense` cambia
  saveExpense(): void {
    if (this.newExpense._id) {
      this.updateExpense();
    } else {
      this.createExpense();
    }
  }

  //Crear un nuevo egreso
  createExpense(): void {
    this.expenseService.createExpense(this.newExpense).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Egreso creado con éxito.', 'success');
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al crear el egreso.', 'error');
      }
    });
  }

  //Actualizar un egreso
  updateExpense(): void {
    this.expenseService.updateExpense(this.newExpense._id, this.newExpense).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Egreso actualizado con éxito.', 'success');
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al actualizar el egreso.', 'error');
      }
    });
  }

  initializeSalaryDetails(): Day[] {
    return this.daysOfWeek.map(day => ({
      day,
      date: new Date(),
      startTime: '',
      endTime: '',
      price: 0
    }));
  }

  onItemChange(): void {
    if (this.newExpense.item === 'Sueldo') {
      this.newExpense.salaryDetails = this.initializeSalaryDetails();
    } else if (this.newExpense.item !== 'Otros') {
      this.newExpense.description = '';
    }
    this.updateTotalCost();
  }

  onTimeOrPriceChange(day: Day): void {
    day.totalPrice = this.calculateTotal(day);
    this.updateTotalCost();
  }


  calculateTotal(day: Day): number {
    if (!day.startTime || !day.endTime || !day.price) {
      return 0;
    }
    const startTime = new Date(`1970-01-01T${day.startTime}:00`);
    const endTime = new Date(`1970-01-01T${day.endTime}:00`);
    let hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (hoursWorked < 0) {
      hoursWorked += 24; // Se resta un día
    }
    return hoursWorked * day.price;
  }

  // actualizar el costo total
  updateTotalCost(): void {
    if (this.newExpense.item === 'Sueldo' && this.newExpense.salaryDetails) {
      this.newExpense.cost = this.newExpense.salaryDetails.reduce((total, day) => total + (day.totalPrice || 0), 0);
    }
  }

}

