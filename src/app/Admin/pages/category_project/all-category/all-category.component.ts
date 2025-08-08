import { category } from '../../../../model/category.model';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
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
  baseStorageUrl = 'https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/'; // Database image storage URL

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
            Swal.fire('Error!', 'There was an error deleting the category.', 'error');
          }
        });
      }
    });
  }

  createCategory(): void {
    this.router.navigate(['/admin/add/categories']);
  }

  // Get full image URL
  getImageUrl(coverPath: string): string {
    if (!coverPath) return '';
    return this.baseStorageUrl + coverPath;
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