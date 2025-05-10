import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Material } from '../interfaces/material';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}materials`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  getMaterialById(id: string): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}materials/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createMaterial(material: Material): Observable<Material> {
    return this.http.post<Material>(`${this.apiUrl}materials`, material)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateMaterial(id: string, material: Material): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}materials/${id}`, material)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteMaterial(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}materials/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

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
