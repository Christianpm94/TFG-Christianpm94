// Configuración principal del entorno Angular usando el enfoque standalone

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// Configuración del módulo principal, incluyendo optimización de eventos con Zone.js

import { provideHttpClient, withInterceptors } from '@angular/common/http';
// Para usar HttpClient y añadir interceptores como el de JWT

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
// Enrutamiento del frontend (archivo separado con tus rutas)

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
// Soporte para renderizado y rehidratación en SSR (útil si usas Angular Universal)

import { authInterceptor } from './interceptors/auth.interceptor';
// Tu interceptor personalizado para añadir tokens JWT

import { provideAnimations } from '@angular/platform-browser/animations';
// Necesario para activar animaciones (dependencia requerida por ngx-toastr)

import { provideToastr } from 'ngx-toastr';
// Inicializa y configura los servicios de toast a nivel global

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Mejora el rendimiento al combinar eventos DOM

    provideRouter(routes),
    // Rutas del frontend

    provideClientHydration(withEventReplay()),
    // Rehidratación del SSR (seguro aunque no lo uses por ahora)

    provideHttpClient(withInterceptors([authInterceptor])),
    // Añade interceptores a todas las peticiones HTTP

    provideAnimations(),
    // Habilita animaciones necesarias para mostrar toasts

    provideToastr(),
    // Provee el servicio global de notificaciones
  ]
};
