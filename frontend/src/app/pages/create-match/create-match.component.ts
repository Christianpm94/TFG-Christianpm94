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
  matchForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.matchForm = this.fb.group({
      type: ['', Validators.required],
      location: ['', Validators.required],
      date: ['', Validators.required],
      isPrivate: [false],
      code: [''] // solo se usará si isPrivate es true
    });
  }

  onSubmit(): void {
    if (this.matchForm.invalid) {
      this.toastr.error('Por favor completa todos los campos', 'Error');
      return;
    }

    this.loading = true;
    const formValue = this.matchForm.value;

    const matchData = {
      type: formValue.type,
      location: formValue.location,
      date: formValue.date,
      isPrivate: formValue.isPrivate,
      code: formValue.isPrivate ? formValue.code : null
    };

    this.matchService.createMatch(matchData).subscribe({
      next: (res: any) => {
        this.toastr.success('Partido creado correctamente', 'Éxito');

        if (res.joinCode) {
          this.toastr.info(`Código de acceso: ${res.joinCode}`, 'Partido privado');
        }

        this.router.navigate(['/match', res.id]);
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
