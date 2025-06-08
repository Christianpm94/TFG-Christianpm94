import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  matches: any[] = [];         // Lista de partidos disponibles
  userId: number | null = null; // ID del usuario logueado

  constructor(
    private matchService: MatchService,     // Servicio que gestiona los partidos
    private toastr: ToastrService,          // Servicio de notificaciones
    private authService: AuthService,       // Servicio de autenticación
    private router: Router                  // Navegación de rutas
  ) {}

  ngOnInit(): void {
    // Escuchamos el observable del usuario
    this.authService.user$.subscribe({
      next: (user) => {
        if (user) {
          // Usuario logueado correctamente
          this.userId = user.id;
          this.cargarPartidos();
        } else if (!this.authService.isAuthenticated()) {
          // Solo mostramos el toast si no hay token válido
          this.toastr.warning('No has iniciado sesión');
        }
      },
      error: () => this.toastr.error('Error al cargar el usuario'),
    });
  }

  // Cargar todos los partidos desde el backend
  cargarPartidos(): void {
    this.matchService.getMatches().subscribe({
      next: (data) => this.matches = data,
      error: () => this.toastr.error('No se pudieron cargar los partidos')
    });
  }

  // Verifica si el usuario está inscrito
  isUserInMatch(match: any): boolean {
    return match.players?.some((p: any) => p.id === this.userId);
  }

  // Verifica si es el creador
  isCreator(match: any): boolean {
    return match.createdBy === this.userId;
  }

  // Verifica si el partido ha expirado
  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }

  // Unirse a un partido
  unirseAlPartido(match: any): void {
    let code: string | undefined;

    if (match.isPrivate) {
      code = prompt('Este partido es privado. Introduce el código:') ?? undefined;
      if (!code) return;
    }

    this.matchService.joinMatch(match.id, code).subscribe({
      next: () => {
        this.toastr.success('Te has unido al partido');
        this.router.navigate(['/match', match.id]); // Redirige a detalles
      },
      error: () => this.toastr.error('No fue posible unirse al partido')
    });
  }

  // Eliminar partido
  eliminarPartido(matchId: number): void {
    if (!confirm('¿Estás seguro de eliminar este partido?')) return;

    this.matchService.deleteMatch(matchId).subscribe({
      next: () => {
        this.toastr.success('Partido eliminado');
        this.matches = this.matches.filter(m => m.id !== matchId);
      },
      error: () => this.toastr.error('No se pudo eliminar el partido')
    });
  }
}
