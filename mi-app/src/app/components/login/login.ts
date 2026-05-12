import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  // ── Typewriter ────────────────────────────────────────────────────────
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
  private readonly typingSpeed = 38;
  private readonly deletingSpeed = 16;
  private readonly waitTime = 1400;

  // ── Theme toggle (login page has its own since nav is hidden) ─────────
  theme: 'light' | 'dark' = 'light';
  isThemeAnimating = false;

  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

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
  }

  ngOnDestroy() {
    if (this.typeTimeout !== null) {
      clearTimeout(this.typeTimeout);
      this.typeTimeout = null;
    }
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

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

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
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/procesos']);
    }, 1500);
  }

  toggleTheme() {
    if (this.isThemeAnimating || !isPlatformBrowser(this.platformId)) return;
    this.isThemeAnimating = true;

    const curtain = document.getElementById('login-curtain');
    if (curtain) {
      curtain.classList.remove('active');
      void curtain.offsetWidth; // fuerza reflow para que la animación se reinicie
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
