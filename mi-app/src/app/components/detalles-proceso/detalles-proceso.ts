import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProcesoService } from '../../services/proceso.service';
import { ActividadService } from '../../services/actividad.service';
import { GatewayService } from '../../services/gateway.service';
import { ArcoService } from '../../services/arco.service';
import { Proceso } from '../../models/proceso.model';
import { Actividad } from '../../models/actividad.model';
import { Gateway } from '../../models/gateway.model';
import { Arco } from '../../models/arco.model';

@Component({
  selector: 'app-detalles-proceso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalles-proceso.html',
  styleUrl: './detalles-proceso.css'
})
export class DetallesProceso implements OnInit {
  proceso = signal<Proceso | null>(null);
  actividades = signal<Actividad[]>([]);
  gateways = signal<Gateway[]>([]);
  arcos = signal<Arco[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private procesoService: ProcesoService,
    private actividadService: ActividadService,
    private gatewayService: GatewayService,
    private arcoService: ArcoService
  ) {}

  ngOnInit() {
    const id = parseInt(this.route.snapshot.params['id'], 10);
    this.cargarDatos(id);
  }

  cargarDatos(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.procesoService.getById(id).subscribe({
      next: (proceso) => {
        this.proceso.set(proceso);
        forkJoin({
          actividades: this.actividadService.getByProceso(id),
          gateways: this.gatewayService.getByProceso(id),
          arcos: this.arcoService.getByProceso(id)
        }).subscribe({
          next: ({ actividades, gateways, arcos }) => {
            this.actividades.set(actividades);
            this.gateways.set(gateways);
            this.arcos.set(arcos);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.error.set('No se pudo cargar el proceso.');
        this.loading.set(false);
      }
    });
  }

  volver() {
    this.router.navigate(['/procesos']);
  }

  getStatusColor(): string {
    switch (this.proceso()?.estado) {
      case 'completado': return 'completado';
      case 'en-progreso': return 'en-progreso';
      case 'suspendido': return 'suspendido';
      default: return '';
    }
  }

  getStatusText(): string {
    switch (this.proceso()?.estado) {
      case 'completado': return 'Completado';
      case 'en-progreso': return 'En Progreso';
      case 'suspendido': return 'Suspendido';
      default: return this.proceso()?.estado ?? '';
    }
  }
}
