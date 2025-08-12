import { category } from '../../../../model/category.model';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-category.component.html',
  styleUrl: './all-category.component.css'
})
export class AllCategoryComponent implements OnInit {
  categories: category[] = [];
  // Base storage URL no longer needed - using base64 data directly

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadCategories(); // Load categories when the component initializes
  }

  // Send to update page
  editCategory(id: number): void {
    this.router.navigate(['admin', 'edit', 'categories', id]);
  }

  // Delete category
  deleteCategory(id: number): void {
    Swal.fire({
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
        // Call your API to delete
        this.api.deletecategories(id).subscribe({
          next: (res) => {
            console.log('Category deleted successfully:', res);
            this.loadCategories(); // Reload categories after deletion
            Swal.fire('Deleted!', 'Your category has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Error deleting category:', err);

            let errorMessage = 'There was an error deleting the category.';

            // Check for specific error types
            if (err.status === 422 && err.error?.message) {
              // Cannot delete category with projects
              errorMessage = err.error.message;

              // Show project names if available
              if (err.error.projects && err.error.projects.length > 0) {
                const projectNames = err.error.projects.map((p: any) => `• ${p.name}`).join('\n');
                errorMessage += `\n\nProjects in this category:\n${projectNames}`;
              }
            } else if (err.status === 404) {
              errorMessage = 'Category not found.';
            } else if (err.error?.error_details) {
              errorMessage = `Error: ${err.error.error_details}`;
            } else if (err.error?.message) {
              errorMessage = err.error.message;
            }

            Swal.fire('Error!', errorMessage, 'error');
          }
        });
      }
    });
  }

  createCategory(): void {
    this.router.navigate(['/admin/add/categories']);
  }

  // Get image URL - now using base64 data directly
  getImageUrl(coverData: string): string {
    return coverData || 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing user.png as fallback
  }

  // Load categories from API
  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories; // ✅ matches the Laravel key
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        Swal.fire('Error!', 'Failed to load categories.', 'error');
      }
    });
  }
}