import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token =this.authService.getToken();
    if (this.authService.getToken()) {
      this.authService.getUser().subscribe({
        next: (data) => this.user = data,
        error: () => this.user = null
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.user = null;
    window.location.reload(); // recarga para actualizar visibilidad del navbar
  }
}
