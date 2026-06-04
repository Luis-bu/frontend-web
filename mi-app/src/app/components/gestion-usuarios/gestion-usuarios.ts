import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioService, UsuarioDTO, UsuarioCreateDTO } from '../../services/usuario.service';

const ROLES = ['ADMINISTRADOR', 'EDITOR', 'SOLO_LECTURA'];

interface UsuarioForm {
  id?: number;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  empresaId: number;
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css'
})
export class GestionUsuarios implements OnInit {
  usuarios            = signal<UsuarioDTO[]>([]);
  cargando            = signal(false);
  error               = signal<string | null>(null);
  guardando           = signal(false);
  eliminandoId        = signal<number | null>(null);
  confirmarEliminarId = signal<number | null>(null);
  mostrarEditor       = signal(false);
  editUsuario: UsuarioForm | null = null;

  soloLectura = computed(() => this.authService.getRol() === 'SOLO_LECTURA');

  readonly roles = ROLES;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    const empresaId = this.authService.getEmpresaId();
    if (!empresaId) return;

    this.cargando.set(true);
    this.error.set(null);
    this.usuarioService.getByEmpresa(empresaId).subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios.');
        this.cargando.set(false);
      }
    });
  }

  nuevoUsuario() {
    this.editUsuario = {
      nombre: '',
      correo: '',
      contrasena: '',
      rol: 'EDITOR',
      empresaId: this.authService.getEmpresaId() ?? 0
    };
    this.mostrarEditor.set(true);
  }

  editarUsuario(usuario: UsuarioDTO) {
    this.editUsuario = { ...usuario, contrasena: '' };
    this.mostrarEditor.set(true);
  }

  cerrarEditor() {
    this.mostrarEditor.set(false);
    this.editUsuario = null;
  }

  guardarUsuario() {
    if (!this.editUsuario) return;
    this.guardando.set(true);

    if (this.editUsuario.id !== undefined) {
      const payload: Omit<UsuarioDTO, 'id'> = {
        nombre: this.editUsuario.nombre,
        correo: this.editUsuario.correo,
        rol: this.editUsuario.rol,
        empresaId: this.editUsuario.empresaId
      };
      this.usuarioService.update(this.editUsuario.id, payload).subscribe({
        next: (updated) => {
          this.guardando.set(false);
          this.cerrarEditor();
          this.usuarios.update(list => list.map(u => u.id === updated.id ? updated : u));
          this.toast.success('Usuario actualizado correctamente');
        },
        error: () => {
          this.guardando.set(false);
          this.toast.error('Error al actualizar el usuario');
        }
      });
    } else {
      const payload: UsuarioCreateDTO = {
        nombre: this.editUsuario.nombre,
        correo: this.editUsuario.correo,
        contrasena: this.editUsuario.contrasena,
        rol: this.editUsuario.rol,
        empresaId: this.editUsuario.empresaId
      };
      this.usuarioService.create(payload).subscribe({
        next: (created) => {
          this.guardando.set(false);
          this.cerrarEditor();
          this.usuarios.update(list => [...list, created]);
          this.toast.success('Usuario creado correctamente');
        },
        error: () => {
          this.guardando.set(false);
          this.toast.error('Error al crear el usuario');
        }
      });
    }
  }

  pedirConfirmacion(usuario: UsuarioDTO) {
    this.confirmarEliminarId.set(usuario.id);
  }

  cancelarEliminar() {
    this.confirmarEliminarId.set(null);
  }

  eliminarUsuario(usuario: UsuarioDTO) {
    const id = usuario.id;
    this.confirmarEliminarId.set(null);
    this.eliminandoId.set(id);
    this.usuarioService.delete(id).subscribe({
      next: () => {
        this.eliminandoId.set(null);
        this.usuarios.update(list => list.filter(u => u.id !== id));
        this.toast.success('Usuario eliminado');
      },
      error: () => {
        this.eliminandoId.set(null);
        this.toast.error('Error al eliminar el usuario');
      }
    });
  }

  formularioValido(): boolean {
    const f = this.editUsuario;
    if (!f) return false;
    const base = f.nombre.trim() !== '' && f.correo.trim() !== '' && f.rol !== '';
    return f.id !== undefined ? base : base && f.contrasena.trim() !== '';
  }

  getRolColor(rol: string): string {
    switch (rol) {
      case 'ADMINISTRADOR': return 'rol-admin';
      case 'EDITOR':        return 'rol-editor';
      default:              return 'rol-lector';
    }
  }
}
