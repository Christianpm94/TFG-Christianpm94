import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
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
    this.loginForm = this.fb.group({
      mail: [''],
      password: ['']
    });
  }

  onSubmit(): void {
    const { mail, password } = this.loginForm.value;
    this.authService.login(mail, password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Correo o contraseña incorrectos';
      }
    });
  }
}
