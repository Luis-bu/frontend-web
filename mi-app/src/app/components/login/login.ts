import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmpresaService } from '../../services/empresa.service';
import { Empresa } from '../../models/empresa.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  // ── Modo ─────────────────────────────────────────────────────────────────
  modo = signal<'login' | 'registro'>('login');

  // ── Login ─────────────────────────────────────────────────────────────────
  email    = signal('');
  password = signal('');

  // ── Registro ──────────────────────────────────────────────────────────────
  regNombre    = signal('');
  regCorreo    = signal('');
  regPassword  = signal('');
  regEmpresaId = signal<number | null>(null);
  regRol       = signal('EDITOR');
  empresas     = signal<Empresa[]>([]);
  readonly roles = ['ADMINISTRADOR', 'EDITOR', 'SOLO_LECTURA'];

  // ── Compartidos ───────────────────────────────────────────────────────────
  showPassword  = signal(false);
  isLoading     = signal(false);
  errorMessage  = signal('');

  // ── Typewriter ────────────────────────────────────────────────────────────
  readonly phrases = [
    'Diseña procesos empresariales con claridad',
    'Administra actividades, roles, gateways y arcos',
    'Visualiza el flujo completo de tu organización',
    'Gestiona procesos en borrador y publicados',
    'Controla la trazabilidad de cada cambio'
  ];
  currentPhraseIndex = 0;
  currentText = signal('');
  isDeleting = false;
  private typeTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly typingSpeed  = 38;
  private readonly deletingSpeed = 16;
  private readonly waitTime     = 1400;

  // ── Theme ─────────────────────────────────────────────────────────────────
  theme: 'light' | 'dark' = 'light';
  isThemeAnimating = false;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private router: Router,
    private authService: AuthService,
    private empresaService: EmpresaService
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('processflow-theme') as 'light' | 'dark' | null;
    this.theme = saved ?? 'light';
    this.applyTheme(this.theme, false);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      this.currentText.set(this.phrases[0]);
    } else {
      this.typeTimeout = setTimeout(() => this.typeStep(), 600);
    }
    this.cargarEmpresas();
  }

  ngOnDestroy() {
    if (this.typeTimeout !== null) {
      clearTimeout(this.typeTimeout);
      this.typeTimeout = null;
    }
  }

  cargarEmpresas() {
    this.empresaService.getAll().subscribe({
      next: (data) => this.empresas.set(data),
      error: () => {}
    });
  }

  cambiarModo(modo: 'login' | 'registro') {
    this.modo.set(modo);
    this.errorMessage.set('');
  }

  private typeStep() {
    const phrase = this.phrases[this.currentPhraseIndex];
    const cur = this.currentText();
    if (!this.isDeleting) {
      this.currentText.set(phrase.substring(0, cur.length + 1));
      if (this.currentText() === phrase) {
        this.isDeleting = true;
        this.typeTimeout = setTimeout(() => this.typeStep(), this.waitTime);
        return;
      }
    } else {
      this.currentText.set(phrase.substring(0, cur.length - 1));
      if (this.currentText() === '') {
        this.isDeleting = false;
        this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
      }
    }
    const delay = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
    this.typeTimeout = setTimeout(() => this.typeStep(), delay);
  }

  togglePasswordVisibility() { this.showPassword.update(v => !v); }

  onLogin() {
    this.errorMessage.set('');
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor completa todos los campos');
      return;
    }
    if (!this.validateEmail(this.email())) {
      this.errorMessage.set('Por favor ingresa un email válido');
      return;
    }
    this.isLoading.set(true);
    this.authService.login({ correo: this.email(), contrasena: this.password() }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/procesos']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Correo o contraseña incorrectos');
      }
    });
  }

  onRegistro() {
    this.errorMessage.set('');
    if (!this.regNombre() || !this.regCorreo() || !this.regPassword() || !this.regEmpresaId()) {
      this.errorMessage.set('Por favor completa todos los campos');
      return;
    }
    if (!this.validateEmail(this.regCorreo())) {
      this.errorMessage.set('Por favor ingresa un email válido');
      return;
    }
    this.isLoading.set(true);
    this.authService.register({
      nombre: this.regNombre(),
      correo: this.regCorreo(),
      contrasena: this.regPassword(),
      rol: this.regRol(),
      empresaId: this.regEmpresaId()!
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/procesos']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al registrar. El correo puede estar en uso.');
      }
    });
  }

  toggleTheme() {
    if (this.isThemeAnimating || !isPlatformBrowser(this.platformId)) return;
    this.isThemeAnimating = true;
    const curtain = document.getElementById('login-curtain');
    if (curtain) {
      curtain.classList.remove('active');
      void curtain.offsetWidth;
      curtain.classList.add('active');
    }
    setTimeout(() => {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      this.applyTheme(this.theme);
    }, 300);
    setTimeout(() => {
      this.isThemeAnimating = false;
      curtain?.classList.remove('active');
    }, 650);
  }

  private applyTheme(theme: 'light' | 'dark', save = true) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (save) localStorage.setItem('processflow-theme', theme);
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
