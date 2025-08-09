import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { category } from '../../../../model/category.model';
import { Project } from '../../../../model/project.model';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-update-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-project.component.html',
  styleUrl: './update-project.component.css'
})
export class UpdateProjectComponent implements OnInit {
  ProjectForm!: FormGroup;
  categories: category[] = [];
  imagesPreview: string[] = [];
  selectedImages: File[] = [];
  existingImages: any[] = [];
  isFormValid: any;
  isLoading = false;
  isDataLoaded = false; // Add this flag
  projectId!: number;

  constructor(
    private fb: FormBuilder,
    private apiservice: ApiService,
    public router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadCategories();
    this.loadProject();
  }

  initForm(): void {
    this.ProjectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category_id: ['', Validators.required],
      images: [null]
    });
  }

  loadCategories(): void {
    this.apiservice.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response.categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProject(): void {
    console.log('Loading project with ID:', this.projectId);
    this.apiservice.getProjectById(this.projectId).subscribe({
      next: (response: any) => {
        console.log('Raw API response:', response);

        if (!response || !response.project) {
          console.error('Invalid response structure:', response);
          Swal.fire({
            title: "Error!",
            text: "Invalid project data received from server.",
            icon: "error",
            draggable: true
          });
          return;
        }

        const project = response.project;
        this.existingImages = project.images || [];

        console.log('Project data loaded:', project);
        console.log('Setting form values:', {
          name: project.name,
          description: project.description,
          category_id: project.category_id
        });

        // Test: Set form values manually first
        this.ProjectForm.get('name')?.setValue(project.name);
        this.ProjectForm.get('description')?.setValue(project.description);
        this.ProjectForm.get('category_id')?.setValue(project.category_id);

        console.log('Form values after manual set:', {
          name: this.ProjectForm.get('name')?.value,
          description: this.ProjectForm.get('description')?.value,
          category_id: this.ProjectForm.get('category_id')?.value
        });

        // Also try patchValue
        this.ProjectForm.patchValue({
          name: project.name,
          description: project.description,
          category_id: project.category_id
        });

        // Mark form as dirty and touched to ensure values are recognized
        this.ProjectForm.markAsDirty();
        this.ProjectForm.markAsTouched();

        console.log('Form values after patch:', {
          name: this.ProjectForm.get('name')?.value,
          description: this.ProjectForm.get('description')?.value,
          category_id: this.ProjectForm.get('category_id')?.value
        });

        console.log('Form state after setting values:', {
          valid: this.ProjectForm.valid,
          dirty: this.ProjectForm.dirty,
          touched: this.ProjectForm.touched,
          nameValid: this.ProjectForm.get('name')?.valid,
          descriptionValid: this.ProjectForm.get('description')?.valid,
          categoryValid: this.ProjectForm.get('category_id')?.valid
        });

        this.isDataLoaded = true; // Set flag when data is loaded
      },
      error: (error) => {
        console.error('Error loading project:', error);
        console.error('Error details:', error.error);
        Swal.fire({
          title: "Error!",
          text: "Failed to load project details.",
          icon: "error",
          draggable: true
        });
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  handleFiles(files: FileList) {
    const selectedFiles = Array.from(files);
    this.selectedImages = [...this.selectedImages, ...selectedFiles];
    this.ProjectForm.patchValue({ images: this.selectedImages });

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagesPreview.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagesPreview.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  OnSubmit(): void {
    console.log('OnSubmit called');
    console.log('Form state:', {
      isDataLoaded: this.isDataLoaded,
      formValid: this.ProjectForm.valid,
      formValues: {
        name: this.ProjectForm.get('name')?.value,
        description: this.ProjectForm.get('description')?.value,
        category_id: this.ProjectForm.get('category_id')?.value
      }
    });

    // Check if project data has been loaded
    if (!this.isDataLoaded) {
      console.error('Project data not loaded yet');
      Swal.fire({
        title: "Error!",
        text: "Project data is still loading. Please wait and try again.",
        icon: "error",
        draggable: true
      });
      return;
    }

    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched();

    // Check if the form is valid
    if (!this.ProjectForm.valid) {
      console.error('Form is invalid');
      console.error('Form errors:', this.ProjectForm.errors);
      console.error('Name field errors:', this.ProjectForm.get('name')?.errors);
      console.error('Description field errors:', this.ProjectForm.get('description')?.errors);
      console.error('Category field errors:', this.ProjectForm.get('category_id')?.errors);
      return;
    }

    // Set loading state
    this.isLoading = true;

    // Create FormData
    const formData = new FormData();

    // Append form values to FormData
    formData.append('name', this.ProjectForm.get('name')?.value);
    formData.append('description', this.ProjectForm.get('description')?.value);
    formData.append('category_id', this.ProjectForm.get('category_id')?.value);

    // Append new images to FormData only if there are selected images
    if (this.selectedImages.length > 0) {
      this.selectedImages.forEach((file, index) => {
        formData.append(`images[]`, file);
      });
    }

    // Send IDs of existing images to keep (so backend can delete the others)
    const existingImageIds = this.existingImages.map(img => img.id);
    formData.append('keep_image_ids', JSON.stringify(existingImageIds));

    // Debug: Log what's being sent
    console.log('Form data being sent:');
    console.log('Name:', this.ProjectForm.get('name')?.value);
    console.log('Description:', this.ProjectForm.get('description')?.value);
    console.log('Category ID:', this.ProjectForm.get('category_id')?.value);
    console.log('Selected Images Count:', this.selectedImages.length);
    console.log('Existing Images to Keep:', existingImageIds);

    // Log FormData contents
    console.log('FormData contents:');
    console.log('FormData object:', formData);
    console.log('FormData has name:', formData.has('name'));
    console.log('FormData has description:', formData.has('description'));
    console.log('FormData has category_id:', formData.has('category_id'));

    // Send the form data to the API
    this.apiservice.updateProject(this.projectId, formData).subscribe({
      next: (res) => {
        console.log('Project updated successfully:', res);

        Swal.fire({
          title: "Project updated successfully!",
          icon: "success",
          draggable: true
        });
        this.router.navigate(['admin/list/project'])
      },
      error: (error) => {
        console.error('Error updating project:', error);
        console.error('Error details:', error.error); // Log the actual error response

        if (error.status === 401) {
          Swal.fire({
            title: "Authentication failed. Please login again.",
            icon: "error",
            draggable: true
          });
        } else if (error.status === 422) {
          // Validation error
          const validationErrors = error.error.errors;
          let errorMessage = 'Validation errors:\n';
          for (const field in validationErrors) {
            errorMessage += `${field}: ${validationErrors[field].join(', ')}\n`;
          }
          Swal.fire({
            title: "Validation Error",
            text: errorMessage,
            icon: "error",
            draggable: true
          });
        } else {
          Swal.fire({
            title: "Error updating project. Please try again.",
            icon: "error",
            draggable: true
          });
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Helper method to mark all form fields as touched for validation display
  private markFormGroupTouched(): void {
    Object.keys(this.ProjectForm.controls).forEach(key => {
      const control = this.ProjectForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for template validation
  get nameInvalid(): boolean {
    const control = this.ProjectForm.get('name');
    return !!(control?.invalid && control?.touched);
  }

  get descriptionInvalid(): boolean {
    const control = this.ProjectForm.get('description');
    return !!(control?.invalid && control?.touched);
  }

  get categoryInvalid(): boolean {
    const control = this.ProjectForm.get('category_id');
    return !!(control?.invalid && control?.touched);
  }

  getImageUrl(imageData: string): string {
    return imageData || 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png';
  }
}
