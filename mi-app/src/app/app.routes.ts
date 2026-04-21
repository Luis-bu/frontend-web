import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { App } from './app';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: App },
];
