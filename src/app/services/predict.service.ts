import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de que la ruta sea correcta


@Injectable({
  providedIn: 'root'
})
export class PredictService {
  private apiUrl = environment.predictApiUrl + 'predict'; // Usa la URL del entorno

  constructor(private http: HttpClient) {}

  getPrediction(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
