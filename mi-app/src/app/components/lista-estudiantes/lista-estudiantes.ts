import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-estudiantes',
  imports: [CommonModule],
  templateUrl: './lista-estudiantes.html',
  styleUrl: './lista-estudiantes.css',
})
export class ListaEstudiantes {
  datos = [
    { id: 1, nombre: 'Pablo', carrera: 'Ingeniería', promedio: 8.5 },
    { id: 2, nombre: 'María', carrera: 'Medicina', promedio: 9.2 },
    { id: 3, nombre: 'Carlos', carrera: 'Derecho', promedio: 7.8 },
    { id: 4, nombre: 'Ana', carrera: 'Arquitectura', promedio: 8.0 },
    { id: 5, nombre: 'Luis', carrera: 'Psicología', promedio: 8.7 },
  ];
}
