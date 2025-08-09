import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    website: '',
    message: ''
  };

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  onSubmit() {
    // Client-side validation
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.notificationService.showError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.notificationService.showError('Veuillez entrer une adresse email valide.');
      return;
    }

    this.http.post(`${environment.apiUrl}/contact`, this.formData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Message envoyé avec succès !');
        // Reset form
        this.formData = {
          name: '',
          email: '',
          phone: '',
          website: '',
          message: ''
        };
      },
      error: (error) => {
        console.error('Contact form error:', error);
        if (error.status === 422) {
          this.notificationService.showError('Veuillez vérifier les informations saisies.');
        } else {
          this.notificationService.showError('Erreur lors de l\'envoi du message.');
        }
      }
    });
  }
}
