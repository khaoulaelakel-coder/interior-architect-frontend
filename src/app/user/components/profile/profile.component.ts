import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
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
export class ProfileComponent implements AfterViewInit, OnInit, OnDestroy {

  activeCV: any = null;
  private countersStarted = false;
  private observer: IntersectionObserver | null = null;
  private counters: CountUp[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadActiveCV();
    this.initAOS();
  }

  ngAfterViewInit(): void {
    // Initialize counters with a delay to ensure DOM is ready
    setTimeout(() => {
      this.setupScrollTriggeredCounters();
      this.initCounters();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    // Clean up counters
    this.counters.forEach(counter => {
      if (counter && typeof counter.reset === 'function') {
        counter.reset();
      }
    });
  }

  private initAOS(): void {
    try {
      AOS.init({
        duration: 1000,
        once: false,
        mirror: true,
        easing: 'ease-in-out',
        delay: 100,
        offset: 100
      });
    } catch (error) {
      console.warn('AOS initialization failed:', error);
    }
  }

  private setupScrollTriggeredCounters(): void {
    try {
      const statsSection = document.getElementById('statsSection');
      if (!statsSection) {
        console.warn('Stats section not found, starting counters immediately');
        this.startCounters();
        return;
      }

      // Create intersection observer
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.countersStarted) {
            console.log('Stats section visible, starting counters');
            this.countersStarted = true;
            this.startCounters();
          }
        });
      }, {
        threshold: 0.1, // Start when 10% of the section is visible
        rootMargin: '0px 0px -50px 0px'
      });

      this.observer.observe(statsSection);

      // Fallback: start counters after 3 seconds if observer doesn't trigger
      setTimeout(() => {
        if (!this.countersStarted) {
          console.log('Fallback: starting counters after timeout');
          this.countersStarted = true;
          this.startCounters();
        }
      }, 3000);

    } catch (error) {
      console.error('Error setting up scroll triggered counters:', error);
      // Fallback: start counters immediately
      this.startCounters();
    }
  }

  private initCounters(): void {
    try {
      // Initialize all counter elements
      const counterElements = [
        'experienceCounter',
        'projectCounter',
        'clientCounter',
        'experienceCounterMobile',
        'projectCounterMobile',
        'clientCounterMobile'
      ];

      counterElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
          element.textContent = '0';
        }
      });
    } catch (error) {
      console.error('Error initializing counters:', error);
    }
  }

  private startCounters(): void {
    try {
      console.log('Starting counters...');

      // Clear any existing counters
      this.counters = [];

      // Desktop counters
      const desktopCounters = [
        { id: 'experienceCounter', endVal: 2, duration: 2 },
        { id: 'projectCounter', endVal: 100, duration: 2.5 },
        { id: 'clientCounter', endVal: 80, duration: 2.2 }
      ];

      // Mobile counters
      const mobileCounters = [
        { id: 'experienceCounterMobile', endVal: 2, duration: 2 },
        { id: 'projectCounterMobile', endVal: 100, duration: 2.5 },
        { id: 'clientCounterMobile', endVal: 80, duration: 2.2 }
      ];

      // Create and start all counters
      [...desktopCounters, ...mobileCounters].forEach(counterConfig => {
        try {
          const element = document.getElementById(counterConfig.id);
          if (element) {
            const counter = new CountUp(counterConfig.id, counterConfig.endVal, {
              startVal: 0,
              duration: counterConfig.duration,
              useEasing: true,
              useGrouping: true,
              separator: ',',
              decimal: '.'
            });

            if (!counter.error) {
              this.counters.push(counter);
              counter.start();
              console.log(`Counter ${counterConfig.id} started successfully`);
            } else {
              console.error(`Counter ${counterConfig.id} error:`, counter.error);
              // Fallback: manually update the element
              this.animateCounter(element, counterConfig.endVal, counterConfig.duration);
            }
          } else {
            console.warn(`Element ${counterConfig.id} not found`);
          }
        } catch (error) {
          console.error(`Error creating counter ${counterConfig.id}:`, error);
          // Fallback: manually update the element
          const element = document.getElementById(counterConfig.id);
          if (element) {
            this.animateCounter(element, counterConfig.endVal, counterConfig.duration);
          }
        }
      });

    } catch (error) {
      console.error('Error starting counters:', error);
      // Fallback: manually update all counter elements
      this.fallbackCounterAnimation();
    }
  }

  private animateCounter(element: HTMLElement, endVal: number, duration: number): void {
    const startVal = 0;
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const currentVal = Math.floor(startVal + (endVal - startVal) * progress);

      element.textContent = currentVal.toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  private fallbackCounterAnimation(): void {
    console.log('Using fallback counter animation');

    const counterConfigs = [
      { id: 'experienceCounter', endVal: 2 },
      { id: 'projectCounter', endVal: 100 },
      { id: 'clientCounter', endVal: 80 },
      { id: 'experienceCounterMobile', endVal: 2 },
      { id: 'projectCounterMobile', endVal: 100 },
      { id: 'clientCounterMobile', endVal: 80 }
    ];

    counterConfigs.forEach(config => {
      const element = document.getElementById(config.id);
      if (element) {
        this.animateCounter(element, config.endVal, 2);
      }
    });
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


