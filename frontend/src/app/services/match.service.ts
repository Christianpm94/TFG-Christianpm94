import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'http://localhost:8000/api/matches'; // URL base de los endpoints de partidos

  constructor(private http: HttpClient) {}

  //  Enviar los datos para crear un nuevo partido
  createMatch(matchData: any): Observable<any> {
    return this.http.post(this.apiUrl, matchData);
  }

  //  Obtener los detalles de un partido por ID
  getMatch(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  //  Listar todos los partidos
  getAllMatches(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  joinMatch(matchId: number, code?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${matchId}/join`, { code });
  }

}
