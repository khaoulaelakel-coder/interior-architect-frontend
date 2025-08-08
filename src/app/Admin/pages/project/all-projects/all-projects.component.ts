import { Component, OnInit } from '@angular/core';
import { Project } from '../../../../model/project.model';
import { CommonModule, SlicePipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { category } from '../../../../model/category.model';
import { ConfirmDeleteComponent } from '../../../shared/confirm-delete/confirm-delete.component';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-all-projects',
  standalone: true,
  imports: [CommonModule, ConfirmDeleteComponent, RouterModule],
  templateUrl: './all-projects.component.html',
  styleUrl: './all-projects.component.css'
})
export class AllProjectsComponent implements OnInit {
  projects: Project[] = [];
  selectedImages: string[] = [];
  expandedDescriptions: Set<number> = new Set();
  // Modal properties
  showModal: boolean = false;
  modalImages: string[] = [];
  currentImageIndex: number = 0;
  showModalDelete: boolean = false;
  loading = false;

  categories: category[] = [];
  deleteId: number | null = null;

  // Pagination properties
  pagination: any = null;
  currentPage = 1;
  totalPages = 1;

  constructor(private apiservice: ApiService, private router: Router
  ) { }
  editProject(projectId: number) {
    this.router.navigate(['/admin/edit/project', projectId]);
  }

  createProject() {
    this.router.navigate(['/admin/add/project']);
  }

  ngOnInit(): void {
    this.apiservice.getCategories().subscribe
      ({
        next: (response) => {
          this.categories = response.categories; // Assuming API returns {categories: Category[]}
        },
        error: (error) => console.error('Error loading categories:', error)
      });

    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.apiservice.getProjects(this.currentPage).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.projects = response.projects;
          this.pagination = response.pagination;
          this.currentPage = response.pagination?.current_page || 1;
          this.totalPages = response.pagination?.last_page || 1;
        } else {
          this.projects = response.projects || [];
        }
        console.log('Projects loaded:', this.projects); // Debug
      },
      error: (error) => {
        console.error('Error fetching projects:', error);
        this.projects = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Pagination methods
  loadPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProjects();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  }
  showImages(images: any[]) {
    // Handle different image data structures
    if (!images || images.length === 0) {
      console.warn('No images to show');
      return;
    }

    // Transform images to URLs based on data structure
    this.modalImages = images.map(img => {
      if (typeof img === 'string') {
        // If image is just a string path
        return `https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/${img}`;
      } else if (img && typeof img === 'object') {
        // If image is an object with image_url property
        if (img.image_url) {
          return `https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/${img.image_url}`;
        } else if (img.path) {
          return `https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/${img.path}`;
        } else if (img.url) {
          return `https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/${img.url}`;
        }
      }
      // Fallback
      return 'assets/Image/user.png';
    }).filter(url => url !== 'assets/Image/user.png'); // Remove fallback URLs

    if (this.modalImages.length === 0) {
      console.warn('No valid images found');
      return;
    }

    this.currentImageIndex = 0;
    this.showModal = true;
    console.log('Modal images:', this.modalImages);
  }
  isDescriptionExpanded(index: number): boolean {
    return this.expandedDescriptions.has(index);
  }

  // Modal control methods
  closeModal() {
    this.showModal = false;
    this.modalImages = [];
    this.currentImageIndex = 0;
  }
  nextImage() {
    if (this.currentImageIndex < this.modalImages.length - 1) {
      this.currentImageIndex++;
    }
  }
  toggleDescription(index: number): void {
    if (this.expandedDescriptions.has(index)) {
      this.expandedDescriptions.delete(index);
    } else {
      this.expandedDescriptions.add(index);
    }
  }
  prevImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
  }

  getShortDescription(desc: string): string {
    if (desc.length > 100) {
      return desc.slice(0, 100) + '...';
    }
    return desc;
  }

  getImageUrl(imageFile: File): string {
    return URL.createObjectURL(imageFile);
  }

  getProjectImageUrl(image: any): string {
    // Handle different image data structures
    if (typeof image === 'string') {
      // If image is just a string path
      return `https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/${image}`;
    } else if (image && typeof image === 'object') {
      // If image is an object with image_url property
      if (image.image_url) {
        return `https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/${image.image_url}`;
      } else if (image.path) {
        return `https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/${image.path}`;
      } else if (image.url) {
        return `https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/${image.url}`;
      }
    }
    // Fallback
    return 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }

  openDeleteModal(id: number) {
    this.deleteId = id;
    this.showModalDelete = true;
  }

  confirmDelete() {
    if (this.deleteId !== null) {
      this.apiservice.deleteProject(this.deleteId).subscribe
        ({
          next: () => {
            this.projects = this.projects.filter(p => p.id !== this.deleteId);
            this.showModalDelete = false
            this.deleteId = null;


            const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              }
            });
            Toast.fire({
              icon: "success",
              title: "Projet supprimé avec succès!"
            });

          },
          error: (err) => {
            console.error('Error deleting project:', err);
            this.showModalDelete = false;
            this.deleteId = null;
          }
        });

    }
  }

  cancelDelete() {
    this.showModalDelete = false;
    this.deleteId = null
  }

}
