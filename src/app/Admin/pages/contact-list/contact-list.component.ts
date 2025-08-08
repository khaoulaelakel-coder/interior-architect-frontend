import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

interface Contact {
    id: number;
    name: string;
    email: string;
    phone?: string;
    website?: string;
    message: string;
    created_at: string;
}

@Component({
    selector: 'app-contact-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './contact-list.component.html',
    styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {
    contacts: Contact[] = [];
    loading = false;
    error = '';

    constructor(private apiService: ApiService) { }

    ngOnInit(): void {
        this.loadContacts();
    }

    loadContacts(): void {
        this.loading = true;
        this.error = '';

        this.apiService.getContacts().subscribe({
            next: (response) => {
                this.contacts = response;
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Erreur lors du chargement des messages';
                this.loading = false;
                console.error('Error loading contacts:', error);
            }
        });
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    deleteContact(id: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
            this.apiService.deleteContact(id).subscribe({
                next: () => {
                    this.contacts = this.contacts.filter(contact => contact.id !== id);
                },
                error: (error) => {
                    console.error('Error deleting contact:', error);
                    alert('Erreur lors de la suppression');
                }
            });
        }
    }
}
