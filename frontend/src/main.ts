// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // <-- Este es el que incluye todo

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
