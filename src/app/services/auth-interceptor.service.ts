import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token'); // Obtiene el token del almacenamiento local

    if (token) {
      // Si hay un token, clona la solicitud y agrega el encabezado de autorización
      const clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Agrega el token como 'Bearer'
        }
      });
      return next.handle(clonedRequest); // Pasa la solicitud modificada
    }

    // Si no hay token, pasa la solicitud original sin modificar
    return next.handle(request);
  }
}
