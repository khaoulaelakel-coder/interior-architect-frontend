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

  // Bulk selection properties
  selectedSkills: number[] = [];
  isAllSelected = false;

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
    target.src = 'assets/Image/user.png';
  }

  // Bulk selection methods
  toggleSkillSelection(skillId: number): void {
    const index = this.selectedSkills.indexOf(skillId);
    if (index > -1) {
      this.selectedSkills.splice(index, 1);
    } else {
      this.selectedSkills.push(skillId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.selectedSkills = [];
    } else {
      this.selectedSkills = this.skills.map(s => s.id!);
    }
    this.isAllSelected = !this.isAllSelected;
  }

  isSkillSelected(skillId: number): boolean {
    return this.selectedSkills.includes(skillId);
  }

  updateSelectAllState(): void {
    this.isAllSelected = this.selectedSkills.length === this.skills.length && this.skills.length > 0;
  }

  bulkDeleteSkills(): void {
    if (this.selectedSkills.length === 0) {
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous vraiment supprimer ${this.selectedSkills.length} compétence(s) sélectionnée(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performBulkDelete();
      }
    });
  }

  private performBulkDelete(): void {
    // Use the new bulk delete API endpoint
    this.api.bulkDeleteSkills(this.selectedSkills).subscribe({
      next: (response) => {
        console.log('Bulk delete successful:', response);

        // Remove deleted skills from local array
        this.skills = this.skills.filter(s => !this.selectedSkills.includes(s.id!));

        // Clear selection
        this.selectedSkills = [];
        this.isAllSelected = false;

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Suppression terminée!',
          text: `${response.deleted_count} compétence(s) supprimée(s) avec succès!`
        });
      },
      error: (error) => {
        console.error('Bulk delete error:', error);

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression en masse des compétences'
        });
      }
    });
  }
}
