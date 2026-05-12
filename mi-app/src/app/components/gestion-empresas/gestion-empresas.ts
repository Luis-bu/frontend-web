import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../services/empresa.service';
import { ToastService } from '../../services/toast.service';
import { Empresa } from '../../models/empresa.model';

interface EmpresaForm {
  id?: number;
  nombre: string;
  nit: string;
  correoContacto: string;
}

@Component({
  selector: 'app-gestion-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-empresas.html',
  styleUrl: './gestion-empresas.css'
})
export class GestionEmpresas implements OnInit {
  empresas          = signal<Empresa[]>([]);
  cargando          = signal(false);
  error             = signal<string | null>(null);
  guardando         = signal(false);
  eliminandoId      = signal<number | null>(null);
  confirmarEliminarId = signal<number | null>(null);
  mostrarEditor     = signal(false);
  editEmpresa: EmpresaForm | null = null;

  constructor(
    private empresaService: EmpresaService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.cargarEmpresas();
  }

  cargarEmpresas() {
    this.cargando.set(true);
    this.error.set(null);
    this.empresaService.getAll().subscribe({
      next: (data) => {
        this.empresas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las empresas. Verifica que el servidor esté activo.');
        this.cargando.set(false);
      }
    });
  }

  nuevaEmpresa() {
    this.editEmpresa = { nombre: '', nit: '', correoContacto: '' };
    this.mostrarEditor.set(true);
  }

  editarEmpresa(empresa: Empresa) {
    this.editEmpresa = { ...empresa };
    this.mostrarEditor.set(true);
  }

  cerrarEditor() {
    this.mostrarEditor.set(false);
    this.editEmpresa = null;
  }

  guardarEmpresa() {
    if (!this.editEmpresa) return;
    const { nombre, nit, correoContacto } = this.editEmpresa;
    const payload: Omit<Empresa, 'id'> = { nombre, nit, correoContacto };
    this.guardando.set(true);

    if (this.editEmpresa.id !== undefined) {
      this.empresaService.update(this.editEmpresa.id, payload).subscribe({
        next: (updated) => {
          this.guardando.set(false);
          this.cerrarEditor();
          this.empresas.update(list => list.map(e => e.id === updated.id ? updated : e));
          this.toast.success('Empresa actualizada correctamente');
        },
        error: () => {
          this.guardando.set(false);
          this.toast.error('Error al guardar la empresa');
        }
      });
    } else {
      this.empresaService.create(payload).subscribe({
        next: (created) => {
          this.guardando.set(false);
          this.cerrarEditor();
          this.empresas.update(list => [...list, created]);
          this.toast.success('Empresa creada correctamente');
        },
        error: () => {
          this.guardando.set(false);
          this.toast.error('Error al crear la empresa');
        }
      });
    }
  }

  pedirConfirmacion(empresa: Empresa) {
    this.confirmarEliminarId.set(empresa.id);
  }

  cancelarEliminar() {
    this.confirmarEliminarId.set(null);
  }

  eliminarEmpresa(empresa: Empresa) {
    const id = empresa.id;
    this.confirmarEliminarId.set(null);
    this.eliminandoId.set(id);
    this.empresaService.delete(id).subscribe({
      next: () => {
        this.eliminandoId.set(null);
        this.empresas.update(list => list.filter(e => e.id !== id));
        this.toast.success('Empresa eliminada');
      },
      error: () => {
        this.eliminandoId.set(null);
        this.toast.error('Error al eliminar la empresa');
      }
    });
  }

  formularioValido(): boolean {
    const f = this.editEmpresa;
    return !!f && f.nombre.trim() !== '' && f.nit.trim() !== '' && f.correoContacto.trim() !== '';
  }
}
