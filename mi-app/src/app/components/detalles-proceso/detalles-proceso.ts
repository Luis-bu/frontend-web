import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProcesoService } from '../../services/proceso.service';
import { ActividadService } from '../../services/actividad.service';
import { GatewayService } from '../../services/gateway.service';
import { ArcoService } from '../../services/arco.service';
import { RolProcesoService } from '../../services/rol-proceso.service';
import { ToastService } from '../../services/toast.service';
import { Proceso } from '../../models/proceso.model';
import { Actividad } from '../../models/actividad.model';
import { Gateway } from '../../models/gateway.model';
import { Arco } from '../../models/arco.model';
import { RolProceso } from '../../models/rol-proceso.model';

interface ActividadForm {
  id?: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  procesoId: number;
  rolProcesoId: number | null;
}

interface GatewayForm {
  id?: number;
  tipo: string;
  procesoId: number;
}

interface ArcoForm {
  id?: number;
  etiqueta: string;
  procesoId: number;
  actividadOrigenId: number | null;
  actividadDestinoId: number | null;
  gatewayOrigenId: number | null;
  gatewayDestinoId: number | null;
}

interface RolForm {
  id?: number;
  nombre: string;
  descripcion: string;
  empresaId: number;
}

export interface OrbitalNode {
  visualId: string;
  sourceId: number;
  label: string;
  type: 'ACTIVIDAD' | 'GATEWAY';
  description?: string;
  roleName?: string;
  subtype?: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-detalles-proceso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalles-proceso.html',
  styleUrl: './detalles-proceso.css'
})
export class DetallesProceso implements OnInit {
  procesoId!: number;

  proceso = signal<Proceso | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  actividades = signal<Actividad[]>([]);
  gateways = signal<Gateway[]>([]);
  arcos = signal<Arco[]>([]);
  roles = signal<RolProceso[]>([]);

  confirmarKey = signal<string | null>(null);

  // Actividades
  mostrarFormActividad = signal(false);
  actividadForm: ActividadForm | null = null;
  guardandoActividad = signal(false);
  errorActividad = signal<string | null>(null);
  eliminandoActividadId = signal<number | null>(null);

  // Gateways
  mostrarFormGateway = signal(false);
  gatewayForm: GatewayForm | null = null;
  guardandoGateway = signal(false);
  errorGateway = signal<string | null>(null);
  eliminandoGatewayId = signal<number | null>(null);

  // Arcos
  mostrarFormArco = signal(false);
  arcoForm: ArcoForm | null = null;
  guardandoArco = signal(false);
  errorArco = signal<string | null>(null);
  eliminandoArcoId = signal<number | null>(null);

  // Picker de rol en form de actividad
  rolPickerAbierto = signal(false);

  // Roles
  mostrarFormRol = signal(false);
  rolForm: RolForm | null = null;
  guardandoRol = signal(false);
  errorRol = signal<string | null>(null);
  eliminandoRolId = signal<number | null>(null);

  private readonly rolesDelProceso = new Set<number>();

  rolesEnUsoPorProceso = computed<Set<number>>(() => {
    const ids = new Set<number>();
    for (const act of this.actividades()) {
      if (act.rolProcesoId != null) ids.add(act.rolProcesoId);
    }
    return ids;
  });

  rolesMostrados = computed<RolProceso[]>(() =>
    this.roles().filter(r =>
      this.rolesEnUsoPorProceso().has(r.id) || this.rolesDelProceso.has(r.id)
    )
  );

  // ── Orbital view ────────────────────────────────────────────────────────
  selectedOrbitalNode: OrbitalNode | null = null;

