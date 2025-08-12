import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Signals for reactive state management
  isLoading = signal(false);
  alertMessage = signal('');
  alertType = signal<'success' | 'error'>('error');
  showPassword = signal(false);
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Auto-redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.showAlert('Vous êtes déjà connecté !', 'success');
      setTimeout(() => {
        this.router.navigate(['/admin/add/education']);
      }, 1000);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.alertMessage.set('');

      try {
        const loginData = this.loginForm.value;
        console.log('Attempting login...');

        await this.authService.login(loginData);
        console.log('Login successful, user logged in:', this.authService.isLoggedIn());

        this.showAlert('Connexion réussie ! Redirection...', 'success');

        console.log('About to redirect to /admin/dashboard');
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']).then(
            (success) => console.log('Navigation success:', success),
            (error) => console.error('Navigation error:', error)
          );
        }, 1000);

      } catch (error: any) {
        console.error('Login error:', error);
        this.showAlert(error.message || 'Échec de la connexion. Veuillez réessayer.', 'error');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  resetPassword() {
    this.showAlert('La fonctionnalité de réinitialisation du mot de passe arrive bientôt !', 'success');
  }



  private showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => {
      this.alertMessage.set('');
    }, 5000);
  }
}