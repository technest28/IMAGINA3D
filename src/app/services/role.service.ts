import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de que la ruta sea correcta
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { retry } from 'rxjs/operators';
import { Role } from '../interfaces/role'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiUrl; // Usa la URL del entorno

  constructor(private http: HttpClient) { }

  // Obtener todos los roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl + 'AllRoles')
      .pipe(
        retry(2), // Reintenta la petición hasta 2 veces en caso de fallo
        catchError(this.handleError)
      );
  }

  // Obtener un rol por su ID
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}Roles/${id}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Crear un nuevo rol
  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl + 'Roles', role)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Actualizar un rol existente
  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}Roles/${id}`, role)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Eliminar un rol
  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}Roles/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
