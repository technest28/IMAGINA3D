import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { User } from '../interfaces/user';
import { UserService } from '../services/user.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { FormUsuariosComponent } from '../formularios/form-usuarios/form-usuarios.component';
import { NgFor, NgIf } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  imports: [ FormUsuariosComponent, NgIf, NgFor],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Agregar el esquema para reconocer propiedades personalizadas
})
export class UsuariosComponent {

  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  selectedUser: User | null = null;
  showCreateModal = false;

  private subscriptions: Subscription = new Subscription();

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 8;


  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  // Cargar usuarios desde el servicio
  loadUsers(): void {
    Swal.fire({
      title: 'Cargando usuarios...',
      text: 'Por favor, espera mientras se cargan los datos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar animación de carga
      }
    });

    const usersSub = this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        Swal.close(); // Cerrar el modal de carga
        this.users = users;
        this.filteredUsers = users;
        this.currentPage = 1; // Reinicia la paginación al cargar nuevos datos
      },
      error: (error: string) => {
        Swal.close(); // Cerrar el modal de carga
        Swal.fire('Error', error, 'error');
      }
    });
    this.subscriptions.add(usersSub);
  }


  // Filtrar la tabla de usuarios
  filterTable(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user =>
        Object.values(user).some(val =>
          String(val).toLowerCase().includes(term)
        )
      );
    }
    this.currentPage = 1; // Reinicia la página al aplicar el filtro
  }

  openCreateModal(): void {
    this.selectedUser = null;
    this.showCreateModal = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  updateUser(user: User): void {

    this.selectedUser = { ...user }; // Clonar el usuario seleccionado
    this.showCreateModal = true; // Mostrar el modal del formulario
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  deleteUser(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            // Actualiza ambas listas
            this.users = this.users.filter(user => user._id !== id);
            this.filteredUsers = this.filteredUsers.filter(user => user._id !== id);
            Swal.fire('Eliminado', 'El usuario ha sido eliminado correctamente.', 'success');
            // Si la página actual queda sin elementos y no es la primera, retrocede una página
            if (this.paginatedUsers.length === 0 && this.currentPage > 1) {
              this.currentPage--;
            }
          },
          error: (error) => {
            Swal.fire('Error', 'Error al eliminar el usuario.', 'error');
            console.error(error);
          }
        });
      }
    });
  }


  closeCreateModal(): void {
    this.showCreateModal = false;
    this.loadUsers(); // Recargar la lista de usuarios
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }


  // Devuelve los usuarios de la página actual
  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calcula el total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  // Cambia a la página siguiente (si existe)
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Cambia a la página anterior (si existe)
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Ir a una página específica
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
