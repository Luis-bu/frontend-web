import { Component, ElementRef, signal, ViewChild } from '@angular/core';
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
  @ViewChild('tablero', { static: false }) tablero?: ElementRef<HTMLDivElement>;

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
  modo: 'lista' | 'tablero' = 'lista';
  editarProcesoId = signal<number | null>(null);
  editProceso: Proceso | null = null;
  posiciones = signal<Record<number, { x: number; y: number }>>({});
  conexiones = signal<{ from: number; to: number }[]>([]);
  conectarDesdeId: number | null = null;
  mensajeConectar: string = '';

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

  nuevoProceso() {
    const siguienteId = Math.max(...this.procesos().map(p => p.id), 0) + 1;
    const fechaHoy = new Date().toISOString().slice(0, 10);
    const nuevo: Proceso = {
      id: siguienteId,
      nombre: 'Nuevo proceso',
      descripcion: 'Describe este proceso',
      estado: 'en-progreso',
      progreso: 0,
      fechaInicio: fechaHoy
    };

    this.procesos.update(procesos => [...procesos, nuevo]);
    this.editarProcesoId.set(nuevo.id);
    this.editProceso = { ...nuevo };

    this.posiciones.update(posiciones => ({
      ...posiciones,
      [nuevo.id]: { x: 20, y: 20 }
    }));
  }

  editarProcesoItem(proceso: Proceso, event: MouseEvent) {
    event.stopPropagation();
    this.editarProcesoId.set(proceso.id);
    this.editProceso = { ...proceso };
  }

  guardarProceso() {
    if (!this.editProceso) {
      return;
    }

    this.procesos.update(procesos => procesos.map(p =>
      p.id === this.editProceso!.id ? { ...p, ...this.editProceso! } : p
    ));

    this.editarProcesoId.set(null);
    this.editProceso = null;
  }

  cancelarEdicion() {
    this.editarProcesoId.set(null);
    this.editProceso = null;
  }

  cambiarModo(modo: 'lista' | 'tablero') {
    this.modo = modo;
    if (modo === 'tablero') {
      this.inicializarPosiciones();
    }
    this.conectarDesdeId = null;
    this.mensajeConectar = '';
  }

  inicializarPosiciones() {
    const posicionesActuales = this.posiciones();
    if (Object.keys(posicionesActuales).length > 0) {
      return;
    }

    const procesos = this.procesos();
    const ancho = 280;
    const alto = 160;
    const cols = 3;
    const gap = 24;

    const nuevasPosiciones: Record<number, { x: number; y: number }> = {};

    procesos.forEach((proceso, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      nuevasPosiciones[proceso.id] = {
        x: col * (ancho + gap) + 30,
        y: row * (alto + gap) + 30
      };
    });

    this.posiciones.set(nuevasPosiciones);
  }

  onTableroDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onCardDragStart(event: DragEvent, proceso: Proceso) {
    event.dataTransfer?.setData('text/plain', proceso.id.toString());
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
  }

  onTableroDrop(event: DragEvent) {
    event.preventDefault();
    const idString = event.dataTransfer?.getData('text/plain');
    const id = idString ? Number(idString) : null;
    if (id === null || Number.isNaN(id)) {
      return;
    }

    const tablero = event.currentTarget as HTMLElement;
    const rect = tablero.getBoundingClientRect();
    const x = event.clientX - rect.left - 140;
    const y = event.clientY - rect.top - 50;

    this.posiciones.update(posiciones => ({
      ...posiciones,
      [id]: {
        x: Math.max(10, x),
        y: Math.max(10, y)
      }
    }));
  }

  iniciarConexion(proceso: Proceso, event: MouseEvent) {
    event.stopPropagation();

    if (this.conectarDesdeId === proceso.id) {
      this.conectarDesdeId = null;
      this.mensajeConectar = '';
      return;
    }

    if (!this.conectarDesdeId) {
      this.conectarDesdeId = proceso.id;
      this.mensajeConectar = `Selecciona el proceso destino para conectar "${proceso.nombre}"`;
      return;
    }

    this.agregarConexion(this.conectarDesdeId, proceso.id);
    this.conectarDesdeId = null;
    this.mensajeConectar = '';
  }

  agregarConexion(desde: number, hasta: number) {
    if (desde === hasta) {
      return;
    }

    const yaExiste = this.conexiones().some(
      conexion => (conexion.from === desde && conexion.to === hasta) ||
                  (conexion.from === hasta && conexion.to === desde)
    );

    if (yaExiste) {
      return;
    }

    this.conexiones.update(conexiones => [...conexiones, { from: desde, to: hasta }]);
  }

  getNombreProceso(id: number): string {
    return this.procesos().find(p => p.id === id)?.nombre || '';
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

  getBoardStyles(proceso: Proceso) {
    const posicion = this.posiciones()[proceso.id] ?? { x: 30, y: 30 };
    return {
      left: `${posicion.x}px`,
      top: `${posicion.y}px`
    };
  }
}
