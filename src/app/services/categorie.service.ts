import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Category } from '../interfaces/categorie'; // Actualiza la ruta a interface

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiUrl = environment.apiUrl; // Usa la URL del entorno

  constructor(private http: HttpClient) { }

  // Obtener todos los Categoriees
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}categories`)
      .pipe(
        retry(2), // Reintenta la petición hasta 2 veces en caso de fallo
        catchError(this.handleError)
      );
  }

  // Obtener un Categorie por ID
  getCategorieById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}categories/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear un nuevo Categorie
  createCategorie(Categorie: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}categories`, Categorie)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Actualizar un Categorie existente
  updateCategorie(id: string, Categorie: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}categories/${id}`, Categorie)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Eliminar un Categorie
  deleteCategorie(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}categories/${id}`)
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
