import { Component, OnInit } from '@angular/core';
import { Education } from './../../../../education.model';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-education',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-education.component.html',
  styleUrl: './list-education.component.css'
})
export class ListEducationComponent implements OnInit {
  [x: string]: any;
  educations: Education[] = [];

  constructor
    (
      private api: ApiService,
      private router: Router
    ) { }

  ngOnInit(): void {
    this.loadEducations(); // Load educations when the component initializes
  }

  // send to update page
  editEducation(id: number) {
    this.router.navigate(['admin', 'edit', 'education', id]);
  }

  // delete education
  deleteEducation(id: number) {
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
        // Call your API to delete
        this.api.deleteEducation(id).subscribe({
          next: (res: any) => {
            Swal.fire(
              'Deleted!',
              'Education has been deleted.',
              'success'
            );
            // Refresh the list after deletion
            this.loadEducations();
          },
          error: (err: any) => {
            console.error('Delete error:', err);
            Swal.fire('Error!', 'Failed to delete education.', 'error');
          }
        });
      }
    });
  }
  loadEducations() {
    this.api.getEducations().subscribe({
      next: (res: any) => {
        this.educations = res.education; // ✅ matches the Laravel key
      },
      error: (err) => {
        console.error('Error fetching education data:', err);
      }
    });
  }

  createEducation(): void {
    this.router.navigate(['/admin/add/education']);
  }


}
