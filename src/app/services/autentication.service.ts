import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Corrige la importación de jwtDecode
import { environment } from '../../environments/environment'; // Corrige la ruta de environment

@Injectable({
  providedIn: 'root'
})
export class AutenticationService {
  private apiUrl = environment.apiUrl; // Usa la URL del entorno
  private currentUserSubject: BehaviorSubject<any>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(this.loadCurrentUser());
  }

  login(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}signin`, user).pipe(
      tap(res => {
        this.saveToken(res.token);
        this.router.navigate(['/dashboard']); // Redirige al dashboard
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode(token) as any; // Decodifica el token
    this.currentUserSubject.next(decodedUser); // Actualiza el BehaviorSubject
    localStorage.setItem('role', decodedUser.role); // Guarda el rol del usuario
    localStorage.setItem('name', decodedUser.name); // Guarda el nombre
    localStorage.setItem('email', decodedUser.email); // Guarda el email
  }

  private loadCurrentUser(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token); // Decodifica el token
    }
    return null;
  }

  public get currentUserObservable(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  signOut(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}signout`, {}).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }

  signUp(user: any) {
    // Asignar el ID del rol de "usuario" predeterminado al objeto user
    user.roleName = 'usuario';
    return this.http.post<any>(`${this.apiUrl}signup`, user);
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    this.currentUserSubject.next(null);
  }

  checkEmailExistence(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}checkEmail`, { email });
  }

  updatePassword(email: string, newPassword: string): Observable<any> {
    const body = { email, newPassword };
    return this.http.post(`${this.apiUrl}updatePassword`, body);
  }
}
