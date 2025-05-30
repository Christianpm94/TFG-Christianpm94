import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match-detail.component.html',
  styleUrls: []
})
export class MatchDetailComponent implements OnInit {
  match: any;                     // Almacena los datos del partido
  accessCode: string = '';        // Código de acceso para partidos privados
  errorMessage = '';              // Mensaje de error para mostrar si falla la carga
  successMessage = '';           // Éxito al unirse

  constructor(
    private route: ActivatedRoute,      // Para acceder al parámetro :id
    private matchService: MatchService  // Servicio para consultar partidos
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.matchService.getMatch(+id).subscribe({
        next: (data) => this.match = data,
        error: () => this.errorMessage = 'No se pudo cargar el partido.'
      });
    }
  }

  joinMatch(): void {
    if (!this.match?.id) return;

    this.matchService.joinMatch(this.match.id, this.accessCode).subscribe({
      next: () => {
        this.successMessage = 'Te has unido correctamente al partido.';
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'No se pudo unir al partido. Código incorrecto o acceso denegado.';
        this.successMessage = '';
      }
    });
  }
}
