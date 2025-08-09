import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CountUp } from 'countup.js';
import * as AOS from 'aos';
import { ApiService } from '../../../services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements AfterViewInit, OnInit {

  activeCV: any = null;
  private countersStarted = false;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadActiveCV();
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: 'ease-in-out',
      delay: 100
    });
  }

  ngAfterViewInit(): void {
    this.setupScrollTriggeredCounters();

    setTimeout(() => {
      AOS.refreshHard();
    }, 500);
  }

  private setupScrollTriggeredCounters(): void {
    const statsSection = document.getElementById('statsSection');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.countersStarted) {
          this.countersStarted = true;
          this.startCounters();
        }
      });
    }, {
      threshold: 0.3, // Start when 30% of the section is visible
      rootMargin: '0px 0px -100px 0px' // Start a bit before the section is fully visible
    });

    observer.observe(statsSection);
  }

  private startCounters(): void {
    // Desktop counters
    const counterYears = new CountUp('experienceCounter', 2, {
      startVal: 0,
      duration: 2
    });

    const counterProject = new CountUp('projectCounter', 100, {
      startVal: 0,
      duration: 2.5
    });

    const counterClient = new CountUp('clientCounter', 80, {
      startVal: 0,
      duration: 2.2
    });

    // Mobile counters
    const counterYearsMobile = new CountUp('experienceCounterMobile', 2, {
      startVal: 0,
      duration: 2
    });

    const counterProjectMobile = new CountUp('projectCounterMobile', 100, {
      startVal: 0,
      duration: 2.5
    });

    const counterClientMobile = new CountUp('clientCounterMobile', 80, {
      startVal: 0,
      duration: 2.2
    });

    // Start all counters
    if (!counterYears.error) counterYears.start();
    if (!counterProject.error) counterProject.start();
    if (!counterClient.error) counterClient.start();
    if (!counterYearsMobile.error) counterYearsMobile.start();
    if (!counterProjectMobile.error) counterProjectMobile.start();
    if (!counterClientMobile.error) counterClientMobile.start();
  }

  loadActiveCV(): void {
    this.api.getActiveCV().subscribe({
      next: (res: any) => {
        this.activeCV = res.cv;
        console.log('Active CV loaded:', this.activeCV);
      },
      error: (err) => {
        console.error('Error loading active CV:', err);
        // Keep the default CV if no dynamic CV is available
      }
    });
  }

  downloadCV(language: 'fr' | 'en'): void {
    if (this.activeCV) {
      const hasCV = language === 'fr' ? this.activeCV.cv_fr_data : this.activeCV.cv_en_data;

      if (hasCV) {
        // Use the API download endpoint
        const downloadUrl = `${environment.apiUrl}/cvs/${this.activeCV.id}/download/${language}`;

        // Create a temporary link element and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `CV_Khaoula_Elakel_${language.toUpperCase()}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error(`CV ${language.toUpperCase()} not available`);
        alert(`CV ${language.toUpperCase()} not available for download.`);
      }
    } else {
      console.error('No CV available');
      alert('No CV available for download. Please contact the administrator.');
    }
  }
}


