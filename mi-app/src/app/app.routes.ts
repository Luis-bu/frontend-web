import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { ListaProcesos } from './components/lista-procesos/lista-procesos';
import { DetallesProceso } from './components/detalles-proceso/detalles-proceso';
import { App } from './app';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'procesos', component: ListaProcesos },
  { path: 'proceso/:id', component: DetallesProceso },
  { path: 'dashboard', component: ListaProcesos },
];
