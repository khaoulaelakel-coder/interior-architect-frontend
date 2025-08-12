import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all-cvs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-cvs.component.html',
  styleUrl: './all-cvs.component.css'
})
export class AllCvsComponent implements OnInit {
  cvs: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCVs();
  }

  loadCVs(): void {
    this.api.getCVs().subscribe({
      next: (res: any) => {
        this.cvs = res.cvs || [];
      },
      error: (err) => {
        console.error('Error fetching CVs:', err);
      }
    });
  }

  // Navigate to add CV page
  addCV(): void {
    this.router.navigate(['admin', 'add', 'cv']);
  }

  // Navigate to edit CV page
  editCV(id: number): void {
    this.router.navigate(['admin', 'edit', 'cv', id]);
  }

  // Delete CV
  deleteCV(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteCV(id).subscribe({
          next: (res) => {
            console.log('CV deleted successfully:', res);
            this.loadCVs(); // Reload CVs after deletion
            Swal.fire('Deleted!', 'CV has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Error deleting CV:', err);
            Swal.fire('Error!', 'There was an error deleting the CV.', 'error');
          }
        });
      }
    });
  }

  // Download CV file from database
  downloadCV(cvId: number, language: string): void {
    // Use the API download endpoint
    const downloadUrl = `${this.api['apiUrl']}/cvs/${cvId}/download/${language}`;

    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `CV_${language}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}