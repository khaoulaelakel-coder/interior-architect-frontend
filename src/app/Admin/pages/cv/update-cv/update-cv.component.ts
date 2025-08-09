import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-cv',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-cv.component.html',
  styleUrl: './update-cv.component.css'
})
export class UpdateCvComponent implements OnInit {
  cvForm!: FormGroup;
  isLoading = false;
  cvId!: number;
  currentCv: any = null;

  // File previews
  frFileSelected: File | null = null;
  enFileSelected: File | null = null;
  frFileName = '';
  enFileName = '';

  // Track if files were changed
  frFileChanged = false;
  enFileChanged = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getCvId();
  }

  getCvId(): void {
    this.route.params.subscribe(params => {
      this.cvId = +params['id'];
      if (this.cvId) {
        this.loadCvData();
      }
    });
  }

  loadCvData(): void {
    this.isLoading = true;
    this.api.getCVById(this.cvId).subscribe({
      next: (res: any) => {
        this.currentCv = res.cv || res;
        this.populateForm();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading CV data:', err);
        this.isLoading = false;
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load CV data.',
          icon: 'error',
          confirmButtonText: 'OK'
        }).then(() => {
          this.goBack();
        });
      }
    });
  }

  populateForm(): void {
    if (this.currentCv) {
      this.cvForm.patchValue({
        user_id: this.currentCv.user_id || 1
      });

      // Set file names if they exist
      if (this.currentCv.cv_fr_filename) {
        this.frFileName = this.currentCv.cv_fr_filename;
      }
      if (this.currentCv.cv_en_filename) {
        this.enFileName = this.currentCv.cv_en_filename;
      }
    }
  }

  initForm(): void {
    this.cvForm = this.fb.group({
      user_id: [1, Validators.required],
      cv_fr: [null],
      cv_en: [null]
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
        this.frFileChanged = true;
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
        this.enFileChanged = true;
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
    this.frFileName = this.currentCv?.cv_fr_filename || '';
    this.frFileChanged = false;
    this.cvForm.patchValue({ cv_fr: null });
  }

  resetEnglishFile(): void {
    this.enFileSelected = null;
    this.enFileName = this.currentCv?.cv_en_filename || '';
    this.enFileChanged = false;
    this.cvForm.patchValue({ cv_en: null });
  }

  onSubmit(): void {
    if (this.cvForm.invalid) {
      console.error('Form is invalid');
      Swal.fire({
        title: 'Form Invalid',
        text: 'Please fill in all required fields.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check if at least one file is provided (either existing or new)
    const hasFrenchFile = this.currentCv?.cv_fr_data || this.frFileSelected;
    const hasEnglishFile = this.currentCv?.cv_en_data || this.enFileSelected;

    if (!hasFrenchFile || !hasEnglishFile) {
      Swal.fire({
        title: 'Missing Files',
        text: 'Please ensure both French and English CV files are provided.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isLoading = true;

    // Create FormData
    const formData = new FormData();
    formData.append('user_id', this.cvForm.get('user_id')?.value);
    formData.append('_method', 'PUT'); // Laravel method spoofing

    // Only append files if they were changed
    if (this.frFileChanged && this.frFileSelected) {
      formData.append('cv_fr', this.frFileSelected);
    }

    if (this.enFileChanged && this.enFileSelected) {
      formData.append('cv_en', this.enFileSelected);
    }

    // Debug logging
    console.log('Form data being sent for update:');
    console.log('CV ID:', this.cvId);
    console.log('User ID:', this.cvForm.get('user_id')?.value);
    console.log('French file changed:', this.frFileChanged);
    console.log('English file changed:', this.enFileChanged);

    // Call API
    this.api.updateCV(this.cvId, formData).subscribe({
      next: (res) => {
        console.log('CV updated successfully:', res);
        this.isLoading = false;

        Swal.fire({
          title: 'Success!',
          text: 'CV has been updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/admin/list/cvs']);
        });
      },
      error: (err) => {
        console.error('Error updating CV:', err);
        this.isLoading = false;

        let errorMessage = 'Failed to update CV. Please try again.';

        if (err.error?.message) {
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
