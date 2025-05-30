import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatchService } from '../../services/match.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-match',
  standalone: true,
  templateUrl: './create-match.component.html',
  styleUrl: './create-match.component.scss',
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateMatchComponent {
  matchForm: FormGroup;

  constructor(private fb: FormBuilder, private matchService: MatchService) {
    // Inicialización del formulario con los campos necesarios
    this.matchForm = this.fb.group({
      type: ['Fútbol Sala (Parqué)'],
      location: [''],
      datetime: [''],
      isPrivate: [false]
    });
  }

  // Función que se ejecuta al enviar el formulario
  onSubmit(): void {
    const formData = this.matchForm.value;

    // Formatear datos si es necesario (por ejemplo, convertir fecha a formato ISO)
    const matchData = {
      type: formData.type,
      location: formData.location,
      datetime: formData.datetime,
      isPrivate: formData.isPrivate
    };

    this.matchService.createMatch(matchData).subscribe({
      next: response => {
        console.log('Partido creado con éxito:', response);
        // Aquí podrías redirigir a otra página, por ejemplo al listado o detalle
      },
      error: err => {
        console.error('Error al crear partido:', err);
      }
    });
  }
}
