import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate de que la ruta sea correcta
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { retry } from 'rxjs/operators';
import { User } from '../interfaces/user'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private apiUrl = environment.apiUrl; // Usa la URL del entorno

  constructor(private http: HttpClient) { }


  // Obtener todos los usuarios
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl + 'AllUsers')
      .pipe(
        retry(2), // Reintenta la petición hasta 2 veces en caso de fallo
        catchError(this.handleError)
      );
  }

  createUser(user: User): Observable<User> {
    // Construir el payload con el formato esperado
    const payload = {
      name: user.name,
      lastnameFather: user.lastnameFather,
      lastnameMother: user.lastnameMother,
      email: user.email,
      password: user.password,
      roleName: user.role.name // Enviar solo el nombre del rol
    };

    return this.http.post<User>(this.apiUrl + 'createUser', payload)
      .pipe(
        catchError(this.handleError)
      );
  }


  // Actualizar un usuario existente
  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}updateUser/${id}`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Eliminar un usuario
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}deleteUser/${id}`)
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
    //
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
