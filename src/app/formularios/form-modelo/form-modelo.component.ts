import { Component, OnInit } from '@angular/core';
import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PredictService } from '../../services/predict.service';
import Swal from 'sweetalert2';
import { PredictionService } from '../../services/prediction.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Perdict } from '../../interfaces/predict';



@Component({
  selector: 'app-form-modelo',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './form-modelo.component.html',
  styleUrl: './form-modelo.component.css'
})
export class FormModeloComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() selectedMaterial: Perdict | null = null; // Material seleccionado para edición


  constructor(
    private fb: FormBuilder,
    private predictService: PredictService,
    private predictionExpress: PredictionService
  ) {
  }

  ngOnInit(): void {

  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const form = (event.target as HTMLFormElement);
    const predictData: any = {
      InventarioInicial: parseInt(form['InventarioInicial'].value, 10),
      PedidoRealizado: parseInt(form['PedidoRealizado'].value, 10),
      Mes: parseInt(form['Mes'].value, 10),
      Año: parseInt(form['Año'].value, 10),
      Demanda: parseInt(form['Demanda'].value, 10)
    };

    // Mostrar swal de espera
    Swal.fire({
      title: 'Realizando predicción...',
      text: 'Por favor, espere.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.predictService.getPrediction(predictData).subscribe(response => {
      const roundedPrediction = response.prediction.toFixed(2);

      // Cerrar swal de espera
      Swal.close();

      Swal.fire({
        title: 'Predicción realizada',
        text: `La predicción de la demanda para el siguiente mes es: ${roundedPrediction}`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        const predictionDataToSave = {
          ...predictData,
          DemandaSugerida: parseFloat(roundedPrediction)
        };
        this.predictionExpress.createPrediction(predictionDataToSave).subscribe();
      });
    }, error => {
      // Manejar errores y cerrar swal
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo realizar la predicción. Intente nuevamente más tarde.'
      });
    });
  }

  closeModal(): void {
    this.close.emit();
    document.body.style.overflow = 'auto';
  }
}

