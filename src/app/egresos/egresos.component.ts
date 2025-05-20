import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { Expense } from '../interfaces/expense';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { FormGastosComponent } from '../formularios/form-gastos/form-gastos.component';
import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';


@Component({
  selector: 'app-egresos',
  imports: [FormsModule, FormGastosComponent, NgFor, NgIf, CurrencyPipe, DatePipe],
  templateUrl: './egresos.component.html',
  styleUrl: './egresos.component.css'
})
export class EgresosComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  searchTerm: string = '';
  private subscriptions: Subscription = new Subscription();

  // Paginación: 8 elementos por página
  currentPage: number = 1;
  itemsPerPage: number = 8;

  selectedExpense: Expense | null = null; // Mantener el egreso seleccionado

  showModal = false;
  showCreateModal = false;

  constructor(private expenseService: ExpenseService) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  // Cargar gastos desde el servicio
  loadExpenses(): void {
    Swal.fire({
      title: 'Cargando egresos...',
      text: 'Por favor, espera mientras se cargan los datos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar animación de carga
      }
    });

    const expenseSub = this.expenseService.getAllExpenses().subscribe({
      next: (expenses: Expense[]) => {
        Swal.close(); // Cerrar el modal de carga
        this.expenses = expenses;
        this.filteredExpenses = expenses;
        this.currentPage = 1; // Reinicia la paginación al cargar los datos
      },
      error: (error: string) => {
        Swal.close(); // Cerrar el modal de carga
        Swal.fire('Error', error, 'error');
      }
    });
    this.subscriptions.add(expenseSub);
  }

  // Filtrar la tabla de gastos
  filterTable(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredExpenses = this.expenses;
      return;
    }
    this.filteredExpenses = this.expenses.filter(expense =>
      Object.values(expense).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );
    this.currentPage = 1; // Reinicia la página al aplicar el filtro
  }

  addExpense(): void {
    Swal.fire('Agregar gasto', 'Formulario para agregar gasto', 'info');
  }

  editExpense(expense: Expense): void {
    this.selectedExpense = { ...expense }; // Clonar el egreso seleccionado
    this.showCreateModal = true;
    document.body.style.overflow = 'hidden';
  }

  deleteExpense(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.expenseService.deleteExpense(id).subscribe({
          next: () => {
            this.expenses = this.expenses.filter(exp => exp._id !== id);
            this.filteredExpenses = this.filteredExpenses.filter(exp => exp._id !== id);
            Swal.fire('Eliminado', 'El gasto ha sido eliminado correctamente.', 'success');
            if (this.paginatedExpenses.length === 0 && this.currentPage > 1) {
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


  openCreateModal(): void {
    this.showCreateModal = true;
    this.showModal = false;
    this.selectedExpense = null; // Asegurarse de que no haya egreso seleccionado
    document.body.style.overflow = 'hidden';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.loadExpenses();
    document.body.style.overflow = 'auto';
  }

  // Devuelve los egresos de la página actual
  get paginatedExpenses(): Expense[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredExpenses.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calcula el total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredExpenses.length / this.itemsPerPage);
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
