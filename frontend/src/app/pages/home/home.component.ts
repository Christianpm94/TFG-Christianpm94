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
  userId: number | null = null; // ID del usuario actualmente logueado

  constructor(
    private matchService: MatchService,     // Servicio que gestiona los partidos
    private toastr: ToastrService,          // Servicio de notificaciones (toasts)
    private authService: AuthService,       // Servicio de autenticación y usuario actual
    private router: Router                  // Para redireccionar a otras rutas
  ) {}

  ngOnInit(): void {
    //  Escuchamos el observable user$ para detectar cuándo el usuario está disponible
    this.authService.user$.subscribe({
      next: (user) => {
        if (user) {
          // Guardamos el ID del usuario logueado
          this.userId = user.id;
          // Cargamos los partidos solo si el usuario existe
          this.cargarPartidos();
        } else {
          // Si no hay usuario, mostramos un aviso
          this.toastr.warning('No has iniciado sesión');
        }
      },
      error: () => this.toastr.error('Error al cargar el usuario'),
    });
  }

  //  Carga todos los partidos desde el backend
  cargarPartidos(): void {
    this.matchService.getMatches().subscribe({
      next: (data) => this.matches = data, // Guardamos la lista de partidos
      error: () => this.toastr.error('No se pudieron cargar los partidos')
    });
  }

  //  Comprueba si el usuario está inscrito en el partido
  isUserInMatch(match: any): boolean {
    return match.players?.some((p: any) => p.id === this.userId);
  }

  //  Comprueba si el usuario es el creador del partido
  isCreator(match: any): boolean {
    return match.createdBy === this.userId;
  }

  //  Comprueba si el partido ya ha pasado en el tiempo
  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }

  //  Permite unirse a un partido (con código si es privado)
  unirseAlPartido(match: any): void {
    let code: string | undefined;

    if (match.isPrivate) {
      // Si el partido es privado, pedimos el código
      code = prompt('Este partido es privado. Introduce el código:') ?? undefined;
      if (!code) return;
    }

    // Llamamos al backend para unirnos
    this.matchService.joinMatch(match.id, code).subscribe({
      next: () => {
        this.toastr.success('Te has unido al partido');
        this.router.navigate(['/match', match.id]); // Redirige a los detalles del partido
      },
      error: () => {
        this.toastr.error('No fue posible unirse al partido');
      }
    });
  }

  //  Elimina un partido (solo si eres el creador)
  eliminarPartido(matchId: number): void {
    if (!confirm('¿Estás seguro de eliminar este partido?')) return;

    this.matchService.deleteMatch(matchId).subscribe({
      next: () => {
        this.toastr.success('Partido eliminado');
        // Filtra el array local para eliminar el partido de la vista
        this.matches = this.matches.filter(m => m.id !== matchId);
      },
      error: () => this.toastr.error('No se pudo eliminar el partido')
    });
  }
}
