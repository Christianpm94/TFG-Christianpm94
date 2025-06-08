import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatchService } from '../../services/match.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './match-detail.component.html',
})
export class MatchDetailComponent implements OnInit {
  match: any;                // Objeto con los datos del partido
  matchId!: number;          // ID del partido
  joinCode: string = '';     // Código de entrada (solo si es privado)
  joined: boolean = false;   // Estado si el usuario ya está unido
  currentUserId: number = 0; // ID del usuario actual para controlar permisos

  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Obtiene el ID del partido desde la URL
    this.matchId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPartido();
  }

  // Carga los datos del partido desde el backend
  cargarPartido(): void {
    this.matchService.getMatch(this.matchId).subscribe({
      next: (data) => {
        this.match = data;
        this.joined = data.joined || false;
        this.currentUserId = data.currentUserId || 0; // El backend debería devolver el ID del usuario actual
      },
      error: () => {
        this.toastr.error('No se pudo cargar el partido');
      }
    });
  }

  // Permite unirse a un partido (usa código si es privado)
  unirse(): void {
    const payload = this.match.isPrivate ? { code: this.joinCode } : undefined;

    this.matchService.joinMatch(this.matchId, this.joinCode).subscribe({
      next: () => {
        this.toastr.success('Te has unido al partido');
        this.joined = true;
        this.cargarPartido(); // Refresca los datos
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('No fue posible unirse al partido');
      }
    });
  }

  //  Elimina un partido (solo si el usuario es el creador)
  eliminarPartido(): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este partido?')) return;

    this.matchService.deleteMatch(this.matchId).subscribe({
      next: () => {
        this.toastr.success('Partido eliminado');
        window.history.back(); // O redirige a la página principal
      },
      error: () => {
        this.toastr.error('No se pudo eliminar el partido');
      }
    });
  }

  // 🔒 Verifica si el usuario es el creador del partido
  esCreador(): boolean {
    return this.match?.creatorId === this.currentUserId;
  }
}
