// import { CanActivateFn } from '@angular/router';
// import { inject } from '@angular/core';
// import { AutenticationService } from './services/autentication.service';
// import { Router } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AutenticationService);
//   const router = inject(Router);

//   const isAuthenticated = authService.isAuthenticated();
//   const requiredRole = route.data['requiredRole'];
//   const userRole = authService.getRole();

//   if (!isAuthenticated) {
//     router.navigate(['/login']);
//     return false;
//   }

//   if (requiredRole && userRole !== requiredRole) {
//     router.navigate(['/landing-page']);
//     return false;
//   }

//   return true;
// };
