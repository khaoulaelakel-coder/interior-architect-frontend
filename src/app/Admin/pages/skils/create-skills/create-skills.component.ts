import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-skills',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-skills.component.html',
  styleUrl: './create-skills.component.css'
})
export class CreateSkillsComponent implements OnInit {
  form!: FormGroup;
  previewUrl: string | ArrayBuffer | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      logoFile: [null] // ✅ Register logoFile here
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.patchValue({ logoFile: file });
      this.form.get('logoFile')?.updateValueAndValidity(); // ✅ Force Angular to recognize the new file

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Please enter a skill name.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.form.value.name);

    if (this.form.value.logoFile) {
      formData.append('logo', this.form.value.logoFile); // ✅ Laravel expects 'logo'
    }

    this.api.addskills(formData).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'Success',
          text: 'Skill added successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/admin/list/skills']);
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error adding skill:', error);
        this.errorMessage = error.error.message || 'An error occurred while adding the skill.';
      }
    });
  }
}
