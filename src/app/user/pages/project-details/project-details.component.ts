import { Component, OnInit } from '@angular/core';
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
export class ProjectDetailsComponent implements OnInit {
  project: any = null;
  currentImageIndex: number = 0;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(projectId);
    }
  }

  loadProject(projectId: string): void {
    this.apiService.getProjectById(parseInt(projectId)).subscribe({
      next: (data) => {
        this.project = data.project; // Extract project from response
        this.loading = false;
        console.log('Project loaded:', this.project);
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
}
