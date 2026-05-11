import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProcesoService } from '../../services/proceso.service';
import { Proceso } from '../../models/proceso.model';

const EMPRESA_ID = 1;

interface ProcesoForm {
  id?: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: string;
  empresaId: number;
}

@Component({
  selector: 'app-lista-procesos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-procesos.html',
  styleUrl: './lista-procesos.css'
})
export class ListaProcesos implements OnInit {
  @ViewChild('tablero', { static: false }) tablero?: ElementRef<HTMLDivElement>;

  procesos = signal<Proceso[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  guardando = signal(false);
  eliminandoId = signal<number | null>(null);

  searchTerm = '';
  filtroEstado = 'todos';
  modo: 'lista' | 'tablero' = 'lista';

  mostrarEditor = signal(false);
  editProceso: ProcesoForm | null = null;

  posiciones = signal<Record<number, { x: number; y: number }>>({});
  conexiones = signal<{ from: number; to: number }[]>([]);
  conectarDesdeId: number | null = null;
  mensajeConectar = '';

  constructor(
    private router: Router,
    private procesoService: ProcesoService
  ) {}

  ngOnInit() {
    this.cargarProcesos();
  }

  cargarProcesos() {
    this.cargando.set(true);
    this.error.set(null);
    this.procesoService.getByEmpresa(EMPRESA_ID).subscribe({
      next: (data) => {
        this.procesos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los procesos. Verifica que el servidor esté activo.');
        this.cargando.set(false);
      }
    });
  }

  get procesosFiltrados(): Proceso[] {
    let lista = this.procesos();

    if (this.filtroEstado !== 'todos') {
      lista = lista.filter(p => p.estado === this.filtroEstado);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      lista = lista.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term) ||
        p.estado.toLowerCase().includes(term)
      );
    }

    return lista;
  }

  verProceso(id: number) {
    this.router.navigate(['/proceso', id]);
  }

  nuevoProceso() {
    this.editProceso = {
      nombre: '',
      descripcion: '',
      categoria: '',
      estado: 'en-progreso',
      empresaId: EMPRESA_ID
    };
    this.mostrarEditor.set(true);
  }

  editarProcesoItem(proceso: Proceso, event: MouseEvent) {
    event.stopPropagation();
    this.editProceso = { ...proceso };
    this.mostrarEditor.set(true);
  }

  guardarProceso() {
    if (!this.editProceso) return;

    const { nombre, descripcion, categoria, estado, empresaId } = this.editProceso;
    const payload: Omit<Proceso, 'id'> = { nombre, descripcion, categoria, estado, empresaId };

    this.guardando.set(true);

    if (this.editProceso.id !== undefined) {
      this.procesoService.update(this.editProceso.id, payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarEditor();
          this.cargarProcesos();
        },
        error: () => {
          this.guardando.set(false);
          this.error.set('Error al guardar el proceso.');
        }
      });
    } else {
      this.procesoService.create(payload).subscribe({
        next: () => {
          this.guardando.set(false);
          this.cerrarEditor();
          this.cargarProcesos();
        },
        error: () => {
          this.guardando.set(false);
          this.error.set('Error al crear el proceso.');
        }
      });
    }
  }

  eliminarProceso(proceso: Proceso, event: MouseEvent) {
    event.stopPropagation();
    if (!confirm(`¿Eliminar el proceso "${proceso.nombre}"?`)) return;

    this.eliminandoId.set(proceso.id);
    this.procesoService.delete(proceso.id).subscribe({
      next: () => {
        this.eliminandoId.set(null);
        this.cargarProcesos();
      },
      error: () => {
        this.eliminandoId.set(null);
        this.error.set('Error al eliminar el proceso.');
      }
    });
  }

  cerrarEditor() {
    this.mostrarEditor.set(false);
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
    const actuales = this.posiciones();
    if (Object.keys(actuales).length > 0) return;

    const procesos = this.procesos();
    const ancho = 280;
    const alto = 130;
    const cols = 3;
    const gap = 24;
    const nuevas: Record<number, { x: number; y: number }> = {};

    procesos.forEach((proceso, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      nuevas[proceso.id] = {
        x: col * (ancho + gap) + 30,
        y: row * (alto + gap) + 30
      };
    });

    this.posiciones.set(nuevas);
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
    if (id === null || Number.isNaN(id)) return;

    const tablero = event.currentTarget as HTMLElement;
    const rect = tablero.getBoundingClientRect();
    const x = event.clientX - rect.left - 140;
    const y = event.clientY - rect.top - 50;

    this.posiciones.update(pos => ({
      ...pos,
      [id]: { x: Math.max(10, x), y: Math.max(10, y) }
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

    const desde = this.conectarDesdeId;
    const hasta = proceso.id;
    if (desde !== hasta) {
      const yaExiste = this.conexiones().some(
        c => (c.from === desde && c.to === hasta) || (c.from === hasta && c.to === desde)
      );
      if (!yaExiste) {
        this.conexiones.update(cs => [...cs, { from: desde, to: hasta }]);
      }
    }
    this.conectarDesdeId = null;
    this.mensajeConectar = '';
  }

  getBoardStyles(proceso: Proceso) {
    const pos = this.posiciones()[proceso.id] ?? { x: 30, y: 30 };
    return { left: `${pos.x}px`, top: `${pos.y}px` };
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'completado': return 'completado';
      case 'en-progreso': return 'en-progreso';
      case 'suspendido': return 'suspendido';
      default: return '';
    }
  }

  getStatusText(estado: string): string {
    switch (estado) {
      case 'completado': return 'Completado';
      case 'en-progreso': return 'En Progreso';
      case 'suspendido': return 'Suspendido';
      default: return estado;
    }
  }
}
