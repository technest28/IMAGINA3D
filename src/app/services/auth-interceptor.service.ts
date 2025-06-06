import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token'); // Solo en navegador
    }

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