  orbitalNodes = computed<OrbitalNode[]>(() => {
    const actividades = this.actividades();
    const gateways = this.gateways();
    const total = actividades.length + gateways.length;
    if (total === 0) return [];

    const radius = Math.max(175, Math.min(220, total * 36));
    const nodes: OrbitalNode[] = [];
    let index = 0;

    for (const act of actividades) {
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      nodes.push({
        visualId: `act-${act.id}`,
        sourceId: act.id,
        label: act.nombre,
        type: 'ACTIVIDAD',
        description: act.descripcion || undefined,
        roleName: this.getRolNombre(act.rolProcesoId) !== '—' ? this.getRolNombre(act.rolProcesoId) : undefined,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
      index++;
    }

    for (const gw of gateways) {
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      nodes.push({
        visualId: `gw-${gw.id}`,
        sourceId: gw.id,
        label: `Gateway #${gw.id}`,
        type: 'GATEWAY',
        subtype: gw.tipo,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
      index++;
    }

    return nodes;
  });

  selectOrbitalNode(node: OrbitalNode) {
    this.selectedOrbitalNode =
      this.selectedOrbitalNode?.visualId === node.visualId ? null : node;
  }

  getConnectionsCount(node: OrbitalNode): number {
    const arcos = this.arcos();
    if (node.type === 'ACTIVIDAD') {
      return arcos.filter(a =>
        a.actividadOrigenId === node.sourceId || a.actividadDestinoId === node.sourceId
      ).length;
    }
    return arcos.filter(a =>
      a.gatewayOrigenId === node.sourceId || a.gatewayDestinoId === node.sourceId
    ).length;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private procesoService: ProcesoService,
    private actividadService: ActividadService,
    private gatewayService: GatewayService,
    private arcoService: ArcoService,
    private rolProcesoService: RolProcesoService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.procesoId = parseInt(this.route.snapshot.params['id'], 10);
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.error.set(null);

    this.procesoService.getById(this.procesoId).subscribe({
      next: (proceso) => {
        this.proceso.set(proceso);
        forkJoin({
          actividades: this.actividadService.getByProceso(this.procesoId),
          gateways: this.gatewayService.getByProceso(this.procesoId),
          arcos: this.arcoService.getByProceso(this.procesoId),
          roles: this.rolProcesoService.getByEmpresa(proceso.empresaId)
        }).subscribe({
          next: ({ actividades, gateways, arcos, roles }) => {
            this.actividades.set(actividades);
            this.gateways.set(gateways);
            this.arcos.set(arcos);
            this.roles.set(roles);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error cargando datos del proceso:', err);
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error cargando proceso:', err);
        this.error.set('No se pudo cargar el proceso. Verifica que el servidor esté activo.');
        this.loading.set(false);
      }
    });
  }

  volver() { this.router.navigate(['/procesos']); }

  getStatusColor(): string {
    switch (this.proceso()?.estado) {
      case 'BORRADOR':  return 'borrador';
      case 'PUBLICADO': return 'publicado';
      default: return '';
    }
  }

  getStatusText(): string {
    switch (this.proceso()?.estado) {
      case 'BORRADOR':  return 'Borrador';
      case 'PUBLICADO': return 'Publicado';
      default: return this.proceso()?.estado ?? '';
    }
  }

  getRolNombre(rolId: number | null | undefined): string {
    if (!rolId) return '—';
    return this.roles().find(r => r.id === rolId)?.nombre ?? `Rol #${rolId}`;
  }

  // ─── Actividades ──────────────────────────────────────────────────────────

  private actividadVacia(): ActividadForm {
    return { nombre: '', tipo: '', descripcion: '', procesoId: this.procesoId, rolProcesoId: null };
  }

  nuevaActividad() {
    this.actividadForm = this.actividadVacia();
    this.errorActividad.set(null);
    this.mostrarFormActividad.set(true);
  }

  editarActividad(a: Actividad) {
    this.actividadForm = { id: a.id, nombre: a.nombre, tipo: a.tipo, descripcion: a.descripcion, procesoId: a.procesoId, rolProcesoId: a.rolProcesoId ?? null };
    this.errorActividad.set(null);
    this.mostrarFormActividad.set(true);
  }

  cancelarActividad() {
    this.actividadForm = null;
    this.mostrarFormActividad.set(false);
    this.rolPickerAbierto.set(false);
  }

  toggleRolPicker() { this.rolPickerAbierto.update(v => !v); }

  seleccionarRolEnForm(rolId: number | null) {
    if (this.actividadForm) this.actividadForm.rolProcesoId = rolId;
    this.rolPickerAbierto.set(false);
  }

  getRolDescripcion(rolId: number | null | undefined): string {
    if (!rolId) return '';
    return this.roles().find(r => r.id === rolId)?.descripcion ?? '';
  }

  guardarActividad() {
    if (!this.actividadForm) return;
    this.guardandoActividad.set(true);
    this.errorActividad.set(null);

    const f = this.actividadForm;
    const payload: Omit<Actividad, 'id'> = {
      nombre: f.nombre,
      tipo: f.tipo,
      descripcion: f.descripcion,
      procesoId: f.procesoId,
      rolProcesoId: f.rolProcesoId
    };

    const op = f.id !== undefined
      ? this.actividadService.update(f.id, payload)
      : this.actividadService.create(payload);

    const esEdicion = f.id !== undefined;
    op.subscribe({
      next: () => {
        this.guardandoActividad.set(false);
        this.cancelarActividad();
        this.actividadService.getByProceso(this.procesoId).subscribe(d => this.actividades.set(d));
        this.toast.success(esEdicion ? 'Actividad actualizada' : 'Actividad creada');
      },
      error: (err) => {
        this.guardandoActividad.set(false);
        this.errorActividad.set('Error al guardar la actividad.');
        this.toast.error(esEdicion ? 'Error al editar la actividad' : 'Error al crear la actividad');
      }
    });
  }

  eliminarActividad(id: number) {
    this.confirmarKey.set(null);
    this.eliminandoActividadId.set(id);
    this.actividadService.delete(id).subscribe({
      next: () => {
        this.eliminandoActividadId.set(null);
        this.actividades.update(list => list.filter(a => a.id !== id));
        this.toast.success('Actividad eliminada');
      },
      error: () => {
        this.eliminandoActividadId.set(null);
        this.errorActividad.set('Error al eliminar la actividad.');
        this.toast.error('Error al eliminar la actividad');
      }
    });
  }

  // ─── Gateways ─────────────────────────────────────────────────────────────

  private gatewayVacio(): GatewayForm {
    return { tipo: '', procesoId: this.procesoId };
  }

  nuevoGateway() {
    this.gatewayForm = this.gatewayVacio();
    this.errorGateway.set(null);
    this.mostrarFormGateway.set(true);
  }

  editarGateway(g: Gateway) {
    this.gatewayForm = { id: g.id, tipo: g.tipo, procesoId: g.procesoId };
    this.errorGateway.set(null);
    this.mostrarFormGateway.set(true);
  }

  cancelarGateway() {
    this.gatewayForm = null;
    this.mostrarFormGateway.set(false);
  }

  guardarGateway() {
    if (!this.gatewayForm) return;
    this.guardandoGateway.set(true);
    this.errorGateway.set(null);

    const f = this.gatewayForm;
    const payload: Omit<Gateway, 'id'> = { tipo: f.tipo, procesoId: f.procesoId };

    const op = f.id !== undefined
      ? this.gatewayService.update(f.id, payload)
      : this.gatewayService.create(payload);

    const esEdicionGw = f.id !== undefined;
    op.subscribe({
      next: () => {
        this.guardandoGateway.set(false);
        this.cancelarGateway();
        this.gatewayService.getByProceso(this.procesoId).subscribe(d => this.gateways.set(d));
        this.toast.success(esEdicionGw ? 'Gateway actualizado' : 'Gateway creado');
      },
      error: () => {
        this.guardandoGateway.set(false);
        this.errorGateway.set('Error al guardar el gateway.');
        this.toast.error(esEdicionGw ? 'Error al editar el gateway' : 'Error al crear el gateway');
      }
    });
  }

  eliminarGateway(id: number) {
    this.confirmarKey.set(null);
    this.eliminandoGatewayId.set(id);
    this.gatewayService.delete(id).subscribe({
      next: () => {
        this.eliminandoGatewayId.set(null);
        this.gateways.update(list => list.filter(g => g.id !== id));
        this.toast.success('Gateway eliminado');
      },
      error: () => {
        this.eliminandoGatewayId.set(null);
        this.errorGateway.set('Error al eliminar el gateway.');
        this.toast.error('Error al eliminar el gateway');
      }
    });
  }

  // ─── Arcos ────────────────────────────────────────────────────────────────

  private arcoVacio(): ArcoForm {
    return { etiqueta: '', procesoId: this.procesoId, actividadOrigenId: null, actividadDestinoId: null, gatewayOrigenId: null, gatewayDestinoId: null };
  }

  nuevoArco() {
    this.arcoForm = this.arcoVacio();
    this.errorArco.set(null);
    this.mostrarFormArco.set(true);
  }

  editarArco(a: Arco) {
    this.arcoForm = {
      id: a.id,
      etiqueta: a.etiqueta,
      procesoId: a.procesoId,
      actividadOrigenId: a.actividadOrigenId ?? null,
      actividadDestinoId: a.actividadDestinoId ?? null,
      gatewayOrigenId: a.gatewayOrigenId ?? null,
      gatewayDestinoId: a.gatewayDestinoId ?? null
    };
    this.errorArco.set(null);
    this.mostrarFormArco.set(true);
  }

  cancelarArco() {
    this.arcoForm = null;
    this.mostrarFormArco.set(false);
  }

  get arcoTieneBucle(): boolean {
    const f = this.arcoForm;
    if (!f) return false;
    if (f.actividadOrigenId !== null && f.actividadOrigenId === f.actividadDestinoId) return true;
    if (f.gatewayOrigenId   !== null && f.gatewayOrigenId   === f.gatewayDestinoId)   return true;
    return false;
  }

  guardarArco() {
    if (!this.arcoForm) return;
    if (this.arcoTieneBucle) {
      this.errorArco.set('El origen y el destino no pueden ser el mismo elemento.');
      return;
    }
    this.guardandoArco.set(true);
    this.errorArco.set(null);

    const f = this.arcoForm;
    const payload: Omit<Arco, 'id'> = {
      etiqueta: f.etiqueta,
      procesoId: f.procesoId,
      ...(f.actividadOrigenId  ? { actividadOrigenId:  f.actividadOrigenId  } : {}),
      ...(f.actividadDestinoId ? { actividadDestinoId: f.actividadDestinoId } : {}),
      ...(f.gatewayOrigenId    ? { gatewayOrigenId:    f.gatewayOrigenId    } : {}),
      ...(f.gatewayDestinoId   ? { gatewayDestinoId:   f.gatewayDestinoId   } : {})
    };

    const op = f.id !== undefined
      ? this.arcoService.update(f.id, payload)
      : this.arcoService.create(payload);

    const esEdicionArco = f.id !== undefined;
    op.subscribe({
      next: () => {
        this.guardandoArco.set(false);
        this.cancelarArco();
        this.arcoService.getByProceso(this.procesoId).subscribe(d => this.arcos.set(d));
        this.toast.success(esEdicionArco ? 'Arco actualizado' : 'Arco creado');
      },
      error: () => {
        this.guardandoArco.set(false);
        this.errorArco.set('Error al guardar el arco.');
        this.toast.error(esEdicionArco ? 'Error al editar el arco' : 'Error al crear el arco');
      }
    });
  }

  eliminarArco(id: number) {
    this.confirmarKey.set(null);
    this.eliminandoArcoId.set(id);
    this.arcoService.delete(id).subscribe({
      next: () => {
        this.eliminandoArcoId.set(null);
        this.arcos.update(list => list.filter(a => a.id !== id));
        this.toast.success('Arco eliminado');
      },
      error: () => {
        this.eliminandoArcoId.set(null);
        this.errorArco.set('Error al eliminar el arco.');
        this.toast.error('Error al eliminar el arco');
      }
    });
  }

  // ─── Roles de proceso ─────────────────────────────────────────────────────

  private rolVacio(): RolForm {
    return { nombre: '', descripcion: '', empresaId: this.proceso()?.empresaId ?? 1 };
  }

  nuevoRol() {
    this.rolForm = this.rolVacio();
    this.errorRol.set(null);
    this.mostrarFormRol.set(true);
  }

  editarRol(r: RolProceso) {
    this.rolForm = { id: r.id, nombre: r.nombre, descripcion: r.descripcion, empresaId: r.empresaId };
    this.errorRol.set(null);
    this.mostrarFormRol.set(true);
  }

  cancelarRol() {
    this.rolForm = null;
    this.mostrarFormRol.set(false);
  }

  guardarRol() {
    if (!this.rolForm) return;
    this.guardandoRol.set(true);
    this.errorRol.set(null);

    const f = this.rolForm;
    const payload: Omit<RolProceso, 'id'> = { nombre: f.nombre, descripcion: f.descripcion, empresaId: f.empresaId };

    if (f.id !== undefined) {
      this.rolProcesoService.update(f.id, payload).subscribe({
        next: (updated) => {
          this.guardandoRol.set(false);
          this.cancelarRol();
          this.roles.update(list => list.map(r => r.id === updated.id ? updated : r));
          this.toast.success('Rol actualizado');
        },
        error: (err) => {
          this.guardandoRol.set(false);
          this.errorRol.set(err?.error?.mensaje ?? 'Error al guardar el rol.');
          this.toast.error('Error al editar el rol');
        }
      });
    } else {
      this.rolProcesoService.create(payload).subscribe({
        next: (created) => {
          this.guardandoRol.set(false);
          this.cancelarRol();
          this.rolesDelProceso.add(created.id);
          this.roles.update(list => [...list, created]);
          this.toast.success('Rol creado');
        },
        error: (err) => {
          this.guardandoRol.set(false);
          this.errorRol.set(err?.error?.mensaje ?? 'Error al crear el rol.');
          this.toast.error('Error al crear el rol');
        }
      });
    }
  }

  eliminarRol(id: number) {
    this.confirmarKey.set(null);
    this.eliminandoRolId.set(id);
    this.rolProcesoService.delete(id).subscribe({
      next: () => {
        this.eliminandoRolId.set(null);
        this.roles.update(list => list.filter(r => r.id !== id));
        this.toast.success('Rol eliminado');
      },
      error: (err) => {
        this.eliminandoRolId.set(null);
        const mensaje: string = err?.error?.mensaje;
        this.errorRol.set(mensaje ?? 'Error al eliminar el rol.');
        this.toast.error(mensaje ?? 'Error al eliminar el rol');
      }
    });
  }
}
