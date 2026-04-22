import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Proceso {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'en-progreso' | 'completado' | 'suspendido';
  progreso: number;
  fechaInicio: string;
  fechaFin?: string;
  detalles?: string;
  responsable?: string;
  prioridad?: 'baja' | 'media' | 'alta';
}

@Component({
  selector: 'app-detalles-proceso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalles-proceso.html',
  styleUrl: './detalles-proceso.css'
})
export class DetallesProceso {
  procesoId = signal<number | null>(null);
  proceso = signal<Proceso | null>(null);
  loading = signal(true);

  procesos: { [key: number]: Proceso } = {
    1: {
      id: 1,
      nombre: 'Importación de Datos',
      descripcion: 'Importación de estudiantes desde CSV',
      estado: 'completado',
      progreso: 100,
      fechaInicio: '2026-04-15',
      fechaFin: '2026-04-16',
      detalles: 'Se importaron exitosamente 250 registros de estudiantes. Todos los datos fueron validados y sincronizados con la base de datos principal.',
      responsable: 'Admin',
      prioridad: 'alta'
    },
    2: {
      id: 2,
      nombre: 'Validación de Registros',
      descripcion: 'Validación de integridad de datos',
      estado: 'en-progreso',
      progreso: 65,
      fechaInicio: '2026-04-20',
      detalles: 'Se están validando 350 registros de estudiantes. Se han encontrado 5 inconsistencias menores que están siendo corregidas automáticamente.',
      responsable: 'Sistema',
      prioridad: 'media'
    },
    3: {
      id: 3,
      nombre: 'Generación de Reportes',
      descripcion: 'Generar reportes academicos mensuales',
      estado: 'en-progreso',
      progreso: 40,
      fechaInicio: '2026-04-21',
      detalles: 'Se están generando reportes académicos del mes de abril. Se han compilado datos de 8 calificaciones por estudiante.',
      responsable: 'Sistema',
      prioridad: 'baja'
    },
    4: {
      id: 4,
      nombre: 'Sincronización de BD',
      descripcion: 'Sincronización con base de datos externa',
      estado: 'suspendido',
      progreso: 25,
      fechaInicio: '2026-04-19',
      detalles: 'El proceso fue suspendido debido a problemas de conexión con el servidor externo. Se reintentará automáticamente en 30 minutos.',
      responsable: 'Admin',
      prioridad: 'alta'
    },
    5: {
      id: 5,
      nombre: 'Backup de Sistema',
      descripcion: 'Copia de seguridad completa del sistema',
      estado: 'completado',
      progreso: 100,
      fechaInicio: '2026-04-18',
      fechaFin: '2026-04-18',
      detalles: 'Backup completado exitosamente. Se realizó copia de seguridad de 2.5 GB de datos con compresión aplicada.',
      responsable: 'Admin',
      prioridad: 'alta'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    effect(() => {
      const id = this.procesoId();
      if (id !== null) {
        this.cargarProceso(id);
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id'], 10);
      this.procesoId.set(id);
    });
  }

  cargarProceso(id: number) {
    setTimeout(() => {
      const procesoData = this.procesos[id];
      this.proceso.set(procesoData || null);
      this.loading.set(false);
    }, 300);
  }

  volver() {
    this.router.navigate(['/procesos']);
  }

  getStatusColor(): string {
    const estado = this.proceso()?.estado;
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

  getStatusText(): string {
    const estado = this.proceso()?.estado;
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

  getPriorityColor(): string {
    const prioridad = this.proceso()?.prioridad;
    switch (prioridad) {
      case 'alta':
        return 'alta';
      case 'media':
        return 'media';
      case 'baja':
        return 'baja';
      default:
        return '';
    }
  }

  getPriorityText(): string {
    const prioridad = this.proceso()?.prioridad;
    switch (prioridad) {
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Media';
      case 'baja':
        return 'Baja';
      default:
        return '';
    }
  }
}
