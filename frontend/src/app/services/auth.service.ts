import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  //  Login - retorna el token JWT
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, {
      email,
      password,
    });
  }

  //  Registro - crea nuevo usuario
  register(data: {
    email: string;
    password: string;
    name: string;
    position: string;
    level: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  //  Guarda el token en localStorage
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  //  Obtiene el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  //  Borra el token
  logout(): void {
    localStorage.removeItem('token');
  }

  //  Obtiene los datos del usuario actual autenticado
  getUser(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.apiUrl}/users/me`, { headers });
  }

  //  Verifica si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
