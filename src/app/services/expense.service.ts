import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Corrige la ruta de environment
import { Expense } from '../interfaces/expense'; // Actualiza la ruta a interface
import { Material } from '../interfaces/material'; // Actualiza la ruta a interface

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = environment.apiUrl; // Usa la URL del entorno

  constructor(private http: HttpClient) {}

  // Obtener todos los gastos
  getAllExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl + 'expenses')
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Obtener un gasto por ID
  getExpenseById(id: string): Observable<Expense> {
    return this.http.get<Expense>(this.apiUrl + 'expenses/' + id)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear un nuevo gasto
  createExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl + 'expenses', expense)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear un nuevo gasto a partir de un material
  createExpenseFromMaterial(material: Material): Observable<Expense> {
    const expense: Expense = {
      _id: '',
      customer: 'Material Purchase',
      item: material.name,
      date: material.purchaseDate,
      cost: material.total || 0,
      description: material.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.createExpense(expense);
  }

  // Actualizar un gasto existente
  updateExpense(id: string, expense: Expense): Observable<Expense> {
    return this.http.put<Expense>(this.apiUrl + 'expenses/' + id, expense)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Eliminar un gasto
  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + 'expenses/' + id)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
