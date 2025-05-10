import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de que la ruta sea correcta
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { retry } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PredictionService {


  private apiUrl = environment.apiUrl; // Usa la URL del entorno

  constructor(private http: HttpClient) { }

  // Obtener todas las Predicciones
  getAllPredictions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}prediction`)
      .pipe(
        retry(2), // Reintenta la petición hasta 2 veces en caso de fallo
        catchError(this.handleError)
      );
  }

  // Obtener una Predicción por ID
  getPredictionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}prediction/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear una nueva Predicción
  createPrediction(prediction: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}prediction`, prediction)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Actualizar una Predicción existente
  updatePrediction(id: string, prediction: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}prediction/${id}`, prediction)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Eliminar una Predicción
  deletePrediction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}prediction/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Guardar los datos de predicción
  savePredictionData(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}prediction`, data)
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
