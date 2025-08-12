import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Experience } from '../../../../model/experience.model';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-experiences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-experiences.component.html',
  styleUrl: './all-experiences.component.css'
})
export class AllExperiencesComponent implements OnInit {
  experience: Experience[] = [];

  constructor
    (
      private api: ApiService,
      private Router: Router
    ) { }

  ngOnInit(): void {


    this.loadExperiences();
  }


  loadExperiences(): void {
    this.api.getExperiences().subscribe({
      next: (res: any) => {
        this.experience = res.experiences;
      },
      error: (err) => {
        console.error('Error fetching experience data:', err);
      }
    });
  }
  editExperience(id: number): void {
    this.Router.navigate(['admin', 'edit', 'experience', id]);
  }

  deleteExperience(id: number) {
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
        this.api.deleteExperience(id).subscribe({
          next: (res: any) => {
            Swal.fire(
              'Deleted!',
              'Experience has been deleted.',
              'success'
            );
            // Refresh the list after deletion
            this.loadExperiences();
          },
          error: (err: any) => {
            console.error('Delete error:', err);
            Swal.fire('Error!', 'Failed to delete education.', 'error');
          }
        });
      }
    });
  }

  createExperience(): void {
    this.Router.navigate(['/admin/add/experience']);
  }

}


