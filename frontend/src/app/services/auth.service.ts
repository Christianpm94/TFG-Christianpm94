// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private loginUrl = 'http://localhost:8000/login';

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable(); // observable para escuchar cambios

  constructor(private http: HttpClient) {
    this.loadUser(); // carga inicial si hay token
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.loginUrl, { email, password }).pipe(
      tap((res) => {
        this.saveToken(res.token);
        this.loadUser(); // actualiza el usuario al iniciar sesión
      })
    );
  }

  register(data: {
    email: string;
    password: string;
    name: string;
    position: string;
    level: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.userSubject.next(null); // limpia el observable
  }

  getUser(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.apiUrl}/users/me`, { headers });
  }

  loadUser(): void {
    const token = this.getToken();
    if (token) {
      this.getUser().subscribe({
        next: (user) => this.userSubject.next(user),
        error: () => this.userSubject.next(null),
      });
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
