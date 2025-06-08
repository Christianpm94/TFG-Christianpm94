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
  user: any = null;                  // Usuario actualmente logueado
  private toastShown = false;       // Controla si se ha mostrado el toast de bienvenida
  private userSub!: Subscription;   // Suscripción al observable de usuario

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Se suscribe al observable del estado del usuario en AuthService
    this.userSub = this.authService.user$.subscribe({
      next: (userData) => {
        const firstLogin = !this.user && userData; // Detecta si es el primer login
        this.user = userData;

        // Mostrar toast de bienvenida una sola vez
        if (firstLogin && !this.toastShown) {
          this.toastr.success(`Bienvenido, ${userData.name}`, 'Sesión iniciada');
          this.toastShown = true;
        }

        // Si el usuario se desloguea, reiniciamos toast
        if (!userData) {
          this.toastShown = false;
        }
      },
      error: () => {
        this.user = null;
        this.toastShown = false;
      }
    });
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout(); // Limpia token y estado
    this.user = null;
    this.toastShown = false;

    this.toastr.info('Sesión cerrada', 'Hasta pronto');
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario está autenticado (por si se requiere usar en lógica del template)
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Limpieza de la suscripción al destruir el componente
   */
  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}

