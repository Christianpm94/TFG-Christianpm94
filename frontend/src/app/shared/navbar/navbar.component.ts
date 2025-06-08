import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: [],
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: any = null; // Usuario logueado actualmente
  private toastShown = false; // Controla si el toast de bienvenida ya se mostró
  private userSub!: Subscription; // Suscripción al estado del usuario

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Se suscribe al observable del usuario
    this.userSub = this.authService.user$.subscribe({
      next: (userData) => {
        const firstLogin = !this.user && userData; // Detecta primer login
        this.user = userData;

        if (firstLogin && !this.toastShown) {
          this.toastr.success(`Bienvenido, ${userData.name}`, 'Sesión iniciada');
          this.toastShown = true;
        }

        if (!userData) {
          this.toastShown = false; // Reinicia si se desloguea
        }
      },
      error: () => {
        this.user = null;
        this.toastShown = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.user = null;
    this.toastShown = false;
    this.toastr.info('Sesión cerrada', 'Hasta pronto');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated(); // Utilidad para verificar login
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}

