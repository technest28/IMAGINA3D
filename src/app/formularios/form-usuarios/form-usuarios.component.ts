import { NgFor, NgIf } from '@angular/common';
import { Component, Input, NgModule, Output } from '@angular/core';
import { EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Role } from '../../interfaces/role';
import { User } from '../../interfaces/user';
import { AutenticationService } from '../../services/autentication.service';
import { RoleService } from '../../services/role.service';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-form-usuarios',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './form-usuarios.component.html',
  styleUrl: './form-usuarios.component.css'
})
export class FormUsuariosComponent implements OnChanges {
  @Input() selectedUser: User | null = null; // Recibe el usuario seleccionado para editar
  @Output() close = new EventEmitter<void>();

  newUser: User = {
    _id: '',
    name: '',
    lastnameFather: '',
    lastnameMother: '',
    email: '',
    password: '', // Asegúrate de que el campo password esté presente
    role: { name: 'usuario' } // Inicializa el nombre del rol
  };

  roles: Role[] = []; // Lista de roles
  isLoading = false; // Variable para desactivar el botón mientras se envía la solicitud

  constructor(private authService: AutenticationService, private userService: UserService, private roleService: RoleService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedUser'] && this.selectedUser) {
      this.newUser = { ...this.selectedUser }; // Clonar los datos del usuario seleccionado
      if (this.selectedUser.role && typeof this.selectedUser.role === 'object') {
        this.newUser.role = {
          _id: this.selectedUser.role._id || '',
          name: this.selectedUser.role.name || ''
        };
      }
    } else {
      this.resetForm();
    }
  }

  ngOnInit(): void {
    this.loadRoles(); // Cargar roles al inicializar el formulario
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles: Role[]) => {
        this.roles = roles;
      },
      error: (error) => {
        Swal.fire('Error', 'Error al cargar los roles.', 'error');
        console.error(error);
      }
    });
  }

  resetForm(): void {
    this.newUser = {
      _id: '',
      name: '',
      lastnameFather: '',
      lastnameMother: '',
      email: '',
      password: '', // Asegúrate de que el campo password esté presente
      role: { name: '' } // Inicializa el nombre del rol
    };
  }

  closeModal(): void {
    this.close.emit(); // Emitir el evento de cierre
    document.body.style.overflow = 'auto';
  }

  saveUser(): void {
    if (this.newUser._id) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    if (!this.validateFields()) {
      return;
    }

    this.isLoading = true; // Desactivar el botón mientras se envía la solicitud

    this.authService.signUp(this.newUser).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Usuario creado con éxito.', 'success');
        this.closeModal();
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', this.handleErrors(error), 'error');
      }
    });
  }

  // Validación de campos antes de enviar la solicitud
  private validateFields(): boolean {
    if (!this.newUser.name || !this.newUser.lastnameFather || !this.newUser.lastnameMother || !this.newUser.email || !this.newUser.password) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return false;
    }

    if (this.newUser.password.length < 6) {
      Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.newUser.email)) {
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

  updateUser(): void {
    const updatePayload = { ...this.newUser };

    // Excluir el campo password del payload de actualización
    delete updatePayload.password;

    this.userService.updateUser(this.newUser._id, updatePayload).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Usuario actualizado con éxito.', 'success');
        this.closeModal();
      },
      error: (error) => {
        Swal.fire('Error', 'Error al actualizar el usuario.', 'error');
        console.error(error);
      }
    });
  }


}
