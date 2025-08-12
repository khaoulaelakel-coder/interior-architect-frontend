import { AuthService } from './../../../services/auth.service';
import { Component , computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import { SharedService } from '../../../services/navigation/shared.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit  , OnDestroy{
  private AuthService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();


  
// Signals for reactive state management
  selectedTitle = signal('Dashboard');
  currentUser = signal<any>(null);
  isDropdownOpen = signal(false);
  notificationCount = signal(3);
  searchTerm = signal('');

  // Computed values
  userDisplayName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Guest User';
    return user.name || user.username || user.email?.split('@')[0] || 'User';
  });

  userRole = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Guest';
    
    if (user.role) return user.role;
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].name || user.roles[0];
    }
    if (user.email && user.email.includes('admin')) {
      return 'Administrator';
    }
    return 'User';
  });

  userInitials = computed(() => {
    const name = this.userDisplayName();
    if (!name || name === 'Guest User') return 'GU';
    
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  ngOnInit() {
    // Subscribe to current user changes
    this.AuthService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser.set(user);
      });

    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  private handleDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('[data-dropdown]') as HTMLElement;
    
    if (dropdown && !dropdown.contains(target)) {
      this.isDropdownOpen.set(false);
    }
  }

  toggleDropdown() {
    this.isDropdownOpen.update(open => !open);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  getUserDisplayName(): string {
    return this.userDisplayName();
  }

  getUserRole(): string {
    return this.userRole();
  }

  getInitials(): string {
    return this.userInitials();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  // Navigation methods
  viewProfile() {
    this.closeDropdown();
    this.router.navigate(['/profile']);
  }

  editProfile() {
    this.closeDropdown();
    this.router.navigate(['/profile/edit']);
  }

  openSettings() {
    this.closeDropdown();
    this.router.navigate(['/settings']);
  }

  changePassword() {
    this.closeDropdown();
    this.router.navigate(['/profile/change-password']);
  }

  async logout() {
    this.closeDropdown();
    
    try {
      await this.AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      this.AuthService.forceLogout();
    }
  }

  // Method to update page title
  setTitle(title: string) {
    this.selectedTitle.set(title);
  }

  // Method to update notification count
  updateNotificationCount(count: number) {
    this.notificationCount.set(count);
  }
}
