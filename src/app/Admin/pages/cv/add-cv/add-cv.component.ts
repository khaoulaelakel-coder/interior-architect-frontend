import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-cv',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-cv.component.html',
  styleUrl: './add-cv.component.css'
})
export class AddCvComponent implements OnInit {
  cvForm!: FormGroup;
  isLoading = false;

  // File previews
  frFileSelected: File | null = null;
  enFileSelected: File | null = null;
  frFileName = '';
  enFileName = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.cvForm = this.fb.group({
      user_id: [1, Validators.required], // Default user ID, you can make this dynamic
      cv_fr: [null, Validators.required],
      cv_en: [null, Validators.required]
    });
  }

  onFrenchFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type and size
      if (this.validateFile(file)) {
        this.frFileSelected = file;
        this.frFileName = file.name;
        this.cvForm.patchValue({ cv_fr: file });
      } else {
        this.resetFrenchFile();
      }
    }
  }

  onEnglishFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type and size
      if (this.validateFile(file)) {
        this.enFileSelected = file;
        this.enFileName = file.name;
        this.cvForm.patchValue({ cv_en: file });
      } else {
        this.resetEnglishFile();
      }
    }
  }

  validateFile(file: File): boolean {
    // Check file type (only PDF)
    if (file.type !== 'application/pdf') {
      Swal.fire({
        title: 'Invalid File Type',
        text: 'Please select a PDF file only.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      Swal.fire({
        title: 'File Too Large',
        text: 'Please select a file smaller than 5MB.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return false;
    }

    return true;
  }

  resetFrenchFile(): void {
    this.frFileSelected = null;
    this.frFileName = '';
    this.cvForm.patchValue({ cv_fr: null });
  }

  resetEnglishFile(): void {
    this.enFileSelected = null;
    this.enFileName = '';
    this.cvForm.patchValue({ cv_en: null });
  }

  onSubmit(): void {
    if (this.cvForm.invalid) {
      console.error('Form is invalid');
      Swal.fire({
        title: 'Form Invalid',
        text: 'Please fill in all required fields and select both CV files.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isLoading = true;

    // Create FormData
    const formData = new FormData();
    formData.append('user_id', this.cvForm.get('user_id')?.value);

    if (this.frFileSelected) {
      formData.append('cv_fr', this.frFileSelected);
    }

    if (this.enFileSelected) {
      formData.append('cv_en', this.enFileSelected);
    }

    // Debug logging
    console.log('Form data being sent:');
    console.log('User ID:', this.cvForm.get('user_id')?.value);
    console.log('French file:', this.frFileSelected?.name);
    console.log('English file:', this.enFileSelected?.name);

    // Call API
    this.api.addCV(formData).subscribe({
      next: (res) => {
        console.log('CV added successfully:', res);
        this.isLoading = false;

        Swal.fire({
          title: 'Success!',
          text: 'CV has been added successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/admin/list/cvs']);
        });
      },
      error: (err) => {
        console.error('Error adding CV:', err);
        this.isLoading = false;

        let errorMessage = 'Failed to add CV. Please try again.';

        if (err.status === 409) {
          errorMessage = 'CV already exists for this user.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  // Navigate back to CV list
  goBack(): void {
    this.router.navigate(['/admin/list/cvs']);
  }
}