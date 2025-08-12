import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project } from '../../../../model/project.model';
import { ApiService } from '../../../../services/api.service';
import { category } from '../../../../model/category.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.css'
})
export class AddProjectComponent implements OnInit {
  ProjectForm !: FormGroup;
  categories: category[] = [];
  imagesPreview: string[] = [];
  selectedImages: File[] = [];
  isFormValid: any;
  isLoading = false;

  constructor(private fb: FormBuilder, private apiservice: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.ProjectForm = this.fb.group
      ({
        name: ['', Validators.required],
        description: ['', Validators.required],
        category_id: ['', Validators.required],
        images: [null], // workaround for file array form control
        user_id: []
      });

    this.loadCategories();
  }

  loadCategories(): void {
    this.apiservice.getCategories().subscribe
      ({
        next: (Response) => {
          this.categories = Response.categories || Response.data || Response;
          console.log('Categories loaded:', this.categories);
        },
        error: (error) => console.error('Error loading categories:', error)

      });
  }


  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onImageChange(event: Event): void {

    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      const selectedFiles = Array.from(files);

      this.selectedImages = selectedFiles;

      this.ProjectForm.patchValue({ images: selectedFiles });

      //get preview 
      this.imagesPreview = [];
      if (!this.selectedImages || !Array.isArray(this.selectedImages)) {
        console.error('selectedImages is not defined or not an array:', this.selectedImages);
        return;
      }

      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagesPreview.push(e.target.result);
        reader.readAsDataURL(file);
      });
    }
  }


  handleFiles(files: FileList) {

    this.selectedImages = Array.from(files);
    this.imagesPreview = []; // Clear previous previews

    //generate previews for each selected image
    this.selectedImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagesPreview.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagesPreview.splice(index, 1);
  }

  OnSubmit(): void {
    console.log('OnSubmit called');

    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched();

    // Check if the form is valid
    if (!this.ProjectForm.valid) {
      console.error('Form is invalid');
      return;
    }

    // Check if images are selected
    if (!this.selectedImages || this.selectedImages.length === 0) {
      Swal.fire({
        title: "Please select at least one image!",
        icon: "error",
        draggable: true
      });

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

    // Append images to FormData
    this.selectedImages.forEach((file, index) => {
      formData.append(`images[]`, file);
    });

    // Send the form data to the API
    this.apiservice.addProjects(formData).subscribe({
      next: (res) => {
        console.log('Project added successfully:', res);

        // Reset the form
        this.ProjectForm.reset();
        this.selectedImages = [];
        this.imagesPreview = [];

        Swal.fire({
          title: "Project added successfully!",
          icon: "success",
          draggable: true
        });
        this.router.navigate(['admin/list/project'])
      },
      error: (error) => {
        console.error('Error adding project:', error);
        if (error.status === 401) {
          Swal.fire({
            title: "Authentication failed. Please login again.",
            icon: "error",
            draggable: true
          });

        } else {
          Swal.fire({
            title: "Error adding project. Please try again.",
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

}