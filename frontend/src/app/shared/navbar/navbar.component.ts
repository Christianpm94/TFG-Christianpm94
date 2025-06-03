import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // Para directivas como *ngIf
import { RouterModule } from '@angular/router'; // Para routerLink y routerLinkActive

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: [],
  imports: [CommonModule, RouterModule] // <-- IMPORTANTE
})
export class NavbarComponent implements OnInit {
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      this.authService.getUser().subscribe({
        next: (data) => this.user = data,
        error: () => this.user = null
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.user = null;
    window.location.reload(); // actualiza el navbar al cerrar sesión
  }
}
