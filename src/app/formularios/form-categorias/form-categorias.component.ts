import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CategorieService } from '../../services/categorie.service';
import Swal from 'sweetalert2';
import { Category } from '../../interfaces/categorie';



@Component({
  selector: 'app-form-categorias',
  imports: [FormsModule],
  templateUrl: './form-categorias.component.html',
  styleUrl: './form-categorias.component.css'
})
export class FormCategoriasComponent implements OnChanges {
  @Output() close = new EventEmitter<void>();
  @Input() selectedCategory: Category | null = null; // Categoría seleccionada para edición

  newCategory: Category = {
    _id: '',
    name: '',
    description: ''
  };

  constructor(private categorieService: CategorieService) { }

  // Se ejecuta cuando `selectedCategory` cambia
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory'] && this.selectedCategory) {
      this.newCategory = { ...this.selectedCategory };
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.newCategory = {
      _id: '',
      name: '',
      description: ''
    };
  }

  closeModal() {
    this.close.emit();
    this.resetForm();
    document.body.style.overflow = 'auto';
  }

  saveCategory(): void {
    if (this.newCategory._id) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  createCategory(): void {
    this.categorieService.createCategorie(this.newCategory).subscribe({
      next: (category) => {
        Swal.fire('¡Éxito!', 'Categoría registrada con éxito.', 'success');
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al registrar la categoría.', 'error');
      }
    });
  }

  updateCategory(): void {
    this.categorieService.updateCategorie(this.newCategory._id!, this.newCategory).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Categoría actualizada con éxito.', 'success');
        this.closeModal();
      },
      error: () => {
        Swal.fire('Error', 'Error al actualizar la categoría.', 'error');
      }
    });
    this.resetForm();
  }
}

