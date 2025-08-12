import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-update-skills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './update-skills.component.html',
  styleUrl: './update-skills.component.css'
})
export class UpdateSkillsComponent implements OnInit {
  skillForm!: FormGroup;
  skillId!: number;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.skillForm = this.fb.group({
      name: ['', Validators.required],
      logoFile: [null] // optional
    });

    this.skillId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getSkillById(this.skillId).subscribe({
      next: (res: any) => {
        const skill = res.skill;
        this.skillForm.patchValue({
          name: skill.name
        });

        if (skill.logo) {
          this.previewUrl = skill.logo || 'assets/Image/user.png';
        }
      },
      error: (err) => {
        console.error('Error fetching skill:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.skillForm.patchValue({ logoFile: file });
      this.skillForm.get('logoFile')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.skillForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.skillForm.value.name.trim());
    formData.append('_method', 'PUT'); // Spécifier la méthode PUT pour le backend

    if (this.skillForm.value.logoFile) {
      formData.append('logo', this.skillForm.value.logoFile);
    }

    this.api.uptdateSkill(this.skillId, formData).subscribe({
      next: (res) => {
        Swal.fire({
          title: 'Skill updated successfully!',
          icon: 'success'
        });
        this.router.navigate(['/admin/list/skills']);
      },
      error: (err) => {
        console.error('Error updating skill:', err);
        Swal.fire({
          title: 'Error updating skill',
          text: 'Please try again later.',
          icon: 'error'
        });
      }
    });
  }
}
