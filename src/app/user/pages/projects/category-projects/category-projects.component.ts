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

  constructor(private route: ActivatedRoute, private apiService: ApiService) { }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    console.log('CategoryProjectsComponent - categoryId:', this.categoryId);
    if (this.categoryId) {
      this.apiService.getProjectsByCategory(this.categoryId).subscribe({
        next: (data) => {
          console.log('CategoryProjectsComponent - API response:', data);
          this.projects = data.projects; // ✅ not just `data`
        },
        error: (err) => {
          console.error('Failed to load projects:', err);
        }
      });

    }
  }

  getImageUrl(filename: string): string {
    return `https://interior-architect-backend-main-36p6qz.laravel.cloud/api/images/${filename}`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }
}
