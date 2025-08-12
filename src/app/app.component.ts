import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "./user/components/header/header.component";
import { ProfileComponent } from "./user/components/profile/profile.component";
import { ServicesPageComponent } from "./user/pages/services-page/services-page.component";
import { ExperienceComponent } from "./user/pages/experience/experience.component";
import { SkillsComponent } from './user/skills/skills.component';
import { RacentprojectsComponent } from "./user/pages/racentprojects/racentprojects.component";
import { WorkwithusComponent } from "./user/pages/workwithus/workwithus.component";
import { ContactComponent } from "./user/components/contact/contact.component";
import { FooterComponent } from './user/components/footer/footer.component';
import { HomeComponent } from "./user/pages/home/home.component";
import { VideoPreloaderComponent } from "./shared/components/video-preloader/video-preloader.component";
import { NotificationComponent } from "./shared/components/notification/notification.component";
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    HeaderComponent,
    ProfileComponent,
    ServicesPageComponent,
    ExperienceComponent,
    SkillsComponent,
    RacentprojectsComponent,
    WorkwithusComponent,
    ContactComponent,
    FooterComponent,
    HomeComponent,
    VideoPreloaderComponent,
    NotificationComponent
  ],
  template: `
    <!-- Video Preloader - Shows on page refresh only, not on navigation -->
    <app-video-preloader 
      *ngIf="!appReady && !hasSeenVideo" 
      (videoReady)="onAppReady($event)">
    </app-video-preloader>

    <!-- Main App Content - Shows after video preloader or immediately on navigation -->
    <div *ngIf="appReady || hasSeenVideo">
      <router-outlet></router-outlet>
    </div>

    <!-- Global Notifications -->
    <app-notification></app-notification>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front';
  appReady = false;
  hasSeenVideo = false;

  constructor() {
    // Check if this is the very first time visiting the website
    this.hasSeenVideo = localStorage.getItem('firstTimeVisit') === 'true';
    this.appReady = this.hasSeenVideo; // If first time, show video. If not, show content immediately

    if (!this.hasSeenVideo) {
      console.log('First time visiting website - showing video preloader');
    } else {
      console.log('Returning visitor - showing content immediately');
    }
  }

  onAppReady(videoPath: string) {
    console.log('App: Video ready event received with path:', videoPath);
    console.log('App: Setting appReady to true and marking as visited');
    this.appReady = true;
    this.hasSeenVideo = true;

    // Mark that user has visited the website
    localStorage.setItem('firstTimeVisit', 'true');

    console.log('App: appReady is now', this.appReady, 'hasSeenVideo is now', this.hasSeenVideo);
  }
}
