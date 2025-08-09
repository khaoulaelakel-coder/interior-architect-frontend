import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';


@Component({
  selector: 'app-racentprojects',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './racentprojects.component.html',
  styleUrl: './racentprojects.component.css'
})
export class RacentprojectsComponent implements OnInit, OnDestroy {
  recentProjects: any[] = [];
  loading: boolean = true;
  error = false;

  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadRecentProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecentProjects(): void {
    this.apiService.getProjects().subscribe({
      next: (data: any) => {
        // Get the 4 most recent projects
        this.recentProjects = data.projects?.slice(0, 4) || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recent projects:', error);
        this.loading = false;
      }
    });
  }

  retryLoad(): void {
    this.loadRecentProjects();
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
    // Show fallback content
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500">Aucune Image</div>';
    }
  }

  getFirstImage(project: any): string {
    // Use cover_image if available, otherwise fallback to first image
    if (project.cover_image) {
      return project.cover_image;
    }
    if (project.images && project.images.length > 0) {
      return project.images[0].image_url; // Return base64 data directly
    }
    return ''; // Return empty string if no images
  }
}
