import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: [],
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  user: any = null;
  private toastShown = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe({
      next: (userData) => {
        const firstLogin = !this.user && userData;
        this.user = userData;

        if (firstLogin && !this.toastShown) {
          this.toastr.success(`Bienvenido, ${userData.name}`, 'Sesión iniciada');
          this.toastShown = true;
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
}
