import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MatchService {
  // URL base del backend Symfony
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los partidos disponibles desde el backend.
   * @returns Observable con array de partidos
   */
  getMatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/matches`);
  }

  /**
   * Obtiene los detalles de un partido específico.
   * @param matchId ID del partido a consultar
   * @returns Observable con datos del partido
   */
  getMatch(matchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/matches/${matchId}`);
  }

  /**
   * Crea un nuevo partido (público o privado).
   * @param matchData Objeto con los campos: type, location, date, isPrivate, code
   * @returns Observable con la respuesta del backend
   */
  createMatch(matchData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(`${this.apiUrl}/matches`, matchData, { headers });
  }

  /**
   * Permite al usuario unirse a un partido.
   * @param matchId ID del partido
   * @param code Código de acceso (si el partido es privado)
   * @returns Observable con la respuesta del backend
   */
  joinMatch(matchId: number, code?: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // Si el partido es privado, se envía el código en el cuerpo
    const body = code ? { joinCode: code } : {};

    return this.http.post(`${this.apiUrl}/matches/${matchId}/players`, body, { headers });
  }

  /**
   * Elimina un partido (solo si el usuario es el creador).
   * @param matchId ID del partido a eliminar
   * @returns Observable con respuesta del backend
   */
  deleteMatch(matchId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${this.apiUrl}/matches/${matchId}`, { headers });
  }

  /**
   * Genera equipos equilibrados automáticamente para un partido.
   * @param matchId ID del partido
   * @returns Observable con los equipos generados
   */
  generateTeams(matchId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.apiUrl}/matches/${matchId}/generate-teams`, { headers });
  }
}
