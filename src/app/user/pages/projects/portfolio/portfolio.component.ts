import { Component, OnInit, OnDestroy } from '@angular/core';
import { category } from '../../../../model/category.model';
import { ApiService } from '../../../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit, OnDestroy {
  categories: category[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadCategories();
    this.hideFooter();
  }

  ngOnDestroy(): void {
    this.showFooter();
  }

  private hideFooter(): void {
    // Hide footer when portfolio component loads
    const footer = document.querySelector('app-footer');
    if (footer) {
      (footer as HTMLElement).style.display = 'none';
    }
  }

  private showFooter(): void {
    // Show footer when leaving portfolio component
    const footer = document.querySelector('app-footer');
    if (footer) {
      (footer as HTMLElement).style.display = 'block';
    }
  }

  loadCategories() {
    this.isLoading = true;
    this.error = null;

    this.api.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching categories:', err);
        this.error = 'Failed to load categories. Please try again.';
        this.isLoading = false;
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

  // Navigate to category with forced scroll
  navigateToCategory(categoryId: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('Portfolio: Navigating to category with forced scroll:', categoryId);

    // Force scroll to top BEFORE navigation
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Small delay then navigate
    setTimeout(() => {
      this.router.navigate(['/categories', categoryId]).then(() => {
        // Additional scroll after navigation
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          console.log('Portfolio: Post-navigation scroll applied');
        }, 0);
      });
    }, 50);
  }

}
