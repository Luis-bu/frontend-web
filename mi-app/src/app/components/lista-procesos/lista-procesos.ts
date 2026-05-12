import { Component, computed, ElementRef, HostListener, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProcesoService } from '../../services/proceso.service';
import { EmpresaService } from '../../services/empresa.service';
import { Proceso } from '../../models/proceso.model';
import { Empresa } from '../../models/empresa.model';

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
export class ListaProcesos implements OnInit, OnDestroy {
  @ViewChild('tablero', { static: false }) tablero?: ElementRef<HTMLDivElement>;

  // ── Empresas ────────────────────────────────────────────────────────────
  empresas               = signal<Empresa[]>([]);
  cargandoEmpresas       = signal(false);
  empresaSeleccionadaId  = signal<number | null>(null);
  empresaSeleccionada    = computed(() =>
    this.empresas().find(e => e.id === this.empresaSeleccionadaId()) ?? null
  );
  empresaDropdownAbierto = signal(false);

  // ── Procesos ─────────────────────────────────────────────────────────────
  procesos     = signal<Proceso[]>([]);
  cargando     = signal(false);
  error        = signal<string | null>(null);
  guardando    = signal(false);
  eliminandoId = signal<number | null>(null);

  searchTerm   = '';
  filtroEstado = 'todos';
  modo: 'lista' | 'tablero' = 'lista';

  mostrarEditor = signal(false);
  editProceso: ProcesoForm | null = null;

  posiciones = signal<Record<number, { x: number; y: number }>>({});
  conexiones = signal<{ from: number; to: number }[]>([]);
  conectarDesdeId: number | null = null;
  mensajeConectar = '';

  draggingId: number | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private boardRect: DOMRect | null = null;
  private readonly onMouseMoveFn = (e: MouseEvent) => this.onBoardMouseMove(e);
  private readonly onMouseUpFn   = ()              => this.onBoardMouseUp();

  constructor(
    private router: Router,
    private procesoService: ProcesoService,
    private empresaService: EmpresaService,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    this.cargarEmpresas();
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.onMouseMoveFn);
    document.removeEventListener('mouseup',   this.onMouseUpFn);
  }

  // Cierra el dropdown si el clic ocurre fuera del componente
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.empresaDropdownAbierto.set(false);
    }
  }

  // ── Empresa ──────────────────────────────────────────────────────────────

  cargarEmpresas() {
    this.cargandoEmpresas.set(true);
    this.error.set(null);

    this.empresaService.getAll().subscribe({
      next: (data) => {
        this.empresas.set(data);
        this.cargandoEmpresas.set(false);

        if (data.length === 0) {
          this.empresaSeleccionadaId.set(null);
          this.procesos.set([]);
          return;
        }

        const preferida = data.find(e => e.id === 1);
        this.empresaSeleccionadaId.set(preferida ? preferida.id : data[0].id);
        this.cargarProcesos();
      },
      error: () => {
        this.error.set('No se pudieron cargar las empresas. Verifica que el servidor esté activo.');
        this.cargandoEmpresas.set(false);
      }
    });
  }

  toggleEmpresaDropdown() {
    this.empresaDropdownAbierto.update(open => !open);
  }

  seleccionarEmpresa(empresa: Empresa) {
    this.empresaSeleccionadaId.set(empresa.id);
    this.empresaDropdownAbierto.set(false);
    this.cerrarEditor();
    this.searchTerm         = '';
    this.filtroEstado       = 'todos';
    this.conectarDesdeId    = null;
    this.mensajeConectar    = '';
    this.conexiones.set([]);
    this.posiciones.set({});
    this.cargarProcesos();
  }

  // ── Procesos ─────────────────────────────────────────────────────────────

  cargarProcesos() {
    const empresaId = this.empresaSeleccionadaId();
    if (empresaId === null) return;

    this.cargando.set(true);
    this.error.set(null);

    this.procesoService.getByEmpresa(empresaId).subscribe({
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
      estado: 'BORRADOR',
      empresaId: this.empresaSeleccionadaId() ?? 1
    };
    this.mostrarEditor.set(true);
  }

  editarProcesoItem(proceso: Proceso, event: MouseEvent) {
    event.stopPropagation();
    this.editProceso = {
      ...proceso,
      empresaId: proceso.empresaId ?? this.empresaSeleccionadaId() ?? 1
    };
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

  // ── Modo ─────────────────────────────────────────────────────────────────

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
    const alto  = 130;
    const cols  = 3;
    const gap   = 24;
    const nuevas: Record<number, { x: number; y: number }> = {};

    procesos.forEach((proceso, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      nuevas[proceso.id] = {
        x: col * (ancho + gap) + 30,
        y: row * (alto  + gap) + 30
      };
    });

    this.posiciones.set(nuevas);
  }

  onCardMouseDown(event: MouseEvent, proceso: Proceso) {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button')) return;
    event.preventDefault();
    const boardEl = this.tablero?.nativeElement;
    if (!boardEl) return;
    this.boardRect   = boardEl.getBoundingClientRect();
    const pos        = this.posiciones()[proceso.id] ?? { x: 30, y: 30 };
    this.draggingId  = proceso.id;
    this.dragOffsetX = event.clientX - this.boardRect.left - pos.x;
    this.dragOffsetY = event.clientY - this.boardRect.top  - pos.y;
    document.addEventListener('mousemove', this.onMouseMoveFn);
    document.addEventListener('mouseup',   this.onMouseUpFn);
  }

  private onBoardMouseMove(event: MouseEvent) {
    if (this.draggingId === null || !this.boardRect) return;
    const id = this.draggingId;
    const x  = Math.max(0, event.clientX - this.boardRect.left - this.dragOffsetX);
    const y  = Math.max(0, event.clientY - this.boardRect.top  - this.dragOffsetY);
    this.posiciones.update(pos => ({ ...pos, [id]: { x, y } }));
  }

  private onBoardMouseUp() {
    this.draggingId = null;
    this.boardRect  = null;
    document.removeEventListener('mousemove', this.onMouseMoveFn);
    document.removeEventListener('mouseup',   this.onMouseUpFn);
  }

  // ── Conexiones ───────────────────────────────────────────────────────────

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
    return { transform: `translate(${pos.x}px, ${pos.y}px)` };
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'BORRADOR':  return 'borrador';
      case 'PUBLICADO': return 'publicado';
      default:          return '';
    }
  }

  getStatusText(estado: string): string {
    switch (estado) {
      case 'BORRADOR':  return 'Borrador';
      case 'PUBLICADO': return 'Publicado';
      default:          return estado;
    }
  }
}
