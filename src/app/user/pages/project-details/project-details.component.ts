import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css'
})
export class ProjectDetailsComponent implements OnInit, AfterViewInit {
  project: any = null;
  currentImageIndex: number = 0;
  loading: boolean = true;

  // Modal functionality
  isModalOpen: boolean = false;
  modalImageIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    console.log('ProjectDetailsComponent ngOnInit called');

    // AGGRESSIVE MOBILE SCROLL FIX
    this.forceScrollToTop();

    const projectId = this.route.snapshot.paramMap.get('id');
    console.log('Project ID from route:', projectId);

    if (projectId) {
      this.loadProject(projectId);
    }
  }

  private forceScrollToTop(): void {
    // Multiple scroll methods for maximum compatibility
    try {
      // Method 1: Window scroll
      window.scrollTo(0, 0);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Method 2: Document element scroll
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;

      // Method 3: Body scroll
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;

      // Method 4: Force viewport positioning
      if (window.pageYOffset !== 0) {
        window.pageYOffset = 0;
      }

      console.log('Forced scroll to top - all methods applied');
    } catch (error) {
      console.error('Error forcing scroll to top:', error);
    }
  }

  ngAfterViewInit(): void {
    // SUPER AGGRESSIVE SCROLL FIX FOR MOBILE
    setTimeout(() => {
      this.forceScrollToTop();
      console.log('AfterViewInit: Applied aggressive scroll fix');
    }, 0);

    setTimeout(() => {
      this.forceScrollToTop();
      console.log('AfterViewInit: Applied second aggressive scroll fix');
    }, 100);

    setTimeout(() => {
      this.forceScrollToTop();
      console.log('AfterViewInit: Applied third aggressive scroll fix');
    }, 300);
  }

  loadProject(projectId: string): void {
    this.apiService.getProjectById(parseInt(projectId)).subscribe({
      next: (data) => {
        this.project = data.project; // Extract project from response
        this.loading = false;
        console.log('Project loaded:', this.project);

        // FINAL AGGRESSIVE SCROLL AFTER DATA LOADS
        setTimeout(() => {
          this.forceScrollToTop();
          console.log('Data loaded: Applied final aggressive scroll fix');
        }, 100);

        setTimeout(() => {
          this.forceScrollToTop();
          console.log('Data loaded: Applied delayed aggressive scroll fix');
        }, 500);
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.loading = false;
      }
    });
  }

  getImageUrl(imageData: string): string {
    // Images now come as base64 data directly from the API
    return imageData || 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }

  nextImage(): void {
    if (this.project && this.project.images && this.project.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.project.images.length;
    }
  }

  previousImage(): void {
    if (this.project && this.project.images && this.project.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0
        ? this.project.images.length - 1
        : this.currentImageIndex - 1;
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Modal functionality
  openModal(imageIndex: number): void {
    this.modalImageIndex = imageIndex;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Debug logging
    console.log('Opening modal with image index:', imageIndex);
    console.log('Project images:', this.project?.images);
    console.log('Selected image:', this.project?.images[imageIndex]);
    console.log('Image URL:', this.getImageUrl(this.project?.images[imageIndex]?.image_url));
  }

  closeModal(): void {
    this.isModalOpen = false;
    document.body.style.overflow = 'auto'; // Restore scrolling
  }

  nextModalImage(): void {
    if (this.project && this.project.images) {
      this.modalImageIndex = this.modalImageIndex === this.project.images.length - 1
        ? 0
        : this.modalImageIndex + 1;
    }
  }

  previousModalImage(): void {
    if (this.project && this.project.images) {
      this.modalImageIndex = this.modalImageIndex === 0
        ? this.project.images.length - 1
        : this.modalImageIndex - 1;
    }
  }

  goToModalImage(index: number): void {
    this.modalImageIndex = index;
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onImageLoad(event: Event): void {
    console.log('Image loaded successfully in modal');
  }
}
