import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Skill } from '../../../../model/skills.model';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';
import { Route, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-all-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-skills.component.html',
  styleUrl: './all-skills.component.css'
})
export class AllSkillsComponent implements OnInit {
  skills: Skill[] = [];

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.getSkills();
  }

  getSkills(): void {
    this.api.getSkills().subscribe({
      next: (res: any) => {
        console.log('API response:', res);
        this.skills = res.skills ?? []; // ✅ اسحب skills من داخل الـ object

        // Debug: Log skill data and image URLs
        console.log('Skills data:', this.skills);
        this.skills.forEach((skill, index) => {
          console.log(`Skill ${index}:`, {
            name: skill.name,
            logo: skill.logo,
            fullImageUrl: this.getImageUrl(skill.logo)
          });
        });
      },
      error: (err) => {
        console.error('Failed to load skills', err);
      }
    });

  }




  editskill(id: number) {
    this.router.navigate(['admin', 'edit', 'skill', id]);
  }

  deleteSkill(id: number) {
    Swal.fire
      ({
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
          this.api.deleteSkill(id).subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Your skill has been deleted.', 'success');
              this.loadskills();
            },
            error: (err) => {
              Swal.fire('Error!', 'There was an error deleting the skill.', 'error');
              console.error('Error deleting skill:', err);
            }
          });
        }
      });
  }

  loadskills() {
    this.api.getSkills().subscribe({
      next: (res: any) => {
        this.skills = res.skills; // ✅ matches the Laravel key
      },
      error: (err) => {
        console.error('Error fetching skills data:', err);
      }
    });
  }

  createSkill(): void {
    this.router.navigate(['/admin/add/skills']);
  }

  getImageUrl(logoData: string): string {
    // Skills now come with base64 data directly from the API
    return logoData || 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.error('Image failed to load:', {
      originalSrc: target.src,
      skillName: target.alt,
      settingFallback: 'assets/Image/user.png'
    });
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }
}
