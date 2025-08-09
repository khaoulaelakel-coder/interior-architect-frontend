import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-category.component.html',
  styleUrl: './edit-category.component.css'
})
export class EditCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  categoryId!: number;
  loading = false;
  previewUrl: string | ArrayBuffer | null = null;
  existingCover: string | null = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      coverFile: [null] // Add cover file control
    });

    this.categoryId = this.route.snapshot.params['id'];
    this.loadCategoryData();
  }

  loadCategoryData(): void {
    this.loading = true;
    this.api.getCategoryById(this.categoryId).subscribe({
      next: (res: any) => {
        console.log('API Response:', res); // Debug log

        // Handle different possible response structures
        let categoryData = null;

        if (res && res.category) {
          // Structure: {message: '...', category: {id: x, name: 'name'}}
          categoryData = res.category;
        } else if (res && res.name) {
          // Structure: {id: x, name: 'name'}
          categoryData = res;
        } else if (res && res.data && res.data.name) {
          // Structure: {data: {id: x, name: 'name'}}
          categoryData = res.data;
        }

        if (categoryData && categoryData.name) {
          // Use patchValue to populate form with existing data
          this.categoryForm.patchValue({
            name: categoryData.name,
            description: categoryData.description || ''
          });

          // Handle existing cover image
          if (categoryData.cover) {
            this.existingCover = categoryData.cover;
            this.previewUrl = categoryData.cover || 'assets/Image/user.png';
          }
        } else {
          console.error('Invalid response structure:', res);
          Swal.fire({
            title: 'Error',
            text: 'Invalid data format received.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.loading = false;

        let errorMessage = 'Échec du chargement des données de la catégorie.';

        if (error.status === 404) {
          errorMessage = 'Catégorie non trouvée.';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        Swal.fire({
          title: 'Erreur',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const data = this.categoryForm.value;
    this.loading = true;

    // Debug: Log form values
    console.log('Form values:', data);
    console.log('Form valid:', this.categoryForm.valid);
    console.log('Form dirty:', this.categoryForm.dirty);
    console.log('Form touched:', this.categoryForm.touched);

    // Create FormData to handle file uploads
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');

    if (data.coverFile) {
      formData.append('cover', data.coverFile);
    }

    // Debug: Log what's being sent
    console.log('Form data being sent:', {
      name: data.name,
      description: data.description,
      hasCoverFile: !!data.coverFile,
      categoryId: this.categoryId
    });

    // Debug: Check FormData contents
    console.log('FormData has name:', formData.has('name'));
    console.log('FormData has description:', formData.has('description'));
    console.log('FormData has cover:', formData.has('cover'));

    // Call update API - matches your Laravel controller update method
    this.api.updateCategory(this.categoryId, formData).subscribe({
      next: (res) => {
        console.log('Category updated successfully:', res);
        this.loading = false;
        Swal.fire({
          title: 'Succès',
          text: 'Catégorie mise à jour avec succès!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/admin/list/categories']);
        });
      },
      error: (error: any) => {
        console.error('Error updating category:', error);
        this.loading = false;

        let errorMessage = 'Échec de la mise à jour de la catégorie. Veuillez réessayer.';

        if (error.status === 422) {
          // Validation error
          const validationErrors = error.error.errors;
          if (validationErrors) {
            const errorMessages = [];
            for (const field in validationErrors) {
              errorMessages.push(...validationErrors[field]);
            }
            errorMessage = errorMessages.join('\n');
          }
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        Swal.fire({
          title: 'Erreur',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.categoryForm.patchValue({ coverFile: file });
      this.categoryForm.get('coverFile')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Reset form to original values using patchValue
  resetForm(): void {
    this.loadCategoryData();
  }

  // Cancel and go back
  onCancel(): void {
    this.router.navigate(['/categories']);
  }
}
