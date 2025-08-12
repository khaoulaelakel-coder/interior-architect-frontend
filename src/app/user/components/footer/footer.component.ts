import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = element.getBoundingClientRect().top + window.scrollY;
      const duration = 1500; // Customize speed in ms (800ms = slower)
  
      const start = window.scrollY;
      const startTime = performance.now();
  
      function animateScroll(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutQuad(progress);
  
        window.scrollTo(0, start + (offset - start) * ease);
  
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      }
  
      function easeInOutQuad(t: number): number {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }
  
      requestAnimationFrame(animateScroll);
    }
  }
  
}