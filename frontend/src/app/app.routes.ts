import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CreateMatchComponent } from './pages/create-match/create-match.component';
import { MatchDetailComponent } from './pages/match-detail/match-detail.component';
import { authGuard } from './guards/auth.guard';
import { RoomComponent } from './pages/room/room.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'create-match', component: CreateMatchComponent, canActivate: [authGuard] },
  { path: 'match/:id', component: MatchDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
  {
  path: 'room/:id',
  loadComponent: () => import('./pages/room/room.component').then(m => m.RoomComponent)
  }
];
