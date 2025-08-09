import { Component, OnInit, OnDestroy } from '@angular/core';
import { Experience } from '../../../model/experience.model';
import { Education } from '../../../model/education.model';
import { ApiService } from '../../../services/api.service';
import { DatePipe, CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
})
export class ExperienceComponent implements OnInit, OnDestroy {
  experiences: Experience[] = [];
  educations: Education[] = [];

  // Loading states
  experiencesLoading = true;
  educationsLoading = true;

  // Error states
  experiencesError = false;
  educationsError = false;

  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    // Load both in parallel for better performance
    const experiences$ = this.api.getExperiences();
    const educations$ = this.api.getEducations();

    // Load experiences
    experiences$.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.experiencesLoading = false),
      catchError(error => {
        this.experiencesError = true;
        console.error('Error loading experiences:', error);
        return [];
      })
    ).subscribe((res: any) => {
      if (res && res.experiences) {
        this.experiences = res.experiences.sort((a: any, b: any) => {
          if (a.currently_working && !b.currently_working) return -1;
          if (!a.currently_working && b.currently_working) return 1;
          return new Date(b.year_end || b.year_start).getTime() - new Date(a.year_end || a.year_start).getTime();
        });
        this.experiencesError = false;
      }
    });

    // Load educations  
    educations$.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.educationsLoading = false),
      catchError(error => {
        this.educationsError = true;
        console.error('Error loading educations:', error);
        return [];
      })
    ).subscribe((res: any) => {
      if (res) {
        this.educations = (res.educations || res.education || []).sort((a: Education, b: Education) => {
          const endA = new Date(a.year_end || a.year_start).getTime();
          const endB = new Date(b.year_end || b.year_start).getTime();
          return endB - endA;
        });
        this.educationsError = false;
      }
    });
  }
}