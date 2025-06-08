import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
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
  joinCode: string = '';     // Código de entrada (si es privado)
  joined: boolean = false;   // Si el usuario ya está unido al partido
  currentUserId: number = 0; // ID del usuario actual (para saber si es el creador)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Extrae el ID de la ruta y carga el partido
    this.matchId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPartido();
  }

  /**
   * Llama al backend para cargar los datos del partido
   */
  cargarPartido(): void {
    this.matchService.getMatch(this.matchId).subscribe({
      next: (data) => {
        this.match = data;
        this.joined = data.joined || false;
        this.currentUserId = data.currentUserId || 0;
      },
      error: () => {
        this.toastr.error('No se pudo cargar el partido');
      }
    });
  }

  /**
   * Unirse al partido, usando código si es necesario
   */
  unirse(): void {
    const code = this.match.isPrivate ? this.joinCode : undefined;

    this.matchService.joinMatch(this.matchId, code).subscribe({
      next: () => {
        this.toastr.success('Te has unido al partido');
        this.joined = true;
        this.cargarPartido(); // Refresca la vista
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('No fue posible unirse al partido');
      }
    });
  }

  /**
   * Elimina el partido si el usuario es el creador
   */
  eliminarPartido(): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este partido?')) return;

    this.matchService.deleteMatch(this.matchId).subscribe({
      next: () => {
        this.toastr.success('Partido eliminado');
        this.router.navigate(['/']); // Redirige al home
      },
      error: () => {
        this.toastr.error('No se pudo eliminar el partido');
      }
    });
  }

  /**
   * Verifica si el usuario actual es el creador
   */
  esCreador(): boolean {
    return this.match?.creatorId === this.currentUserId;
  }

  /**
   * Redirige a la sala del partido
   */
  irALaSala(): void {
    this.router.navigate(['/room', this.matchId]);
  }
}
