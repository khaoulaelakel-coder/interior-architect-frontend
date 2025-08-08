import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import { category } from '../../../../model/category.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-category',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-category.component.html',
  styleUrl: './create-category.component.css'
})
export class CreateCategoryComponent implements OnInit {
  categoryForm!: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      category1: ['', Validators.required],
      category2: [''],
      category3: [''],
      description1: [''],
      description2: [''],
      description3: [''],
      cover1: [null],
      cover2: [null],
      cover3: [null],
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const data = this.categoryForm.value;

    // Prepare arrays for form data
    const categoriesToSend = [data.category1, data.category2, data.category3].filter(
      (c) => c && c.trim() !== ''
    );

    const descriptionsToSend = [data.description1, data.description2, data.description3];
    const coversToSend = [data.cover1, data.cover2, data.cover3];

    if (categoriesToSend.length === 0) {
      console.error('No categories to save.');
      return;
    }

    // Create FormData to handle file uploads
    const formData = new FormData();

    // Add category names
    categoriesToSend.forEach((name, index) => {
      formData.append(`name[${index}]`, name);
    });

    // Add descriptions (matching the length of categories)
    categoriesToSend.forEach((_, index) => {
      const description = descriptionsToSend[index] || '';
      formData.append(`description[${index}]`, description);
    });

    // Add covers (matching the length of categories)
    categoriesToSend.forEach((_, index) => {
      const cover = coversToSend[index];
      if (cover) {
        formData.append(`cover[${index}]`, cover);
      }
    });

    // Call API with FormData
    this.api.addcategories(formData).subscribe({
      next: (res) => {
        console.log('Categories added successfully:', res);
        this.categoryForm.reset();
        Swal.fire({
          title: 'Succès',
          text: 'Catégories ajoutées avec succès!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/admin/list/categories']);
        });
      },
      error: (error: any) => {
        console.error('Error adding categories:', error);

        let errorMessage = 'Échec de l\'ajout des catégories. Veuillez réessayer.';

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

  onFileSelected(event: any, controlName: string): void {
    const file = event.target.files[0];
    if (file) {
      this.categoryForm.patchValue({
        [controlName]: file
      });
    }
  }

  private addCategories(categories: category[]): void {
    console.log('Categories submitted:', categories);
  }
}