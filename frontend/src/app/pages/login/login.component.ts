// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Inicializa el formulario con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.toastr.error('Rellena todos los campos correctamente.', 'Error');
      return;
    }

    const { email, password } = this.loginForm.value;

    // ✅ Esperamos a que el usuario se cargue antes de redirigir
    this.authService.login(email, password).pipe(
      switchMap(() => {
        return this.authService.user$; // Esperamos el usuario cargado
      })
    ).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.toastr.error('Correo o contraseña incorrectos', 'Error de login');
      }
    });
  }
}
