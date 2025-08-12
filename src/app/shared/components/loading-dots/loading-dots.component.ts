import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-dots',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="loading-dots-container">
      <div class="loading-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <div class="loading-text" *ngIf="showText">{{ text }}</div>
    </div>
  `,
    styles: [`
    .loading-dots-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .loading-dots {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #3498db;
      animation: loading-dots 1.4s infinite ease-in-out both;
    }

    .dot:nth-child(1) {
      animation-delay: -0.32s;
    }

    .dot:nth-child(2) {
      animation-delay: -0.16s;
    }

    .dot:nth-child(3) {
      animation-delay: 0s;
    }

    @keyframes loading-dots {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .loading-text {
      color: #666;
      font-size: 16px;
      font-weight: 500;
    }
  `]
})
export class LoadingDotsComponent {
    @Input() text: string = 'Chargement...';
    @Input() showText: boolean = true;
}
