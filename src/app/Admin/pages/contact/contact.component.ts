import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  contacts: any[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getContacts().subscribe({
      next: (res: any) => {
        this.contacts = res.contacts || res;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load contacts';
        this.loading = false;
      }
    });
  }
}
