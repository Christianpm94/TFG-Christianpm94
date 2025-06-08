import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private apiUrl = 'http://localhost:8000/api'; //  URL base del backend Symfony

  constructor(private http: HttpClient) {}

  /**
   *  Obtiene todos los partidos disponibles desde el backend.
   * @returns Observable con array de partidos
   */
  getMatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/matches`);
  }

  /**
   *  Obtiene los detalles de un partido específico.
   * @param matchId ID del partido a consultar
   * @returns Observable con datos del partido
   */
  getMatch(matchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/matches/${matchId}`);
  }

  /**
   *  Crea un nuevo partido.
   * @param matchData Objeto con los campos: type, location, date, isPrivate, code
   * @returns Observable con respuesta del backend (id y código de acceso)
   */
  createMatch(matchData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    //  Corrección importante: la ruta correcta para crear partidos es `/matches`
    return this.http.post<any>(`${this.apiUrl}/matches`, matchData, { headers });
  }

  /**
   *  Permite al usuario unirse a un partido.
   * @param matchId ID del partido
   * @param code Código de acceso si el partido es privado
   * @returns Observable con la respuesta del backend
   */
  joinMatch(matchId: number, code?: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body = code ? { joinCode: code } : {};

    return this.http.post(`${this.apiUrl}/matches/${matchId}/players`, body, { headers });
  }

  /**
   *  Elimina un partido (solo el creador puede hacerlo).
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
 * Genera los equipos automáticamente para un partido.
 * @param matchId - ID del partido
 */
generateTeams(matchId: number): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.get<any>(`http://localhost:8000/api/matches/${matchId}/generate-teams`, { headers });
}
}
