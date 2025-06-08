import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room.component.html',
})
export class RoomComponent implements OnInit {
  matchId!: number;      // ID del partido obtenido de la URL
  teamA: any[] = [];     // Lista de jugadores del Equipo A
  teamB: any[] = [];     // Lista de jugadores del Equipo B

  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService,
    private toastr: ToastrService // Servicio para mostrar mensajes
  ) {}

  ngOnInit(): void {
    // Obtiene el ID del partido desde la ruta
    this.matchId = Number(this.route.snapshot.paramMap.get('id'));

    // Llama al backend para generar los equipos automáticamente
    this.matchService.generateTeams(this.matchId).subscribe({
      next: (data) => {
        if (!data || !data.teamA || !data.teamB) {
          this.toastr.warning('No se pudieron formar equipos válidos');
          return;
        }

        this.teamA = data.teamA;
        this.teamB = data.teamB;
      },
      error: () => {
        this.toastr.error('No se pudieron generar los equipos');
      }
    });
  }
}
