import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modern-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="modern-loader-container" [class.fullscreen]="fullscreen" [class.dark]="dark">
      <div class="loader-wrapper">
        <!-- Pulse Ring Animation -->
        <div class="pulse-ring" *ngIf="style === 'pulse'">
          <div class="ring"></div>
          <div class="ring"></div>
          <div class="ring"></div>
        </div>

        <!-- Morphing Shapes Animation -->
        <div class="morphing-shapes" *ngIf="style === 'morph'">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>

        <!-- Wave Animation -->
        <div class="wave-loader" *ngIf="style === 'wave'">
          <div class="wave" *ngFor="let i of [1,2,3,4,5]"></div>
        </div>

        <!-- Gradient Spinner -->
        <div class="gradient-spinner" *ngIf="style === 'gradient'">
          <div class="spinner-ring"></div>
        </div>

        <!-- Floating Bubbles -->
        <div class="floating-bubbles" *ngIf="style === 'bubbles'">
          <div class="bubble" *ngFor="let i of [1,2,3,4,5,6]"></div>
        </div>

        <!-- Loading Text -->
        <div class="loading-text" *ngIf="showText">
          <span class="text-content">{{ text }}</span>
          <div class="text-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modern-loader-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .modern-loader-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      backdrop-filter: blur(10px);
      z-index: 9999;
      min-height: 100vh;
    }

    .modern-loader-container.dark {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    }

    .loader-wrapper {
      text-align: center;
      color: white;
    }

    /* Pulse Ring Animation */
    .pulse-ring {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
    }

    .pulse-ring .ring {
      position: absolute;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }

    .pulse-ring .ring:nth-child(1) {
      width: 80px;
      height: 80px;
      animation-delay: 0s;
    }

    .pulse-ring .ring:nth-child(2) {
      width: 60px;
      height: 60px;
      top: 10px;
      left: 10px;
      animation-delay: 0.2s;
    }

    .pulse-ring .ring:nth-child(3) {
      width: 40px;
      height: 40px;
      top: 20px;
      left: 20px;
      animation-delay: 0.4s;
    }

    @keyframes pulse-ring {
      0% {
        transform: scale(0.8);
        opacity: 1;
      }
      100% {
        transform: scale(1.2);
        opacity: 0;
      }
    }

    /* Morphing Shapes Animation */
    .morphing-shapes {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
    }

    .morphing-shapes .shape {
      position: absolute;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      animation: morph-shape 3s ease-in-out infinite;
    }

    .morphing-shapes .shape-1 {
      top: 0;
      left: 25px;
      animation-delay: 0s;
    }

    .morphing-shapes .shape-2 {
      top: 25px;
      right: 0;
      animation-delay: 0.5s;
    }

    .morphing-shapes .shape-3 {
      bottom: 0;
      left: 25px;
      animation-delay: 1s;
    }

    @keyframes morph-shape {
      0%, 100% {
        transform: scale(1) rotate(0deg);
        border-radius: 50%;
      }
      33% {
        transform: scale(1.2) rotate(120deg);
        border-radius: 20%;
      }
      66% {
        transform: scale(0.8) rotate(240deg);
        border-radius: 10%;
      }
    }

    /* Wave Animation */
    .wave-loader {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin: 0 auto 30px;
    }

    .wave-loader .wave {
      width: 6px;
      height: 40px;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      border-radius: 3px;
      animation: wave-animation 1.2s ease-in-out infinite;
    }

    .wave-loader .wave:nth-child(1) { animation-delay: 0s; }
    .wave-loader .wave:nth-child(2) { animation-delay: 0.1s; }
    .wave-loader .wave:nth-child(3) { animation-delay: 0.2s; }
    .wave-loader .wave:nth-child(4) { animation-delay: 0.3s; }
    .wave-loader .wave:nth-child(5) { animation-delay: 0.4s; }

    @keyframes wave-animation {
      0%, 40%, 100% {
        transform: scaleY(0.4);
      }
      20% {
        transform: scaleY(1);
      }
    }

    /* Gradient Spinner */
    .gradient-spinner {
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
      position: relative;
    }

    .gradient-spinner .spinner-ring {
      width: 100%;
      height: 100%;
      border: 4px solid transparent;
      border-top: 4px solid #ff6b6b;
      border-right: 4px solid #4ecdc4;
      border-bottom: 4px solid #45b7d1;
      border-left: 4px solid #96ceb4;
      border-radius: 50%;
      animation: gradient-spin 1.5s linear infinite;
    }

    @keyframes gradient-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Floating Bubbles */
    .floating-bubbles {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
    }

    .floating-bubbles .bubble {
      position: absolute;
      width: 12px;
      height: 12px;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      border-radius: 50%;
      animation: float-bubble 2s ease-in-out infinite;
    }

    .floating-bubbles .bubble:nth-child(1) {
      top: 0;
      left: 34px;
      animation-delay: 0s;
    }

    .floating-bubbles .bubble:nth-child(2) {
      top: 10px;
      right: 10px;
      animation-delay: 0.2s;
    }

    .floating-bubbles .bubble:nth-child(3) {
      top: 34px;
      right: 0;
      animation-delay: 0.4s;
    }

    .floating-bubbles .bubble:nth-child(4) {
      bottom: 10px;
      right: 10px;
      animation-delay: 0.6s;
    }

    .floating-bubbles .bubble:nth-child(5) {
      bottom: 0;
      left: 34px;
      animation-delay: 0.8s;
    }

    .floating-bubbles .bubble:nth-child(6) {
      bottom: 10px;
      left: 10px;
      animation-delay: 1s;
    }

    @keyframes float-bubble {
      0%, 100% {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      50% {
        transform: translateY(-20px) scale(1.2);
        opacity: 0.7;
      }
    }

    /* Loading Text */
    .loading-text {
      font-size: 18px;
      font-weight: 600;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .text-content {
      margin-right: 8px;
    }

    .text-dots {
      display: inline-block;
    }

    .text-dots span {
      animation: text-dots 1.4s infinite;
      opacity: 0;
    }

    .text-dots span:nth-child(1) { animation-delay: 0s; }
    .text-dots span:nth-child(2) { animation-delay: 0.2s; }
    .text-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes text-dots {
      0%, 20% {
        opacity: 0;
        transform: translateY(0);
      }
      50% {
        opacity: 1;
        transform: translateY(-5px);
      }
      100% {
        opacity: 0;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .modern-loader-container {
        min-height: 150px;
      }
      
      .pulse-ring, .morphing-shapes, .gradient-spinner, .floating-bubbles {
        width: 60px;
        height: 60px;
      }
      
      .loading-text {
        font-size: 16px;
      }
    }
  `]
})
export class ModernLoaderComponent {
    @Input() text: string = 'Loading...';
    @Input() showText: boolean = true;
    @Input() fullscreen: boolean = false;
    @Input() dark: boolean = false;
    @Input() style: 'pulse' | 'morph' | 'wave' | 'gradient' | 'bubbles' = 'pulse';
}
