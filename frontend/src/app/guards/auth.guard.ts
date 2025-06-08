import { Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usamos user$ observable para verificar si el usuario está autenticado
  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (user) {
        // Si el usuario está autenticado, se permite el acceso
        return true;
      } else {
        // Si no está autenticado, redirige al login
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
