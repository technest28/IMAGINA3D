import { Component } from '@angular/core';
import { AutenticationService } from '../services/autentication.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, NavComponent, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  user = { email: '', password: '' };
  showPassword: boolean = false; // visibilidad de la contraseña

  constructor(private AutenticationService: AutenticationService) {}

  login() {
    if (!this.user.email || !this.user.password) {
      Swal.fire('Error', 'Por favor, completa todos los campos', 'error');
      return;
    }

    Swal.fire({
      title: 'Cargando...',
      text: 'Por favor, espera mientras procesamos tu solicitud.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar animación de carga
      }
    });

    this.AutenticationService.login(this.user).subscribe({
      next: () => {
        Swal.close(); // Cerrar el modal de carga
        Swal.fire('Bienvenido', 'Inicio de sesión exitoso', 'success');
      },
      error: () => {
        Swal.close(); // Cerrar el modal de carga
        Swal.fire('Error', 'Correo o contraseña incorrectos', 'error');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
