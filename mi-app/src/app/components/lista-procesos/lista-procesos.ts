import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Proceso {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'en-progreso' | 'completado' | 'suspendido';
  progreso: number;
  fechaInicio: string;
  fechaFin?: string;
}

@Component({
  selector: 'app-lista-procesos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-procesos.html',
  styleUrl: './lista-procesos.css'
})
export class ListaProcesos {
  procesos = signal<Proceso[]>([
    {
      id: 1,
      nombre: 'Importación de Datos',
      descripcion: 'Importación de estudiantes desde CSV',
      estado: 'completado',
      progreso: 100,
      fechaInicio: '2026-04-15',
      fechaFin: '2026-04-16'
    },
    {
      id: 2,
      nombre: 'Validación de Registros',
      descripcion: 'Validación de integridad de datos',
      estado: 'en-progreso',
      progreso: 65,
      fechaInicio: '2026-04-20'
    },
    {
      id: 3,
      nombre: 'Generación de Reportes',
      descripcion: 'Generar reportes academicos mensuales',
      estado: 'en-progreso',
      progreso: 40,
      fechaInicio: '2026-04-21'
    },
    {
      id: 4,
      nombre: 'Sincronización de BD',
      descripcion: 'Sincronización con base de datos externa',
      estado: 'suspendido',
      progreso: 25,
      fechaInicio: '2026-04-19'
    },
    {
      id: 5,
      nombre: 'Backup de Sistema',
      descripcion: 'Copia de seguridad completa del sistema',
      estado: 'completado',
      progreso: 100,
      fechaInicio: '2026-04-18',
      fechaFin: '2026-04-18'
    }
  ]);

  searchTerm: string = '';
  filtroEstado: 'todos' | 'en-progreso' | 'completado' | 'suspendido' = 'todos';

  constructor(private router: Router) {}

  get procesosFiltrados() {
    let procesos = this.procesos();
    
    if (this.filtroEstado !== 'todos') {
      procesos = procesos.filter(p => p.estado === this.filtroEstado);
    }
    
    if (this.searchTerm) {
      procesos = procesos.filter(p =>
        p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    return procesos;
  }

  verProceso(id: number) {
    this.router.navigate(['/proceso', id]);
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'completado':
        return 'completado';
      case 'en-progreso':
        return 'en-progreso';
      case 'suspendido':
        return 'suspendido';
      default:
        return '';
    }
  }

  getStatusText(estado: string): string {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en-progreso':
        return 'En Progreso';
      case 'suspendido':
        return 'Suspendido';
      default:
        return '';
    }
  }
}
