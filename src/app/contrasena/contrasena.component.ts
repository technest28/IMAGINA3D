import { Component } from '@angular/core';
import { AutenticationService } from '../services/autentication.service';
import swal from 'sweetalert2';
import { Router } from '@angular/router'; // Importa Router
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-contrasena',
  imports: [FormsModule, NavComponent],
  templateUrl: './contrasena.component.html',
  styleUrl: './contrasena.component.css'
})
export class ContrasenaComponent {
  email: string = '';
  newPassword: string = '';
  emailValidated: boolean = false;

  constructor(private authService: AutenticationService, private router: Router) {}

  onSubmit() {
    if (this.email) {
      this.authService.checkEmailExistence(this.email).subscribe(
        (res: any) => {
          // Si el API devuelve 200, el correo existe
  /*         console.log(res.message); */
          this.emailValidated = true; // Muestra el formulario para actualizar contraseña
        },
        (error) => {

          if (error.status === 404) {
            swal.fire('Error', 'El correo no existe en nuestra base de datos.', 'error');

          } else {
            /* console.error('Error al verificar el correo:', error); */
            swal.fire('Error', 'Ocurrió un error al verificar el correo.', 'error');
          }
        }
      );
    }
  }

  // Método que se ejecuta al enviar el formulario para actualizar la contraseña
  onUpdatePassword() {
    if (this.email && this.newPassword) {
      this.authService.updatePassword(this.email, this.newPassword).subscribe(
        (res: any) => {
          swal.fire('Éxito', 'Contraseña actualizada correctamente.', 'success').then(() => {
            this.router.navigate(['/login']); // Redirige al login
          });
        },
        (error) => {
         /*  console.error('Error al actualizar la contraseña:', error); */
          swal.fire('Error', 'Ocurrió un error al actualizar la contraseña.', 'error');
        }
      );
    }
  }
}
