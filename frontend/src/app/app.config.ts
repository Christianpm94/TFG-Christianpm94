// Configuración global de la aplicación Angular
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // Rutas definidas
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor'; // Interceptor para añadir JWT
import { provideToastr } from 'ngx-toastr'; // Soporte para toast
import { provideAnimations } from '@angular/platform-browser/animations'; // Requisito para ngx-toastr

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Proporciona el sistema de enrutamiento
    provideHttpClient(withInterceptors([authInterceptor])), // Añade el interceptor global
    provideAnimations(), // Necesario para que ngx-toastr funcione
    provideToastr(), // Registra el servicio de toast a nivel global
  ]
};
