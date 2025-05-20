import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AutenticationService } from '../services/autentication.service';
import { Location } from '@angular/common';
import { HostListener } from '@angular/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  role: string | null = '';

  userName: string = '';
  userEmail: string = '';
  userRole: string = '';

  isOpen = false;

  constructor(private authservice: AutenticationService, private router: Router, private location: Location) {}

  ngOnInit(): void {
    this.authservice.currentUserObservable.subscribe(user => {
      if (user) {
        this.userName = user.name;
        this.userEmail = user.email;
        this.userRole = user.role;
      }
    });
  }

  get isAdministrator(): boolean {
    return this.authservice.getRole() === 'administrador';
  }

  get isUserNormal(): boolean {
    return this.authservice.getRole() === 'usuario';
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  onSignOut(): void {
    Swal.fire({
      title: 'Cerrando sesión...',
      text: 'Por favor, espera mientras procesamos tu solicitud.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authservice.signOut().subscribe({
      next: () => {
        Swal.close();
        Swal.fire('Éxito', 'Sesión cerrada exitosamente', 'success');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        Swal.close();
        Swal.fire('Error', 'Error al cerrar sesión', 'error');
        console.error('Error al cerrar sesión');
      },
    });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any): void {
    this.location.forward();
  }
}
