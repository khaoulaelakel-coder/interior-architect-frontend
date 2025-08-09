import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-category-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-projects.component.html',
  styleUrls: ['./category-projects.component.css']
})
export class CategoryProjectsComponent implements OnInit {
  categoryId: string | null = null;
  projects: any[] = [];
  isLoading: boolean = true;
  isLoadingMore: boolean = false;
  error: string | null = null;

  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;
  hasMorePages: boolean = true;
  perPage: number = 12;

  constructor(private route: ActivatedRoute, private apiService: ApiService) { }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    console.log('CategoryProjectsComponent - categoryId:', this.categoryId);
    if (this.categoryId) {
      this.loadProjects();
    }
  }

  loadProjects(reset: boolean = true): void {
    if (!this.categoryId) return;

    if (reset) {
      this.isLoading = true;
      this.currentPage = 1;
      this.projects = [];
    } else {
      this.isLoadingMore = true;
    }

    this.error = null;

    // Add pagination parameters
    const params = {
      page: this.currentPage,
      per_page: this.perPage
    };

    this.apiService.getProjectsByCategory(this.categoryId, params).subscribe({
      next: (data) => {
        console.log('CategoryProjectsComponent - API response:', data);

        const newProjects = data.projects || [];

        if (reset) {
          this.projects = newProjects;
        } else {
          this.projects = [...this.projects, ...newProjects];
        }

        // Update pagination info
        if (data.pagination) {
          this.currentPage = data.pagination.current_page;
          this.totalPages = data.pagination.last_page;
          this.hasMorePages = data.pagination.has_more_pages;
        }

        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (err) => {
        console.error('Failed to load projects:', err);

        // Handle 404 as "no projects found" instead of an error
        if (err.status === 404 || (err.error && err.error.message === 'No projects found for this category')) {
          console.log('No projects found for this category - this is normal');
          if (reset) {
            this.projects = []; // Empty array, not an error
          }
          this.error = null;
          this.hasMorePages = false;
        } else {
          // Real error
          this.error = 'Failed to load projects. Please try again.';
        }

        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  loadMoreProjects(): void {
    if (this.hasMorePages && !this.isLoadingMore) {
      this.currentPage++;
      this.loadProjects(false);
    }
  }

  getImageUrl(imageData: string | null): string {
    // Images now come as base64 data directly from the API
    return imageData || 'assets/Image/user.png';
  }


  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }

  getFirstImage(project: any): string | null {
    if (project.cover_image) {
      return project.cover_image; // default cover image
    }
    if (project.images && project.images.length > 0) {
      return project.images[0].image_url; // fallback to first image in array
    }
    return null; // no image available
  }



}
