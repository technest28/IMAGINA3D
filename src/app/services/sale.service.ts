import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de que la ruta sea correcta
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { retry } from 'rxjs/operators';
import { Sale } from '../interfaces/sale'; // Asegúrate de que la ruta sea correcta


@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = environment.apiUrl; // Usa la URL del entorno

  constructor(private http: HttpClient) { }

  // Obtener todas las ventas
  getAllSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.apiUrl + 'sales')
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Obtener una venta por ID
  getSaleById(id: string): Observable<Sale> {
    return this.http.get<Sale>(this.apiUrl + 'sales/' + id)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear una nueva venta
  createSale(sale: Sale): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl + 'sales', sale)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Actualizar una venta existente
  updateSale(id: string, sale: Sale): Observable<Sale> {
    return this.http.put<Sale>(this.apiUrl + 'sales/' + id, sale)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Eliminar una venta
  deleteSale(id: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + 'sales/' + id)
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
