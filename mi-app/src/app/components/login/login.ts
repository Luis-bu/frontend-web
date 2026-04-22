import { Component, signal } from '@angular/core';
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
export class Login {
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
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
    
    // Simulamos una petición al servidor
    setTimeout(() => {
      this.isLoading.set(false);
      // Simulamos login exitoso
      console.log('Login exitoso:', { email: this.email(), password: this.password() });
      this.router.navigate(['/procesos']);
    }, 1500);
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
