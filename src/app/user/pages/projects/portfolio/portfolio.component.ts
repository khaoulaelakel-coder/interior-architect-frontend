import { Component, OnInit } from '@angular/core';
import { category } from '../../../../model/category.model';
import { ApiService } from '../../../../services/api.service';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit {
  categories: category[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories;
      },
      error: (err: any) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  // Get full image URL - now using base64 data directly
  getImageUrl(coverData: string): string {
    return coverData || 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }

}
