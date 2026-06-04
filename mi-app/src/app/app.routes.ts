import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { ListaProcesos } from './components/lista-procesos/lista-procesos';
import { DetallesProceso } from './components/detalles-proceso/detalles-proceso';
import { GestionEmpresas } from './components/gestion-empresas/gestion-empresas';
import { GestionUsuarios } from './components/gestion-usuarios/gestion-usuarios';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'procesos', component: ListaProcesos, canActivate: [authGuard] },
  { path: 'proceso/:id', component: DetallesProceso, canActivate: [authGuard] },
  { path: 'empresas', component: GestionEmpresas, canActivate: [authGuard] },
  { path: 'usuarios', component: GestionUsuarios, canActivate: [authGuard] },
];
