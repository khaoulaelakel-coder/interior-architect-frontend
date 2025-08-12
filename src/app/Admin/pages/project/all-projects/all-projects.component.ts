import { Component, OnInit } from '@angular/core';
import { Project } from '../../../../model/project.model';
import { CommonModule, SlicePipe } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { category } from '../../../../model/category.model';
import { ConfirmDeleteComponent } from '../../../shared/confirm-delete/confirm-delete.component';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-all-projects',
  standalone: true,
  imports: [CommonModule, ConfirmDeleteComponent, RouterModule],
  templateUrl: './all-projects.component.html',
  styleUrl: './all-projects.component.css'
})
export class AllProjectsComponent implements OnInit {
  projects: any[] = [];
  selectedImages: string[] = [];
  expandedDescriptions: Set<number> = new Set();
  // Modal properties
  showModal: boolean = false;
  modalImages: string[] = [];
  currentImageIndex: number = 0;
  currentProject: any = null; // Store current project for cover selection
  showModalDelete: boolean = false;
  loading = false;

  categories: category[] = [];
  deleteId: number | null = null;

  // Pagination properties
  pagination: any = null;
  currentPage = 1;
  totalPages = 1;

  // Bulk selection properties
  selectedProjects: number[] = [];
  isAllSelected = false;

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
  showImages(images: any[], project?: any) {
    // Handle different image data structures
    if (!images || images.length === 0) {
      console.warn('No images to show');
      return;
    }

    // Store current project for cover selection
    this.currentProject = project;

    // Transform images to URLs based on data structure
    this.modalImages = images.map(img => {
      if (typeof img === 'string') {
        // Check if it's already a base64 data URL
        if (img.startsWith('data:')) {
          return img;
        }
        // Images now come as base64 data directly from the API
        return img || 'assets/Image/user.png';
      } else if (img && typeof img === 'object') {
        // If image is an object, return the base64 data
        if (img.image_url) {
          return img.image_url || 'assets/Image/user.png';
        } else if (img.path) {
          return img.path || 'assets/Image/user.png';
        } else if (img.url) {
          return img.url || 'assets/Image/user.png';
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
      // Check if it's already a base64 data URL
      if (image.startsWith('data:')) {
        return image;
      }
      // If image is just a file path
      return image || 'assets/Image/user.png';
    } else if (image && typeof image === 'object') {
      // If image is an object, return the base64 data
      if (image.image_url) {
        return image.image_url || 'assets/Image/user.png';
      } else if (image.path) {
        return image.path || 'assets/Image/user.png';
      } else if (image.url) {
        return image.url || 'assets/Image/user.png';
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

  setCoverImage(projectId: number, imageId: number) {
    this.apiservice.setCoverImage(projectId, imageId).subscribe({
      next: (response) => {
        console.log('Cover image set successfully:', response);
        this.loadProjects(); // Reload to see updated cover
        // Close modal if open
        this.showModal = false;

        // Show success message
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        Toast.fire({
          icon: "success",
          title: "Image de couverture mise à jour!"
        });
      },
      error: (error) => {
        console.error('Error setting cover image:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la mise à jour de l\'image de couverture'
        });
      }
    });
  }

  // Bulk selection methods
  toggleProjectSelection(projectId: number): void {
    const index = this.selectedProjects.indexOf(projectId);
    if (index > -1) {
      this.selectedProjects.splice(index, 1);
    } else {
      this.selectedProjects.push(projectId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.selectedProjects = [];
    } else {
      this.selectedProjects = this.projects.map(p => p.id);
    }
    this.isAllSelected = !this.isAllSelected;
  }

  isProjectSelected(projectId: number): boolean {
    return this.selectedProjects.includes(projectId);
  }

  updateSelectAllState(): void {
    this.isAllSelected = this.selectedProjects.length === this.projects.length && this.projects.length > 0;
  }

  bulkDeleteProjects(): void {
    if (this.selectedProjects.length === 0) {
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous vraiment supprimer ${this.selectedProjects.length} projet(s) sélectionné(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performBulkDelete();
      }
    });
  }

  private performBulkDelete(): void {
    this.loading = true;

    this.apiservice.bulkDeleteProjects(this.selectedProjects).subscribe({
      next: (response) => {
        console.log('Bulk delete successful:', response);

        // Remove deleted projects from local array
        this.projects = this.projects.filter(p => !this.selectedProjects.includes(p.id));

        // Clear selection
        this.selectedProjects = [];
        this.isAllSelected = false;

        // Show success message
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        Toast.fire({
          icon: "success",
          title: `${response.deleted_count} projet(s) supprimé(s) avec succès!`
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Bulk delete error:', error);
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression en masse des projets'
        });
      }
    });
  }
}
