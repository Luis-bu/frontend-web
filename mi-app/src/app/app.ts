import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListaEstudiantes } from './components/lista-estudiantes/lista-estudiantes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ListaEstudiantes],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  titulo: string = 'Bienvenidos';
  nombreProfesor: string = 'Pablo';
  cantidadEstudiantes: number = 25;
}
