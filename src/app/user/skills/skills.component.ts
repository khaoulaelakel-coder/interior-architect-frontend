import { Component, OnInit, signal, Signal, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Skill } from '../../model/skills.model';
import { ApiService } from '../../services/api.service';
import { CacheService } from '../../services/cache.service';
import { PerformanceMonitorService } from '../../services/performance-monitor.service';
import { ProgressiveImageLoaderService } from '../../services/progressive-image-loader.service';
import { environment } from '../../../environments/environment';
import { Subject, takeUntil, catchError, of, finalize, fromEvent, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent implements OnInit, OnDestroy, AfterViewInit {
  skills = signal<Skill[]>([]); // 🟢 Signal that holds all skills
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  isVisible = signal<boolean>(false);
  private destroy$ = new Subject<void>();
  private intersectionObserver?: IntersectionObserver;

  @ViewChild('skillsSection', { static: false }) skillsSection!: ElementRef;

  constructor(
    private api: ApiService,
    private cache: CacheService,
    private performanceMonitor: PerformanceMonitorService,
    private progressiveLoader: ProgressiveImageLoaderService
  ) { }

  ngOnInit() {
    // Preload skills data immediately
    this.preloadSkills();
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
    this.setupScrollOptimizations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    // Log performance summary when component is destroyed
    this.performanceMonitor.logPerformanceSummary();
  }

  private setupIntersectionObserver(): void {
    if (!this.skillsSection?.nativeElement) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.isVisible.set(true);
            this.loadSkillsIfNeeded();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    this.intersectionObserver.observe(this.skillsSection.nativeElement);
  }

  private setupScrollOptimizations(): void {
    // Optimize scroll performance
    fromEvent(window, 'scroll')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(16), // ~60fps
        distinctUntilChanged()
      )
      .subscribe(() => {
        // Handle scroll optimizations if needed
      });
  }

  private preloadSkills(): void {
    // Check cache first and load if available
    const cachedSkills = this.cache.getCachedSkills();
    if (cachedSkills) {
      this.skills.set(cachedSkills);
      this.error.set(null);
      this.performanceMonitor.recordCacheHit();
    }
  }

  private loadSkillsIfNeeded(): void {
    // Only load if we don't have skills and we're visible
    if (this.skills().length === 0 && this.isVisible()) {
      this.loadSkills();
    }
  }

  loadSkills(): void {
    // Start performance monitoring
    this.performanceMonitor.startTimer('skills-load');

    // Check cache first
    const cachedSkills = this.cache.getCachedSkills();
    if (cachedSkills) {
      this.skills.set(cachedSkills);
      this.error.set(null);
      this.performanceMonitor.recordCacheHit();
      this.performanceMonitor.endTimer('skills-load');

      // Background refresh if needed
      this.refreshSkillsInBackground();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.performanceMonitor.recordCacheMiss();

    this.api.getSkills()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading skills:', err);
          this.error.set('Erreur lors du chargement des compétences');
          return of({ skills: [] });
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.performanceMonitor.endTimer('skills-load');
        })
      )
      .subscribe((res: any) => {
        const skillsData = res.skills || [];
        this.skills.set(skillsData);
        this.cache.setSkills(skillsData);
        this.error.set(null);
      });
  }

  private refreshSkillsInBackground(): void {
    // Only refresh if cache is getting stale
    if (!this.cache.has('skills')) {
      return;
    }

    this.api.getSkills()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Background skills refresh failed:', err);
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res && res.skills) {
          this.skills.set(res.skills);
          this.cache.setSkills(res.skills);
        }
      });
  }

  retryLoad(): void {
    this.loadSkills();
  }

  getImageUrl(logoData: string): string {
    // Skills now come with base64 data directly from the API
    return logoData || 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }

  // Method to manually refresh skills (useful for admin updates)
  refreshSkills(): void {
    this.cache.clear('skills');
    this.loadSkills();
  }

  // Method to get performance metrics (useful for debugging)
  getPerformanceMetrics(): any {
    return this.performanceMonitor.getMetrics();
  }
}
