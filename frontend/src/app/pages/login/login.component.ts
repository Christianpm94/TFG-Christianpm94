import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  // Importamos los módulos necesarios para los formularios y estructuras comunes
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Se inicializa el formulario con los campos mail y password
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit(): void {
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (res) => {
        // Guarda el token en localStorage y redirige al home
        this.authService.saveToken(res.token);
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Correo o contraseña incorrectos';
      }
    });
  }
}
