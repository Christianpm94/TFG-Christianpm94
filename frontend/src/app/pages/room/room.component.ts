import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room.component.html',
})
export class RoomComponent implements OnInit {
  matchId!: number;
  teamA: any[] = [];
  teamB: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private matchService: MatchService
  ) {}

  ngOnInit(): void {
    // Obtiene el ID del partido desde la ruta
    this.matchId = Number(this.route.snapshot.paramMap.get('id'));

    // Llama al backend para generar equipos
    this.matchService.generateTeams(this.matchId).subscribe({
      next: (data) => {
        this.teamA = data.teamA;
        this.teamB = data.teamB;
      },
      error: () => {
        alert('No se pudieron generar los equipos');
      }
    });
  }
}
