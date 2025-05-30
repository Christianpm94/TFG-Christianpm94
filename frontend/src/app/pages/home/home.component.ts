import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatchService } from '../../services/match.service'; // Ajusta esta ruta si es distinta

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: [] // O elimínalo si no existe home.component.scss
})
export class HomeComponent implements OnInit {
  matches: any[] = [];

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    this.matchService.getAllMatches().subscribe({
      next: (data) => this.matches = data,
      error: (err) => console.error('Error al obtener los partidos:', err)
    });
  }
}
