import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AutenticationService } from '../services/autentication.service';
import { User } from '../interfaces/user';
import { NavComponent } from '../nav/nav.component';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-registro',
  imports: [NavComponent, FormsModule, NgClass],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  usuario: User = {
    _id: '',
    name: '',
    lastnameFather: '',
    lastnameMother: '',
    email: '',
    password: '',
    role: { name: 'usuario' } // Definir el rol por defecto como "usuario"
  };

  showPassword: boolean = false; // Variable para mostrar u ocultar la contraseña
  isLoading = false; // Variable para desactivar el botón mientras se envía la solicitud

  constructor(private authService: AutenticationService, private router: Router) { }

  registerUser() {
    if (!this.validateFields()) {
      return;
    }

    this.isLoading = true; // Desactivar el botón mientras se envía la solicitud

    this.authService.signUp(this.usuario).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Registro exitoso, ahora puedes iniciar sesión', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', this.handleErrors(err), 'error');
      },
    });
  }

  // Validación de campos antes de enviar la solicitud
  private validateFields(): boolean {
    if (!this.usuario.name || !this.usuario.lastnameFather || !this.usuario.lastnameMother || !this.usuario.email || !this.usuario.password) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return false;
    }

    if (this.usuario.password.length < 6) {
      Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.usuario.email)) {
      Swal.fire('Error', 'Ingrese un correo electrónico válido', 'error');
      return false;
    }

    return true;
  }

  // Manejo de errores del backend
  private handleErrors(error: any): string {
    if (error.status === 400) {
      return 'El correo ya está registrado. Intenta con otro.';
    } else if (error.status === 500) {
      return 'Ocurrió un error en el servidor. Intenta más tarde.';
    } else {
      return 'Hubo un problema con el registro. Verifica tus datos.';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }
}
