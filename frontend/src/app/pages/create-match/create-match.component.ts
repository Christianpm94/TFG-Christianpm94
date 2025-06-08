import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatchService } from '../../services/match.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-match',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-match.component.html',
})
export class CreateMatchComponent {
  matchForm: FormGroup;  // Formulario reactivo para crear un partido
  loading = false;       // Estado de carga al enviar el formulario

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private toastr: ToastrService,
    private router: Router
  ) {
    // Definimos el formulario y validaciones
    this.matchForm = this.fb.group({
      type: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      isPrivate: [false],
      code: [''] // Se usará solo si el partido es privado
    });
  }

  /**
   * Se ejecuta al enviar el formulario de creación de partido.
   */
  onSubmit(): void {
    if (this.matchForm.invalid) {
      this.toastr.error('Por favor completa todos los campos obligatorios', 'Error');
      return;
    }

    this.loading = true;

    const formValue = this.matchForm.value;

    // Preparamos los datos del partido a enviar al backend
    const matchData = {
      type: formValue.type,
      location: formValue.location,
      date: formValue.date,
      isPrivate: formValue.isPrivate,
      code: formValue.isPrivate ? formValue.code : null
    };

    // Petición para crear el partido
    this.matchService.createMatch(matchData).subscribe({
      next: (res: any) => {
        this.toastr.success('Partido creado correctamente', 'Éxito');

        // Si el partido es privado, mostramos el código de acceso
        if (res.joinCode) {
          this.toastr.info(`Código de acceso: ${res.joinCode}`, 'Partido privado');
        }

        // 🔁 Una vez creado, nos unimos automáticamente al partido
        this.matchService.joinMatch(res.id, res.joinCode).subscribe({
          next: () => {
            this.toastr.success('Te has unido automáticamente al partido', 'Unido');
            this.router.navigate(['/match', res.id]); // Redirigimos al detalle del partido
          },
          error: () => {
            this.toastr.warning('No se pudo unir automáticamente al partido', 'Advertencia');
            this.router.navigate(['/']); // Redirige al home si falla la unión
          }
        });
      },
      error: () => {
        this.toastr.error('Hubo un error al crear el partido', 'Error');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
