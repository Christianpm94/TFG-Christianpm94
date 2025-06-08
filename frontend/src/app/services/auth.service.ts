import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // URL base del backend
  private apiUrl = 'http://localhost:8000/api';
  private loginUrl = 'http://localhost:8000/login';

  // Observable para compartir el estado del usuario en toda la app
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser(); // Al iniciar el servicio, intenta cargar usuario si hay token
  }

  // Login: envía email y password, y guarda el token recibido
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.loginUrl, { email, password }).pipe(
      tap((res) => {
        this.saveToken(res.token); // Guarda el token en localStorage
        this.loadUser();           // Carga los datos del usuario
      })
    );
  }

  // Registro de nuevo usuario
  register(data: {
    email: string;
    password: string;
    name: string;
    position: string;
    level: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Guarda el token JWT en localStorage
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Obtiene el token del localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Limpia el estado al cerrar sesión
  logout(): void {
    localStorage.removeItem('token'); // Borra token del navegador
    this.userSubject.next(null);      // Resetea el observable
  }

  // Petición para obtener los datos del usuario actual
  getUser(): Observable<any> {
  const token = this.getToken();

  // Si no hay token, devuelve un observable vacío con null
  if (!token) {
    return new BehaviorSubject(null).asObservable();
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.get(`${this.apiUrl}/users/me`, { headers });
}

  // Intenta cargar el usuario desde el backend si hay token
  loadUser(): void {
    const token = this.getToken();
    
    if (token) {
      this.getUser().subscribe({
        next: (user) => {
          this.userSubject.next(user); // Actualiza observable con el usuario
        },
        error: () => {
          this.userSubject.next(null); // Si falla, resetea el observable
        }
      });
    } else {
      this.userSubject.next(null); // Si no hay token, asegura que user es null
    }
  }

  // Verifica si hay un token como forma rápida de saber si está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken(); // Devuelve true si hay token, false si no
  }
}
